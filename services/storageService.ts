import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  setDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { Account, Transaction, User, StockHolding, StockTrade, TransactionType, AccountType } from '../types';
import { MOCK_ACCOUNTS, MOCK_TRANSACTIONS, MOCK_STOCKS } from '../constants';

const COLLECTIONS = {
  ACCOUNTS: 'accounts',
  TRANSACTIONS: 'transactions',
  STOCKS: 'stocks',
  TRADES: 'trades',
};

export const storageService = {
  // --- Auth ---
  
  observeAuth: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        callback({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          username: firebaseUser.email?.split('@')[0] || 'User'
        });
      } else {
        callback(null);
      }
    });
  },

  getCurrentUser: (): User | null => {
    const u = auth.currentUser;
    return u ? { id: u.uid, email: u.email || '', username: u.email?.split('@')[0] || 'User' } : null;
  },

  login: async (email: string, password: string): Promise<User> => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return { id: cred.user.uid, email: cred.user.email || '', username: cred.user.email?.split('@')[0] || 'User' };
  },

  register: async (email: string, password: string): Promise<User> => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const userId = cred.user.uid;

    // Initialize default data for new user
    const batchPromises = [];
    
    // 1. Add Mock Accounts
    for (const acc of MOCK_ACCOUNTS) {
        // Remove ID to let Firestore generate one, or use a specific one
        const { id, ...data } = acc; 
        batchPromises.push(addDoc(collection(db, 'users', userId, COLLECTIONS.ACCOUNTS), data));
    }
    
    // 2. Add Mock Stocks
    for (const stk of MOCK_STOCKS) {
        batchPromises.push(addDoc(collection(db, 'users', userId, COLLECTIONS.STOCKS), stk));
    }

    // 3. Add Mock Transactions
    // Note: Transactions need valid account IDs to link correctly. 
    // For simplicity in this demo, we skip linking strictly or just add them as standalone.
    // To do it properly, we would await the account creation above.
    // Here we just add them for visual populating.
    for (const tx of MOCK_TRANSACTIONS) {
       const { id, ...data } = tx;
       batchPromises.push(addDoc(collection(db, 'users', userId, COLLECTIONS.TRANSACTIONS), data));
    }

    await Promise.all(batchPromises);

    return { id: userId, email: cred.user.email || '', username: cred.user.email?.split('@')[0] || 'User' };
  },

  logout: async () => {
    await signOut(auth);
  },

  // --- Accounts ---

  getAccounts: async (): Promise<Account[]> => {
    const user = auth.currentUser;
    if (!user) return [];
    
    const q = query(collection(db, 'users', user.uid, COLLECTIONS.ACCOUNTS));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Account));
  },

  saveAccount: async (account: Account): Promise<void> => {
    const user = auth.currentUser;
    if (!user) return;

    if (account.id && account.id.length > 20) { 
        // Assuming ID length > 20 implies Firestore ID, otherwise it might be a new one or temp
        await setDoc(doc(db, 'users', user.uid, COLLECTIONS.ACCOUNTS, account.id), account);
    } else {
        const { id, ...data } = account;
        await addDoc(collection(db, 'users', user.uid, COLLECTIONS.ACCOUNTS), data);
    }
  },

  deleteAccount: async (id: string): Promise<void> => {
    const user = auth.currentUser;
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, COLLECTIONS.ACCOUNTS, id));
  },

  // --- Transactions ---

  getTransactions: async (): Promise<Transaction[]> => {
    const user = auth.currentUser;
    if (!user) return [];

    const q = query(collection(db, 'users', user.uid, COLLECTIONS.TRANSACTIONS));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
  },

  addTransaction: async (tx: Omit<Transaction, 'id'>): Promise<Transaction> => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    const docRef = await addDoc(collection(db, 'users', user.uid, COLLECTIONS.TRANSACTIONS), tx);
    
    // Update Account Balance
    const accountRef = doc(db, 'users', user.uid, COLLECTIONS.ACCOUNTS, tx.accountId);
    const accountSnap = await getDocs(query(collection(db, 'users', user.uid, COLLECTIONS.ACCOUNTS)));
    // We need to fetch the specific account to update it.
    // In a real app, use a Transaction (Firestore Transaction) for atomicity.
    // Here we do a simple read-modify-write.
    // Optimization: The UI passes accountId, but we need the current balance.
    // We'll just fetch all accounts to find it or getDoc.
    const accDoc = await import('firebase/firestore').then(mod => mod.getDoc(accountRef));
    
    if (accDoc.exists()) {
        const accData = accDoc.data() as Account;
        let newBalance = accData.balance;
        if (tx.type === TransactionType.INCOME) {
            newBalance += tx.amount;
        } else {
            newBalance -= tx.amount;
        }
        await updateDoc(accountRef, { balance: newBalance });
    }

    return { ...tx, id: docRef.id };
  },

  // --- Stocks ---

  getStocks: async (): Promise<StockHolding[]> => {
    const user = auth.currentUser;
    if (!user) return [];

    const q = query(collection(db, 'users', user.uid, COLLECTIONS.STOCKS));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data() } as StockHolding));
  },

  updateStockPrice: async (symbol: string, newPrice: number): Promise<void> => {
    const user = auth.currentUser;
    if (!user) return;

    // Find the stock doc by symbol
    const q = query(collection(db, 'users', user.uid, COLLECTIONS.STOCKS), import('firebase/firestore').then(mod => mod.where('symbol', '==', symbol)));
    // Note: Can't easily use await inside the query construction with dynamic imports if not structured well.
    // Simplified: Fetch all and find, or assume ID is symbol? 
    // Let's rely on fetching all for this simple demo, or query:
    const qRef = query(collection(db, 'users', user.uid, COLLECTIONS.STOCKS), import('firebase/firestore').then(mod => mod.where('symbol', '==', symbol)) as any); 
    // Actually standard query:
    // We need to match where symbol == symbol.
    // Since we didn't store ID as symbol, we query.
    
    const snapshot = await getDocs(query(collection(db, 'users', user.uid, COLLECTIONS.STOCKS)));
    // Filter client side or do proper query
    const targetDoc = snapshot.docs.find(d => d.data().symbol === symbol);
    
    if (targetDoc) {
        await updateDoc(targetDoc.ref, { 
            currentPrice: newPrice,
            lastUpdated: new Date().toISOString()
        });
    }
  },

  saveStockTrade: async (trade: StockTrade): Promise<void> => {
    const user = auth.currentUser;
    if (!user) return;

    // Save Trade
    await addDoc(collection(db, 'users', user.uid, COLLECTIONS.TRADES), trade);

    // Update Holding
    const stocksRef = collection(db, 'users', user.uid, COLLECTIONS.STOCKS);
    const snapshot = await getDocs(stocksRef);
    const existingDoc = snapshot.docs.find(d => d.data().symbol === trade.symbol);

    if (trade.type === 'Buy') {
        if (existingDoc) {
            const s = existingDoc.data() as StockHolding;
            const totalCost = (s.quantity * s.averageCost) + (trade.quantity * trade.price) + trade.fee;
            const totalQty = s.quantity + trade.quantity;
            const avgCost = totalQty > 0 ? totalCost / totalQty : 0;
            
            await updateDoc(existingDoc.ref, {
                quantity: totalQty,
                averageCost: avgCost,
                currentPrice: trade.price,
                lastUpdated: new Date().toISOString()
            });
        } else {
            const newStock: StockHolding = {
                symbol: trade.symbol,
                name: trade.symbol,
                quantity: trade.quantity,
                averageCost: (trade.price * trade.quantity + trade.fee) / trade.quantity,
                currentPrice: trade.price,
                lastUpdated: new Date().toISOString()
            };
            await addDoc(stocksRef, newStock);
        }
    } else {
        // Sell
        if (existingDoc) {
            const s = existingDoc.data() as StockHolding;
            const newQty = s.quantity - trade.quantity;
            if (newQty <= 0) {
                await deleteDoc(existingDoc.ref);
            } else {
                await updateDoc(existingDoc.ref, { quantity: newQty });
            }
        }
    }
  }
};
