export type UserRole = 'admin' | 'finance' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  status: 'active' | 'inactive';
  lastLogin?: string;
}

export interface CompanyProfile {
  name: string;
  logoText?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  email: string;
  phone: string;
  website: string;
  taxId: string; // GST/VAT/PAN
  currency: string; // e.g. INR (₹), USD ($)
  currencySymbol: string; // e.g. ₹ or $
  invoicePrefix: string; // e.g. INV-2026-
  nextInvoiceNumber: number; // e.g. 1004
  invoiceNotes: string;
  paymentInstructions: string;
}

export type AccountType = 'bank' | 'cash' | 'gateway' | 'credit_card' | 'other';

export interface FinancialAccount {
  id: string;
  name: string;
  type: AccountType;
  accountNumber?: string;
  bankName?: string;
  currency: string;
  openingBalance: number;
  currentBalance: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  isDefault?: boolean;
  status: 'active' | 'disabled';
}

export interface Customer {
  id: string;
  customerId: string; // e.g. CUST-001
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  taxId: string;
  currency: string;
  notes: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Vendor {
  id: string;
  vendorId: string; // e.g. VEND-001
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  taxId: string;
  notes: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export type PaymentMethod = 'Bank Transfer' | 'Cash' | 'Card' | 'UPI' | 'PayPal' | 'Other';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number; // percentage or fixed amount
  taxRate: number; // % e.g. 18%
  taxAmount: number;
  subtotal: number;
  total: number;
}

export interface InvoicePayment {
  id: string;
  invoiceId: string;
  paymentDate: string;
  amount: number;
  accountId: string;
  accountName: string;
  paymentMethod: PaymentMethod;
  referenceNumber: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  currency: string;
  items: InvoiceItem[];
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  total: number;
  notes: string;
  paymentInstructions: string;
  status: InvoiceStatus;
  payments: InvoicePayment[];
  createdAt: string;
  createdBy: string;
  attachment?: string;
}

export interface Income {
  id: string;
  incomeId: string; // e.g. INC-2026-001
  date: string;
  customerId: string;
  customerName: string;
  description: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  tax: number;
  totalAmount: number;
  accountId: string;
  accountName: string;
  paymentMethod: PaymentMethod;
  referenceNumber: string;
  notes?: string;
  attachment?: string;
  createdAt: string;
  createdBy: string;
}

export interface Expense {
  id: string;
  expenseId: string; // e.g. EXP-2026-001
  date: string;
  vendorId: string;
  vendorName: string;
  description: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  tax: number;
  totalAmount: number;
  accountId: string;
  accountName: string;
  paymentMethod: PaymentMethod;
  referenceNumber: string;
  notes?: string;
  attachment?: string;
  isPaid: boolean; // if false, tracks in Accounts Payable
  dueDate?: string;
  paidDate?: string;
  createdAt: string;
  createdBy: string;
}

export type TransactionType = 'income' | 'expense' | 'invoice_payment' | 'adjustment';

export interface Transaction {
  id: string;
  transactionId: string; // e.g. TXN-10023
  date: string;
  type: TransactionType;
  description: string;
  category: string;
  amount: number;
  accountId: string;
  accountName: string;
  reference: string;
  relatedCustomerId?: string;
  relatedCustomerName?: string;
  relatedVendorId?: string;
  relatedVendorName?: string;
  relatedInvoiceId?: string;
  relatedInvoiceNumber?: string;
  createdBy: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  recordType: 'Income' | 'Expense' | 'Invoice' | 'Payment' | 'Customer' | 'Vendor' | 'Account' | 'Category' | 'Settings' | 'User';
  recordId: string;
  oldValue: string;
  newValue: string;
  details?: string;
}

export interface FileAttachment {
  id: string;
  recordType: 'Income' | 'Expense' | 'Invoice' | 'Payment';
  recordId: string;
  name: string;
  size: string;
  type: string;
  dataUrl?: string;
  uploadedAt: string;
  uploadedBy: string;
}

export type DateFilterRange = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom' | 'all';
