export interface User {
  id: string;
  username: string;
  email: string;
}

export enum AccountType {
  BANK = 'Bank',
  CASH = 'Cash',
  CREDIT = 'Credit Card',
  INVESTMENT = 'Investment',
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
}

export enum TransactionType {
  INCOME = 'Income',
  EXPENSE = 'Expense',
  TRANSFER = 'Transfer',
}

export interface Transaction {
  id: string;
  accountId: string;
  toAccountId?: string; // For transfers
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  note?: string;
}

export interface StockHolding {
  symbol: string;
  name: string;
  quantity: number;
  averageCost: number;
  currentPrice: number; // Updated via API or manual
  lastUpdated: string;
}

export enum TradeType {
  BUY = 'Buy',
  SELL = 'Sell',
}

export interface StockTrade {
  id: string;
  symbol: string;
  type: TradeType;
  quantity: number;
  price: number;
  date: string;
  fee: number;
}

export interface FinancialSnapshot {
  totalAssets: number;
  totalLiabilities: number; // Credit card debt, etc.
  netWorth: number;
  monthlyIncome: number;
  monthlyExpense: number;
}
