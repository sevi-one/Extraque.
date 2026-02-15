
export type Category = string;

export interface CategoryItem {
  id: string;
  label: string;
  color: string;
  type: 'income' | 'expense';
  icon?: any; // Stores the lucide icon name or component reference
}

export interface User {
  id: string;
  email: string;
  name: string;
  is_premium: boolean;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  category: Category;
  description: string;
  type: 'income' | 'expense';
  date: string;
  is_recurring: boolean;
}

export interface Bill {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  due_date: string;
  category: Category;
  is_paid: boolean;
}

export interface Debt {
  id: string;
  user_id: string;
  creditor: string;
  total_amount: number;
  remaining_balance: number;
  interest_rate: number;
  due_date: string;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
}

export type PeriodType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export interface DateFilter {
  type: PeriodType;
  startDate: string;
  endDate: string;
}

export interface Currency {
  code: string;
  symbol: string;
  rate: number; // Rate relative to USD (base)
  label: string;
}
