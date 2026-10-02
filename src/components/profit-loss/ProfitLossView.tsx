import React, { useState } from 'react';
import { PieChart, Download, Printer, Calendar, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { DateFilterRange } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';
import { downloadCsv, triggerPrint } from '../../utils/exportUtils';

export const ProfitLossView: React.FC = () => {
  const { income, expenses, invoices, company } = useFinance();

  const [dateRange, setDateRange] = useState<DateFilterRange>('year');
  const [customStart, setCustomStart] = useState('2026-01-01');
  const [customEnd, setCustomEnd] = useState('2026-12-31');

  // Filter helper
  const isInRange = (dateStr: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const now = new Date();

    if (dateRange === 'all') return true;
    if (dateRange === 'today') {
      return (
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    }
    if (dateRange === 'month') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    if (dateRange === 'quarter') {
      const qNow = Math.floor(now.getMonth() / 3);
      const qDate = Math.floor(d.getMonth() / 3);
      return qNow === qDate && d.getFullYear() === now.getFullYear();
    }
    if (dateRange === 'year') {
      return d.getFullYear() === now.getFullYear();
    }
    if (dateRange === 'custom') {
      if (customStart && d < new Date(customStart)) return false;
      if (customEnd) {
        const end = new Date(customEnd);
        end.setHours(23, 59, 59, 999);
        if (d > end) return false;
      }
      return true;
    }
    return true;
  };

  // 1. Group Revenue by Category
  const revenueByCategory: Record<string, number> = {};

  // Direct Income
  income.forEach((inc) => {
    if (isInRange(inc.date)) {
      revenueByCategory[inc.categoryName] =
        (revenueByCategory[inc.categoryName] || 0) + inc.totalAmount;
    }
  });

  // Invoice Payments (Client Payment category)
  invoices.forEach((inv) => {
    inv.payments.forEach((p) => {
      if (isInRange(p.paymentDate)) {
        const cat = 'Client Invoiced Revenue';
        revenueByCategory[cat] = (revenueByCategory[cat] || 0) + p.amount;
      }
    });
  });

  const totalRevenue = Object.values(revenueByCategory).reduce((a, b) => a + b, 0);

  // 2. Group Expenses by Category (Paid Expenses)
  const expensesByCategory: Record<string, number> = {};
  expenses.forEach((exp) => {
    if (exp.isPaid && isInRange(exp.paidDate || exp.date)) {
      expensesByCategory[exp.categoryName] =
        (expensesByCategory[exp.categoryName] || 0) + exp.totalAmount;
    }
  });

  const totalExpenses = Object.values(expensesByCategory).reduce((a, b) => a + b, 0);
  const netProfit = totalRevenue - totalExpenses;
  const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  const handleExportCsv = () => {
    const headers = ['Category Type', 'Category Name', 'Amount'];
    const rows: (string | number)[][] = [];

    rows.push(['--- REVENUE ---', '', '']);
    Object.entries(revenueByCategory).forEach(([cat, amt]) => {
      rows.push(['Revenue', cat, amt]);
    });
    rows.push(['TOTAL REVENUE', '', totalRevenue]);

    rows.push(['--- EXPENSES ---', '', '']);
    Object.entries(expensesByCategory).forEach(([cat, amt]) => {
      rows.push(['Expense', cat, amt]);
    });
    rows.push(['TOTAL EXPENSES', '', totalExpenses]);

    rows.push(['--- NET PROFIT ---', '', netProfit]);

    downloadCsv(`Profit_and_Loss_${dateRange}_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Profit & Loss Statement</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational financial performance, gross margins, and net company earnings
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs">
            {(
              [
                { id: 'month', label: 'Monthly' },
                { id: 'quarter', label: 'Quarterly' },
                { id: 'year', label: 'Yearly' },
                { id: 'all', label: 'All Time' },
                { id: 'custom', label: 'Custom' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setDateRange(tab.id)}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  dateRange === tab.id
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {dateRange === 'custom' && (
            <div className="flex items-center gap-1.5 text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1">
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

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </button>

          <button
            onClick={triggerPrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </button>
        </div>
      </div>

      {/* Top 3 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:hidden">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Operating Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 tabular-nums">
            {formatCurrency(totalRevenue, company.currencySymbol)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Operating Expenses</span>
            <TrendingDown className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-600 tabular-nums">
            {formatCurrency(totalExpenses, company.currencySymbol)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Net Profit (Margin: {netMargin.toFixed(1)}%)</span>
            <DollarSign className="w-4 h-4 text-indigo-600" />
          </div>
          <div
            className={`text-2xl font-bold tabular-nums ${
              netProfit >= 0 ? 'text-indigo-600' : 'text-rose-600'
            }`}
          >
            {formatCurrency(netProfit, company.currencySymbol)}
          </div>
        </div>
      </div>

      {/* Official P&L Statement Sheet */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs max-w-4xl mx-auto print:shadow-none print:border-none print:p-0">
        {/* Statement Header */}
        <div className="text-center pb-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide">
            {company.name}
          </h2>
          <h3 className="text-base font-semibold text-indigo-800 mt-0.5">
            Statement of Profit and Loss (Income Statement)
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Period: {dateRange.toUpperCase()} · Currency: {company.currency} ({company.currencySymbol})
          </p>
        </div>

        {/* Financial Line Items */}
        <div className="py-6 space-y-6 text-xs">
          {/* SECTION 1: REVENUE */}
          <div>
            <div className="flex items-center justify-between pb-2 border-b-2 border-slate-900 font-bold text-slate-900 uppercase tracking-wider text-xs">
              <span>Operating Revenue</span>
              <span>Amount ({company.currencySymbol})</span>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {Object.keys(revenueByCategory).length === 0 ? (
                <div className="py-2 text-slate-400 italic">No revenue recorded in this period.</div>
              ) : (
                Object.entries(revenueByCategory).map(([cat, amt]) => (
                  <div key={cat} className="flex justify-between py-2 text-slate-700 pl-4">
                    <span>{cat}</span>
                    <span className="font-semibold tabular-nums text-slate-900">
                      {formatCurrency(amt, company.currencySymbol)}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-between py-2.5 mt-2 bg-slate-50 px-4 font-bold text-slate-900 border-t border-slate-300">
              <span>Total Revenue</span>
              <span className="tabular-nums text-emerald-700 text-sm">
                {formatCurrency(totalRevenue, company.currencySymbol)}
              </span>
            </div>
          </div>

          {/* SECTION 2: OPERATING EXPENSES */}
          <div>
            <div className="flex items-center justify-between pb-2 border-b-2 border-slate-900 font-bold text-slate-900 uppercase tracking-wider text-xs">
              <span>Operating Expenses</span>
              <span>Amount ({company.currencySymbol})</span>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {Object.keys(expensesByCategory).length === 0 ? (
                <div className="py-2 text-slate-400 italic">No expenses recorded in this period.</div>
              ) : (
                Object.entries(expensesByCategory).map(([cat, amt]) => (
                  <div key={cat} className="flex justify-between py-2 text-slate-700 pl-4">
                    <span>{cat}</span>
                    <span className="font-semibold tabular-nums text-slate-900">
                      {formatCurrency(amt, company.currencySymbol)}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-between py-2.5 mt-2 bg-slate-50 px-4 font-bold text-slate-900 border-t border-slate-300">
              <span>Total Operating Expenses</span>
              <span className="tabular-nums text-rose-700 text-sm">
                {formatCurrency(totalExpenses, company.currencySymbol)}
              </span>
            </div>
          </div>

          {/* SECTION 3: NET PROFIT */}
          <div className="pt-4 border-t-2 border-slate-900">
            <div className="flex justify-between items-center bg-indigo-50/80 p-4 rounded-lg border border-indigo-200">
              <div>
                <span className="text-sm font-bold text-slate-900 block">
                  Net Operating Profit / (Loss)
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Formula: Total Revenue − Total Expenses
                </span>
              </div>
              <div
                className={`text-xl font-extrabold tabular-nums ${
                  netProfit >= 0 ? 'text-indigo-700' : 'text-rose-600'
                }`}
              >
                {formatCurrency(netProfit, company.currencySymbol)}
              </div>
            </div>
          </div>
        </div>

        {/* Footer verification note */}
        <div className="pt-4 border-t border-slate-200 text-center text-[11px] text-slate-400">
          Generated automatically from single source of financial records · FinanceFlow Internal Engine
        </div>
      </div>
    </div>
  );
};
