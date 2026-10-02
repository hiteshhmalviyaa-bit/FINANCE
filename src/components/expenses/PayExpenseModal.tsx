import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Expense, PaymentMethod } from '../../types/finance';
import { Modal } from '../common/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface PayExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
}

export const PayExpenseModal: React.FC<PayExpenseModalProps> = ({
  isOpen,
  onClose,
  expense,
}) => {
  const { accounts, payExpense, company } = useFinance();
  const activeAccounts = accounts.filter((a) => a.status === 'active');

  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState<string>(
    expense?.accountId || (activeAccounts[0]?.id ?? '')
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [reference, setReference] = useState<string>(
    `PAY-${Math.floor(100000 + Math.random() * 900000)}`
  );

  if (!expense) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId) {
      alert('Please select an account to pay from');
      return;
    }

    payExpense(expense.id, accountId, paymentMethod, reference, date);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Pay Vendor Expense: ${expense.expenseId}`}
      subtitle={`Settle Accounts Payable of ${formatCurrency(expense.totalAmount, company.currencySymbol)} to ${expense.vendorName}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
          <div className="flex justify-between items-center text-slate-700">
            <span>Vendor:</span>
            <span className="font-semibold text-slate-900">{expense.vendorName}</span>
          </div>
          <div className="flex justify-between items-center text-slate-700 mt-1">
            <span>Bill Amount:</span>
            <span className="font-bold text-rose-700 text-sm tabular-nums">
              {formatCurrency(expense.totalAmount, company.currencySymbol)}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-600 mt-1 text-[11px]">
            <span>Due Date:</span>
            <span>{formatDate(expense.dueDate)}</span>
          </div>
        </div>

        <div>
          <label className="block font-medium text-slate-700 mb-1">
            Payment Date <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block font-medium text-slate-700 mb-1">
            Pay From Account <span className="text-rose-500">*</span>
          </label>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          >
            {activeAccounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} (Balance: {formatCurrency(acc.currentBalance, company.currencySymbol)})
              </option>
            ))}
          </select>
        </div>

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
              <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
              <option value="Card">Corporate Card</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Payment Reference / UTR
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

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
            Confirm & Pay Expense
          </button>
        </div>
      </form>
    </Modal>
  );
};
