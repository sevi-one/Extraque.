
import React, { useMemo, useState } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  TrendingUp, 
  PiggyBank, 
  CreditCard, 
  Plus,
  ArrowRight,
  Calendar,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { Transaction, Debt, SavingsGoal, Bill, PeriodType, CategoryItem, Currency } from '../types.ts';
import { PERIOD_OPTIONS } from '../constants.tsx';
import { useNavigate } from 'react-router-dom';
import FinancialInsights from './FinancialInsights.tsx';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, 
  Title, Tooltip, Legend, ArcElement, Filler
);

interface DashboardProps {
  transactions: Transaction[];
  debts: Debt[];
  savings: SavingsGoal[];
  bills: Bill[];
  period: PeriodType;
  setPeriod: (p: PeriodType) => void;
  categories: CategoryItem[];
  onOpenNewEntry: () => void;
  formatCurrency: (amount: number) => string;
  currency: Currency;
}

const SummaryCard = ({ title, amount, icon: Icon, trend, colorClass, formatCurrency }: any) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 h-full flex flex-col justify-between">
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl ${colorClass}`}>
          <Icon className="text-white" size={24} />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{title}</p>
      <h3 className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(amount)}</h3>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ transactions, debts, savings, bills, period, setPeriod, categories, onOpenNewEntry, formatCurrency, currency }) => {
  const navigate = useNavigate();
  const [showInsights, setShowInsights] = useState(false);
  
  const totals = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const debtTotal = debts.reduce((acc, d) => acc + d.remaining_balance, 0);
    const savingsTotal = savings.reduce((acc, s) => acc + s.current_amount, 0);
    return { income, expenses, debtTotal, savingsTotal, net: income - expenses };
  }, [transactions, debts, savings]);

  const expenseByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      counts[t.category] = (counts[t.category] || 0) + t.amount;
    });
    return counts;
  }, [transactions]);

  const trendData = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const dataByDate: Record<string, { income: number; expense: number }> = {};
    
    sorted.forEach(t => {
      if (!dataByDate[t.date]) dataByDate[t.date] = { income: 0, expense: 0 };
      if (t.type === 'income') dataByDate[t.date].income += t.amount;
      else dataByDate[t.date].expense += t.amount;
    });

    const labels = Object.keys(dataByDate).sort();
    
    const incomePoints = labels.map(d => dataByDate[d].income);
    const expensePoints = labels.map(d => dataByDate[d].expense);

    return {
      labels: labels.map(d => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
      income: incomePoints,
      expense: expensePoints
    };
  }, [transactions]);

  const doughnutData = {
    labels: Object.keys(expenseByCategory).map(id => categories.find(c => c.id === id)?.label || id),
    datasets: [{
      data: Object.values(expenseByCategory),
      backgroundColor: Object.keys(expenseByCategory).map(id => 
        categories.find(c => c.id === id)?.color || '#94a3b8'
      ),
      borderWidth: 0,
      hoverOffset: 10
    }]
  };

  const lineData = {
    labels: trendData.labels.length > 0 ? trendData.labels : ['No Data'],
    datasets: [
      {
        label: 'Income',
        data: trendData.income.length > 0 ? trendData.income : [0],
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.05)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#fff',
        pointBorderWidth: 2
      },
      {
        label: 'Expenses',
        data: trendData.expense.length > 0 ? trendData.expense : [0],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#fff',
        pointBorderWidth: 2
      }
    ]
  };

  return (
    <div className="space-y-8 animate-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Financial Overview</h1>
            <button 
              onClick={() => setShowInsights(!showInsights)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-full transition-all border ${
                showInsights 
                  ? 'bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              <Sparkles size={14} className={showInsights ? 'animate-pulse' : ''} />
              <span className="text-[10px] font-black uppercase tracking-widest">AI Insights</span>
              {showInsights ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
            </button>
          </div>
          <p className="text-slate-500 font-medium text-lg">Manage your wealth and track progress.</p>
        </div>
        <div className="flex items-center bg-white p-1 rounded-2xl shadow-sm border border-slate-100 overflow-x-auto">
          {PERIOD_OPTIONS.map(opt => (
            <button 
              key={opt.value}
              onClick={() => setPeriod(opt.value as PeriodType)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                period === opt.value 
                  ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className={`${showInsights ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
          <div className={`grid grid-cols-1 sm:grid-cols-2 ${showInsights ? 'lg:grid-cols-2' : 'lg:grid-cols-4'} gap-6`}>
            <SummaryCard title="Income" amount={totals.income} icon={Wallet} colorClass="bg-green-500" trend={12} formatCurrency={formatCurrency} />
            <SummaryCard title="Expenses" amount={totals.expenses} icon={TrendingUp} colorClass="bg-red-500" trend={-4} formatCurrency={formatCurrency} />
            <SummaryCard title="Total Savings" amount={totals.savingsTotal} icon={PiggyBank} colorClass="bg-brand-primary" formatCurrency={formatCurrency} />
            <SummaryCard title="Remaining Debt" amount={totals.debtTotal} icon={CreditCard} colorClass="bg-slate-800" formatCurrency={formatCurrency} />
          </div>
        </div>
        {showInsights && (
          <div className="lg:col-span-4 animate-in">
            <FinancialInsights transactions={transactions} debts={debts} savings={savings} currency={currency} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <button 
          onClick={onOpenNewEntry}
          className="group flex items-center justify-between p-6 bg-brand-primary rounded-3xl text-white shadow-xl shadow-brand-primary/20 hover:brightness-110 transition-all active:scale-95"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-2xl">
              <Plus size={24} />
            </div>
            <div className="text-left">
              <p className="font-bold text-lg">Add Transaction</p>
              <p className="text-white/70 text-sm">Income or Expense</p>
            </div>
          </div>
          <ArrowRight className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
        </button>
        <button 
          onClick={() => navigate('/bills')}
          className="group flex items-center justify-between p-6 bg-slate-900 rounded-3xl text-white shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/10 rounded-2xl">
              <Calendar size={24} />
            </div>
            <div className="text-left">
              <p className="font-bold text-lg">Pay a Bill</p>
              <p className="text-slate-400 text-sm">Upcoming obligations</p>
            </div>
          </div>
          <ArrowRight className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 h-[450px] flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">Cash Flow Trend</h3>
                  <div className="flex items-center space-x-4 text-xs font-bold uppercase">
                    <div className="flex items-center space-x-1"><div className="w-2 h-2 rounded-full bg-green-500"></div><span>Income</span></div>
                    <div className="flex items-center space-x-1"><div className="w-2 h-2 rounded-full bg-red-500"></div><span>Expense</span></div>
                  </div>
                </div>
                <div className="flex-1 min-h-0">
                    <Line 
                        data={lineData} 
                        options={{ 
                            responsive: true, 
                            maintainAspectRatio: false,
                            plugins: { 
                                legend: { display: false },
                                tooltip: {
                                    backgroundColor: '#1e293b',
                                    padding: 12,
                                    titleFont: { weight: 'bold' },
                                    bodyFont: { weight: 'bold' },
                                    cornerRadius: 12,
                                    callbacks: {
                                        label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}`
                                    }
                                }
                            },
                            scales: { 
                              y: { 
                                beginAtZero: true, 
                                grid: { color: '#f8fafc' }, 
                                ticks: { 
                                  font: { weight: 'bold' },
                                  callback: (val) => typeof val === 'number' ? formatCurrency(val) : val
                                } 
                              }, 
                              x: { grid: { display: false }, ticks: { font: { weight: 'bold' } } } 
                            }
                        }} 
                    />
                </div>
            </div>
        </div>

        <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
                <h3 className="text-xl font-black text-slate-800 mb-8 tracking-tight">Spending Breakdown</h3>
                <div className="h-[220px] relative flex items-center justify-center mb-6">
                    <Doughnut 
                        data={doughnutData} 
                        options={{ 
                            responsive: true, 
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            cutout: '75%'
                        }} 
                    />
                    <div className="absolute flex flex-col items-center pointer-events-none">
                        <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Spent</span>
                        <span className="text-2xl font-black text-slate-900">{formatCurrency(totals.expenses)}</span>
                    </div>
                </div>
                <div className="space-y-3">
                    {Object.entries(expenseByCategory).sort((a,b) => (b[1] as number) - (a[1] as number)).slice(0, 4).map(([catId, val]) => (
                        <div key={catId} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: categories.find(c => c.id === catId)?.color }}></div>
                                <span className="text-sm font-bold text-slate-600">{categories.find(c => c.id === catId)?.label || catId}</span>
                            </div>
                            <span className="text-sm font-black text-slate-900">{formatCurrency(val)}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-black text-slate-800 mb-6 tracking-tight">Upcoming Bills</h3>
                <div className="space-y-4">
                    {bills.filter(b => !b.is_paid).slice(0, 3).map(bill => (
                        <div key={bill.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:bg-white hover:border-brand-primary/30 transition-all cursor-default">
                            <div>
                                <p className="text-sm font-black text-slate-900">{bill.name}</p>
                                <p className="text-xs text-slate-500 font-bold uppercase">Due {new Date(bill.due_date).toLocaleDateString()}</p>
                            </div>
                            <span className="text-sm font-black text-red-600">{formatCurrency(bill.amount)}</span>
                        </div>
                    ))}
                    {bills.filter(b => !b.is_paid).length === 0 && (
                        <div className="text-center py-6">
                           <p className="text-slate-400 font-bold italic">All clear!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
