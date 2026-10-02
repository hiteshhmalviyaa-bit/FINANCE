import React, { useState } from 'react';
import {
  TrendingDown,
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Download,
  CreditCard,
  CheckCircle2,
  Clock,
  Paperclip,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Expense } from '../../types/finance';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ExpenseModal } from './ExpenseModal';
import { PayExpenseModal } from './PayExpenseModal';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { downloadCsv } from '../../utils/exportUtils';

export const ExpenseView: React.FC = () => {
  const {
    expenses,
    vendors,
    categories,
    accounts,
    deleteExpense,
    company,
    currentUser,
  } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [viewingExpense, setViewingExpense] = useState<Expense | null>(null);
  const [payingExpense, setPayingExpense] = useState<Expense | null>(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);

  const isViewer = currentUser.role === 'viewer';

  // Filtered expense list
  const filteredExpenses = expenses.filter((item) => {
    // Search
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      item.expenseId.toLowerCase().includes(searchLower) ||
      item.vendorName.toLowerCase().includes(searchLower) ||
      item.description.toLowerCase().includes(searchLower) ||
      item.referenceNumber.toLowerCase().includes(searchLower);

    // Filters
    const matchesVend = !selectedVendor || item.vendorId === selectedVendor;
    const matchesCat = !selectedCategory || item.categoryId === selectedCategory;
    const matchesAcc = !selectedAccount || item.accountId === selectedAccount;
    const matchesMethod = !selectedPaymentMethod || item.paymentMethod === selectedPaymentMethod;
    const matchesStatus =
      selectedStatus === 'all'
        ? true
        : selectedStatus === 'paid'
        ? item.isPaid
        : !item.isPaid;

    // Date range
    let matchesDate = true;
    if (startDate && item.date < startDate) matchesDate = false;
    if (endDate && item.date > endDate) matchesDate = false;

    return (
      matchesSearch &&
      matchesVend &&
      matchesCat &&
      matchesAcc &&
      matchesMethod &&
      matchesStatus &&
      matchesDate
    );
  });

  const totalFilteredPaid = filteredExpenses
    .filter((e) => e.isPaid)
    .reduce((sum, item) => sum + item.totalAmount, 0);

  const totalFilteredAP = filteredExpenses
    .filter((e) => !e.isPaid)
    .reduce((sum, item) => sum + item.totalAmount, 0);

  const handleExportCsv = () => {
    const headers = [
      'Expense ID',
      'Date',
      'Vendor',
      'Description',
      'Category',
      'Amount',
      'Tax',
      'Total Amount',
      'Account',
      'Payment Method',
      'Status',
      'Due Date',
      'Reference Number',
    ];
    const rows = filteredExpenses.map((item) => [
      item.expenseId,
      item.date,
      item.vendorName,
      item.description,
      item.categoryName,
      item.amount,
      item.tax,
      item.totalAmount,
      item.accountName,
      item.paymentMethod,
      item.isPaid ? 'Paid' : 'Unpaid (AP)',
      item.dueDate || '-',
      item.referenceNumber,
    ]);
    downloadCsv(`Expenses_Report_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  return (
    <div className="space-y-5">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Expense Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track operational spending, vendor payables, and paid company disbursements
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
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Expense
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search vendor, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Vendor Filter */}
          <select
            value={selectedVendor}
            onChange={(e) => setSelectedVendor(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-700"
          >
            <option value="">All Vendors</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.companyName}
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
              .filter((c) => c.type === 'expense')
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
            <option value="">All Accounts</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid Only</option>
            <option value="unpaid">Unpaid / In AP</option>
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
          {(searchTerm || selectedVendor || selectedCategory || selectedAccount || selectedStatus !== 'all' || startDate || endDate) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedVendor('');
                setSelectedCategory('');
                setSelectedAccount('');
                setSelectedPaymentMethod('');
                setSelectedStatus('all');
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="flex items-center justify-between px-4 py-2.5 bg-rose-50/80 border border-rose-200 rounded-lg">
          <span className="text-rose-900 font-medium">Paid Expenses (Historical Cash Outflow)</span>
          <span className="font-bold text-rose-900 tabular-nums">
            {formatCurrency(totalFilteredPaid, company.currencySymbol)}
          </span>
        </div>
        <div className="flex items-center justify-between px-4 py-2.5 bg-amber-50/80 border border-amber-200 rounded-lg">
          <span className="text-amber-900 font-medium">Unpaid Bills (Accounts Payable)</span>
          <span className="font-bold text-amber-900 tabular-nums">
            {formatCurrency(totalFilteredAP, company.currencySymbol)}
          </span>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">ID</th>
                <th className="py-3 px-4 font-semibold">Vendor</th>
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
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    No expense records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-600">
                      {formatDate(item.date)}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900 whitespace-nowrap">
                      {item.expenseId}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">
                      {item.vendorName}
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
                    <td className="py-3 px-4 font-bold text-right tabular-nums text-rose-600 whitespace-nowrap">
                      {formatCurrency(item.totalAmount, company.currencySymbol)}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {item.isPaid ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <Clock className="w-3 h-3" /> Due {item.dueDate ? formatDate(item.dueDate) : 'Soon'}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingExpense(item)}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {!isViewer && (
                          <>
                            {!item.isPaid && (
                              <button
                                onClick={() => setPayingExpense(item)}
                                className="px-2 py-0.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded font-medium text-[11px] transition-colors"
                                title="Pay Bill"
                              >
                                Pay
                              </button>
                            )}
                            <button
                              onClick={() => setEditingExpense(item)}
                              className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingExpenseId(item.id)}
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

      {/* Add / Edit Expense Modal */}
      {(isAddModalOpen || editingExpense) && (
        <ExpenseModal
          isOpen={isAddModalOpen || !!editingExpense}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingExpense(null);
          }}
          expenseToEdit={editingExpense}
        />
      )}

      {/* Pay Bill Modal */}
      {payingExpense && (
        <PayExpenseModal
          isOpen={!!payingExpense}
          onClose={() => setPayingExpense(null)}
          expense={payingExpense}
        />
      )}

      {/* View Detail Modal */}
      {viewingExpense && (
        <Modal
          isOpen={!!viewingExpense}
          onClose={() => setViewingExpense(null)}
          title={`Expense Details: ${viewingExpense.expenseId}`}
          subtitle={`Recorded by ${viewingExpense.createdBy} on ${viewingExpense.createdAt}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100">
              <div>
                <span className="text-slate-400 block">Date</span>
                <span className="font-semibold text-slate-800">{formatDate(viewingExpense.date)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Vendor</span>
                <span className="font-semibold text-slate-800">{viewingExpense.vendorName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Category</span>
                <span className="font-semibold text-slate-800">{viewingExpense.categoryName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Payment Status</span>
                <span className="font-semibold text-slate-800">
                  {viewingExpense.isPaid ? 'Paid' : 'Unpaid (Accounts Payable)'}
                </span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block">Description</span>
              <p className="font-medium text-slate-800 mt-0.5">{viewingExpense.description}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500 block">Subtotal</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {formatCurrency(viewingExpense.amount, company.currencySymbol)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Tax / GST</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {formatCurrency(viewingExpense.tax, company.currencySymbol)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Total Amount</span>
                <span className="font-bold text-rose-600 tabular-nums">
                  {formatCurrency(viewingExpense.totalAmount, company.currencySymbol)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block">Account</span>
                <span className="font-medium text-slate-800">{viewingExpense.accountName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Payment Method</span>
                <span className="font-medium text-slate-800">{viewingExpense.paymentMethod}</span>
              </div>
            </div>

            {viewingExpense.attachment && (
              <div>
                <span className="text-slate-400 block mb-1">Attachment</span>
                <div className="p-2 border border-slate-200 rounded bg-slate-50 flex items-center justify-between">
                  <span className="font-medium text-slate-700">{viewingExpense.attachment}</span>
                  <span className="text-[11px] text-emerald-600 font-semibold">Verified Receipt</span>
                </div>
              </div>
            )}

            {viewingExpense.notes && (
              <div>
                <span className="text-slate-400 block mb-1">Notes</span>
                <p className="text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200">
                  {viewingExpense.notes}
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViewingExpense(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {deletingExpenseId && (
        <ConfirmDialog
          isOpen={!!deletingExpenseId}
          onClose={() => setDeletingExpenseId(null)}
          onConfirm={() => {
            if (deletingExpenseId) {
              deleteExpense(deletingExpenseId);
              setDeletingExpenseId(null);
            }
          }}
          title="Delete Expense Record"
          message="Are you sure you want to delete this expense record? If already paid, this will restore the account balance and delete the transaction."
        />
      )}
    </div>
  );
};
