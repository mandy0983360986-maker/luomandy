import { Account, Transaction, User, StockHolding, StockTrade, TransactionType } from '../types';
import { MOCK_ACCOUNTS, MOCK_TRANSACTIONS, MOCK_STOCKS } from '../constants';

const STORAGE_KEYS = {
  USER: 'wf_user',
  ACCOUNTS: 'wf_accounts',
  TRANSACTIONS: 'wf_transactions',
  STOCKS: 'wf_stocks',
  TRADES: 'wf_trades',
};

// Simulate async database calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const storageService = {
  // User Auth
  getUser: (): User | null => {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  },
  login: async (username: string): Promise<User> => {
    await delay(500);
    const user = { id: 'u1', username, email: `${username}@example.com` };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    
    // Initialize demo data if new user
    if (!localStorage.getItem(STORAGE_KEYS.ACCOUNTS)) {
        localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(MOCK_ACCOUNTS));
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(MOCK_TRANSACTIONS));
        localStorage.setItem(STORAGE_KEYS.STOCKS, JSON.stringify(MOCK_STOCKS));
    }
    return user;
  },
  logout: async () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  // Accounts
  getAccounts: async (): Promise<Account[]> => {
    await delay(300);
    const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    return data ? JSON.parse(data) : [];
  },
  saveAccount: async (account: Account): Promise<void> => {
    const accounts = await storageService.getAccounts();
    const index = accounts.findIndex(a => a.id === account.id);
    if (index >= 0) {
      accounts[index] = account;
    } else {
      accounts.push({ ...account, id: Date.now().toString() });
    }
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  },
  deleteAccount: async (id: string): Promise<void> => {
    const accounts = await storageService.getAccounts();
    const filtered = accounts.filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(filtered));
  },

  // Transactions
  getTransactions: async (): Promise<Transaction[]> => {
    await delay(300);
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  },
  addTransaction: async (tx: Omit<Transaction, 'id'>): Promise<Transaction> => {
    const txs = await storageService.getTransactions();
    const newTx = { ...tx, id: Date.now().toString() };
    txs.push(newTx);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));

    // Update account balance
    const accounts = await storageService.getAccounts();
    const accIndex = accounts.findIndex(a => a.id === tx.accountId);
    if (accIndex >= 0) {
        if (tx.type === TransactionType.INCOME) {
            accounts[accIndex].balance += tx.amount;
        } else {
            accounts[accIndex].balance -= tx.amount;
        }
        localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    }

    return newTx;
  },

  // Stocks
  getStocks: async (): Promise<StockHolding[]> => {
    await delay(300);
    const data = localStorage.getItem(STORAGE_KEYS.STOCKS);
    return data ? JSON.parse(data) : [];
  },
  updateStockPrice: async (symbol: string, newPrice: number): Promise<void> => {
      const stocks = await storageService.getStocks();
      const index = stocks.findIndex(s => s.symbol === symbol);
      if (index >= 0) {
          stocks[index].currentPrice = newPrice;
          stocks[index].lastUpdated = new Date().toISOString();
          localStorage.setItem(STORAGE_KEYS.STOCKS, JSON.stringify(stocks));
      }
  },
  saveStockTrade: async (trade: StockTrade): Promise<void> => {
      const tradesData = localStorage.getItem(STORAGE_KEYS.TRADES);
      const trades: StockTrade[] = tradesData ? JSON.parse(tradesData) : [];
      trades.push(trade);
      localStorage.setItem(STORAGE_KEYS.TRADES, JSON.stringify(trades));

      // Update Holdings Logic
      const stocks = await storageService.getStocks();
      const existingIndex = stocks.findIndex(s => s.symbol === trade.symbol);
      
      if (trade.type === 'Buy') {
          if (existingIndex >= 0) {
              const s = stocks[existingIndex];
              const totalCost = (s.quantity * s.averageCost) + (trade.quantity * trade.price) + trade.fee;
              const totalQty = s.quantity + trade.quantity;
              s.averageCost = totalQty > 0 ? totalCost / totalQty : 0;
              s.quantity = totalQty;
              s.currentPrice = trade.price; // Update to latest transaction price
          } else {
              stocks.push({
                  symbol: trade.symbol,
                  name: trade.symbol, // In real app, fetch name
                  quantity: trade.quantity,
                  averageCost: (trade.price * trade.quantity + trade.fee) / trade.quantity,
                  currentPrice: trade.price,
                  lastUpdated: new Date().toISOString()
              });
          }
      } else {
          // Sell
          if (existingIndex >= 0) {
              const s = stocks[existingIndex];
              s.quantity -= trade.quantity;
              if (s.quantity <= 0) {
                  stocks.splice(existingIndex, 1);
              }
          }
      }
      localStorage.setItem(STORAGE_KEYS.STOCKS, JSON.stringify(stocks));
  }
};
