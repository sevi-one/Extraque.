
import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  CreditCard, 
  PiggyBank, 
  TrendingUp, 
  Calendar,
  Menu,
  X,
  LogOut,
  Globe
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Category, Transaction, CategoryItem, Currency, User } from '../types.ts';
import { CURRENCIES } from '../constants.tsx';

interface NavItemProps {
  to: string;
  icon: any;
  label: string;
  active: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label, active, onClick }) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

interface LayoutProps {
  user: User;
  children: React.ReactNode;
  categories: CategoryItem[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onAdd: (t: Omit<Transaction, 'id' | 'user_id'>) => void;
  currency: Currency;
  onCurrencyChange: (c: Currency) => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ user, children, categories, isOpen, setIsOpen, onAdd, currency, onCurrencyChange, onLogout }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    type: 'expense' as 'income' | 'expense',
    date: new Date().toISOString().split('T')[0]
  });

  // Sync category when categories load or type changes
  useEffect(() => {
    const available = categories.filter(c => c.type === formData.type);
    if (available.length > 0 && !formData.category) {
        setFormData(prev => ({ ...prev, category: available[0].id }));
    }
  }, [categories, formData.type]);

  const availableCategories = useMemo(() => {
    return categories.filter(c => c.type === formData.type);
  }, [categories, formData.type]);

  const handleTypeToggle = (type: 'income' | 'expense') => {
    const filtered = categories.filter(c => c.type === type);
    setFormData({
      ...formData,
      type,
      category: filtered.length > 0 ? filtered[0].id : ''
    });
  };

  const handleNewEntrySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(formData.amount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    onAdd({
      amount: amountNum,
      description: formData.description,
      category: formData.category,
      type: formData.type,
      date: formData.date,
      is_recurring: false
    });
    setIsOpen(false);
    // Reset form for next time
    setFormData({
        amount: '',
        description: '',
        category: categories.filter(c => c.type === 'expense')[0]?.id || '',
        type: 'expense',
        date: new Date().toISOString().split('T')[0]
    });
  };

  const navLinks = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/transactions', icon: Receipt, label: 'Transactions' },
    { to: '/bills', icon: Calendar, label: 'Bills' },
    { to: '/debt', icon: CreditCard, label: 'Debt' },
    { to: '/savings', icon: PiggyBank, label: 'Savings' },
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden relative">
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b px-6 py-4 flex items-center justify-between z-40 shrink-0">
        <div className="flex items-center space-x-2">
          <div className="bg-brand-primary p-1.5 rounded-lg">
            <TrendingUp className="text-white" size={20} />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-800">Extra<span className="text-brand-primary">que</span></span>
        </div>
        <button 
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar - Persistent fixed position */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-300 ease-in-out shadow-xl md:shadow-none
        md:translate-x-0 md:block
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col px-4 py-8">
          <div className="hidden md:flex items-center space-x-3 mb-10 px-2">
            <div className="bg-brand-primary p-2 rounded-xl shadow-lg shadow-brand-primary/20">
              <TrendingUp className="text-white" size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">Extra<span className="text-brand-primary">que</span></span>
          </div>

          <nav className="flex-1 space-y-1">
            {navLinks.map((link) => (
              <NavItem 
                key={link.to} 
                {...link} 
                active={location.pathname === link.to} 
                onClick={() => setSidebarOpen(false)}
              />
            ))}
          </nav>

          <div className="mt-auto space-y-4 pt-6 border-t border-slate-100">
            {/* Currency Switcher */}
            <div className="px-3">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Display Currency</label>
              <div className="relative group">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-brand-primary transition-colors" size={16} />
                <select 
                  value={currency.code}
                  onChange={(e) => {
                    const selected = CURRENCIES.find(c => c.code === e.target.value);
                    if (selected) onCurrencyChange(selected);
                  }}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all font-bold text-xs text-slate-700 appearance-none cursor-pointer"
                >
                  {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>{c.code} - {c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-3 px-3 py-3 bg-slate-50 rounded-2xl group transition-colors">
              <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold border-2 border-white shadow-sm shrink-0">
                {getInitials(user.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 truncate font-black uppercase tracking-widest">
                  {user.is_premium ? 'Premium' : 'Free Plan'}
                </p>
              </div>
              <button 
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area - Scrollable independently */}
      <main className="flex-1 flex flex-col min-w-0 md:pl-64 overflow-hidden relative">
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-10 custom-scrollbar">
          <div className="max-w-6xl mx-auto pb-10">
            {children}
          </div>
        </div>
      </main>

      {/* New Entry Modal - Using Portal to ensure it overlaps everything independently of DOM tree */}
      {isOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative border border-slate-100 my-auto">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <X size={24} />
            </button>
            <h3 className="text-xl font-black text-slate-900 mb-6 tracking-tight">New Entry</h3>
            <form onSubmit={handleNewEntrySubmit} className="space-y-4">
              <div className="flex bg-slate-100 p-1 rounded-2xl mb-4">
                <button type="button" onClick={() => handleTypeToggle('expense')} className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.type === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'}`}>Expense</button>
                <button type="button" onClick={() => handleTypeToggle('income')} className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.type === 'income' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500'}`}>Income</button>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                <input required type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all font-bold text-slate-900" placeholder="e.g. Starbucks" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount ({currency.code})</label>
                  <input required type="number" step="any" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all font-black text-slate-900" placeholder="0.00" />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                  <div className="relative group">
                    <Calendar 
                      className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none z-10" 
                      size={18} 
                      color="#0f172a" 
                    />
                    <input 
                      required 
                      type="date" 
                      value={formData.date} 
                      onChange={e => setFormData({...formData, date: e.target.value})} 
                      className="w-full pl-4 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all font-bold text-slate-900 cursor-pointer appearance-none" 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                <select 
                  value={formData.category} 
                  onChange={e => setFormData({...formData, category: e.target.value as Category})} 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all font-bold text-slate-900 appearance-none"
                >
                  {availableCategories.length > 0 ? (
                    availableCategories.map(cat => (<option key={cat.id} value={cat.id}>{cat.label}</option>))
                  ) : (
                    <option disabled value="">No categories for this type</option>
                  )}
                </select>
              </div>

              {/* Action buttons aligned to the lower right */}
              <div className="flex justify-end space-x-3 pt-6">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)} 
                  className="px-6 py-3.5 text-slate-600 font-black hover:bg-slate-100 rounded-xl transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={availableCategories.length === 0} 
                  className={`px-8 py-3.5 text-white font-black rounded-xl transition-colors shadow-lg text-sm ${availableCategories.length === 0 ? 'bg-slate-300 cursor-not-allowed' : 'bg-brand-primary hover:brightness-110 shadow-brand-primary/20'}`}
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden animate-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
