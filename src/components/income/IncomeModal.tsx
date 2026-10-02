import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Income, PaymentMethod } from '../../types/finance';
import { Modal } from '../common/Modal';
import { AttachmentUploader } from '../common/AttachmentUploader';

interface IncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  incomeToEdit?: Income | null;
}

export const IncomeModal: React.FC<IncomeModalProps> = ({
  isOpen,
  onClose,
  incomeToEdit,
}) => {
  const { customers, categories, accounts, addIncome, updateIncome, company } = useFinance();

  const activeIncomeCategories = categories.filter(
    (c) => c.type === 'income' && c.status === 'active'
  );
  const activeAccounts = accounts.filter((a) => a.status === 'active');
  const activeCustomers = customers.filter((c) => c.status === 'active');

  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [customerId, setCustomerId] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [categoryName, setCategoryName] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [accountId, setAccountId] = useState<string>('');
  const [accountName, setAccountName] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [attachment, setAttachment] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (incomeToEdit) {
      setDate(incomeToEdit.date);
      setCustomerId(incomeToEdit.customerId);
      setCustomerName(incomeToEdit.customerName);
      setDescription(incomeToEdit.description);
      setCategoryId(incomeToEdit.categoryId);
      setCategoryName(incomeToEdit.categoryName);
      setAmount(incomeToEdit.amount);
      setTax(incomeToEdit.tax || 0);
      setAccountId(incomeToEdit.accountId);
      setAccountName(incomeToEdit.accountName);
      setPaymentMethod(incomeToEdit.paymentMethod);
      setReferenceNumber(incomeToEdit.referenceNumber);
      setNotes(incomeToEdit.notes || '');
      setAttachment(incomeToEdit.attachment);
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      if (activeCustomers.length > 0) {
        setCustomerId(activeCustomers[0].id);
        setCustomerName(activeCustomers[0].companyName);
      }
      if (activeIncomeCategories.length > 0) {
        setCategoryId(activeIncomeCategories[0].id);
        setCategoryName(activeIncomeCategories[0].name);
      }
      if (activeAccounts.length > 0) {
        setAccountId(activeAccounts[0].id);
        setAccountName(activeAccounts[0].name);
      }
      setDescription('');
      setAmount(0);
      setTax(0);
      setPaymentMethod('Bank Transfer');
      setReferenceNumber(`REF-${Math.floor(100000 + Math.random() * 900000)}`);
      setNotes('');
      setAttachment(undefined);
    }
  }, [incomeToEdit, isOpen]);

  const totalAmount = Number((Number(amount) + Number(tax)).toFixed(2));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalAmount <= 0) {
      alert('Please enter a valid income amount greater than 0');
      return;
    }
    if (!description.trim()) {
      alert('Please enter a description');
      return;
    }

    if (incomeToEdit) {
      updateIncome(incomeToEdit.id, {
        date,
        customerId,
        customerName,
        description,
        categoryId,
        categoryName,
        amount: Number(amount),
        tax: Number(tax),
        totalAmount,
        accountId,
        accountName,
        paymentMethod,
        referenceNumber,
        notes,
        attachment,
      });
    } else {
      addIncome({
        date,
        customerId,
        customerName,
        description,
        categoryId,
        categoryName,
        amount: Number(amount),
        tax: Number(tax),
        totalAmount,
        accountId,
        accountName,
        paymentMethod,
        referenceNumber,
        notes,
        attachment,
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={incomeToEdit ? `Edit Income (${incomeToEdit.incomeId})` : 'Record Company Income'}
      subtitle="Log direct revenue, consulting, client transfers, or other cash inflow"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Date */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Customer */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Customer / Client <span className="text-rose-500">*</span>
            </label>
            <select
              value={customerId}
              onChange={(e) => {
                setCustomerId(e.target.value);
                const c = customers.find((cust) => cust.id === e.target.value);
                if (c) setCustomerName(c.companyName);
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName} ({c.customerId})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">
            Description <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Q3 Consulting Retainer or Product License"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Category & Payment Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                const cat = categories.find((c) => c.id === e.target.value);
                if (cat) setCategoryName(cat.name);
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              {activeIncomeCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

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
        </div>

        {/* Account & Reference */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Deposit Account <span className="text-rose-500">*</span>
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
                  {a.name} ({company.currencySymbol}{a.currentBalance.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Reference / UTR / Check #
            </label>
            <input
              type="text"
              placeholder="e.g. UTR-9948211"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Amount, Tax, Total Amount Calculation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Amount ({company.currencySymbol}) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="any"
              required
              value={amount || ''}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Tax ({company.currencySymbol})
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={tax || ''}
              onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Total Cleared Amount
            </label>
            <div className="w-full px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-bold text-sm tabular-nums">
              {company.currencySymbol}
              {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Attachment */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">
            Attachment (Deposit slip, bank advice, contract)
          </label>
          <AttachmentUploader value={attachment} onChange={setAttachment} />
        </div>

        {/* Notes */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">Notes</label>
          <textarea
            rows={2}
            placeholder="Additional internal audit notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Action Buttons */}
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
            {incomeToEdit ? 'Save Changes' : 'Record Income'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
