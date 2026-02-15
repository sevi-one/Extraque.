
import React from 'react';
import { 
  Home, Utensils, Car, Film, HeartPulse, Zap, ShoppingBag, 
  PiggyBank, CreditCard, DollarSign, HelpCircle 
} from 'lucide-react';
import { Currency } from './types';

export const CATEGORIES = [
  { id: 'Housing', label: 'Housing', color: '#3b82f6', icon: <Home size={18} /> },
  { id: 'Food', label: 'Food', color: '#ef4444', icon: <Utensils size={18} /> },
  { id: 'Transport', label: 'Transport', color: '#f59e0b', icon: <Car size={18} /> },
  { id: 'Entertainment', label: 'Entertainment', color: '#8b5cf6', icon: <Film size={18} /> },
  { id: 'Healthcare', label: 'Healthcare', color: '#ec4899', icon: <HeartPulse size={18} /> },
  { id: 'Utilities', label: 'Utilities', color: '#10b981', icon: <Zap size={18} /> },
  { id: 'Shopping', label: 'Shopping', color: '#6366f1', icon: <ShoppingBag size={18} /> },
  { id: 'Savings', label: 'Savings', color: '#06b6d4', icon: <PiggyBank size={18} /> },
  { id: 'Debt', label: 'Debt', color: '#64748b', icon: <CreditCard size={18} /> },
  { id: 'Income', label: 'Income', color: '#22c55e', icon: <DollarSign size={18} /> },
  { id: 'Other', label: 'Other', color: '#94a3b8', icon: <HelpCircle size={18} /> },
];

export const PERIOD_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'custom', label: 'Custom' },
];

export const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', rate: 1, label: 'US Dollar' },
  { code: 'EUR', symbol: '€', rate: 0.94, label: 'Euro' },
  { code: 'GBP', symbol: '£', rate: 0.79, label: 'British Pound' },
  { code: 'JPY', symbol: '¥', rate: 151.5, label: 'Japanese Yen' },
  { code: 'PHP', symbol: '₱', rate: 58.5, label: 'Philippine Peso' },
  { code: 'CAD', symbol: 'CA$', rate: 1.37, label: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', rate: 1.52, label: 'Australian Dollar' },
];
