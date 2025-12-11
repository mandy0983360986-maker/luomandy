import React, { useEffect, useState } from 'react';
import { storageService } from '../services/storageService';
import { Transaction, TransactionType, Account } from '../types';
import { CATEGORIES } from '../constants';
import { Plus } from 'lucide-react';

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [accountId, setAccountId] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const tx = await storageService.getTransactions();
    const acc = await storageService.getAccounts();
    setTransactions(tx.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setAccounts(acc);
    if (acc.length > 0 && !accountId) setAccountId(acc[0].id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId) return alert('Please create an account first');

    await storageService.addTransaction({
      accountId,
      amount: parseFloat(amount),
      type,
      category: category || 'Other',
      date: new Date().toISOString(),
      note
    });
    
    setIsModalOpen(false);
    resetForm();
    loadData();
  };

  const resetForm = () => {
    setAmount('');
    setNote('');
    setCategory('');
    setType(TransactionType.EXPENSE);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Transactions</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition"
        >
          <Plus size={18} /> Add Transaction
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
            <tr>
              <th className="p-4 font-semibold">Date</th>
              <th className="p-4 font-semibold">Category</th>
              <th className="p-4 font-semibold">Note</th>
              <th className="p-4 font-semibold">Account</th>
              <th className="p-4 font-semibold text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map((tx) => {
               const accountName = accounts.find(a => a.id === tx.accountId)?.name || 'Unknown';
               const isExpense = tx.type === TransactionType.EXPENSE;
               return (
                <tr key={tx.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 text-slate-600">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className="p-4">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                            {tx.category}
                        </span>
                    </td>
                    <td className="p-4 text-slate-800 font-medium">{tx.note}</td>
                    <td className="p-4 text-slate-500 text-sm">{accountName}</td>
                    <td className={`p-4 text-right font-bold ${isExpense ? 'text-red-500' : 'text-emerald-600'}`}>
                        {isExpense ? '-' : '+'}${tx.amount.toLocaleString()}
                    </td>
                </tr>
               );
            })}
            {transactions.length === 0 && (
                <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">No transactions found.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

       {/* Transaction Modal */}
       {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add Transaction</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <button
                    type="button"
                    onClick={() => setType(TransactionType.EXPENSE)}
                    className={`p-2 rounded-lg text-sm font-medium border ${type === TransactionType.EXPENSE ? 'bg-red-50 border-red-200 text-red-600' : 'border-slate-200 text-slate-500'}`}
                >
                    Expense
                </button>
                <button
                    type="button"
                    onClick={() => setType(TransactionType.INCOME)}
                    className={`p-2 rounded-lg text-sm font-medium border ${type === TransactionType.INCOME ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'border-slate-200 text-slate-500'}`}
                >
                    Income
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                <input 
                  required
                  type="number" 
                  value={amount} 
                  onChange={e => setAmount(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 outline-none" 
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select 
                    required
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 outline-none"
                >
                    <option value="">Select Category</option>
                    {(type === TransactionType.INCOME ? CATEGORIES.INCOME : CATEGORIES.EXPENSE).map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Account</label>
                <select 
                    required
                    value={accountId}
                    onChange={e => setAccountId(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 outline-none"
                >
                    {accounts.map(a => (
                        <option key={a.id} value={a.id}>{a.name} (${a.balance})</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Note</label>
                <input 
                  type="text" 
                  value={note} 
                  onChange={e => setNote(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 outline-none" 
                  placeholder="Description..."
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
