
import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Trash2, X, AlertTriangle, Pencil, Tag, Tags, HelpCircle, ArrowDown, ArrowUp, Plus, Calendar, DollarSign, Check } from 'lucide-react';
import { Transaction, CategoryItem, Category, Currency } from '../types.ts';
import { CATEGORIES as DEFAULT_ICONS } from '../constants.tsx';

interface TransactionsProps {
  transactions: Transaction[];
  categories: CategoryItem[];
  onAdd: (t: Omit<Transaction, 'id' | 'user_id'>) => void;
  onUpdate: (id: string, updates: Partial<Transaction>) => void;
  onDelete: (id: string) => void;
  onAddCategory: (cat: Omit<CategoryItem, 'id'>) => void;
  onUpdateCategory: (id: string, label: string) => void;
  onDeleteCategory: (id: string) => void;
  onOpenNewEntry?: () => void;
  formatCurrency: (amount: number) => string;
  currency: Currency;
}

const Transactions: React.FC<TransactionsProps> = ({ 
  transactions, 
  categories, 
  onUpdate, 
  onDelete,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onOpenNewEntry,
  formatCurrency,
  currency
}) => {
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Income' | 'Expense'>('All');
  
  const [newCatLabel, setNewCatLabel] = useState('');
  const [newCatType, setNewCatType] = useState<'income' | 'expense'>('expense');

  // Local state for the edit form
  const [editFormData, setEditFormData] = useState({
    description: '',
    amount: '',
    category: '',
    type: 'expense' as 'income' | 'expense',
    date: ''
  });

  useEffect(() => {
    if (editingTransaction) {
      setEditFormData({
        description: editingTransaction.description,
        amount: editingTransaction.amount.toString(),
        category: editingTransaction.category,
        type: editingTransaction.type,
        date: editingTransaction.date
      });
    }
  }, [editingTransaction]);

  const getCategoryInfo = (id: string) => {
    const cat = categories.find(c => c.id === id);
    if (!cat) return { label: id, color: '#94a3b8', icon: <HelpCircle size={14} /> };
    const defaultIcon = DEFAULT_ICONS.find(di => di.id === cat.id)?.icon || <Tag size={14} />;
    return { ...cat, icon: defaultIcon };
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction) return;
    
    onUpdate(editingTransaction.id, {
      description: editFormData.description,
      amount: parseFloat(editFormData.amount) || editingTransaction.amount,
      category: editFormData.category,
      type: editFormData.type,
      date: editFormData.date
    });
    setEditingTransaction(null);
  };

  const handleAddCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatLabel.trim()) return;
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
    onAddCategory({ label: newCatLabel.trim(), color: randomColor, type: newCatType });
    setNewCatLabel('');
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      onDelete(itemToDelete);
      setItemToDelete(null);
    }
  };

  const filtered = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase()) || 
                          t.category.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'All' || t.type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesType;
  });

  const availableCategoriesForEdit = useMemo(() => {
    return categories.filter(c => c.type === editFormData.type);
  }, [categories, editFormData.type]);

  const CategorySection = ({ type, title, icon: SectionIcon }: { type: 'income' | 'expense', title: string, icon: any }) => (
    <div className="space-y-4">
        <h4 className={`text-[11px] font-black uppercase tracking-widest flex items-center space-x-2 px-1 ${type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
            <SectionIcon size={14} />
            <span>{title}</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.filter(c => c.type === type).map(cat => (
                <div 
                    key={cat.id} 
                    className="flex items-center space-x-3 p-4 bg-white border border-slate-100 rounded-[1.25rem] group transition-all hover:border-brand-primary/30 hover:shadow-md focus-within:ring-4 focus-within:ring-brand-primary/5 focus-within:border-brand-primary/50 relative"
                >
                    <div className="p-2.5 rounded-xl shrink-0 transition-transform group-hover:scale-110" style={{ backgroundColor: `${cat.color}15` }}>
                        {React.isValidElement(getCategoryInfo(cat.id).icon) ? React.cloneElement(getCategoryInfo(cat.id).icon as React.ReactElement<any>, { size: 18, color: cat.color }) : <Tag size={18} color={cat.color} />}
                    </div>
                    
                    <div className="flex-1 flex items-center justify-between min-w-0">
                        <input 
                            type="text" 
                            defaultValue={cat.label}
                            onBlur={(e) => onUpdateCategory(cat.id, e.target.value)}
                            className="bg-transparent border-none outline-none font-bold text-slate-900 text-sm py-1 placeholder:text-slate-300 w-full truncate focus:placeholder:opacity-0"
                            placeholder="Category Name"
                        />
                        
                        <button 
                            onClick={() => onDeleteCategory(cat.id)}
                            className="ml-2 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 outline-none shrink-0"
                            aria-label="Delete Category"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            ))}
            {categories.filter(c => c.type === type).length === 0 && (
                <div className="col-span-full py-8 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 font-medium italic text-xs">
                    No categories in this section.
                </div>
            )}
        </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Transactions</h2>
          <p className="text-sm text-slate-500 font-medium">Detailed transaction logs and records.</p>
        </div>
        <div className="flex items-center space-x-3">
            <button 
                onClick={() => setShowCategoryModal(true)}
                className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center space-x-2 active:scale-95"
            >
                <Tags size={18} />
                <span>Manage Categories</span>
            </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all shadow-sm"
          />
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 w-full md:w-auto overflow-x-auto shadow-sm">
          {['All', 'Income', 'Expense'].map(f => (
            <button 
              key={f}
              onClick={() => setFilterType(f as any)}
              className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                filterType === f 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                <th className="px-8 py-5">Label</th>
                <th className="px-8 py-5">Category</th>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5 text-right">Amount</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? (
                filtered.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => {
                  const catInfo = getCategoryInfo(t.category);
                  return (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="font-bold text-slate-900">{t.description}</div>
                        <div className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>{t.type}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-xl" style={{ backgroundColor: `${catInfo.color}15` }}>
                                {React.isValidElement(catInfo.icon) ? React.cloneElement(catInfo.icon as React.ReactElement<any>, { size: 14, color: catInfo.color }) : <Tag size={14} color={catInfo.color} />}
                            </div>
                            <span className="text-sm text-slate-700 font-bold">{catInfo.label}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm font-bold text-slate-500">
                        {new Date(t.date).toLocaleDateString()}
                      </td>
                      <td className={`px-8 py-6 text-right font-bold text-lg ${t.type === 'income' ? 'text-green-600' : 'text-slate-900'}`}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => setEditingTransaction(t)}
                            className="p-2 text-slate-300 hover:text-brand-primary transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Pencil size={20} />
                          </button>
                          <button 
                            onClick={() => setItemToDelete(t.id)}
                            className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-medium italic">No matching records.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="block lg:hidden divide-y divide-slate-100">
          {filtered.length > 0 ? (
            filtered.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => {
              const catInfo = getCategoryInfo(t.category);
              return (
                <div key={t.id} className="p-5 flex items-center justify-between group">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-2xl" style={{ backgroundColor: `${catInfo.color}15` }}>
                      {React.isValidElement(catInfo.icon) ? React.cloneElement(catInfo.icon as React.ReactElement<any>, { size: 20, color: catInfo.color }) : <Tag size={20} color={catInfo.color} />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{t.description}</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{catInfo.label}</p>
                        <span className="text-slate-300">•</span>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(t.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className={`font-bold ${t.type === 'income' ? 'text-green-600' : 'text-slate-900'}`}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                        <button 
                            onClick={() => setEditingTransaction(t)}
                            className="p-2 text-slate-400 hover:text-brand-primary transition-colors"
                        >
                            <Pencil size={18} />
                        </button>
                        <button 
                            onClick={() => setItemToDelete(t.id)}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-20 text-center text-slate-400 font-medium italic">No records found.</div>
          )}
        </div>
      </div>

      {/* NEW ACTION BUTTON POSITION - Directly below the table, right-aligned */}
      {onOpenNewEntry && (
        <div className="flex justify-end pt-2">
          <button 
            onClick={onOpenNewEntry}
            className="p-5 bg-brand-primary text-white rounded-full shadow-2xl shadow-brand-primary/20 hover:brightness-110 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group"
            aria-label="Add New Transaction"
          >
            <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>
      )}

      {/* EDIT TRANSACTION MODAL */}
      {editingTransaction && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in"
          onClick={() => setEditingTransaction(null)}
        >
            <div 
              className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative border border-slate-100 my-auto"
              onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={() => setEditingTransaction(null)}
                    className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors"
                >
                    <X size={24} />
                </button>
                <div className="flex items-center space-x-3 mb-8">
                    <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl">
                        <Pencil size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Edit Transaction</h3>
                        <p className="text-xs text-slate-500 font-medium">Update the ledger entry details.</p>
                    </div>
                </div>

                <form onSubmit={handleUpdateSubmit} className="space-y-4">
                    <div className="flex bg-slate-100 p-1 rounded-2xl mb-4">
                        <button 
                            type="button" 
                            onClick={() => {
                                const newType = 'expense';
                                const filtered = categories.filter(c => c.type === newType);
                                setEditFormData({...editFormData, type: newType, category: filtered.length > 0 ? filtered[0].id : ''});
                            }} 
                            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${editFormData.type === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'}`}
                        >
                            Expense
                        </button>
                        <button 
                            type="button" 
                            onClick={() => {
                                const newType = 'income';
                                const filtered = categories.filter(c => c.type === newType);
                                setEditFormData({...editFormData, type: newType, category: filtered.length > 0 ? filtered[0].id : ''});
                            }} 
                            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${editFormData.type === 'income' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500'}`}
                        >
                            Income
                        </button>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                        <input 
                            required 
                            type="text" 
                            value={editFormData.description} 
                            onChange={e => setEditFormData({...editFormData, description: e.target.value})} 
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all font-bold text-slate-900" 
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount ({currency.code})</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input 
                                    required 
                                    type="number" 
                                    step="any" 
                                    value={editFormData.amount} 
                                    onChange={e => setEditFormData({...editFormData, amount: e.target.value})} 
                                    className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all font-black text-slate-900" 
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                            <div className="relative">
                                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none z-10 text-slate-700" size={18} />
                                <input 
                                    required 
                                    type="date" 
                                    value={editFormData.date} 
                                    onChange={e => setEditFormData({...editFormData, date: e.target.value})} 
                                    className="w-full pl-4 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all font-bold text-slate-900 cursor-pointer appearance-none" 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                        <select 
                            value={editFormData.category} 
                            onChange={e => setEditFormData({...editFormData, category: e.target.value as Category})} 
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all font-bold text-slate-900 appearance-none"
                        >
                            {availableCategoriesForEdit.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Submit buttons aligned to the lower right */}
                    <div className="flex justify-end space-x-3 pt-8">
                        <button 
                            type="button" 
                            onClick={() => setEditingTransaction(null)} 
                            className="px-6 py-3.5 text-slate-600 font-black hover:bg-slate-100 rounded-xl transition-colors text-sm"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="px-8 py-3.5 bg-brand-primary text-white font-black rounded-xl hover:brightness-110 transition-all shadow-xl shadow-brand-primary/20 flex items-center justify-center space-x-2 text-sm"
                        >
                            <Check size={18} />
                            <span>Update Entry</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
      )}

      {/* CATEGORY MANAGEMENT MODAL */}
      {showCategoryModal && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in overflow-y-auto"
          onClick={() => setShowCategoryModal(false)}
        >
            <div 
              className="bg-white w-full max-w-2xl rounded-[2.5rem] p-8 shadow-2xl relative border border-slate-100 flex flex-col max-h-[90vh] my-auto"
              onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={() => setShowCategoryModal(false)}
                    className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors z-20"
                >
                    <X size={24} />
                </button>
                
                <div className="mb-8">
                    <h3 className="text-xl font-black text-slate-900 mb-1 tracking-tight flex items-center space-x-2">
                        <Tags size={24} className="text-brand-primary" />
                        <span>Manage Categories</span>
                    </h3>
                    <p className="text-sm text-slate-500 font-medium">Categorize your transactions for better insights.</p>
                </div>

                <form onSubmit={handleAddCat} className="bg-slate-50 p-6 rounded-[2rem] space-y-4 mb-8 border border-slate-200 shadow-sm relative z-10">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5">Label</label>
                            <input 
                                type="text" 
                                value={newCatLabel}
                                onChange={e => setNewCatLabel(e.target.value)}
                                placeholder="e.g. Subscriptions"
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all font-bold text-slate-900 text-sm placeholder:text-slate-400"
                            />
                        </div>
                        <div className="w-full sm:w-56">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5">Type</label>
                            <div className="flex bg-white p-1 rounded-xl border border-slate-200">
                                <button type="button" onClick={() => setNewCatType('expense')} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${newCatType === 'expense' ? 'bg-red-500 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>Expense</button>
                                <button type="button" onClick={() => setNewCatType('income')} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${newCatType === 'income' ? 'bg-green-500 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>Income</button>
                            </div>
                        </div>
                        <div className="flex items-end">
                            <button 
                                type="submit"
                                className="w-full sm:w-auto bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-sm hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </form>

                <div className="flex-1 overflow-y-auto space-y-10 pr-2 custom-scrollbar pb-6">
                    <CategorySection type="expense" title="Expense Categories" icon={ArrowDown} />
                    <CategorySection type="income" title="Income Categories" icon={ArrowUp} />
                </div>

                <div className="mt-4 pt-6 border-t border-slate-100 flex justify-end">
                    <button 
                        onClick={() => setShowCategoryModal(false)}
                        className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-[0.99]"
                    >
                        Save & Close
                    </button>
                </div>
            </div>
        </div>,
        document.body
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {itemToDelete && createPortal(
        <div 
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in"
          onClick={() => setItemToDelete(null)}
        >
          <div 
            className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative border border-slate-100 text-center my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Delete Transaction?</h3>
            <p className="text-slate-500 text-sm font-medium mb-8">
              Are you sure you want to remove this record? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setItemToDelete(null)} 
                className="px-6 py-3.5 text-slate-600 font-black hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-8 py-3.5 bg-red-500 text-white font-black rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-100"
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

export default Transactions;
