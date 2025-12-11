import React, { useEffect, useState } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';
import { Sparkles, TrendingUp, Wallet, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { storageService } from '../services/storageService';
import { geminiService } from '../services/geminiService';
import { Account, Transaction, StockHolding, TransactionType } from '../types';
import ReactMarkdown from 'react-markdown'; // Assuming standard markdown render, actually I'll just use simple text rendering to avoid extra dependencies for this demo or regex.

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

const Dashboard: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stocks, setStocks] = useState<StockHolding[]>([]);
  const [advice, setAdvice] = useState<string>('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const acc = await storageService.getAccounts();
      const tx = await storageService.getTransactions();
      const stk = await storageService.getStocks();
      setAccounts(acc);
      setTransactions(tx);
      setStocks(stk);
    };
    loadData();
  }, []);

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const stockValue = stocks.reduce((sum, s) => sum + (s.quantity * s.currentPrice), 0);
  const netWorth = totalBalance + stockValue;

  const income = transactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((sum, t) => sum + t.amount, 0);
    
  const expense = transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((sum, t) => sum + t.amount, 0);

  // Prepare Chart Data
  const expensesByCategory = transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc: any, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const pieData = Object.keys(expensesByCategory).map(key => ({
    name: key,
    value: expensesByCategory[key]
  }));

  const handleGetAIAdvice = async () => {
    setLoadingAdvice(true);
    const result = await geminiService.generateFinancialAdvice(accounts, transactions, stocks);
    setAdvice(result);
    setLoadingAdvice(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Net Worth</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                ${netWorth.toLocaleString()}
              </h3>
            </div>
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
              <TrendingUp size={20} />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Cash Balance</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                ${totalBalance.toLocaleString()}
              </h3>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <Wallet size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Income</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                +${income.toLocaleString()}
              </h3>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <ArrowUpCircle size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Expenses</p>
              <h3 className="text-2xl font-bold text-red-500 mt-1">
                -${expense.toLocaleString()}
              </h3>
            </div>
            <div className="p-2 bg-red-50 rounded-lg text-red-500">
              <ArrowDownCircle size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96">
                <h4 className="text-lg font-semibold mb-6">Expense Breakdown</h4>
                {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label
                        >
                        {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                        </Pie>
                        <RechartsTooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                        <Legend />
                    </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-400">
                        No expense data available
                    </div>
                )}
            </div>
        </div>

        {/* AI Insight Section */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl shadow-sm border border-indigo-100">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-indigo-600" />
            <h3 className="text-lg font-bold text-indigo-900">Gemini AI Advisor</h3>
          </div>
          
          <div className="min-h-[200px] text-slate-700 text-sm leading-relaxed whitespace-pre-line">
            {advice ? (
               advice
            ) : (
                <p className="text-slate-500 italic">
                    Click the button below to generate a personalized financial health report based on your current data.
                </p>
            )}
          </div>

          <button
            onClick={handleGetAIAdvice}
            disabled={loadingAdvice}
            className="mt-6 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all shadow-md flex justify-center items-center gap-2"
          >
            {loadingAdvice ? 'Analyzing...' : 'Generate Insights'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
