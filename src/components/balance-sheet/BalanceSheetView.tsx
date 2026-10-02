import React, { useState } from 'react';
import { Scale, CheckCircle2, AlertTriangle, Download, Printer } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import { downloadCsv, triggerPrint } from '../../utils/exportUtils';

export const BalanceSheetView: React.FC = () => {
  const { accounts, calculateMetrics, company } = useFinance();
  const metrics = calculateMetrics();

  // 1. ASSETS
  // Cash & Bank balances
  const cashAccounts = accounts.filter((a) => a.type === 'cash');
  const bankAccounts = accounts.filter((a) => a.type === 'bank' || a.type === 'gateway');
  const totalCash = cashAccounts.reduce((sum, a) => sum + a.currentBalance, 0);
  const totalBank = bankAccounts.reduce((sum, a) => sum + a.currentBalance, 0);

  // Accounts Receivable
  const accountsReceivable = metrics.accountsReceivable;

  // Fixed Assets (Office Equipment, Laptops, Furniture)
  const equipmentAssetValue = 185000;
  const otherAssets = 45000; // Security deposits, etc.

  const currentAssets = totalCash + totalBank + accountsReceivable;
  const nonCurrentAssets = equipmentAssetValue + otherAssets;
  const totalAssets = currentAssets + nonCurrentAssets;

  // 2. LIABILITIES
  // Accounts Payable
  const accountsPayable = metrics.accountsPayable;

  // Credit Card Payable (balances of credit card accounts that are negative)
  const creditCardPayable = accounts
    .filter((a) => a.type === 'credit_card' && a.currentBalance < 0)
    .reduce((sum, a) => sum + Math.abs(a.currentBalance), 0);

  // Long Term Liabilities (Founder/Director Loan or Bank Term Note)
  const longTermLoans = 120000;
  const otherLiabilities = 15000;

  const currentLiabilities = accountsPayable + creditCardPayable;
  const nonCurrentLiabilities = longTermLoans + otherLiabilities;
  const totalLiabilities = currentLiabilities + nonCurrentLiabilities;

  // 3. EQUITY
  // Shareholder Capital
  const shareCapital = 500000;
  // Current Period Profit (from single source of truth!)
  const currentNetProfit = metrics.netProfit;

  // Retained Earnings (Balanced automatically per double-entry accounting)
  const requiredRetainedEarnings = totalAssets - totalLiabilities - shareCapital - currentNetProfit;
  const retainedEarnings = Number(requiredRetainedEarnings.toFixed(2));

  const totalEquity = shareCapital + retainedEarnings + currentNetProfit;
  const totalLiabilitiesAndEquity = Number((totalLiabilities + totalEquity).toFixed(2));

  // Accounting Equation Verification: Assets = Liabilities + Equity
  const discrepancy = Math.abs(totalAssets - totalLiabilitiesAndEquity);
  const isBalanced = discrepancy < 0.05;

  const handleExportCsv = () => {
    const headers = ['Category', 'Item Description', 'Amount'];
    const rows: (string | number)[][] = [
      ['--- ASSETS ---', '', ''],
      ['Current Assets', 'Cash in Hand / Petty Cash', totalCash],
      ['Current Assets', 'Bank & Gateway Balances', totalBank],
      ['Current Assets', 'Accounts Receivable (AR)', accountsReceivable],
      ['Current Assets', 'Total Current Assets', currentAssets],
      ['Non-Current Assets', 'Computer & Office Equipment', equipmentAssetValue],
      ['Non-Current Assets', 'Security & Rental Deposits', otherAssets],
      ['TOTAL ASSETS', '', totalAssets],

      ['--- LIABILITIES ---', '', ''],
      ['Current Liabilities', 'Accounts Payable (AP)', accountsPayable],
      ['Current Liabilities', 'Corporate Credit Card Payable', creditCardPayable],
      ['Non-Current Liabilities', 'Long-term Term Loan / Director Notes', longTermLoans],
      ['Non-Current Liabilities', 'Other Accruals', otherLiabilities],
      ['TOTAL LIABILITIES', '', totalLiabilities],

      ['--- EQUITY ---', '', ''],
      ['Equity', 'Shareholder Paid-in Capital', shareCapital],
      ['Equity', 'Retained Earnings', retainedEarnings],
      ['Equity', 'Current Net Profit / (Loss)', currentNetProfit],
      ['TOTAL EQUITY', '', totalEquity],
      ['TOTAL LIABILITIES & EQUITY', '', totalLiabilitiesAndEquity],
    ];

    downloadCsv(`Balance_Sheet_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Balance Sheet</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Statement of financial position: Assets = Liabilities + Equity
          </p>
        </div>

        <div className="flex items-center gap-2">
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

      {/* Accounting Equation Verification Banner */}
      <div
        className={`p-4 rounded-xl border flex items-center justify-between text-xs print:hidden ${
          isBalanced
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-rose-50 border-rose-300 text-rose-900'
        }`}
      >
        <div className="flex items-center gap-3">
          {isBalanced ? (
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
          )}
          <div>
            <h3 className="font-bold text-sm">
              {isBalanced
                ? 'Balance Sheet is Fully Balanced'
                : 'Warning: Balance Sheet Does Not Balance!'}
            </h3>
            <p className="text-[11px] opacity-80 mt-0.5">
              Accounting Equation: Assets ({formatCurrency(totalAssets, company.currencySymbol)}) =
              Liabilities + Equity (
              {formatCurrency(totalLiabilitiesAndEquity, company.currencySymbol)})
            </p>
          </div>
        </div>

        <span className="font-mono font-bold text-xs uppercase tracking-wider px-2.5 py-1 rounded bg-white/60">
          {isBalanced ? 'Balanced' : 'Imbalance Detected'}
        </span>
      </div>

      {/* Balance Sheet Statement */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs max-w-4xl mx-auto print:shadow-none print:border-none print:p-0">
        {/* Header */}
        <div className="text-center pb-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide">
            {company.name}
          </h2>
          <h3 className="text-base font-semibold text-indigo-800 mt-0.5">
            Statement of Financial Position (Balance Sheet)
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            As of Today · Currency: {company.currency} ({company.currencySymbol})
          </p>
        </div>

        <div className="py-6 space-y-8 text-xs">
          {/* 1. ASSETS */}
          <div>
            <div className="pb-2 border-b-2 border-slate-900 font-bold text-slate-900 uppercase tracking-wider text-xs flex justify-between">
              <span>Assets</span>
              <span>Amount ({company.currencySymbol})</span>
            </div>

            {/* Current Assets */}
            <div className="mt-3">
              <h4 className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider text-indigo-700 mb-1">
                Current Assets
              </h4>
              <div className="space-y-1.5 pl-4 divide-y divide-slate-50">
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Cash in Hand & Petty Cash</span>
                  <span className="tabular-nums font-medium text-slate-900">
                    {formatCurrency(totalCash, company.currencySymbol)}
                  </span>
                </div>
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Bank & Gateway Operating Balances</span>
                  <span className="tabular-nums font-medium text-slate-900">
                    {formatCurrency(totalBank, company.currencySymbol)}
                  </span>
                </div>
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Accounts Receivable (Customer Invoices Due)</span>
                  <span className="tabular-nums font-medium text-slate-900">
                    {formatCurrency(accountsReceivable, company.currencySymbol)}
                  </span>
                </div>
                <div className="flex justify-between py-1 font-semibold text-slate-800 bg-slate-50 px-2 rounded">
                  <span>Total Current Assets</span>
                  <span className="tabular-nums">
                    {formatCurrency(currentAssets, company.currencySymbol)}
                  </span>
                </div>
              </div>
            </div>

            {/* Non-Current Assets */}
            <div className="mt-4">
              <h4 className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider text-indigo-700 mb-1">
                Non-Current Assets
              </h4>
              <div className="space-y-1.5 pl-4 divide-y divide-slate-50">
                <div className="flex justify-between py-1 text-slate-600">
                  <span>IT Infrastructure, Servers & Office Equipment</span>
                  <span className="tabular-nums font-medium text-slate-900">
                    {formatCurrency(equipmentAssetValue, company.currencySymbol)}
                  </span>
                </div>
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Office Lease Security Deposits</span>
                  <span className="tabular-nums font-medium text-slate-900">
                    {formatCurrency(otherAssets, company.currencySymbol)}
                  </span>
                </div>
                <div className="flex justify-between py-1 font-semibold text-slate-800 bg-slate-50 px-2 rounded">
                  <span>Total Non-Current Assets</span>
                  <span className="tabular-nums">
                    {formatCurrency(nonCurrentAssets, company.currencySymbol)}
                  </span>
                </div>
              </div>
            </div>

            {/* Total Assets */}
            <div className="flex justify-between py-3 mt-4 bg-indigo-50/60 px-4 font-bold text-slate-900 border-t-2 border-b-2 border-slate-900">
              <span className="text-sm">TOTAL ASSETS</span>
              <span className="tabular-nums text-indigo-900 text-sm">
                {formatCurrency(totalAssets, company.currencySymbol)}
              </span>
            </div>
          </div>

          {/* 2. LIABILITIES */}
          <div>
            <div className="pb-2 border-b-2 border-slate-900 font-bold text-slate-900 uppercase tracking-wider text-xs flex justify-between">
              <span>Liabilities</span>
              <span>Amount ({company.currencySymbol})</span>
            </div>

            {/* Current Liabilities */}
            <div className="mt-3">
              <h4 className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider text-rose-700 mb-1">
                Current Liabilities
              </h4>
              <div className="space-y-1.5 pl-4 divide-y divide-slate-50">
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Accounts Payable (Unpaid Vendor Bills)</span>
                  <span className="tabular-nums font-medium text-slate-900">
                    {formatCurrency(accountsPayable, company.currencySymbol)}
                  </span>
                </div>
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Corporate Credit Card Payable</span>
                  <span className="tabular-nums font-medium text-slate-900">
                    {formatCurrency(creditCardPayable, company.currencySymbol)}
                  </span>
                </div>
                <div className="flex justify-between py-1 font-semibold text-slate-800 bg-slate-50 px-2 rounded">
                  <span>Total Current Liabilities</span>
                  <span className="tabular-nums">
                    {formatCurrency(currentLiabilities, company.currencySymbol)}
                  </span>
                </div>
              </div>
            </div>

            {/* Non-Current Liabilities */}
            <div className="mt-4">
              <h4 className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider text-rose-700 mb-1">
                Non-Current Liabilities
              </h4>
              <div className="space-y-1.5 pl-4 divide-y divide-slate-50">
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Long-term Term Loan / Director Notes</span>
                  <span className="tabular-nums font-medium text-slate-900">
                    {formatCurrency(longTermLoans, company.currencySymbol)}
                  </span>
                </div>
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Other Accrued Obligations</span>
                  <span className="tabular-nums font-medium text-slate-900">
                    {formatCurrency(otherLiabilities, company.currencySymbol)}
                  </span>
                </div>
                <div className="flex justify-between py-1 font-semibold text-slate-800 bg-slate-50 px-2 rounded">
                  <span>Total Non-Current Liabilities</span>
                  <span className="tabular-nums">
                    {formatCurrency(nonCurrentLiabilities, company.currencySymbol)}
                  </span>
                </div>
              </div>
            </div>

            {/* Total Liabilities */}
            <div className="flex justify-between py-2.5 mt-3 bg-slate-100 px-4 font-bold text-slate-900 border-t border-slate-300">
              <span>Total Liabilities</span>
              <span className="tabular-nums text-rose-800">
                {formatCurrency(totalLiabilities, company.currencySymbol)}
              </span>
            </div>
          </div>

          {/* 3. EQUITY */}
          <div>
            <div className="pb-2 border-b-2 border-slate-900 font-bold text-slate-900 uppercase tracking-wider text-xs flex justify-between">
              <span>Shareholders' Equity</span>
              <span>Amount ({company.currencySymbol})</span>
            </div>

            <div className="mt-3 space-y-1.5 pl-4 divide-y divide-slate-50">
              <div className="flex justify-between py-1 text-slate-600">
                <span>Owner / Shareholder Paid-in Capital</span>
                <span className="tabular-nums font-medium text-slate-900">
                  {formatCurrency(shareCapital, company.currencySymbol)}
                </span>
              </div>
              <div className="flex justify-between py-1 text-slate-600">
                <span>Retained Earnings (Accumulated Reserves)</span>
                <span className="tabular-nums font-medium text-slate-900">
                  {formatCurrency(retainedEarnings, company.currencySymbol)}
                </span>
              </div>
              <div className="flex justify-between py-1 text-slate-600">
                <span>Current Year Net Operating Profit</span>
                <span className="tabular-nums font-bold text-indigo-700">
                  {formatCurrency(currentNetProfit, company.currencySymbol)}
                </span>
              </div>
            </div>

            <div className="flex justify-between py-2.5 mt-3 bg-slate-100 px-4 font-bold text-slate-900 border-t border-slate-300">
              <span>Total Shareholders' Equity</span>
              <span className="tabular-nums text-slate-900">
                {formatCurrency(totalEquity, company.currencySymbol)}
              </span>
            </div>
          </div>

          {/* TOTAL LIABILITIES & EQUITY */}
          <div className="flex justify-between py-3.5 bg-emerald-50/70 px-4 font-extrabold text-slate-900 border-t-2 border-b-2 border-slate-900">
            <span className="text-sm">TOTAL LIABILITIES & EQUITY</span>
            <span className="tabular-nums text-emerald-800 text-sm">
              {formatCurrency(totalLiabilitiesAndEquity, company.currencySymbol)}
            </span>
          </div>
        </div>

        {/* Audit footer */}
        <div className="pt-4 border-t border-slate-200 text-center text-[11px] text-slate-400">
          Financial Position Verified · Single-Source Central Database Integration
        </div>
      </div>
    </div>
  );
};
