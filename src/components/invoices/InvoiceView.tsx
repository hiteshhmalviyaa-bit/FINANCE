import React, { useState } from 'react';
import {
  FileText,
  Search,
  Plus,
  Eye,
  Edit2,
  Copy,
  CreditCard,
  Ban,
  Trash2,
  Download,
  Send,
  Printer,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Invoice, InvoiceStatus } from '../../types/finance';
import { formatCurrency, formatDate, getInvoiceStatusStyle } from '../../utils/formatters';
import { InvoiceModal } from './InvoiceModal';
import { InvoiceDetailModal } from './InvoiceDetailModal';
import { RecordPaymentModal } from './RecordPaymentModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { downloadCsv } from '../../utils/exportUtils';

export const InvoiceView: React.FC = () => {
  const {
    invoices,
    customers,
    duplicateInvoice,
    markInvoiceSent,
    cancelInvoice,
    deleteInvoice,
    company,
    currentUser,
  } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
  const [cancellingInvoiceId, setCancellingInvoiceId] = useState<string | null>(null);
  const [deletingInvoiceId, setDeletingInvoiceId] = useState<string | null>(null);

  const isViewer = currentUser.role === 'viewer';
  const todayStr = new Date().toISOString().split('T')[0];

  // Map invoices with dynamic overdue computation
  const processedInvoices = invoices.map((inv) => {
    const paid = inv.payments.reduce((sum, p) => sum + p.amount, 0);
    const outstanding = Math.max(0, inv.total - paid);

    let effectiveStatus: InvoiceStatus = inv.status;
    if (inv.status !== 'cancelled' && inv.status !== 'paid' && inv.status !== 'draft') {
      if (inv.dueDate < todayStr && outstanding > 0.01) {
        effectiveStatus = 'overdue';
      }
    }

    return {
      ...inv,
      effectiveStatus,
      paid,
      outstanding,
    };
  });

  const filteredInvoices = processedInvoices.filter((item) => {
    // Search
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      item.invoiceNumber.toLowerCase().includes(searchLower) ||
      item.customerName.toLowerCase().includes(searchLower) ||
      item.customerEmail.toLowerCase().includes(searchLower);

    // Status filter
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'overdue'
        ? item.effectiveStatus === 'overdue'
        : item.status === statusFilter;

    // Customer filter
    const matchesCustomer = !selectedCustomer || item.customerId === selectedCustomer;

    // Date range
    let matchesDate = true;
    if (startDate && item.invoiceDate < startDate) matchesDate = false;
    if (endDate && item.invoiceDate > endDate) matchesDate = false;

    return matchesSearch && matchesStatus && matchesCustomer && matchesDate;
  });

  const totalInvoiced = filteredInvoices.reduce((sum, i) => sum + i.total, 0);
  const totalPaid = filteredInvoices.reduce((sum, i) => sum + i.paid, 0);
  const totalOutstanding = filteredInvoices.reduce((sum, i) => sum + i.outstanding, 0);

  const handleExportCsv = () => {
    const headers = [
      'Invoice Number',
      'Invoice Date',
      'Due Date',
      'Customer',
      'Subtotal',
      'Tax',
      'Total',
      'Paid',
      'Outstanding',
      'Status',
    ];
    const rows = filteredInvoices.map((i) => [
      i.invoiceNumber,
      i.invoiceDate,
      i.dueDate,
      i.customerName,
      i.subtotal,
      i.totalTax,
      i.total,
      i.paid,
      i.outstanding,
      i.effectiveStatus,
    ]);
    downloadCsv(`Invoices_Report_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  return (
    <div className="space-y-5">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Invoices & Accounts Receivable</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create, track, and collect customer invoices and manage accounts receivable
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
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Create Invoice
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-medium">Total Invoiced</span>
          <div className="text-lg font-bold text-slate-900 tabular-nums mt-0.5">
            {formatCurrency(totalInvoiced, company.currencySymbol)}
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-emerald-600 font-medium">Collected / Paid</span>
          <div className="text-lg font-bold text-emerald-600 tabular-nums mt-0.5">
            {formatCurrency(totalPaid, company.currencySymbol)}
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-rose-600 font-medium">Outstanding Accounts Receivable</span>
          <div className="text-lg font-bold text-rose-600 tabular-nums mt-0.5">
            {formatCurrency(totalOutstanding, company.currencySymbol)}
          </div>
        </div>
      </div>

      {/* Status Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-3 text-xs">
          {[
            { id: 'all', label: 'All Invoices' },
            { id: 'sent', label: 'Sent / Active' },
            { id: 'partially_paid', label: 'Partially Paid' },
            { id: 'overdue', label: 'Overdue' },
            { id: 'paid', label: 'Fully Paid' },
            { id: 'draft', label: 'Drafts' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search invoice #, customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>

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

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 font-semibold">Invoice #</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Due Date</th>
                <th className="py-3 px-4 font-semibold">Customer</th>
                <th className="py-3 px-4 font-semibold text-right">Total</th>
                <th className="py-3 px-4 font-semibold text-right">Paid</th>
                <th className="py-3 px-4 font-semibold text-right">Outstanding</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No invoices found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const statusStyle = getInvoiceStatusStyle(inv.effectiveStatus);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-700 whitespace-nowrap">
                        <button
                          onClick={() => setViewingInvoice(inv)}
                          className="hover:underline cursor-pointer"
                        >
                          {inv.invoiceNumber}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {formatDate(inv.invoiceDate)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={
                            inv.effectiveStatus === 'overdue'
                              ? 'text-rose-600 font-semibold'
                              : 'text-slate-600'
                          }
                        >
                          {formatDate(inv.dueDate)}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        {inv.customerName}
                      </td>
                      <td className="py-3 px-4 font-bold text-right tabular-nums whitespace-nowrap text-slate-900">
                        {formatCurrency(inv.total, company.currencySymbol)}
                      </td>
                      <td className="py-3 px-4 font-medium text-right tabular-nums whitespace-nowrap text-emerald-600">
                        {formatCurrency(inv.paid, company.currencySymbol)}
                      </td>
                      <td className="py-3 px-4 font-bold text-right tabular-nums whitespace-nowrap text-rose-600">
                        {formatCurrency(inv.outstanding, company.currencySymbol)}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusStyle.bgClass} ${statusStyle.textClass}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dotClass}`} />
                          {statusStyle.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewingInvoice(inv)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                            title="View / Print Invoice"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {!isViewer && (
                            <>
                              {inv.outstanding > 0 && inv.status !== 'cancelled' && (
                                <button
                                  onClick={() => setPaymentInvoice(inv)}
                                  className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                                  title="Record Payment"
                                >
                                  <CreditCard className="w-4 h-4" />
                                </button>
                              )}

                              {inv.status === 'draft' && (
                                <button
                                  onClick={() => markInvoiceSent(inv.id)}
                                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="Mark as Sent"
                                >
                                  <Send className="w-4 h-4" />
                                </button>
                              )}

                              <button
                                onClick={() => duplicateInvoice(inv.id)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                title="Duplicate Invoice"
                              >
                                <Copy className="w-4 h-4" />
                              </button>

                              {inv.paid === 0 && (
                                <button
                                  onClick={() => setEditingInvoice(inv)}
                                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                  title="Edit"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                              )}

                              {inv.status !== 'cancelled' && inv.paid === 0 && (
                                <button
                                  onClick={() => setCancellingInvoiceId(inv.id)}
                                  className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                                  title="Cancel Invoice"
                                >
                                  <Ban className="w-4 h-4" />
                                </button>
                              )}

                              {inv.paid === 0 && (
                                <button
                                  onClick={() => setDeletingInvoiceId(inv.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                  title="Delete Invoice"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {(isCreateModalOpen || editingInvoice) && (
        <InvoiceModal
          isOpen={isCreateModalOpen || !!editingInvoice}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingInvoice(null);
          }}
          invoiceToEdit={editingInvoice}
        />
      )}

      {/* Invoice Detail / Print Modal */}
      {viewingInvoice && (
        <InvoiceDetailModal
          isOpen={!!viewingInvoice}
          onClose={() => setViewingInvoice(null)}
          invoice={viewingInvoice}
          onOpenRecordPayment={(inv) => setPaymentInvoice(inv)}
        />
      )}

      {/* Record Payment Modal */}
      {paymentInvoice && (
        <RecordPaymentModal
          isOpen={!!paymentInvoice}
          onClose={() => setPaymentInvoice(null)}
          invoice={paymentInvoice}
        />
      )}

      {/* Cancel Confirmation */}
      {cancellingInvoiceId && (
        <ConfirmDialog
          isOpen={!!cancellingInvoiceId}
          onClose={() => setCancellingInvoiceId(null)}
          onConfirm={() => {
            if (cancellingInvoiceId) {
              cancelInvoice(cancellingInvoiceId);
              setCancellingInvoiceId(null);
            }
          }}
          title="Cancel Invoice"
          message="Are you sure you want to cancel this invoice? It will no longer count towards Accounts Receivable."
          confirmLabel="Cancel Invoice"
        />
      )}

      {/* Delete Confirmation */}
      {deletingInvoiceId && (
        <ConfirmDialog
          isOpen={!!deletingInvoiceId}
          onClose={() => setDeletingInvoiceId(null)}
          onConfirm={() => {
            if (deletingInvoiceId) {
              deleteInvoice(deletingInvoiceId);
              setDeletingInvoiceId(null);
            }
          }}
          title="Delete Invoice"
          message="Are you sure you want to permanently delete this invoice?"
        />
      )}
    </div>
  );
};
