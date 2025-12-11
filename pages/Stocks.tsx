import React, { useEffect, useState } from 'react';
import { storageService } from '../services/storageService';
import { StockHolding, TradeType } from '../types';
import { RefreshCw, TrendingUp, TrendingDown, Plus } from 'lucide-react';

const Stocks: React.FC = () => {
  const [stocks, setStocks] = useState<StockHolding[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Trade Form
  const [symbol, setSymbol] = useState('');
  const [tradeType, setTradeType] = useState<TradeType>(TradeType.BUY);
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [fee, setFee] = useState('0');

  useEffect(() => {
    loadStocks();
  }, []);

  const loadStocks = async () => {
    const data = await storageService.getStocks();
    setStocks(data);
  };

  const handleSimulateUpdate = async () => {
      // In a real app, this fetches from an API. Here we randomize slightly for demo.
      const updated = stocks.map(async s => {
          const change = (Math.random() - 0.5) * 10; // +/- 5
          let newPrice = s.currentPrice + change;
          if (newPrice < 1) newPrice = 1;
          await storageService.updateStockPrice(s.symbol, newPrice);
      });
      await Promise.all(updated);
      loadStocks();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await storageService.saveStockTrade({
        id: Date.now().toString(),
        symbol: symbol.toUpperCase(),
        type: tradeType,
        quantity: parseInt(quantity),
        price: parseFloat(price),
        date: new Date().toISOString(),
        fee: parseFloat(fee)
    });
    setIsModalOpen(false);
    setSymbol('');
    setQuantity('');
    setPrice('');
    loadStocks();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Investment Portfolio</h2>
        <div className="flex gap-2">
            <button 
                onClick={handleSimulateUpdate}
                className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-50 transition"
            >
            <RefreshCw size={18} /> Sync Prices
            </button>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition"
            >
            <Plus size={18} /> Record Trade
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                <tr>
                    <th className="p-4">Symbol</th>
                    <th className="p-4 text-right">Qty</th>
                    <th className="p-4 text-right">Avg Cost</th>
                    <th className="p-4 text-right">Current Price</th>
                    <th className="p-4 text-right">Market Value</th>
                    <th className="p-4 text-right">P/L</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {stocks.map(s => {
                    const marketValue = s.quantity * s.currentPrice;
                    const costBasis = s.quantity * s.averageCost;
                    const pl = marketValue - costBasis;
                    const plPercent = ((pl / costBasis) * 100).toFixed(2);
                    const isPositive = pl >= 0;

                    return (
                        <tr key={s.symbol} className="hover:bg-slate-50">
                            <td className="p-4 font-bold text-slate-700">{s.symbol}</td>
                            <td className="p-4 text-right text-slate-600">{s.quantity}</td>
                            <td className="p-4 text-right text-slate-600">${s.averageCost.toFixed(2)}</td>
                            <td className="p-4 text-right font-medium text-slate-800">${s.currentPrice.toFixed(2)}</td>
                            <td className="p-4 text-right font-medium">${marketValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                            <td className={`p-4 text-right font-bold flex items-center justify-end gap-1 ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                                {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                {pl > 0 ? '+' : ''}{pl.toLocaleString(undefined, { maximumFractionDigits: 0 })} ({plPercent}%)
                            </td>
                        </tr>
                    )
                })}
                 {stocks.length === 0 && (
                    <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">No holdings found. Add a trade to start.</td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>

      {/* Trade Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Record Stock Trade</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
               <div className="flex gap-4">
                 <label className="flex items-center gap-2">
                     <input type="radio" name="type" checked={tradeType === TradeType.BUY} onChange={() => setTradeType(TradeType.BUY)} />
                     Buy
                 </label>
                 <label className="flex items-center gap-2">
                     <input type="radio" name="type" checked={tradeType === TradeType.SELL} onChange={() => setTradeType(TradeType.SELL)} />
                     Sell
                 </label>
               </div>

               <div>
                 <label className="block text-sm font-medium text-slate-700">Symbol</label>
                 <input required type="text" value={symbol} onChange={e => setSymbol(e.target.value)} className="w-full border p-2 rounded-lg" placeholder="e.g. AAPL" />
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700">Quantity</label>
                    <input required type="number" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full border p-2 rounded-lg" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700">Price per Share</label>
                    <input required type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full border p-2 rounded-lg" />
                 </div>
               </div>

               <div>
                 <label className="block text-sm font-medium text-slate-700">Fees (Optional)</label>
                 <input type="number" value={fee} onChange={e => setFee(e.target.value)} className="w-full border p-2 rounded-lg" />
               </div>

               <div className="flex justify-end gap-3 mt-6">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                 <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-lg">Save Trade</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stocks;
