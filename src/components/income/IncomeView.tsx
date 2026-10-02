import React, { useState } from 'react';
import {
  TrendingUp,
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Download,
  Calendar,
  CheckCircle2,
  Paperclip,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Income } from '../../types/finance';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { IncomeModal } from './IncomeModal';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { downloadCsv } from '../../utils/exportUtils';

export const IncomeView: React.FC = () => {
  const {
    income,
    customers,
    categories,
    accounts,
    deleteIncome,
    company,
    currentUser,
  } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [viewingIncome, setViewingIncome] = useState<Income | null>(null);
  const [deletingIncomeId, setDeletingIncomeId] = useState<string | null>(null);

  const isViewer = currentUser.role === 'viewer';

  // Filtered income list
  const filteredIncome = income.filter((item) => {
    // Search
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      item.incomeId.toLowerCase().includes(searchLower) ||
      item.customerName.toLowerCase().includes(searchLower) ||
      item.description.toLowerCase().includes(searchLower) ||
      item.referenceNumber.toLowerCase().includes(searchLower);

    // Filters
    const matchesCust = !selectedCustomer || item.customerId === selectedCustomer;
    const matchesCat = !selectedCategory || item.categoryId === selectedCategory;
    const matchesAcc = !selectedAccount || item.accountId === selectedAccount;
    const matchesMethod = !selectedPaymentMethod || item.paymentMethod === selectedPaymentMethod;

    // Date range
    let matchesDate = true;
    if (startDate && item.date < startDate) matchesDate = false;
    if (endDate && item.date > endDate) matchesDate = false;

    return (
      matchesSearch &&
      matchesCust &&
      matchesCat &&
      matchesAcc &&
      matchesMethod &&
      matchesDate
    );
  });

  const totalFilteredIncome = filteredIncome.reduce((sum, item) => sum + item.totalAmount, 0);

  const handleExportCsv = () => {
    const headers = [
      'Income ID',
      'Date',
      'Customer',
      'Description',
      'Category',
      'Amount',
      'Tax',
      'Total Amount',
      'Account',
      'Payment Method',
      'Reference Number',
    ];
    const rows = filteredIncome.map((item) => [
      item.incomeId,
      item.date,
      item.customerName,
      item.description,
      item.categoryName,
      item.amount,
      item.tax,
      item.totalAmount,
      item.accountName,
      item.paymentMethod,
      item.referenceNumber,
    ]);
    downloadCsv(`Income_Report_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  return (
    <div className="space-y-5">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Income Records</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Record, monitor, and filter direct company revenue and inflows
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-300 rounded-lg text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>

          {!isViewer && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Income
            </button>
          )}
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
              placeholder="Search description, ID, ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Customer Filter */}
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-700"
          >
            <option value="">All Customers</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.companyName}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-700"
          >
            <option value="">All Categories</option>
            {categories
              .filter((c) => c.type === 'income')
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>

          {/* Account Filter */}
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-700"
          >
            <option value="">All Deposit Accounts</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date range filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium">Date Range:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-2 py-1 border border-slate-200 rounded text-slate-700 focus:outline-hidden text-xs"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-2 py-1 border border-slate-200 rounded text-slate-700 focus:outline-hidden text-xs"
          />
          {(searchTerm || selectedCustomer || selectedCategory || selectedAccount || startDate || endDate) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCustomer('');
                setSelectedCategory('');
                setSelectedAccount('');
                setSelectedPaymentMethod('');
                setStartDate('');
                setEndDate('');
              }}
              className="text-xs text-indigo-600 hover:underline ml-auto cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Summary metric banner */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs">
        <span className="text-emerald-900 font-medium">
          Showing {filteredIncome.length} of {income.length} records
        </span>
        <span className="font-bold text-emerald-900 tabular-nums">
          Filtered Inflow Total: {formatCurrency(totalFilteredIncome, company.currencySymbol)}
        </span>
      </div>

      {/* Income Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">ID</th>
                <th className="py-3 px-4 font-semibold">Customer</th>
                <th className="py-3 px-4 font-semibold">Description</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Account</th>
                <th className="py-3 px-4 font-semibold">Method</th>
                <th className="py-3 px-4 font-semibold text-right">Amount</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredIncome.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    No income records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredIncome.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-600">
                      {formatDate(item.date)}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900 whitespace-nowrap">
                      {item.incomeId}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">
                      {item.customerName}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate font-medium text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate">{item.description}</span>
                        {item.attachment && (
                          <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                      {item.categoryName}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                      {item.accountName}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                      {item.paymentMethod}
                    </td>
                    <td className="py-3 px-4 font-bold text-right tabular-nums text-emerald-600 whitespace-nowrap">
                      {formatCurrency(item.totalAmount, company.currencySymbol)}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Received
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingIncome(item)}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {!isViewer && (
                          <>
                            <button
                              onClick={() => setEditingIncome(item)}
                              className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingIncomeId(item.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {(isAddModalOpen || editingIncome) && (
        <IncomeModal
          isOpen={isAddModalOpen || !!editingIncome}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingIncome(null);
          }}
          incomeToEdit={editingIncome}
        />
      )}

      {/* View Detail Modal */}
      {viewingIncome && (
        <Modal
          isOpen={!!viewingIncome}
          onClose={() => setViewingIncome(null)}
          title={`Income Details: ${viewingIncome.incomeId}`}
          subtitle={`Recorded by ${viewingIncome.createdBy} on ${viewingIncome.createdAt}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100">
              <div>
                <span className="text-slate-400 block">Date</span>
                <span className="font-semibold text-slate-800">{formatDate(viewingIncome.date)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Customer</span>
                <span className="font-semibold text-slate-800">{viewingIncome.customerName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Category</span>
                <span className="font-semibold text-slate-800">{viewingIncome.categoryName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Deposit Account</span>
                <span className="font-semibold text-slate-800">{viewingIncome.accountName}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block">Description</span>
              <p className="font-medium text-slate-800 mt-0.5">{viewingIncome.description}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500 block">Amount</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {formatCurrency(viewingIncome.amount, company.currencySymbol)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Tax</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {formatCurrency(viewingIncome.tax, company.currencySymbol)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Total Received</span>
                <span className="font-bold text-emerald-600 tabular-nums">
                  {formatCurrency(viewingIncome.totalAmount, company.currencySymbol)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block">Payment Method</span>
                <span className="font-medium text-slate-800">{viewingIncome.paymentMethod}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Reference #</span>
                <span className="font-medium text-slate-800">{viewingIncome.referenceNumber || '-'}</span>
              </div>
            </div>

            {viewingIncome.attachment && (
              <div>
                <span className="text-slate-400 block mb-1">Attachment</span>
                <div className="p-2 border border-slate-200 rounded bg-slate-50 flex items-center justify-between">
                  <span className="font-medium text-slate-700">{viewingIncome.attachment}</span>
                  <span className="text-[11px] text-emerald-600 font-semibold">Verified</span>
                </div>
              </div>
            )}

            {viewingIncome.notes && (
              <div>
                <span className="text-slate-400 block mb-1">Notes</span>
                <p className="text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200">
                  {viewingIncome.notes}
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViewingIncome(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {deletingIncomeId && (
        <ConfirmDialog
          isOpen={!!deletingIncomeId}
          onClose={() => setDeletingIncomeId(null)}
          onConfirm={() => {
            if (deletingIncomeId) {
              deleteIncome(deletingIncomeId);
              setDeletingIncomeId(null);
            }
          }}
          title="Delete Income Record"
          message="Are you sure you want to delete this income record? This will automatically reverse the deposited account balance and remove the transaction from the ledger."
        />
      )}
    </div>
  );
};
