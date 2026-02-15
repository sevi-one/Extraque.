
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Calendar, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  X, 
  AlertTriangle, 
  BarChart3, 
  DollarSign, 
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { Bill, CategoryItem, Category, Currency } from '../types';

interface BillsProps {
  bills: Bill[];
  onTogglePaid: (id: string) => void;
  onAdd: (b: Omit<Bill, 'id' | 'user_id'>) => void;
  onDelete: (id: string) => void;
  categories: CategoryItem[];
  formatCurrency: (amount: number) => string;
  currency: Currency;
}

const Bills: React.FC<BillsProps> = ({ bills, onTogglePaid, onAdd, onDelete, categories, formatCurrency, currency }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>(categories.filter(c => c.type === 'expense')[0]?.id || 'Utilities');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);

  // Summary Calculations
  const summary = useMemo(() => {
    const totalUnpaid = bills.filter(b => !b.is_paid).reduce((acc, b) => acc + b.amount, 0);
    const totalPaid = bills.filter(b => b.is_paid).reduce((acc, b) => acc + b.amount, 0);
    const unpaidCount = bills.filter(b => !b.is_paid).length;
    
    // Categorized breakdown
    const catMap: Record<string, { count: number, total: number }> = {};
    bills.forEach(b => {
      if (!catMap[b.category]) {
        catMap[b.category] = { count: 0, total: 0 };
      }
      catMap[b.category].count += 1;
      catMap[b.category].total += b.amount;
    });

    const categoryBreakdown = Object.entries(catMap).map(([id, stats]) => ({
      id,
      label: categories.find(c => c.id === id)?.label || id,
      color: categories.find(c => c.id === id)?.color || '#94a3b8',
      ...stats
    })).sort((a, b) => b.total - a.total);

    // Next bill due
    const upcoming = bills
      .filter(b => !b.is_paid && new Date(b.due_date) >= new Date(new Date().setHours(0,0,0,0)))
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0];

    return { totalUnpaid, totalPaid, unpaidCount, categoryBreakdown, upcoming };
  }, [bills, categories]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    onAdd({
      name,
      amount: amountNum,
      due_date: dueDate,
      category: category,
      is_paid: false
    });
    
    // Reset form
    setName('');
    setAmount('');
    setDueDate(new Date().toISOString().split('T')[0]);
    setShowAddModal(false);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      onDelete(itemToDelete);
      setItemToDelete(null);
    }
  };

  const isOverdue = (date: string) => new Date(date) < new Date(new Date().setHours(0,0,0,0)) && !bills.find(b => b.due_date === date)?.is_paid;

  const expenseCategories = categories.filter(c => c.type === 'expense');

  return (
    <div className="space-y-8 animate-in relative">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Bills</h2>
          <p className="text-sm text-slate-500 font-medium">Analyze and manage your recurring financial commitments.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-brand-primary text-white px-5 py-3 rounded-2xl font-black text-sm hover:brightness-110 transition-all shadow-xl shadow-brand-primary/20 flex items-center justify-center space-x-2 active:scale-95"
        >
          <Plus size={20} />
          <span>New Bill</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center space-x-5">
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl">
                <Clock size={28} />
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Unpaid</p>
                <p className="text-2xl font-black text-slate-900">{formatCurrency(summary.totalUnpaid)}</p>
                <p className="text-xs font-bold text-slate-500">{summary.unpaidCount} Pending Bills</p>
            </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center space-x-5">
            <div className="p-4 bg-green-50 text-green-600 rounded-2xl">
                <CheckCircle2 size={28} />
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Paid</p>
                <p className="text-2xl font-black text-slate-900">{formatCurrency(summary.totalPaid)}</p>
                <p className="text-xs font-bold text-slate-500">This Month</p>
            </div>
        </div>
        <div className="bg-slate-900 p-6 rounded-[2rem] shadow-xl text-white flex items-center space-x-5 col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="p-4 bg-white/10 text-white rounded-2xl">
                <Calendar size={28} />
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Due</p>
                {summary.upcoming ? (
                    <>
                        <p className="text-lg font-black truncate max-w-[150px]">{summary.upcoming.name}</p>
                        <p className="text-xs font-bold text-brand-primary/60">{new Date(summary.upcoming.due_date).toLocaleDateString()}</p>
                    </>
                ) : (
                    <p className="text-lg font-black">All Clear!</p>
                )}
            </div>
        </div>
      </div>

      {/* Categorized Summary Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-brand-primary/10 text-brand-primary rounded-xl">
                    <BarChart3 size={20} />
                </div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Category Distribution</h3>
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aggregated Data</span>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-50/50">
                    <tr>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Count</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Volume</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Share</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {summary.categoryBreakdown.map((cat) => {
                        const totalAll = summary.totalPaid + summary.totalUnpaid;
                        const share = totalAll > 0 ? (cat.total / totalAll) * 100 : 0;
                        return (
                            <tr key={cat.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-8 py-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></div>
                                        <span className="font-bold text-slate-700 text-sm">{cat.label}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-4 text-center">
                                    <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-600">
                                        {cat.count} Items
                                    </span>
                                </td>
                                <td className="px-8 py-4 text-right">
                                    <span className="font-black text-slate-900">{formatCurrency(cat.total)}</span>
                                </td>
                                <td className="px-8 py-4 text-right">
                                    <div className="flex items-center justify-end space-x-3">
                                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                                            <div className="h-full bg-brand-primary rounded-full" style={{ width: `${share}%` }}></div>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400">{Math.round(share)}%</span>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                    {summary.categoryBreakdown.length === 0 && (
                        <tr>
                            <td colSpan={4} className="px-8 py-10 text-center text-slate-400 font-medium italic text-sm">No billing history available.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* Grid of Bills */}
      <div className="space-y-4">
        <h3 className="text-xl font-black text-slate-900 flex items-center space-x-2 ml-1">
            <TrendingUp size={22} className="text-brand-primary" />
            <span>Timeline</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bills.sort((a,b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()).map(bill => (
            <div key={bill.id} className={`bg-white p-6 rounded-[2rem] border transition-all group ${bill.is_paid ? 'opacity-60 grayscale border-slate-100' : 'border-slate-200 hover:shadow-xl hover:border-brand-primary/30'}`}>
                <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${bill.is_paid ? 'bg-green-100 text-green-600' : 'bg-brand-primary/10 text-brand-primary'}`}>
                    {bill.is_paid ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                </div>
                <div className="text-right flex flex-col items-end">
                    <div className="flex items-center space-x-2">
                        <button 
                            onClick={() => setItemToDelete(bill.id)}
                            className="p-1.5 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 size={16} />
                        </button>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg ${isOverdue(bill.due_date) && !bill.is_paid ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                            {isOverdue(bill.due_date) && !bill.is_paid ? 'Overdue' : bill.is_paid ? 'Paid' : 'Pending'}
                        </span>
                    </div>
                    <p className="text-2xl font-black text-slate-900 mt-2">{formatCurrency(bill.amount)}</p>
                </div>
                </div>
                
                <h3 className="font-black text-slate-900 truncate tracking-tight">{bill.name}</h3>
                <div className="flex items-center space-x-1 mt-1 mb-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <Calendar size={14} />
                    <span>Due {new Date(bill.due_date).toLocaleDateString()}</span>
                </div>

                <button 
                    onClick={() => onTogglePaid(bill.id)}
                    className={`w-full py-3.5 rounded-2xl font-black transition-all text-sm flex items-center justify-center space-x-2 ${bill.is_paid ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' : 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20 hover:brightness-110 active:scale-95'}`}
                >
                    <span>{bill.is_paid ? 'Mark Unpaid' : 'Mark as Paid'}</span>
                    {!bill.is_paid && <ChevronRight size={18} />}
                </button>
            </div>
            ))}
            {bills.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-400 bg-white border border-dashed rounded-[2.5rem] font-medium italic">
                No bills added yet. Start by clicking "New Bill".
            </div>
            )}
        </div>
      </div>

      {/* ADD BILL MODAL */}
      {showAddModal && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in overflow-y-auto"
          onClick={() => setShowAddModal(false)}
        >
          <div 
            className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative border border-slate-100 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <X size={24} />
            </button>
            <h3 className="text-xl font-black text-slate-900 mb-6 tracking-tight">Schedule New Bill</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bill Name</label>
                <input 
                  required 
                  type="text"
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all font-bold text-slate-900 placeholder:text-slate-400" 
                  placeholder="e.g. Electric Bill" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount ({currency.code})</label>
                  <input 
                    required 
                    type="number" 
                    step="any"
                    value={amount} 
                    onChange={e => setAmount(e.target.value)} 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all font-black text-slate-900 placeholder:text-slate-400" 
                    placeholder="0.00" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Due Date</label>
                  <div className="relative group">
                    <Calendar 
                      className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none z-10" 
                      size={18} 
                      color="#0f172a" 
                    />
                    <input 
                      required 
                      type="date" 
                      value={dueDate} 
                      onChange={e => setDueDate(e.target.value)} 
                      className="w-full pl-4 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all font-bold text-slate-900 cursor-pointer appearance-none" 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value as Category)} 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all font-bold text-slate-900 appearance-none"
                >
                  {expenseCategories.length > 0 ? (
                    expenseCategories.map(cat => (<option key={cat.id} value={cat.id}>{cat.label}</option>))
                  ) : (
                    <option disabled value="">No expense categories</option>
                  )}
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 text-slate-600 font-black hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={expenseCategories.length === 0} className={`flex-1 py-4 text-white font-black rounded-xl transition-colors shadow-xl shadow-brand-primary/20 ${expenseCategories.length === 0 ? 'bg-slate-300 cursor-not-allowed' : 'bg-brand-primary hover:brightness-110'}`}>
                  Save Bill
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {itemToDelete && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in"
          onClick={() => setItemToDelete(null)}
        >
          <div 
            className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl relative border border-slate-100 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Delete Bill?</h3>
            <p className="text-slate-500 text-sm font-medium mb-8">
              Are you sure you want to remove this bill? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setItemToDelete(null)} 
                className="flex-1 py-3.5 text-slate-600 font-black hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-3.5 bg-red-500 text-white font-black rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-100"
              >
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Bills;
