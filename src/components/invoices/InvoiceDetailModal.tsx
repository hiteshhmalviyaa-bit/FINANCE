import React from 'react';
import { Printer, CreditCard, Send, CheckCircle2, Clock, X, AlertCircle } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Invoice } from '../../types/finance';
import { formatCurrency, formatDate, getInvoiceStatusStyle } from '../../utils/formatters';

interface InvoiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onOpenRecordPayment: (invoice: Invoice) => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onOpenRecordPayment,
}) => {
  const { company, markInvoiceSent, currentUser } = useFinance();

  if (!isOpen || !invoice) return null;

  const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
  const outstanding = Math.max(0, invoice.total - totalPaid);
  const statusInfo = getInvoiceStatusStyle(invoice.status);
  const isViewer = currentUser.role === 'viewer';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity print:hidden"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all z-10 max-h-[95vh] flex flex-col print:max-h-none print:shadow-none print:border-none print:w-full print:m-0 print:p-0">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-slate-50 print:hidden">
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm text-slate-800">
              {invoice.invoiceNumber}
            </span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${statusInfo.bgClass} ${statusInfo.textClass}`}
            >
              {statusInfo.label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isViewer && invoice.status === 'draft' && (
              <button
                onClick={() => markInvoiceSent(invoice.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Mark as Sent
              </button>
            )}

            {!isViewer && outstanding > 0 && invoice.status !== 'cancelled' && (
              <button
                onClick={() => {
                  onClose();
                  onOpenRecordPayment(invoice);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" />
                Record Payment
              </button>
            )}

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-8 sm:p-10 overflow-y-auto flex-1 bg-white print:p-0 text-slate-800 font-sans">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-8 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-lg bg-indigo-700 text-white flex items-center justify-center font-bold text-lg">
                  {company.name.charAt(0)}
                </div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  {company.name}
                </h2>
              </div>
              <p className="text-xs text-slate-500 max-w-sm">{company.address}</p>
              <p className="text-xs text-slate-500">
                {company.city}, {company.state} {company.postalCode}, {company.country}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                <span className="font-semibold text-slate-700">Tax/GSTIN:</span> {company.taxId}
              </p>
              <p className="text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Email:</span> {company.email}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                INVOICE
              </h1>
              <p className="text-base font-bold text-indigo-700 font-mono mt-0.5">
                {invoice.invoiceNumber}
              </p>
              <div className="mt-3 space-y-1 text-xs text-slate-600">
                <div>
                  <span className="text-slate-400">Invoice Date:</span>{' '}
                  <span className="font-semibold text-slate-800">{formatDate(invoice.invoiceDate)}</span>
                </div>
                <div>
                  <span className="text-slate-400">Payment Due:</span>{' '}
                  <span className="font-semibold text-slate-800">{formatDate(invoice.dueDate)}</span>
                </div>
                <div>
                  <span className="text-slate-400">Status:</span>{' '}
                  <span className={`font-semibold uppercase tracking-wider text-[11px] ${statusInfo.textClass}`}>
                    {statusInfo.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bill To */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-slate-100 text-xs">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Billed To
              </span>
              <p className="text-sm font-bold text-slate-900">{invoice.customerName}</p>
              <p className="text-slate-600 mt-0.5">{invoice.customerAddress}</p>
              {invoice.customerEmail && (
                <p className="text-slate-500 mt-0.5">{invoice.customerEmail}</p>
              )}
            </div>

            <div className="sm:text-right flex flex-col justify-end">
              <div className="inline-block sm:ml-auto p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Outstanding Due</span>
                <span className="text-lg font-bold text-slate-900 tabular-nums">
                  {formatCurrency(outstanding, company.currencySymbol)}
                </span>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="py-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-300 text-slate-600 uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-2 font-semibold">Description</th>
                  <th className="py-2.5 px-2 font-semibold text-center">Qty</th>
                  <th className="py-2.5 px-2 font-semibold text-right">Unit Price</th>
                  <th className="py-2.5 px-2 font-semibold text-center">Tax</th>
                  <th className="py-2.5 px-2 font-semibold text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="text-slate-700">
                    <td className="py-3 px-2 font-medium text-slate-900">
                      {item.description}
                    </td>
                    <td className="py-3 px-2 text-center tabular-nums">{item.quantity}</td>
                    <td className="py-3 px-2 text-right tabular-nums">
                      {formatCurrency(item.unitPrice, company.currencySymbol)}
                    </td>
                    <td className="py-3 px-2 text-center tabular-nums">
                      {item.taxRate}%
                    </td>
                    <td className="py-3 px-2 text-right font-semibold tabular-nums text-slate-900">
                      {formatCurrency(item.total, company.currencySymbol)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculations Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-4 border-t border-slate-200 text-xs">
            <div className="max-w-xs space-y-2">
              <div>
                <span className="font-semibold text-slate-700 block">Payment Instructions:</span>
                <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-200">
                  {invoice.paymentInstructions || company.paymentInstructions}
                </p>
              </div>

              {invoice.notes && (
                <div>
                  <span className="font-semibold text-slate-700 block">Notes:</span>
                  <p className="text-slate-500 text-[11px] mt-0.5">{invoice.notes}</p>
                </div>
              )}
            </div>

            <div className="w-full sm:w-72 space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold tabular-nums">
                  {formatCurrency(invoice.subtotal, company.currencySymbol)}
                </span>
              </div>
              {invoice.totalDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount:</span>
                  <span className="font-semibold tabular-nums">
                    -{formatCurrency(invoice.totalDiscount, company.currencySymbol)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Tax / GST:</span>
                <span className="font-semibold tabular-nums">
                  {formatCurrency(invoice.totalTax, company.currencySymbol)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Amount:</span>
                <span className="tabular-nums text-indigo-700">
                  {formatCurrency(invoice.total, company.currencySymbol)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-emerald-700 pt-1">
                <span>Paid to Date:</span>
                <span className="font-semibold tabular-nums">
                  {formatCurrency(totalPaid, company.currencySymbol)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200 bg-slate-50 p-2 rounded">
                <span>Balance Due:</span>
                <span className="tabular-nums text-rose-600">
                  {formatCurrency(outstanding, company.currencySymbol)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment History Log on Invoice */}
          {invoice.payments.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-200 text-xs">
              <h4 className="font-bold text-slate-800 mb-2">Recorded Payment History</h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                    <tr>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Amount</th>
                      <th className="py-2 px-3">Account</th>
                      <th className="py-2 px-3">Method</th>
                      <th className="py-2 px-3">Reference</th>
                      <th className="py-2 px-3">Recorded By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoice.payments.map((p) => (
                      <tr key={p.id}>
                        <td className="py-2 px-3 font-medium">{formatDate(p.paymentDate)}</td>
                        <td className="py-2 px-3 font-bold text-emerald-600 tabular-nums">
                          {formatCurrency(p.amount, company.currencySymbol)}
                        </td>
                        <td className="py-2 px-3">{p.accountName}</td>
                        <td className="py-2 px-3">{p.paymentMethod}</td>
                        <td className="py-2 px-3">{p.referenceNumber || '-'}</td>
                        <td className="py-2 px-3 text-slate-500">{p.createdBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
