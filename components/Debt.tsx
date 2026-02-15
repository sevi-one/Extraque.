
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
// Fixed: Added TrendingUp to the imports from lucide-react
import { CreditCard, TrendingDown, TrendingUp, Plus, ChevronRight, X, Trash2, AlertTriangle, DollarSign, Calendar } from 'lucide-react';
import { Debt, Currency } from '../types';

interface DebtProps {
  debts: Debt[];
  onUpdate: (id: string, balance: number) => void;
  onAdd: (d: Omit<Debt, 'id' | 'user_id'>) => void;
  onDelete: (id: string) => void;
  formatCurrency: (amount: number) => string;
  currency: Currency;
}

const DebtView: React.FC<DebtProps> = ({ debts, onUpdate, onAdd, onDelete, formatCurrency, currency }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [updateBalanceValue, setUpdateBalanceValue] = useState('');
  
  const initialFormState = {
    creditor: '',
    total: '',
    remaining: '',
    interest: '',
    dueDate: new Date().toISOString().split('T')[0]
  };

  const [newDebt, setNewDebt] = useState(initialFormState);

  // Reset form state whenever the modal visibility changes to prevent stale data/focus issues
  useEffect(() => {
    if (showAdd) {
      setNewDebt(initialFormState);
    }
  }, [showAdd]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      creditor: newDebt.creditor,
      total_amount: parseFloat(newDebt.total),
      remaining_balance: parseFloat(newDebt.remaining),
      interest_rate: parseFloat(newDebt.interest),
      due_date: newDebt.dueDate
    });
    setShowAdd(false);
  };

  const handleUpdateBalanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDebt && updateBalanceValue !== '') {
      onUpdate(editingDebt.id, parseFloat(updateBalanceValue));
      setEditingDebt(null);
      setUpdateBalanceValue('');
    }
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      onDelete(itemToDelete);
      setItemToDelete(null);
    }
  };

  const openUpdateModal = (debt: Debt) => {
    setEditingDebt(debt);
    setUpdateBalanceValue(debt.remaining_balance.toString());
  };

  return (
    <div className="space-y-6 animate-in relative">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-slate-900">Debt Portfolio</h2>
            <p className="text-sm text-slate-500 font-medium">Manage your creditors and payoff strategy.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center space-x-2 active:scale-95"
        >
          <Plus size={20} />
          <span>Record Debt</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
            {debts.map(debt => {
                const progress = ((debt.total_amount - debt.remaining_balance) / debt.total_amount) * 100;
                return (
                    <div key={debt.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="p-3 bg-slate-100 rounded-2xl text-slate-600">
                                    <CreditCard size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">{debt.creditor}</h4>
                                    <p className="text-xs font-semibold text-slate-400">{debt.interest_rate}% Interest</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <button 
                                    onClick={() => setItemToDelete(debt.id)}
                                    className="p-1 mb-1 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={16} />
                                </button>
                                <p className="text-xs font-bold text-slate-500 uppercase">Balance</p>
                                <p className="text-lg font-extrabold text-slate-900">{formatCurrency(debt.remaining_balance)}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold text-slate-500">
                                <span>Paid: {formatCurrency(debt.total_amount - debt.remaining_balance)}</span>
                                <span>{Math.round(progress)}% Paid</span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-brand-primary rounded-full transition-all duration-1000" 
                                    style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-50">
                            <button 
                                className="text-sm font-bold text-brand-primary hover:brightness-110 flex items-center group/btn"
                                onClick={() => openUpdateModal(debt)}
                            >
                                Update Balance 
                                <ChevronRight size={16} className="ml-1 group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                );
            })}
            {debts.length === 0 && <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-dashed font-medium italic">No debts recorded.</div>}
        </div>

        <div className="bg-brand-primary rounded-3xl p-8 text-white h-fit md:sticky md:top-8 shadow-2xl shadow-brand-primary/20">
            <h3 className="text-xl font-bold mb-6 flex items-center space-x-2">
                <TrendingUp className="text-white/70" />
                <span>Financial Summary</span>
            </h3>
            <div className="space-y-6">
                <div>
                    <p className="text-white/60 text-sm font-medium">Aggregate Remaining Debt</p>
                    <p className="text-4xl font-black tracking-tight">{formatCurrency(debts.reduce((acc, d) => acc + d.remaining_balance, 0))}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-white/5 rounded-[2rem] border border-white/5">
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Accounts</p>
                        <p className="text-2xl font-bold">{debts.length}</p>
                    </div>
                    <div className="p-5 bg-white/5 rounded-[2rem] border border-white/5">
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Avg Interest</p>
                        <p className="text-2xl font-bold">
                            {(debts.reduce((acc, d) => acc + d.interest_rate, 0) / (debts.length || 1)).toFixed(1)}%
                        </p>
                    </div>
                </div>
                <div className="p-6 bg-white/10 border border-white/10 rounded-[2rem]">
                    <p className="text-white text-[10px] font-black uppercase tracking-widest mb-1">Paid Principal</p>
                    <p className="text-2xl font-bold text-white/90">
                        {formatCurrency(debts.reduce((acc, d) => acc + (d.total_amount - d.remaining_balance), 0))}
                    </p>
                </div>
            </div>
        </div>
      </div>

      {/* UPDATE BALANCE MODAL */}
      {editingDebt && createPortal(
        <div 
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in"
          onClick={() => setEditingDebt(null)}
        >
            <div 
              className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative border border-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
                <button 
                  onClick={() => setEditingDebt(null)}
                  className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors"
                >
                  <X size={24} />
                </button>
                <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-2xl">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Update Balance</h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{editingDebt.creditor}</p>
                    </div>
                </div>
                <form onSubmit={handleUpdateBalanceSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Balance ({currency.code})</label>
                        <input 
                            required 
                            type="number" 
                            step="any"
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-black text-slate-900 text-2xl" 
                            placeholder="0.00" 
                            autoFocus
                            value={updateBalanceValue} 
                            onChange={e => setUpdateBalanceValue(e.target.value)} 
                        />
                        <p className="text-xs text-slate-400 font-medium px-1 italic">Current: {formatCurrency(editingDebt.remaining_balance)}</p>
                    </div>
                    <div className="flex space-x-3">
                        <button type="button" onClick={() => setEditingDebt(null)} className="flex-1 py-4 text-slate-600 font-black hover:bg-slate-100 rounded-2xl transition-colors">Cancel</button>
                        <button type="submit" className="flex-1 py-4 bg-brand-primary text-white font-black rounded-2xl hover:brightness-110 transition-all shadow-xl shadow-brand-primary/20 active:scale-95">Update</button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
      )}

      {/* RECORD NEW DEBT MODAL */}
      {showAdd && createPortal(
        <div key="add-debt-modal" className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in">
            <div 
              className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative border border-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
                <button 
                  onClick={() => setShowAdd(false)}
                  className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors"
                >
                  <X size={24} />
                </button>
                <h3 className="text-xl font-black text-slate-900 mb-6 tracking-tight">Record New Debt</h3>
                <form onSubmit={handleAdd} className="space-y-4" autoComplete="off">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Creditor</label>
                      <input 
                        required 
                        autoFocus
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all font-bold text-slate-900" 
                        placeholder="e.g. Student Loan" 
                        value={newDebt.creditor} 
                        onChange={e => setNewDebt({...newDebt, creditor: e.target.value})} 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Initial Total ({currency.code})</label>
                          <input required type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all font-black text-slate-900" placeholder="0.00" value={newDebt.total} onChange={e => setNewDebt({...newDebt, total: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Balance ({currency.code})</label>
                          <input required type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all font-black text-slate-900" placeholder="0.00" value={newDebt.remaining} onChange={e => setNewDebt({...newDebt, remaining: e.target.value})} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Interest Rate (%)</label>
                          <input required type="number" step="0.1" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all font-bold text-slate-900" placeholder="e.g. 4.5" value={newDebt.interest} onChange={e => setNewDebt({...newDebt, interest: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Next Due Date</label>
                          <div className="relative group">
                            <Calendar 
                              className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none z-10" 
                              size={18} 
                              color="#0f172a" 
                            />
                            <input 
                              required 
                              type="date" 
                              value={newDebt.dueDate} 
                              onChange={e => setNewDebt({...newDebt, dueDate: e.target.value})} 
                              className="w-full pl-4 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all font-bold text-slate-900 cursor-pointer appearance-none" 
                            />
                          </div>
                        </div>
                    </div>
                    <div className="flex space-x-3 pt-4">
                        <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-4 text-slate-600 font-black hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                        <button type="submit" className="flex-1 py-4 bg-slate-900 text-white font-black rounded-xl hover:bg-slate-800 transition-colors shadow-xl shadow-slate-200">Save Portfolio</button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {itemToDelete && createPortal(
        <div 
          className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in"
          onClick={() => setItemToDelete(null)}
        >
          <div 
            className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl relative border border-slate-100 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Delete Debt?</h3>
            <p className="text-slate-500 text-sm font-medium mb-8">
              Are you sure you want to remove this debt record? This action cannot be undone.
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

export default DebtView;
