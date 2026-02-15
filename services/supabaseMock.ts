
import { Transaction, Bill, Debt, SavingsGoal, CategoryItem } from '../types';

const MOCK_STORAGE_KEY = 'fintrack_pro_storage';

const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'Housing', label: 'Housing', color: '#3b82f6', type: 'expense' },
  { id: 'Food', label: 'Food', color: '#ef4444', type: 'expense' },
  { id: 'Transport', label: 'Transport', color: '#f59e0b', type: 'expense' },
  { id: 'Entertainment', label: 'Entertainment', color: '#8b5cf6', type: 'expense' },
  { id: 'Healthcare', label: 'Healthcare', color: '#ec4899', type: 'expense' },
  { id: 'Utilities', label: 'Utilities', color: '#10b981', type: 'expense' },
  { id: 'Shopping', label: 'Shopping', color: '#6366f1', type: 'expense' },
  { id: 'Savings', label: 'Savings', color: '#06b6d4', type: 'expense' },
  { id: 'Debt', label: 'Debt', color: '#64748b', type: 'expense' },
  { id: 'Income', label: 'Income', color: '#22c55e', type: 'income' },
  { id: 'Investment', label: 'Investment', color: '#0ea5e9', type: 'income' },
  { id: 'Other_Income', label: 'Other Income', color: '#10b981', type: 'income' },
  { id: 'Other', label: 'Other', color: '#94a3b8', type: 'expense' },
];

const getInitialData = () => {
  const stored = localStorage.getItem(MOCK_STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  return {
    categories: DEFAULT_CATEGORIES,
    transactions: [
      { id: '1', user_id: 'test-user', amount: 2500, category: 'Income', description: 'Salary', type: 'income', date: '2023-10-01', is_recurring: true },
      { id: '2', user_id: 'test-user', amount: 1200, category: 'Housing', description: 'Monthly Rent', type: 'expense', date: '2023-10-02', is_recurring: true },
      { id: '3', user_id: 'test-user', amount: 80, category: 'Food', description: 'Grocery Store', type: 'expense', date: '2023-10-05', is_recurring: false },
      { id: '4', user_id: 'test-user', amount: 150, category: 'Utilities', description: 'Electricity Bill', type: 'expense', date: '2023-10-10', is_recurring: true },
    ],
    bills: [
      { id: '1', user_id: 'test-user', name: 'Netflix', amount: 15.99, due_date: '2023-11-15', category: 'Entertainment', is_paid: false },
      { id: '2', user_id: 'test-user', name: 'Gym Membership', amount: 45, due_date: '2023-11-01', category: 'Healthcare', is_paid: true },
    ],
    debts: [
      { id: '1', user_id: 'test-user', creditor: 'Student Loan', total_amount: 15000, remaining_balance: 12400, interest_rate: 4.5, due_date: '2023-11-05' },
    ],
    savings: [
      { id: '1', user_id: 'test-user', title: 'New Laptop', target_amount: 2500, current_amount: 1200, deadline: '2024-03-01' },
    ]
  };
};

let db = getInitialData();

const persist = () => localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(db));

export const MockService = {
  // Categories
  getCategories: async () => [...db.categories],
  addCategory: async (cat: Omit<CategoryItem, 'id'>) => {
    const newCat = { ...cat, id: Math.random().toString(36).substr(2, 9) };
    db.categories.push(newCat);
    persist();
    return newCat;
  },
  updateCategory: async (id: string, label: string) => {
    const cat = db.categories.find(c => c.id === id);
    if (cat) {
        cat.label = label;
        persist();
    }
  },
  deleteCategory: async (id: string) => {
    db.categories = db.categories.filter(c => c.id !== id);
    persist();
  },

  // Transactions
  getTransactions: async () => [...db.transactions],
  addTransaction: async (t: Omit<Transaction, 'id'>) => {
    const newT = { ...t, id: Math.random().toString(36).substr(2, 9) };
    db.transactions.push(newT);
    persist();
    return newT;
  },
  updateTransaction: async (id: string, updates: Partial<Transaction>) => {
    const index = db.transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      db.transactions[index] = { ...db.transactions[index], ...updates };
      persist();
    }
  },
  deleteTransaction: async (id: string) => {
    db.transactions = db.transactions.filter(t => t.id !== id);
    persist();
  },

  // Bills
  getBills: async () => [...db.bills],
  addBill: async (b: Omit<Bill, 'id'>) => {
    const newB = { ...b, id: Math.random().toString(36).substr(2, 9) };
    db.bills.push(newB);
    persist();
    return newB;
  },
  toggleBillPaid: async (id: string) => {
    const bill = db.bills.find(b => b.id === id);
    if (bill) bill.is_paid = !bill.is_paid;
    persist();
  },
  deleteBill: async (id: string) => {
    db.bills = db.bills.filter(b => b.id !== id);
    persist();
  },

  // Debts
  getDebts: async () => [...db.debts],
  addDebt: async (d: Omit<Debt, 'id'>) => {
    const newD = { ...d, id: Math.random().toString(36).substr(2, 9) };
    db.debts.push(newD);
    persist();
    return newD;
  },
  updateDebtBalance: async (id: string, newBalance: number) => {
    const debt = db.debts.find(d => d.id === id);
    if (debt) debt.remaining_balance = newBalance;
    persist();
  },
  deleteDebt: async (id: string) => {
    db.debts = db.debts.filter(d => d.id !== id);
    persist();
  },

  // Savings
  getSavings: async () => [...db.savings],
  addSaving: async (s: Omit<SavingsGoal, 'id'>) => {
    const newS = { ...s, id: Math.random().toString(36).substr(2, 9) };
    db.savings.push(newS);
    persist();
    return newS;
  },
  updateSaving: async (id: string, updates: Partial<SavingsGoal>) => {
    const index = db.savings.findIndex(s => s.id === id);
    if (index !== -1) {
      db.savings[index] = { ...db.savings[index], ...updates };
      persist();
    }
  },
  deleteSaving: async (id: string) => {
    db.savings = db.savings.filter(s => s.id !== id);
    persist();
  }
};
