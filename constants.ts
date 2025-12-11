import { AccountType } from './types';

export const CATEGORIES = {
  INCOME: ['Salary', 'Bonus', 'Dividend', 'Investment', 'Other'],
  EXPENSE: ['Food', 'Transport', 'Housing', 'Utilities', 'Entertainment', 'Health', 'Shopping', 'Education', 'Travel', 'Other'],
};

export const MOCK_ACCOUNTS = [
  { id: '1', name: 'Main Savings', type: AccountType.BANK, balance: 150000, currency: 'TWD' },
  { id: '2', name: 'Wallet Cash', type: AccountType.CASH, balance: 3500, currency: 'TWD' },
  { id: '3', name: 'Credit Card', type: AccountType.CREDIT, balance: -12000, currency: 'TWD' },
];

export const MOCK_TRANSACTIONS = [
  { id: 't1', accountId: '1', amount: 55000, type: 'Income', category: 'Salary', date: new Date(Date.now() - 86400000 * 5).toISOString(), note: 'Monthly Salary' },
  { id: 't2', accountId: '2', amount: 120, type: 'Expense', category: 'Food', date: new Date(Date.now() - 86400000 * 1).toISOString(), note: 'Lunch' },
  { id: 't3', accountId: '3', amount: 2500, type: 'Expense', category: 'Transport', date: new Date(Date.now() - 86400000 * 3).toISOString(), note: 'HSR Ticket' },
];

export const MOCK_STOCKS = [
  { symbol: '2330.TW', name: 'TSMC', quantity: 1000, averageCost: 550, currentPrice: 980, lastUpdated: new Date().toISOString() },
  { symbol: 'AAPL', name: 'Apple Inc.', quantity: 50, averageCost: 140, currentPrice: 185, lastUpdated: new Date().toISOString() },
];
