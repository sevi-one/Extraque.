
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.tsx';
import Dashboard from './components/Dashboard.tsx';
import Transactions from './components/Transactions.tsx';
import Bills from './components/Bills.tsx';
import DebtView from './components/Debt.tsx';
import Savings from './components/Savings.tsx';
import Auth from './components/Auth.tsx';
import { MockService } from './services/supabaseMock.ts';
import { AuthService } from './services/authService.ts';
import { Transaction, Bill, Debt, SavingsGoal, PeriodType, CategoryItem, Currency, User } from './types.ts';
import { TrendingUp } from 'lucide-react';
import { CURRENCIES } from './constants.tsx';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [savings, setSavings] = useState<SavingsGoal[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<PeriodType>('monthly');
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);
  const [currency, setCurrency] = useState<Currency>(CURRENCIES[0]);

  const fetchData = async () => {
    if (!user) return;
    const [t, b, d, s, c] = await Promise.all([
      MockService.getTransactions(),
      MockService.getBills(),
      MockService.getDebts(),
      MockService.getSavings(),
      MockService.getCategories()
    ]);
    setAllTransactions(t);
    setBills(b);
    setDebts(d);
    setSavings(s);
    setCategories(c);
    setLoading(false);
  };

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchData();
    }
  }, [user]);

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    return allTransactions.filter(t => {
      const tDate = new Date(t.date);
      if (period === 'daily') return tDate.toDateString() === now.toDateString();
      if (period === 'weekly') {
        const tempNow = new Date();
        const startOfWeek = new Date(tempNow.setDate(tempNow.getDate() - tempNow.getDay()));
        return tDate >= startOfWeek;
      }
      if (period === 'monthly') {
        return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
      }
      if (period === 'yearly') {
        return tDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [allTransactions, period]);

  // Utility to format currency with the active symbol - Numerical conversion REMOVED
  const formatCurrency = (amount: number): string => {
    return `${currency.symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleAddTransaction = async (t: Omit<Transaction, 'id' | 'user_id'>) => {
    if (!user) return;
    await MockService.addTransaction({ ...t, user_id: user.id });
    fetchData();
  };

  const handleUpdateTransaction = async (id: string, updates: Partial<Transaction>) => {
    await MockService.updateTransaction(id, updates);
    fetchData();
  };

  const handleDeleteTransaction = async (id: string) => {
    await MockService.deleteTransaction(id);
    fetchData();
  };

  const handleToggleBill = async (id: string) => {
    await MockService.toggleBillPaid(id);
    fetchData();
  };

  const handleAddBill = async (b: Omit<Bill, 'id' | 'user_id'>) => {
    if (!user) return;
    await MockService.addBill({ ...b, user_id: user.id });
    fetchData();
  };

  const handleDeleteBill = async (id: string) => {
    await MockService.deleteBill(id);
    fetchData();
  };

  const handleUpdateDebt = async (id: string, balance: number) => {
    await MockService.updateDebtBalance(id, balance);
    fetchData();
  };

  const handleAddDebt = async (d: Omit<Debt, 'id' | 'user_id'>) => {
    if (!user) return;
    await MockService.addDebt({ ...d, user_id: user.id });
    fetchData();
  };

  const handleDeleteDebt = async (id: string) => {
    await MockService.deleteDebt(id);
    fetchData();
  };

  const handleAddSaving = async (s: Omit<SavingsGoal, 'id' | 'user_id'>) => {
    if (!user) return;
    await MockService.addSaving({ ...s, user_id: user.id });
    fetchData();
  };

  const handleUpdateSaving = async (id: string, updates: Partial<SavingsGoal>) => {
    await MockService.updateSaving(id, updates);
    fetchData();
  };

  const handleDeleteSaving = async (id: string) => {
    await MockService.deleteSaving(id);
    fetchData();
  };

  const handleAddCategory = async (cat: Omit<CategoryItem, 'id'>) => {
    await MockService.addCategory(cat);
    fetchData();
  };

  const handleUpdateCategory = async (id: string, label: string) => {
    await MockService.updateCategory(id, label);
    fetchData();
  };

  const handleDeleteCategory = async (id: string) => {
    await MockService.deleteCategory(id);
    fetchData();
  };

  const handleLogout = () => {
    AuthService.logout();
    setUser(null);
    setAllTransactions([]);
  };

  if (loading) {
    return (
        <div className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-center space-y-4">
            <div className="bg-brand-primary p-4 rounded-3xl shadow-2xl shadow-brand-primary/20 animate-bounce">
              <TrendingUp size={48} className="text-white" />
            </div>
            <div className="text-center">
              <p className="text-slate-900 font-black text-2xl tracking-tight">Extraque</p>
              <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-1">Analyzing Accounts...</p>
            </div>
        </div>
    );
  }

  if (!user) {
    return <Auth onAuthenticated={setUser} />;
  }

  return (
    <Router>
      <Layout 
        user={user}
        isOpen={isNewEntryOpen} 
        setIsOpen={setIsNewEntryOpen} 
        onAdd={handleAddTransaction} 
        categories={categories}
        currency={currency}
        onCurrencyChange={setCurrency}
        onLogout={handleLogout}
      >
        <Routes>
          <Route 
            path="/" 
            element={
              <Dashboard 
                transactions={filteredTransactions} 
                bills={bills} 
                debts={debts} 
                savings={savings} 
                period={period}
                setPeriod={setPeriod}
                categories={categories}
                onOpenNewEntry={() => setIsNewEntryOpen(true)}
                formatCurrency={formatCurrency}
                currency={currency}
              />
            } 
          />
          <Route 
            path="/transactions" 
            element={
                <Transactions 
                    transactions={filteredTransactions} 
                    categories={categories}
                    onAdd={handleAddTransaction} 
                    onUpdate={handleUpdateTransaction} 
                    onDelete={handleDeleteTransaction}
                    onAddCategory={handleAddCategory}
                    onUpdateCategory={handleUpdateCategory}
                    onDeleteCategory={handleDeleteCategory}
                    onOpenNewEntry={() => setIsNewEntryOpen(true)}
                    formatCurrency={formatCurrency}
                    currency={currency}
                />
            } 
          />
          <Route path="/bills" element={<Bills bills={bills} onTogglePaid={handleToggleBill} onAdd={handleAddBill} onDelete={handleDeleteBill} categories={categories} formatCurrency={formatCurrency} currency={currency} />} />
          <Route path="/debt" element={<DebtView debts={debts} onUpdate={handleUpdateDebt} onAdd={handleAddDebt} onDelete={handleDeleteDebt} formatCurrency={formatCurrency} currency={currency} />} />
          <Route path="/savings" element={<Savings savings={savings} onAdd={handleAddSaving} onUpdate={handleUpdateSaving} onDelete={handleDeleteSaving} formatCurrency={formatCurrency} currency={currency} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
