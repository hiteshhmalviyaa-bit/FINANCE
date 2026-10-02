import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Invoice, PaymentMethod } from '../../types/finance';
import { Modal } from '../common/Modal';
import { formatCurrency } from '../../utils/formatters';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onSelectInvoice?: (invoiceId: string) => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  invoice,
}) => {
  const { invoices, accounts, recordInvoicePayment, company } = useFinance();

  // If no specific invoice passed, allow selecting from outstanding invoices
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(
    invoice?.id || ''
  );

  const activeInvoice =
    invoice || invoices.find((i) => i.id === selectedInvoiceId) || null;

  const activeAccounts = accounts.filter((a) => a.status === 'active');

  const totalPaidSoFar =
    activeInvoice?.payments.reduce((sum, p) => sum + p.amount, 0) || 0;
  const currentOutstanding = Math.max(0, (activeInvoice?.total || 0) - totalPaidSoFar);

  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [amount, setAmount] = useState<number>(currentOutstanding);
  const [accountId, setAccountId] = useState<string>('');
  const [accountName, setAccountName] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (activeInvoice) {
      setSelectedInvoiceId(activeInvoice.id);
      const paid = activeInvoice.payments.reduce((sum, p) => sum + p.amount, 0);
      const rem = Math.max(0, activeInvoice.total - paid);
      setAmount(rem);
    }
    if (activeAccounts.length > 0 && !accountId) {
      setAccountId(activeAccounts[0].id);
      setAccountName(activeAccounts[0].name);
    }
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setReferenceNumber(`NEFT-${Math.floor(100000 + Math.random() * 900000)}`);
  }, [activeInvoice, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInvoice) {
      alert('Please select an invoice');
      return;
    }
    if (amount <= 0) {
      alert('Please enter a payment amount greater than 0');
      return;
    }
    if (amount > currentOutstanding + 0.01) {
      if (
        !window.confirm(
          `Payment amount (${company.currencySymbol}${amount}) exceeds outstanding amount (${company.currencySymbol}${currentOutstanding}). Proceed with recording?`
        )
      ) {
        return;
      }
    }

    recordInvoicePayment({
      invoiceId: activeInvoice.id,
      paymentDate,
      amount: Number(amount),
      accountId,
      accountName,
      paymentMethod,
      referenceNumber,
      notes,
    });

    onClose();
  };

  const outstandingInvoices = invoices.filter(
    (i) => i.status !== 'paid' && i.status !== 'cancelled'
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Invoice Payment"
      subtitle="Receive customer funds into bank/cash account and settle accounts receivable"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Select Invoice if not pre-provided */}
        {!invoice && (
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Select Invoice <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedInvoiceId}
              onChange={(e) => {
                setSelectedInvoiceId(e.target.value);
                const inv = invoices.find((i) => i.id === e.target.value);
                if (inv) {
                  const paid = inv.payments.reduce((sum, p) => sum + p.amount, 0);
                  setAmount(Math.max(0, inv.total - paid));
                }
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">-- Choose an unpaid invoice --</option>
              {outstandingInvoices.map((inv) => {
                const paid = inv.payments.reduce((sum, p) => sum + p.amount, 0);
                const rem = inv.total - paid;
                return (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNumber} - {inv.customerName} ({formatCurrency(rem, company.currencySymbol)} due)
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {/* Invoice Summary Box */}
        {activeInvoice && (
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>Invoice:</span>
              <span className="font-semibold text-slate-900">{activeInvoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Customer:</span>
              <span className="font-medium text-slate-800">{activeInvoice.customerName}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Total Invoiced:</span>
              <span className="tabular-nums">{formatCurrency(activeInvoice.total, company.currencySymbol)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Previously Paid:</span>
              <span className="tabular-nums text-emerald-600">
                {formatCurrency(totalPaidSoFar, company.currencySymbol)}
              </span>
            </div>
            <div className="flex justify-between text-xs font-bold text-slate-900 pt-1 border-t border-slate-200">
              <span>Remaining Outstanding:</span>
              <span className="tabular-nums text-indigo-700">
                {formatCurrency(currentOutstanding, company.currencySymbol)}
              </span>
            </div>
          </div>
        )}

        {/* Payment Amount & Date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Payment Amount ({company.currencySymbol}) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="any"
              min="0.01"
              required
              value={amount || ''}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-bold tabular-nums focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Payment Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Account to Deposit In */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">
            Deposit to Bank/Cash Account <span className="text-rose-500">*</span>
          </label>
          <select
            value={accountId}
            onChange={(e) => {
              setAccountId(e.target.value);
              const acc = accounts.find((a) => a.id === e.target.value);
              if (acc) setAccountName(acc.name);
            }}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          >
            {activeAccounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} (Current: {formatCurrency(a.currentBalance, company.currencySymbol)})
              </option>
            ))}
          </select>
        </div>

        {/* Payment Method & Reference */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Payment Method <span className="text-rose-500">*</span>
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              <option value="Bank Transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="UPI">UPI</option>
              <option value="PayPal">PayPal</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Reference Number</label>
            <input
              type="text"
              placeholder="e.g. UTR / Transaction ID"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">Notes</label>
          <input
            type="text"
            placeholder="e.g. Customer wire confirmation"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-semibold shadow-xs cursor-pointer"
          >
            Confirm & Deposit Payment
          </button>
        </div>
      </form>
    </Modal>
  );
};
