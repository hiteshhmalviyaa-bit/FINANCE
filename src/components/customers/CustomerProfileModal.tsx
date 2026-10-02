import React from 'react';
import { Customer } from '../../types/finance';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';
import { formatCurrency, formatDate, getInvoiceStatusStyle } from '../../utils/formatters';
import { Building2, Mail, Phone, MapPin, FileText, CreditCard } from 'lucide-react';

interface CustomerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
}

export const CustomerProfileModal: React.FC<CustomerProfileModalProps> = ({
  isOpen,
  onClose,
  customer,
}) => {
  const { getCustomerMetrics, company } = useFinance();

  if (!isOpen || !customer) return null;

  const metrics = getCustomerMetrics(customer.id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Customer Profile: ${customer.companyName}`}
      subtitle={`Account ID: ${customer.customerId} · Member since ${formatDate(customer.createdAt)}`}
      maxWidth="3xl"
    >
      <div className="space-y-6 text-xs">
        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium">Total Invoiced</span>
            <div className="text-lg font-bold text-slate-900 tabular-nums mt-0.5">
              {formatCurrency(metrics.totalInvoiced, company.currencySymbol)}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              {metrics.invoices.length} invoices generated
            </span>
          </div>

          <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200">
            <span className="text-[11px] text-emerald-800 font-medium">Total Paid</span>
            <div className="text-lg font-bold text-emerald-700 tabular-nums mt-0.5">
              {formatCurrency(metrics.totalPaid, company.currencySymbol)}
            </div>
            <span className="text-[10px] text-emerald-600 mt-1 block">
              {metrics.payments.length} payments received
            </span>
          </div>

          <div className="bg-rose-50/70 p-3.5 rounded-xl border border-rose-200">
            <span className="text-[11px] text-rose-800 font-medium">Outstanding Due</span>
            <div className="text-lg font-bold text-rose-700 tabular-nums mt-0.5">
              {formatCurrency(metrics.outstanding, company.currencySymbol)}
            </div>
            <span className="text-[10px] text-rose-600 mt-1 block">
              Accounts Receivable
            </span>
          </div>
        </div>

        {/* Customer Information Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-700">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>
                <strong className="text-slate-900">Contact:</strong> {customer.contactPerson}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>
                <strong className="text-slate-900">Email:</strong> {customer.email || 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>
                <strong className="text-slate-900">Phone:</strong> {customer.phone || 'N/A'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2 text-slate-700">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-900">Address:</strong> {customer.address || 'N/A'},{' '}
                {customer.country}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Tax / GST Number:</span>{' '}
              <span className="font-mono text-slate-800">{customer.taxId || 'N/A'}</span>
            </div>
            {customer.notes && (
              <p className="text-[11px] text-slate-500 italic mt-1">{customer.notes}</p>
            )}
          </div>
        </div>

        {/* Invoice History */}
        <div>
          <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-indigo-600" /> Invoice History
          </h4>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Invoice #</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                  <th className="py-2.5 px-3 text-right">Outstanding</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {metrics.invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-slate-400">
                      No invoices recorded for this customer.
                    </td>
                  </tr>
                ) : (
                  metrics.invoices.map((inv) => {
                    const paid = inv.payments.reduce((sum, p) => sum + p.amount, 0);
                    const rem = Math.max(0, inv.total - paid);
                    const statusStyle = getInvoiceStatusStyle(inv.status);
                    return (
                      <tr key={inv.id}>
                        <td className="py-2.5 px-3 font-mono font-semibold text-indigo-700">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{formatDate(inv.invoiceDate)}</td>
                        <td className="py-2.5 px-3 text-slate-600">{formatDate(inv.dueDate)}</td>
                        <td className="py-2.5 px-3 text-right font-semibold tabular-nums">
                          {formatCurrency(inv.total, company.currencySymbol)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold tabular-nums text-rose-600">
                          {formatCurrency(rem, company.currencySymbol)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusStyle.bgClass} ${statusStyle.textClass}`}
                          >
                            {statusStyle.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment History */}
        <div>
          <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-emerald-600" /> Payment History
          </h4>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3">Account</th>
                  <th className="py-2.5 px-3">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {metrics.payments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-slate-400">
                      No payments received yet.
                    </td>
                  </tr>
                ) : (
                  metrics.payments.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2.5 px-3 font-medium">{formatDate(p.paymentDate)}</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-600 tabular-nums">
                        {formatCurrency(p.amount, company.currencySymbol)}
                      </td>
                      <td className="py-2.5 px-3">{p.paymentMethod}</td>
                      <td className="py-2.5 px-3">{p.accountName}</td>
                      <td className="py-2.5 px-3 text-slate-500">{p.referenceNumber || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors cursor-pointer"
          >
            Close Profile
          </button>
        </div>
      </div>
    </Modal>
  );
};
