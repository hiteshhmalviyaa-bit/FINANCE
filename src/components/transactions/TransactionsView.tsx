import React, { useState } from 'react';
import { ArrowLeftRight, Search, Download, Calendar, Filter, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, TransactionType } from '../../types/finance';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { downloadCsv } from '../../utils/exportUtils';
import { Modal } from '../common/Modal';

export const TransactionsView: React.FC = () => {
  const { transactions, accounts, company } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [viewingTxn, setViewingTxn] = useState<Transaction | null>(null);

  const filteredTransactions = transactions.filter((t) => {
    // Search
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      t.transactionId.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      (t.reference && t.reference.toLowerCase().includes(q)) ||
      (t.relatedCustomerName && t.relatedCustomerName.toLowerCase().includes(q)) ||
      (t.relatedVendorName && t.relatedVendorName.toLowerCase().includes(q));

    // Type filter
    const matchesType = selectedType === 'all' || t.type === selectedType;

    // Account filter
    const matchesAccount = selectedAccount === 'all' || t.accountId === selectedAccount;

    // Date range
    let matchesDate = true;
    if (startDate && t.date < startDate) matchesDate = false;
    if (endDate && t.date > endDate) matchesDate = false;

    return matchesSearch && matchesType && matchesAccount && matchesDate;
  });

  const totalInflow = filteredTransactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOutflow = filteredTransactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const netLedgerBalance = totalInflow - totalOutflow;

  const handleExportCsv = () => {
    const headers = [
      'Transaction ID',
      'Date',
      'Type',
      'Description',
      'Category',
      'Amount',
      'Account',
      'Reference',
      'Related Party',
      'Created By',
      'Created At',
    ];
    const rows = filteredTransactions.map((t) => [
      t.transactionId,
      t.date,
      t.type,
      t.description,
      t.category,
      t.amount,
      t.accountName,
      t.reference,
      t.relatedCustomerName || t.relatedVendorName || '-',
      t.createdBy,
      t.createdAt,
    ]);
    downloadCsv(`Ledger_Transactions_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  return (
    <div className="space-y-5">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Central Financial Ledger</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Single source of truth tracking every monetary inflow, disbursement, and settlement
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-300 rounded-lg text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-medium">Total Ledger Inflow</span>
          <div className="text-lg font-bold text-emerald-600 tabular-nums mt-0.5">
            +{formatCurrency(totalInflow, company.currencySymbol)}
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-medium">Total Ledger Outflow</span>
          <div className="text-lg font-bold text-rose-600 tabular-nums mt-0.5">
            -{formatCurrency(totalOutflow, company.currencySymbol)}
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-medium">Net Filtered Cash Flow</span>
          <div
            className={`text-lg font-bold tabular-nums mt-0.5 ${
              netLedgerBalance >= 0 ? 'text-indigo-600' : 'text-rose-600'
            }`}
          >
            {formatCurrency(netLedgerBalance, company.currencySymbol)}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search description, reference, party..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-700"
          >
            <option value="all">All Transaction Types</option>
            <option value="income">Direct Income</option>
            <option value="invoice_payment">Invoice Payments</option>
            <option value="expense">Operating Expenses</option>
            <option value="adjustment">Adjustments</option>
          </select>

          {/* Account Filter */}
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-700"
          >
            <option value="all">All Accounts</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          {/* Date range inputs */}
          <div className="flex items-center gap-1.5 text-xs">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-1/2 px-2 py-1.5 border border-slate-200 rounded text-slate-700 focus:outline-hidden text-xs"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-1/2 px-2 py-1.5 border border-slate-200 rounded text-slate-700 focus:outline-hidden text-xs"
            />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 font-semibold">Txn ID</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Type</th>
                <th className="py-3 px-4 font-semibold">Description</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Account</th>
                <th className="py-3 px-4 font-semibold">Reference</th>
                <th className="py-3 px-4 font-semibold">Related Entity</th>
                <th className="py-3 px-4 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No transactions match current filters.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn) => {
                  const isPositive = txn.amount > 0;
                  return (
                    <tr
                      key={txn.id}
                      onClick={() => setViewingTxn(txn)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {txn.transactionId}
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {formatDate(txn.date)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            txn.type === 'income'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : txn.type === 'invoice_payment'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
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
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {txn.reference || '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap font-medium">
                        {txn.relatedCustomerName || txn.relatedVendorName || '-'}
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
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {viewingTxn && (
        <Modal
          isOpen={!!viewingTxn}
          onClose={() => setViewingTxn(null)}
          title={`Ledger Transaction: ${viewingTxn.transactionId}`}
          subtitle={`Logged on ${viewingTxn.createdAt} by ${viewingTxn.createdBy}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100">
              <div>
                <span className="text-slate-400 block">Date</span>
                <span className="font-semibold text-slate-800">{formatDate(viewingTxn.date)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Type</span>
                <span className="font-semibold uppercase text-slate-800">{viewingTxn.type.replace('_', ' ')}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Account</span>
                <span className="font-semibold text-slate-800">{viewingTxn.accountName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Category</span>
                <span className="font-semibold text-slate-800">{viewingTxn.category}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block">Description</span>
              <p className="font-medium text-slate-900 mt-0.5">{viewingTxn.description}</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between items-center">
              <span className="font-medium text-slate-700">Financial Movement</span>
              <span
                className={`text-lg font-bold tabular-nums ${
                  viewingTxn.amount > 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {viewingTxn.amount > 0 ? '+' : ''}
                {formatCurrency(viewingTxn.amount, company.currencySymbol)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block">Reference #</span>
                <span className="font-mono text-slate-800">{viewingTxn.reference || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Related Party</span>
                <span className="font-medium text-slate-800">
                  {viewingTxn.relatedCustomerName || viewingTxn.relatedVendorName || '-'}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViewingTxn(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
