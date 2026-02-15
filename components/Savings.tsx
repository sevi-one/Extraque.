
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { PiggyBank, Target, Calendar, Plus, X, Trash2, AlertTriangle, Pencil, Check, ChevronRight, Trophy, Coins, ArrowUpRight } from 'lucide-react';
import { SavingsGoal, Currency } from '../types';
import confetti from 'canvas-confetti';

interface SavingsProps {
  savings: SavingsGoal[];
  onAdd: (s: Omit<SavingsGoal, 'id' | 'user_id'>) => void;
  onUpdate: (id: string, updates: Partial<SavingsGoal>) => void;
  onDelete: (id: string) => void;
  formatCurrency: (amount: number) => string;
  currency: Currency;
}

const Savings: React.FC<SavingsProps> = ({ savings, onAdd, onUpdate, onDelete, formatCurrency, currency }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [editValue, setEditValue] = useState('');
  
  const initialFormState = {
    title: '',
    target: '',
    current: '',
    deadline: new Date().toISOString().split('T')[0]
  };

  const [newGoal, setNewGoal] = useState(initialFormState);

  useEffect(() => {
    if (showAdd) {
      setNewGoal(initialFormState);
    }
  }, [showAdd]);

  const triggerCelebration = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 2000 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const current = parseFloat(newGoal.current);
    const target = parseFloat(newGoal.target);
    
    onAdd({
      title: newGoal.title,
      target_amount: target,
      current_amount: current,
      deadline: newGoal.deadline
    });

    if (current >= target && target > 0) {
      triggerCelebration();
    }

    setShowAdd(false);
  };

  const handleQuickUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGoal && editValue !== '') {
        const newValue = parseFloat(editValue);
        onUpdate(editingGoal.id, { current_amount: newValue });
        
        if (newValue >= editingGoal.target_amount && editingGoal.current_amount < editingGoal.target_amount) {
          triggerCelebration();
        }
        
        setEditingGoal(null);
        setEditValue('');
    }
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      onDelete(itemToDelete);
      setItemToDelete(null);
    }
  };

  const openQuickUpdate = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setEditValue(goal.current_amount.toString());
  };

  return (
    <div className="space-y-8 animate-in relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Savings Vault</h2>
          <p className="text-sm text-slate-500 font-medium">Track your journey toward financial milestones.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="w-full sm:w-auto bg-brand-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:brightness-110 transition-all shadow-lg shadow-brand-primary/20 flex items-center justify-center space-x-2 active:scale-95"
        >
          <Plus size={18} />
          <span>New Goal</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savings.map(goal => {
          const progress = (goal.current_amount / goal.target_amount) * 100;
          const isCompleted = goal.current_amount >= goal.target_amount;
          const remaining = Math.max(0, goal.target_amount - goal.current_amount);

          return (
            <div key={goal.id} className={`group bg-white rounded-[1.5rem] border shadow-sm relative overflow-hidden transition-all duration-300 flex flex-col ${isCompleted ? 'border-green-100 bg-gradient-to-br from-white to-green-50/10' : 'border-slate-100'}`}>
              
              <div className="flex justify-between items-center p-5 pb-0 relative z-10">
                <div className={`p-3 rounded-xl transition-all ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-brand-primary/10 text-brand-primary'}`}>
                  {isCompleted ? <Trophy size={20} /> : <PiggyBank size={20} />}
                </div>
                
                <button 
                  onClick={() => setItemToDelete(goal.id)}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  title="Archive goal"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="p-5 pt-4 relative z-10 flex-1 flex flex-col">
                <div className="mb-6">
                  <h3 className={`text-lg font-bold mb-1 transition-colors leading-tight ${isCompleted ? 'text-green-900' : 'text-slate-900 group-hover:text-brand-primary'}`}>{goal.title}</h3>
                  <div className="flex items-center space-x-2 text-slate-400 text-xs font-medium">
                    <Calendar size={12} className={isCompleted ? 'text-green-500' : 'text-brand-primary'} />
                    <span>Target: {new Date(goal.deadline).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="space-y-5 mt-auto">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Accumulated</p>
                      <p className={`text-lg font-bold ${isCompleted ? 'text-green-600' : 'text-slate-900'}`}>
                        {formatCurrency(goal.current_amount)}
                      </p>
                    </div>
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Target</p>
                      <p className="text-lg font-bold text-slate-900">
                        {formatCurrency(goal.target_amount)}
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="flex justify-between items-center mb-1.5 px-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isCompleted ? 'text-green-600' : 'text-brand-primary'}`}>
                        {isCompleted ? '100% Achieved' : `${Math.round(progress)}% Complete`}
                      </span>
                      {!isCompleted && (
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {formatCurrency(remaining)} left
                        </span>
                      )}
                    </div>
                    
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden relative">
                      <div 
                        style={{ width: `${Math.min(progress, 100)}%` }} 
                        className={`h-full rounded-full transition-all duration-1000 ease-out relative ${isCompleted ? 'bg-green-500' : 'bg-brand-primary shadow-sm'}`}
                      >
                        {!isCompleted && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                        )}
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => openQuickUpdate(goal)}
                    className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 ${
                      isCompleted 
                      ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100' 
                      : 'bg-slate-900 text-white hover:bg-brand-primary active:scale-95'
                    }`}
                  >
                    <Coins size={14} />
                    <span>{isCompleted ? 'View Details' : 'Add to Vault'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {savings.length === 0 && (
          <div className="col-span-full p-12 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-100 flex flex-col items-center">
            <div className="p-4 bg-slate-50 rounded-full mb-3">
              <PiggyBank size={32} className="text-slate-300" />
            </div>
            <p className="text-lg font-bold text-slate-500">Your vault is empty</p>
            <p className="text-sm text-slate-400 font-medium">Start by creating your first savings goal.</p>
          </div>
        )}
      </div>

      {/* QUICK UPDATE MODAL - Add to Vault */}
      {editingGoal && createPortal(
        <div 
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in"
          onClick={() => setEditingGoal(null)}
        >
            <div 
              className="bg-white w-full max-w-sm rounded-[2rem] p-7 shadow-2xl relative border border-slate-100 my-auto"
              onClick={(e) => e.stopPropagation()}
            >
                <button 
                  onClick={() => setEditingGoal(null)}
                  className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all"
                >
                  <X size={20} />
                </button>
                
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl mb-3">
                        <Coins size={28} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Add to Vault</h3>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-0.5">{editingGoal.title}</p>
                    </div>
                </div>

                <form onSubmit={handleQuickUpdateSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Current Amount ({currency.code})</label>
                        <div className="relative">
                            <input 
                                required 
                                type="number" 
                                step="any"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-slate-900 text-xl text-center" 
                                placeholder="0.00" 
                                autoFocus
                                value={editValue} 
                                onChange={e => setEditValue(e.target.value)} 
                            />
                        </div>
                        <div className="flex justify-between items-center px-1">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Before</span>
                                <span className="text-xs font-semibold text-slate-600">{formatCurrency(editingGoal.current_amount)}</span>
                            </div>
                            <div className="flex flex-col text-right">
                                <span className="text-[9px] font-bold text-brand-primary uppercase tracking-wider">Target</span>
                                <span className="text-xs font-semibold text-brand-primary">{formatCurrency(editingGoal.target_amount)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col space-y-2 pt-2">
                        <button type="submit" className="w-full py-3.5 bg-brand-primary text-white font-bold text-sm rounded-xl hover:brightness-110 transition-all shadow-md active:scale-95 flex items-center justify-center space-x-2">
                            <Check size={18} />
                            <span>Save Changes</span>
                        </button>
                        <button type="button" onClick={() => setEditingGoal(null)} className="w-full py-2 text-slate-400 font-bold text-xs hover:text-slate-900 transition-colors">Cancel</button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
      )}

      {/* NEW GOAL MODAL */}
      {showAdd && createPortal(
        <div 
          key="add-saving-modal" 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in"
          onClick={() => setShowAdd(false)}
        >
            <div 
              className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl relative border border-slate-100 my-auto"
              onClick={(e) => e.stopPropagation()}
            >
                <button 
                  onClick={() => setShowAdd(false)}
                  className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all"
                >
                  <X size={20} />
                </button>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">New Goal</h3>
                  <p className="text-xs text-slate-500 font-medium">Set a target and start saving towards it.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Goal Name</label>
                      <input 
                        required 
                        autoFocus
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-slate-900 text-sm" 
                        placeholder="e.g. New Apartment" 
                        value={newGoal.title} 
                        onChange={e => setNewGoal({...newGoal, title: e.target.value})} 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Target ({currency.code})</label>
                          <input 
                            required 
                            type="number" 
                            step="any"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-slate-900 text-sm" 
                            placeholder="0.00" 
                            value={newGoal.target} 
                            onChange={e => setNewGoal({...newGoal, target: e.target.value})} 
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Starting ({currency.code})</label>
                          <input 
                            required 
                            type="number" 
                            step="any"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-slate-900 text-sm" 
                            placeholder="0.00" 
                            value={newGoal.current} 
                            onChange={e => setNewGoal({...newGoal, current: e.target.value})} 
                          />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Deadline</label>
                      <div className="relative">
                        <Calendar 
                          className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none z-10 text-brand-primary" 
                          size={16} 
                        />
                        <input 
                          required 
                          type="date" 
                          value={newGoal.deadline} 
                          onChange={e => setNewGoal({...newGoal, deadline: e.target.value})} 
                          className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all font-bold text-slate-900 text-sm cursor-pointer appearance-none" 
                        />
                      </div>
                    </div>
                    <div className="flex space-x-3 pt-4">
                        <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-3 text-slate-400 font-bold text-xs hover:text-slate-900 transition-colors">Cancel</button>
                        <button type="submit" className="flex-2 py-3 bg-brand-primary text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 transition-all shadow-md active:scale-95 flex items-center justify-center space-x-2">
                            <span>Open Vault</span>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
      )}

      {itemToDelete && createPortal(
        <div 
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in"
          onClick={() => setItemToDelete(null)}
        >
          <div 
            className="bg-white w-full max-w-sm rounded-[1.5rem] p-7 shadow-2xl relative border border-slate-100 text-center my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center text-red-500 mb-4">
              <AlertTriangle size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">Dissolve Goal?</h3>
            <p className="text-slate-500 font-medium mb-6 px-2 text-sm leading-relaxed">
              Are you certain you wish to purge this record? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setItemToDelete(null)} 
                className="flex-1 py-3 text-slate-400 font-bold text-xs hover:bg-slate-50 rounded-xl transition-colors"
              >
                Keep
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-3 bg-red-500 text-white font-bold text-xs rounded-xl hover:bg-red-600 transition-all shadow-md"
              >
                Purge
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 2.5s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default Savings;
