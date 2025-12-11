import React, { useEffect, useState } from 'react';
import { Plus, Trash2, CreditCard } from 'lucide-react';
import { storageService } from '../services/storageService';
import { Account, AccountType } from '../types';

const Accounts: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>(AccountType.BANK);
  const [balance, setBalance] = useState('');

  const loadAccounts = async () => {
    const data = await storageService.getAccounts();
    setAccounts(data);
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newAccount: Account = {
      id: Date.now().toString(), // Temp ID gen
      name,
      type,
      balance: parseFloat(balance),
      currency: 'TWD'
    };
    await storageService.saveAccount(newAccount);
    setIsModalOpen(false);
    resetForm();
    loadAccounts();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
        await storageService.deleteAccount(id);
        loadAccounts();
    }
  };

  const resetForm = () => {
    setName('');
    setBalance('');
    setType(AccountType.BANK);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">My Accounts</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition"
        >
          <Plus size={18} /> Add Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((acc) => (
          <div key={acc.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-full ${
                  acc.type === AccountType.CREDIT ? 'bg-pink-100 text-pink-600' : 'bg-emerald-100 text-emerald-600'
              }`}>
                <CreditCard size={24} />
              </div>
              <button onClick={() => handleDelete(acc.id)} className="text-slate-400 hover:text-red-500">
                <Trash2 size={18} />
              </button>
            </div>
            <h3 className="font-semibold text-lg text-slate-800">{acc.name}</h3>
            <p className="text-sm text-slate-500 mb-4">{acc.type}</p>
            <p className={`text-2xl font-bold ${acc.balance < 0 ? 'text-red-500' : 'text-slate-800'}`}>
              ${acc.balance.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Simple Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add New Account</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Account Name</label>
                <input 
                  required
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none" 
                  placeholder="e.g. Chase Savings"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select 
                  value={type} 
                  onChange={e => setType(e.target.value as AccountType)}
                  className="w-full border border-slate-300 rounded-lg p-2 outline-none"
                >
                  {Object.values(AccountType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Initial Balance</label>
                <input 
                  required
                  type="number" 
                  value={balance} 
                  onChange={e => setBalance(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none" 
                  placeholder="0.00"
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
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;
