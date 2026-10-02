import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Invoice, InvoiceItem } from '../../types/finance';
import { Modal } from '../common/Modal';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceToEdit?: Invoice | null;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  invoiceToEdit,
}) => {
  const { customers, company, addInvoice, updateInvoice } = useFinance();
  const activeCustomers = customers.filter((c) => c.status === 'active');

  const [customerId, setCustomerId] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');
  const [invoiceDate, setInvoiceDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [dueDate, setDueDate] = useState<string>('');
  const [notes, setNotes] = useState<string>(company.invoiceNotes);
  const [paymentInstructions, setPaymentInstructions] = useState<string>(
    company.paymentInstructions
  );
  const [status, setStatus] = useState<'draft' | 'sent'>('sent');

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: `item-${Date.now()}`,
      description: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      taxRate: 18,
      taxAmount: 0,
      subtotal: 0,
      total: 0,
    },
  ]);

  useEffect(() => {
    if (invoiceToEdit) {
      setCustomerId(invoiceToEdit.customerId);
      setCustomerName(invoiceToEdit.customerName);
      setCustomerEmail(invoiceToEdit.customerEmail);
      setCustomerAddress(invoiceToEdit.customerAddress);
      setInvoiceDate(invoiceToEdit.invoiceDate);
      setDueDate(invoiceToEdit.dueDate);
      setNotes(invoiceToEdit.notes);
      setPaymentInstructions(invoiceToEdit.paymentInstructions);
      setStatus(invoiceToEdit.status === 'draft' ? 'draft' : 'sent');
      setItems(invoiceToEdit.items);
    } else {
      const today = new Date().toISOString().split('T')[0];
      setInvoiceDate(today);

      const due = new Date();
      due.setDate(due.getDate() + 15);
      setDueDate(due.toISOString().split('T')[0]);

      if (activeCustomers.length > 0) {
        const firstCust = activeCustomers[0];
        setCustomerId(firstCust.id);
        setCustomerName(firstCust.companyName);
        setCustomerEmail(firstCust.email);
        setCustomerAddress(firstCust.address);
      }

      setNotes(company.invoiceNotes);
      setPaymentInstructions(company.paymentInstructions);
      setStatus('sent');
      setItems([
        {
          id: `item-${Date.now()}`,
          description: '',
          quantity: 1,
          unitPrice: 0,
          discount: 0,
          taxRate: 18,
          taxAmount: 0,
          subtotal: 0,
          total: 0,
        },
      ]);
    }
  }, [invoiceToEdit, isOpen]);

  // Handle Customer Selection change
  const handleCustomerChange = (id: string) => {
    setCustomerId(id);
    const selected = customers.find((c) => c.id === id);
    if (selected) {
      setCustomerName(selected.companyName);
      setCustomerEmail(selected.email);
      setCustomerAddress(selected.address);
    }
  };

  // Line item manipulation
  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    setItems((prev) => {
      const copy = [...prev];
      const current = { ...copy[index], [field]: value };

      const qty = Number(current.quantity) || 0;
      const rate = Number(current.unitPrice) || 0;
      const discount = Number(current.discount) || 0;
      const taxRate = Number(current.taxRate) || 0;

      const baseAmount = Math.max(0, qty * rate - discount);
      const taxAmount = Number(((baseAmount * taxRate) / 100).toFixed(2));
      const total = Number((baseAmount + taxAmount).toFixed(2));

      current.subtotal = baseAmount;
      current.taxAmount = taxAmount;
      current.total = total;

      copy[index] = current;
      return copy;
    });
  };

  const addItemRow = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}-${Math.random()}`,
        description: '',
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        taxRate: 18,
        taxAmount: 0,
        subtotal: 0,
        total: 0,
      },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Grand totals
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const totalTax = items.reduce((sum, item) => sum + item.taxAmount, 0);
  const totalDiscount = items.reduce((sum, item) => sum + (Number(item.discount) || 0), 0);
  const grandTotal = Number((subtotal + totalTax).toFixed(2));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (grandTotal <= 0) {
      alert('Please add at least one line item with a price greater than 0');
      return;
    }
    if (!customerName) {
      alert('Please select a customer');
      return;
    }

    if (invoiceToEdit) {
      updateInvoice(invoiceToEdit.id, {
        customerId,
        customerName,
        customerEmail,
        customerAddress,
        invoiceDate,
        dueDate,
        currency: company.currency,
        items,
        subtotal,
        totalDiscount,
        totalTax,
        total: grandTotal,
        notes,
        paymentInstructions,
        status: invoiceToEdit.payments.length > 0 ? invoiceToEdit.status : status,
      });
    } else {
      addInvoice({
        customerId,
        customerName,
        customerEmail,
        customerAddress,
        invoiceDate,
        dueDate,
        currency: company.currency,
        items,
        subtotal,
        totalDiscount,
        totalTax,
        total: grandTotal,
        notes,
        paymentInstructions,
        status,
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={invoiceToEdit ? `Edit Invoice: ${invoiceToEdit.invoiceNumber}` : 'Create Customer Invoice'}
      subtitle="Issue an invoice to track accounts receivable and client billing"
      maxWidth="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Customer & Dates Header */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Customer <span className="text-rose-500">*</span>
            </label>
            <select
              value={customerId}
              onChange={(e) => handleCustomerChange(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-900 focus:outline-hidden text-xs"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName} ({c.customerId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Invoice Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-900 focus:outline-hidden text-xs"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Due Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-900 focus:outline-hidden text-xs"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Initial Status</label>
            <select
              value={status}
              disabled={Boolean(invoiceToEdit && invoiceToEdit.payments.length > 0)}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-900 focus:outline-hidden text-xs"
            >
              <option value="sent">Sent (Active AR)</option>
              <option value="draft">Draft (Unsent)</option>
            </select>
          </div>
        </div>

        {/* Customer Address Details (Auto-filled) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-medium text-slate-600 mb-1">Customer Email</label>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-800 text-xs"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Billing Address</label>
            <input
              type="text"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-800 text-xs"
            />
          </div>
        </div>

        {/* Line Items Table */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="bg-slate-100 px-3 py-2 font-semibold text-slate-700 text-xs border-b border-slate-200 flex justify-between items-center">
            <span>Invoice Items</span>
            <button
              type="button"
              onClick={addItemRow}
              className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold text-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Row
            </button>
          </div>

          <div className="divide-y divide-slate-100 p-2 space-y-2">
            {items.map((item, idx) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-center text-xs pt-1">
                <div className="col-span-5">
                  <input
                    type="text"
                    required
                    placeholder="Item description or service..."
                    value={item.description}
                    onChange={(e) => updateItem(idx, 'description', e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs"
                  />
                </div>
                <div className="col-span-1">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                    className="w-full px-1.5 py-1.5 border border-slate-300 rounded text-center text-xs"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Unit Price"
                    value={item.unitPrice || ''}
                    onChange={(e) => updateItem(idx, 'unitPrice', e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-right text-xs"
                  />
                </div>
                <div className="col-span-1">
                  <input
                    type="number"
                    min="0"
                    placeholder="Tax %"
                    value={item.taxRate}
                    onChange={(e) => updateItem(idx, 'taxRate', e.target.value)}
                    className="w-full px-1.5 py-1.5 border border-slate-300 rounded text-center text-xs"
                  />
                </div>
                <div className="col-span-2 text-right font-bold text-slate-800 tabular-nums">
                  {company.currencySymbol}
                  {item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="col-span-1 text-center">
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItemRow(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                      title="Delete line item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals Summary */}
        <div className="flex justify-end">
          <div className="w-64 bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold tabular-nums">
                {company.currencySymbol}
                {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount:</span>
                <span className="font-semibold tabular-nums">
                  -{company.currencySymbol}
                  {totalDiscount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Tax / GST:</span>
              <span className="font-semibold tabular-nums">
                {company.currencySymbol}
                {totalTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
              <span>Invoice Total:</span>
              <span className="tabular-nums text-indigo-700">
                {company.currencySymbol}
                {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Notes & Payment Instructions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Invoice Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-800 text-xs"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Payment Instructions</label>
            <textarea
              rows={2}
              value={paymentInstructions}
              onChange={(e) => setPaymentInstructions(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-800 text-xs"
            />
          </div>
        </div>

        {/* Actions */}
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
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-semibold shadow-xs cursor-pointer"
          >
            {invoiceToEdit ? 'Save Changes' : 'Generate Invoice'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
