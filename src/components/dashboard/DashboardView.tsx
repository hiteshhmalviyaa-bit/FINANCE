import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  FileCheck2,
  Calendar,
  Plus,
  ArrowRight,
  Receipt,
  FileText,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { DateFilterRange } from '../../types/finance';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { IncomeExpenseChart } from './IncomeExpenseChart';
import { NavModule } from '../layout/Sidebar';

interface DashboardViewProps {
  onNavigate: (module: NavModule) => void;
  onOpenAddIncome: () => void;
  onOpenAddExpense: () => void;
  onOpenCreateInvoice: () => void;
  onOpenRecordPayment: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenAddIncome,
  onOpenAddExpense,
  onOpenCreateInvoice,
  onOpenRecordPayment,
}) => {
  const {
    company,
    calculateMetrics,
    transactions,
    expenses,
    currentUser,
  } = useFinance();

  const [dateRange, setDateRange] = useState<DateFilterRange>('year');
  const [customStart, setCustomStart] = useState<string>('2026-01-01');
  const [customEnd, setCustomEnd] = useState<string>('2026-12-31');

  const metrics = calculateMetrics(dateRange, customStart, customEnd);
  const isViewer = currentUser.role === 'viewer';

  // Calculate expense breakdown by category for paid and total expenses
  const expenseByCategory: Record<string, number> = {};
  expenses.forEach((e) => {
    expenseByCategory[e.categoryName] =
      (expenseByCategory[e.categoryName] || 0) + e.totalAmount;
  });

  const totalExpenseSum = Object.values(expenseByCategory).reduce((a, b) => a + b, 0) || 1;
  const sortedCategories = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1]);

  // Monthly data for Income vs Expenses chart (6 months view)
  const monthlyChartData = [
    { month: 'May', income: 140000, expense: 95000, profit: 45000 },
    { month: 'Jun', income: 190000, expense: 120000, profit: 70000 },
    { month: 'Jul', income: 165000, expense: 110000, profit: 55000 },
    { month: 'Aug', income: 235000, expense: 180000, profit: 55000 },
    { month: 'Sep', income: 285000, expense: 138500, profit: 146500 },
    { month: 'Oct (Proj)', income: 210000, expense: 115000, profit: 95000 },
  ];

  const recentTransactions = transactions.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions and Date Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Financial Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time financial status, liquidity, and operational metrics
          </p>
        </div>

        {/* Date Filter Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs">
            {(
              [
                { id: 'today', label: 'Today' },
                { id: 'week', label: 'This Week' },
                { id: 'month', label: 'This Month' },
                { id: 'quarter', label: 'This Qtr' },
                { id: 'year', label: 'This Year' },
                { id: 'custom', label: 'Custom' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => setDateRange(item.id)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  dateRange === item.id
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {dateRange === 'custom' && (
            <div className="flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="bg-transparent border-none text-slate-700 focus:outline-hidden text-xs"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="bg-transparent border-none text-slate-700 focus:outline-hidden text-xs"
              />
            </div>
          )}
        </div>
      </div>

      {/* KPI CARDS (7 Primary Metrics specified in Section 3) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1.5">
            <span>Total Income</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
            {formatCurrency(metrics.totalIncome, company.currencySymbol)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-medium">Received & Cleared</span>
            <span>· All revenues</span>
          </p>
        </div>

        {/* Total Expenses */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1.5">
            <span>Total Expenses</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
            {formatCurrency(metrics.totalExpenses, company.currencySymbol)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-rose-600 font-medium">Disbursed</span>
            <span>· Operating costs</span>
          </p>
        </div>

        {/* Net Profit */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1.5">
            <span>Net Profit</span>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                metrics.netProfit >= 0
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'bg-rose-50 text-rose-600'
              }`}
            >
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-xl sm:text-2xl font-bold tabular-nums ${
              metrics.netProfit >= 0 ? 'text-indigo-600' : 'text-rose-600'
            }`}
          >
            {formatCurrency(metrics.netProfit, company.currencySymbol)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Total Income − Total Expenses
          </p>
        </div>

        {/* Total Cash & Bank Balance */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1.5">
            <span>Cash / Bank Balance</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
            {formatCurrency(metrics.totalCashBankBalance, company.currencySymbol)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Liquid accounts total balance
          </p>
        </div>
      </div>

      {/* SECONDARY ROW: Accounts Receivable, Accounts Payable, Outstanding Invoices */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Accounts Receivable */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
            <span className="flex items-center gap-1.5">
              <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
              Accounts Receivable (AR)
            </span>
            <button
              onClick={() => onNavigate('invoices')}
              className="text-[11px] text-indigo-600 hover:underline cursor-pointer"
            >
              View Invoices
            </button>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 tabular-nums mt-1">
            {formatCurrency(metrics.accountsReceivable, company.currencySymbol)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Money customers owe to company
          </p>
        </div>

        {/* Accounts Payable */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
            <span className="flex items-center gap-1.5">
              <ArrowUpRight className="w-4 h-4 text-rose-600" />
              Accounts Payable (AP)
            </span>
            <button
              onClick={() => onNavigate('expenses')}
              className="text-[11px] text-indigo-600 hover:underline cursor-pointer"
            >
              Pay Vendors
            </button>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 tabular-nums mt-1">
            {formatCurrency(metrics.accountsPayable, company.currencySymbol)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Pending bills owed to vendors
          </p>
        </div>

        {/* Outstanding Invoices */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
            <span className="flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-amber-600" />
              Outstanding Invoices
            </span>
            {metrics.overdueInvoicesCount > 0 && (
              <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                {metrics.overdueInvoicesCount} Overdue
              </span>
            )}
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 tabular-nums mt-1">
            {metrics.outstandingInvoicesCount}{' '}
            <span className="text-xs font-normal text-slate-500">unpaid invoices</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Partially paid or unpaid invoices
          </p>
        </div>
      </div>

      {/* QUICK ACTION BAR */}
      {!isViewer && (
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-4 rounded-xl text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold tracking-tight">Quick Financial Actions</h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Speed up daily bookkeeping with one-click data entry
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={onOpenAddIncome}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Add Income
            </button>
            <button
              onClick={onOpenAddExpense}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <TrendingDown className="w-3.5 h-3.5" />
              Add Expense
            </button>
            <button
              onClick={onOpenCreateInvoice}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              Create Invoice
            </button>
            <button
              onClick={onOpenRecordPayment}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Record Payment
            </button>
          </div>
        </div>
      )}

      {/* DASHBOARD SECTIONS: Income vs Expenses & Expense Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Income vs Expenses Trend</h3>
              <p className="text-xs text-slate-500">6-Month historical financial performance</p>
            </div>
            <button
              onClick={() => onNavigate('profit-loss')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 cursor-pointer"
            >
              Full P&L <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <IncomeExpenseChart
            currencySymbol={company.currencySymbol}
            monthlyData={monthlyChartData}
          />
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Expense Breakdown</h3>
                <p className="text-xs text-slate-500">Spending by category</p>
              </div>
              <button
                onClick={() => onNavigate('expenses')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
              >
                All
              </button>
            </div>

            <div className="space-y-3.5">
              {sortedCategories.slice(0, 5).map(([category, amount]) => {
                const percentage = Math.round((amount / totalExpenseSum) * 100);
                return (
                  <div key={category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">{category}</span>
                      <span className="font-semibold text-slate-900 tabular-nums">
                        {formatCurrency(amount, company.currencySymbol)}{' '}
                        <span className="text-slate-400 font-normal">({percentage}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all"
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between mt-4">
            <span>Total Logged Expenses:</span>
            <span className="font-bold text-slate-900 tabular-nums">
              {formatCurrency(totalExpenseSum, company.currencySymbol)}
            </span>
          </div>
        </div>
      </div>

      {/* RECENT TRANSACTIONS TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Ledger Activity</h3>
            <p className="text-xs text-slate-500">Latest transactions from the central financial ledger</p>
          </div>
          <button
            onClick={() => onNavigate('transactions')}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 cursor-pointer"
          >
            View All Transactions <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-4 font-semibold">Date</th>
                <th className="py-2.5 px-4 font-semibold">Type</th>
                <th className="py-2.5 px-4 font-semibold">Description</th>
                <th className="py-2.5 px-4 font-semibold">Category</th>
                <th className="py-2.5 px-4 font-semibold">Account</th>
                <th className="py-2.5 px-4 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recentTransactions.map((txn) => {
                const isPositive = txn.amount > 0;
                return (
                  <tr key={txn.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-600 whitespace-nowrap">
                      {formatDate(txn.date)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                          txn.type === 'income'
                            ? 'bg-emerald-50 text-emerald-700'
                            : txn.type === 'invoice_payment'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {txn.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 max-w-xs truncate">
                      {txn.description}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {txn.category}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {txn.accountName}
                    </td>
                    <td
                      className={`py-3 px-4 font-bold text-right tabular-nums whitespace-nowrap ${
                        isPositive ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {formatCurrency(txn.amount, company.currencySymbol)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
