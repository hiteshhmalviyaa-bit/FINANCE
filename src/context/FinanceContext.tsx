import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AccountType,
  AuditLog,
  Category,
  CompanyProfile,
  Customer,
  DateFilterRange,
  Expense,
  FileAttachment,
  FinancialAccount,
  Income,
  Invoice,
  InvoiceItem,
  InvoicePayment,
  InvoiceStatus,
  PaymentMethod,
  Transaction,
  User,
  Vendor,
} from '../types/finance';
import {
  INITIAL_ACCOUNTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_CATEGORIES,
  INITIAL_COMPANY,
  INITIAL_CUSTOMERS,
  INITIAL_EXPENSES,
  INITIAL_INCOME,
  INITIAL_INVOICES,
  INITIAL_TRANSACTIONS,
  INITIAL_USERS,
  INITIAL_VENDORS,
} from '../data/initialData';

interface FinanceContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;

  company: CompanyProfile;
  updateCompany: (profile: Partial<CompanyProfile>) => void;

  accounts: FinancialAccount[];
  addAccount: (account: Omit<FinancialAccount, 'id' | 'currentBalance' | 'createdAt'>) => void;
  updateAccount: (id: string, data: Partial<FinancialAccount>) => void;
  deleteAccount: (id: string) => boolean;

  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, name: string) => void;
  toggleCategoryStatus: (id: string) => void;

  customers: Customer[];
  addCustomer: (cust: Omit<Customer, 'id' | 'customerId' | 'createdAt'>) => void;
  updateCustomer: (id: string, cust: Partial<Customer>) => void;
  deleteCustomer: (id: string) => boolean;

  vendors: Vendor[];
  addVendor: (vend: Omit<Vendor, 'id' | 'vendorId' | 'createdAt'>) => void;
  updateVendor: (id: string, vend: Partial<Vendor>) => void;
  deleteVendor: (id: string) => boolean;

  invoices: Invoice[];
  addInvoice: (inv: Omit<Invoice, 'id' | 'invoiceNumber' | 'payments' | 'createdAt' | 'createdBy'>) => string;
  updateInvoice: (id: string, inv: Partial<Invoice>) => void;
  duplicateInvoice: (id: string) => void;
  markInvoiceSent: (id: string) => void;
  cancelInvoice: (id: string) => void;
  deleteInvoice: (id: string) => boolean;
  recordInvoicePayment: (payment: Omit<InvoicePayment, 'id' | 'createdAt' | 'createdBy'>) => void;

  income: Income[];
  addIncome: (inc: Omit<Income, 'id' | 'incomeId' | 'createdAt' | 'createdBy'>) => void;
  updateIncome: (id: string, inc: Partial<Income>) => void;
  deleteIncome: (id: string) => void;

  expenses: Expense[];
  addExpense: (exp: Omit<Expense, 'id' | 'expenseId' | 'createdAt' | 'createdBy'>) => void;
  payExpense: (id: string, accountId: string, paymentMethod: PaymentMethod, reference: string, date: string) => void;
  updateExpense: (id: string, exp: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  transactions: Transaction[];
  auditLogs: AuditLog[];
  addAuditLog: (entry: Omit<AuditLog, 'id' | 'timestamp' | 'user'>) => void;

  // Financial calculations
  calculateMetrics: (range?: DateFilterRange, customStart?: string, customEnd?: string) => {
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    totalCashBankBalance: number;
    accountsReceivable: number;
    accountsPayable: number;
    outstandingInvoicesCount: number;
    overdueInvoicesCount: number;
  };

  // Helper getters
  getCustomerMetrics: (customerId: string) => {
    totalInvoiced: number;
    totalPaid: number;
    outstanding: number;
    invoices: Invoice[];
    payments: InvoicePayment[];
  };

  getVendorMetrics: (vendorId: string) => {
    totalExpenses: number;
    totalPaid: number;
    outstanding: number;
    expenses: Expense[];
  };

  resetToDemoData: () => void;
  exportDatabaseJson: () => string;
  importDatabaseJson: (json: string) => boolean;
}

const STORAGE_KEY = 'financeflow_app_state_v1';

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state from LocalStorage or defaults
  const [company, setCompany] = useState<CompanyProfile>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_company`);
      return saved ? JSON.parse(saved) : INITIAL_COMPANY;
    } catch {
      return INITIAL_COMPANY;
    }
  });

  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<User>(() => users[0] || INITIAL_USERS[0]);

  const [accounts, setAccounts] = useState<FinancialAccount[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_accounts`);
      return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
    } catch {
      return INITIAL_ACCOUNTS;
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_categories`);
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_customers`);
      return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  });

  const [vendors, setVendors] = useState<Vendor[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_vendors`);
      return saved ? JSON.parse(saved) : INITIAL_VENDORS;
    } catch {
      return INITIAL_VENDORS;
    }
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_invoices`);
      return saved ? JSON.parse(saved) : INITIAL_INVOICES;
    } catch {
      return INITIAL_INVOICES;
    }
  });

  const [income, setIncome] = useState<Income[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_income`);
      return saved ? JSON.parse(saved) : INITIAL_INCOME;
    } catch {
      return INITIAL_INCOME;
    }
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_expenses`);
      return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
    } catch {
      return INITIAL_EXPENSES;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_transactions`);
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_audit`);
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  // Sync to LocalStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_company`, JSON.stringify(company));
      localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users));
      localStorage.setItem(`${STORAGE_KEY}_accounts`, JSON.stringify(accounts));
      localStorage.setItem(`${STORAGE_KEY}_categories`, JSON.stringify(categories));
      localStorage.setItem(`${STORAGE_KEY}_customers`, JSON.stringify(customers));
      localStorage.setItem(`${STORAGE_KEY}_vendors`, JSON.stringify(vendors));
      localStorage.setItem(`${STORAGE_KEY}_invoices`, JSON.stringify(invoices));
      localStorage.setItem(`${STORAGE_KEY}_income`, JSON.stringify(income));
      localStorage.setItem(`${STORAGE_KEY}_expenses`, JSON.stringify(expenses));
      localStorage.setItem(`${STORAGE_KEY}_transactions`, JSON.stringify(transactions));
      localStorage.setItem(`${STORAGE_KEY}_audit`, JSON.stringify(auditLogs));
    } catch (e) {
      console.error('Failed to sync to LocalStorage', e);
    }
  }, [
    company,
    users,
    accounts,
    categories,
    customers,
    vendors,
    invoices,
    income,
    expenses,
    transactions,
    auditLogs,
  ]);

  // Helper to add audit log
  const addAuditLog = (entry: Omit<AuditLog, 'id' | 'timestamp' | 'user'>) => {
    const now = new Date();
    const formatted = now.toISOString().replace('T', ' ').substring(0, 19);
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      user: currentUser.name,
      timestamp: formatted,
      ...entry,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Company management
  const updateCompany = (profile: Partial<CompanyProfile>) => {
    const oldName = company.name;
    setCompany((prev) => ({ ...prev, ...profile }));
    addAuditLog({
      action: 'Updated Company Profile',
      recordType: 'Settings',
      recordId: 'CompanyProfile',
      oldValue: oldName,
      newValue: profile.name || oldName,
      details: 'Updated company contact and settings.',
    });
  };

  // Users management
  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
    };
    setUsers((prev) => [...prev, newUser]);
    addAuditLog({
      action: `Added User ${newUser.name}`,
      recordType: 'User',
      recordId: newUser.id,
      oldValue: '-',
      newValue: `${newUser.name} (${newUser.role})`,
    });
  };

  const updateUser = (id: string, data: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const updated = { ...u, ...data };
          if (currentUser.id === id) setCurrentUser(updated);
          return updated;
        }
        return u;
      })
    );
    addAuditLog({
      action: `Updated User ${id}`,
      recordType: 'User',
      recordId: id,
      oldValue: 'Existing User Data',
      newValue: JSON.stringify(data),
    });
  };

  const deleteUser = (id: string) => {
    if (users.length <= 1) return false;
    const target = users.find((u) => u.id === id);
    if (!target) return false;
    setUsers((prev) => prev.filter((u) => u.id !== id));
    addAuditLog({
      action: `Deleted User ${target.name}`,
      recordType: 'User',
      recordId: id,
      oldValue: `${target.name} (${target.role})`,
      newValue: 'Deleted',
    });
    return true;
  };

  // Accounts management
  const addAccount = (accountData: Omit<FinancialAccount, 'id' | 'currentBalance' | 'createdAt'>) => {
    const newAccount: FinancialAccount = {
      ...accountData,
      id: `acc-${Date.now()}`,
      currentBalance: accountData.openingBalance,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setAccounts((prev) => [...prev, newAccount]);
    addAuditLog({
      action: `Created Account ${newAccount.name}`,
      recordType: 'Account',
      recordId: newAccount.id,
      oldValue: '-',
      newValue: `Opening: ${company.currencySymbol}${newAccount.openingBalance}`,
    });
  };

  const updateAccount = (id: string, data: Partial<FinancialAccount>) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, ...data } : acc))
    );
    addAuditLog({
      action: `Updated Account ${id}`,
      recordType: 'Account',
      recordId: id,
      oldValue: 'Account details',
      newValue: JSON.stringify(data),
    });
  };

  const deleteAccount = (id: string) => {
    // Check if account has transactions
    const hasTxns = transactions.some((t) => t.accountId === id);
    if (hasTxns) return false;
    const acc = accounts.find((a) => a.id === id);
    if (!acc) return false;
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    addAuditLog({
      action: `Deleted Account ${acc.name}`,
      recordType: 'Account',
      recordId: id,
      oldValue: acc.name,
      newValue: 'Deleted',
    });
    return true;
  };

  // Category management
  const addCategory = (categoryData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...categoryData,
      id: `cat-${categoryData.type}-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
    addAuditLog({
      action: `Added ${categoryData.type} Category: ${categoryData.name}`,
      recordType: 'Category',
      recordId: newCat.id,
      oldValue: '-',
      newValue: categoryData.name,
    });
  };

  const updateCategory = (id: string, name: string) => {
    const target = categories.find((c) => c.id === id);
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name } : c))
    );
    addAuditLog({
      action: `Updated Category Name`,
      recordType: 'Category',
      recordId: id,
      oldValue: target?.name || '-',
      newValue: name,
    });
  };

  const toggleCategoryStatus = (id: string) => {
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextStatus = c.status === 'active' ? 'disabled' : 'active';
          addAuditLog({
            action: `${nextStatus === 'disabled' ? 'Disabled' : 'Enabled'} Category ${c.name}`,
            recordType: 'Category',
            recordId: id,
            oldValue: c.status,
            newValue: nextStatus,
          });
          return { ...c, status: nextStatus };
        }
        return c;
      })
    );
  };

  // Customer management
  const addCustomer = (custData: Omit<Customer, 'id' | 'customerId' | 'createdAt'>) => {
    const count = customers.length + 1;
    const customerId = `CUST-${String(count).padStart(3, '0')}`;
    const newCust: Customer = {
      ...custData,
      id: `cust-${Date.now()}`,
      customerId,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCustomers((prev) => [...prev, newCust]);
    addAuditLog({
      action: `Created Customer ${newCust.companyName}`,
      recordType: 'Customer',
      recordId: newCust.customerId,
      oldValue: '-',
      newValue: newCust.companyName,
    });
  };

  const updateCustomer = (id: string, cust: Partial<Customer>) => {
    const old = customers.find((c) => c.id === id);
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...cust } : c))
    );
    addAuditLog({
      action: `Updated Customer ${old?.companyName || id}`,
      recordType: 'Customer',
      recordId: old?.customerId || id,
      oldValue: old?.companyName || '-',
      newValue: cust.companyName || 'Updated Info',
    });
  };

  const deleteCustomer = (id: string) => {
    const hasInvoices = invoices.some((inv) => inv.customerId === id);
    if (hasInvoices) return false;
    const old = customers.find((c) => c.id === id);
    if (!old) return false;
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    addAuditLog({
      action: `Deleted Customer ${old.companyName}`,
      recordType: 'Customer',
      recordId: old.customerId,
      oldValue: old.companyName,
      newValue: 'Deleted',
    });
    return true;
  };

  // Vendor management
  const addVendor = (vendData: Omit<Vendor, 'id' | 'vendorId' | 'createdAt'>) => {
    const count = vendors.length + 1;
    const vendorId = `VEND-${String(count).padStart(3, '0')}`;
    const newVend: Vendor = {
      ...vendData,
      id: `vend-${Date.now()}`,
      vendorId,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setVendors((prev) => [...prev, newVend]);
    addAuditLog({
      action: `Created Vendor ${newVend.companyName}`,
      recordType: 'Vendor',
      recordId: newVend.vendorId,
      oldValue: '-',
      newValue: newVend.companyName,
    });
  };

  const updateVendor = (id: string, vend: Partial<Vendor>) => {
    const old = vendors.find((v) => v.id === id);
    setVendors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...vend } : v))
    );
    addAuditLog({
      action: `Updated Vendor ${old?.companyName || id}`,
      recordType: 'Vendor',
      recordId: old?.vendorId || id,
      oldValue: old?.companyName || '-',
      newValue: vend.companyName || 'Updated Info',
    });
  };

  const deleteVendor = (id: string) => {
    const hasExpenses = expenses.some((e) => e.vendorId === id);
    if (hasExpenses) return false;
    const old = vendors.find((v) => v.id === id);
    if (!old) return false;
    setVendors((prev) => prev.filter((v) => v.id !== id));
    addAuditLog({
      action: `Deleted Vendor ${old.companyName}`,
      recordType: 'Vendor',
      recordId: old.vendorId,
      oldValue: old.companyName,
      newValue: 'Deleted',
    });
    return true;
  };

  // Invoice management
  const addInvoice = (
    invData: Omit<Invoice, 'id' | 'invoiceNumber' | 'payments' | 'createdAt' | 'createdBy'>
  ): string => {
    const invoiceNumStr = String(company.nextInvoiceNumber).padStart(4, '0');
    const invoiceNumber = `${company.invoicePrefix}${invoiceNumStr}`;

    const newInvoice: Invoice = {
      ...invData,
      id: `inv-${Date.now()}`,
      invoiceNumber,
      payments: [],
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: currentUser.name,
    };

    setCompany((prev) => ({
      ...prev,
      nextInvoiceNumber: prev.nextInvoiceNumber + 1,
    }));

    setInvoices((prev) => [newInvoice, ...prev]);

    addAuditLog({
      action: `Created Invoice ${invoiceNumber}`,
      recordType: 'Invoice',
      recordId: invoiceNumber,
      oldValue: '-',
      newValue: `Total: ${company.currencySymbol}${newInvoice.total.toLocaleString()} (${newInvoice.status})`,
      details: `Issued to ${newInvoice.customerName}`,
    });

    return newInvoice.id;
  };

  const updateInvoice = (id: string, data: Partial<Invoice>) => {
    const old = invoices.find((i) => i.id === id);
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, ...data } : inv))
    );
    addAuditLog({
      action: `Updated Invoice ${old?.invoiceNumber || id}`,
      recordType: 'Invoice',
      recordId: old?.invoiceNumber || id,
      oldValue: `Total: ${company.currencySymbol}${old?.total}`,
      newValue: `Total: ${company.currencySymbol}${data.total ?? old?.total}`,
      details: 'Modified invoice parameters or items.',
    });
  };

  const duplicateInvoice = (id: string) => {
    const source = invoices.find((i) => i.id === id);
    if (!source) return;

    const invoiceNumStr = String(company.nextInvoiceNumber).padStart(4, '0');
    const newInvoiceNumber = `${company.invoicePrefix}${invoiceNumStr}`;
    const today = new Date().toISOString().split('T')[0];

    // Compute due date 15 days from now
    const due = new Date();
    due.setDate(due.getDate() + 15);
    const dueDate = due.toISOString().split('T')[0];

    const copy: Invoice = {
      ...source,
      id: `inv-${Date.now()}`,
      invoiceNumber: newInvoiceNumber,
      invoiceDate: today,
      dueDate,
      status: 'draft',
      payments: [],
      createdAt: today,
      createdBy: currentUser.name,
      items: source.items.map((item) => ({ ...item, id: `item-${Date.now()}-${Math.random()}` })),
    };

    setCompany((prev) => ({
      ...prev,
      nextInvoiceNumber: prev.nextInvoiceNumber + 1,
    }));

    setInvoices((prev) => [copy, ...prev]);

    addAuditLog({
      action: `Duplicated Invoice ${source.invoiceNumber} to ${newInvoiceNumber}`,
      recordType: 'Invoice',
      recordId: newInvoiceNumber,
      oldValue: source.invoiceNumber,
      newValue: newInvoiceNumber,
      details: `Created draft duplicate from ${source.invoiceNumber}`,
    });
  };

  const markInvoiceSent = (id: string) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === id && inv.status === 'draft') {
          addAuditLog({
            action: `Marked Invoice ${inv.invoiceNumber} as Sent`,
            recordType: 'Invoice',
            recordId: inv.invoiceNumber,
            oldValue: 'Draft',
            newValue: 'Sent',
          });
          return { ...inv, status: 'sent' };
        }
        return inv;
      })
    );
  };

  const cancelInvoice = (id: string) => {
    const inv = invoices.find((i) => i.id === id);
    if (!inv || inv.status === 'paid') return;
    setInvoices((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: 'cancelled' } : i))
    );
    addAuditLog({
      action: `Cancelled Invoice ${inv.invoiceNumber}`,
      recordType: 'Invoice',
      recordId: inv.invoiceNumber,
      oldValue: inv.status,
      newValue: 'Cancelled',
    });
  };

  const deleteInvoice = (id: string) => {
    const target = invoices.find((i) => i.id === id);
    if (!target) return false;
    // If invoice has payments received, disallow direct delete (requires deleting payments first)
    if (target.payments && target.payments.length > 0) {
      return false;
    }
    setInvoices((prev) => prev.filter((i) => i.id !== id));
    addAuditLog({
      action: `Deleted Invoice ${target.invoiceNumber}`,
      recordType: 'Invoice',
      recordId: target.invoiceNumber,
      oldValue: `${target.invoiceNumber} (${company.currencySymbol}${target.total})`,
      newValue: 'Deleted',
    });
    return true;
  };

  // Record payment for invoice (Decreases Accounts Receivable, Increases Account Balance, Logs Transaction)
  const recordInvoicePayment = (
    paymentData: Omit<InvoicePayment, 'id' | 'createdAt' | 'createdBy'>
  ) => {
    const inv = invoices.find((i) => i.id === paymentData.invoiceId);
    if (!inv) return;

    const newPaymentId = `pmt-${Date.now()}`;
    const nowTime = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newPayment: InvoicePayment = {
      ...paymentData,
      id: newPaymentId,
      createdAt: nowTime,
      createdBy: currentUser.name,
    };

    // Calculate new total paid
    const existingPaid = inv.payments.reduce((sum, p) => sum + p.amount, 0);
    const newPaidTotal = existingPaid + paymentData.amount;
    const newStatus: InvoiceStatus =
      newPaidTotal >= inv.total - 0.01 ? 'paid' : 'partially_paid';

    // 1. Update invoice with payment and new status
    setInvoices((prev) =>
      prev.map((i) =>
        i.id === inv.id
          ? {
              ...i,
              status: newStatus,
              payments: [...i.payments, newPayment],
            }
          : i
      )
    );

    // 2. Increase the target account balance
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === paymentData.accountId
          ? { ...acc, currentBalance: acc.currentBalance + paymentData.amount }
          : acc
      )
    );

    // 3. Create central ledger Transaction
    const txnId = `TXN-${10000 + transactions.length + 1}`;
    const newTxn: Transaction = {
      id: `txn-${Date.now()}`,
      transactionId: txnId,
      date: paymentData.paymentDate,
      type: 'invoice_payment',
      description: `Payment for Invoice ${inv.invoiceNumber} (${inv.customerName})`,
      category: 'Client Payment',
      amount: paymentData.amount,
      accountId: paymentData.accountId,
      accountName: paymentData.accountName,
      reference: paymentData.referenceNumber,
      relatedCustomerId: inv.customerId,
      relatedCustomerName: inv.customerName,
      relatedInvoiceId: inv.id,
      relatedInvoiceNumber: inv.invoiceNumber,
      createdBy: currentUser.name,
      createdAt: nowTime,
    };
    setTransactions((prev) => [newTxn, ...prev]);

    // 4. Audit Log
    addAuditLog({
      action: `Recorded Payment for ${inv.invoiceNumber}`,
      recordType: 'Payment',
      recordId: inv.invoiceNumber,
      oldValue: `Paid: ${company.currencySymbol}${existingPaid} | Status: ${inv.status}`,
      newValue: `Paid: ${company.currencySymbol}${newPaidTotal} | Status: ${newStatus}`,
      details: `Received ${company.currencySymbol}${paymentData.amount} into ${paymentData.accountName}`,
    });
  };

  // Income Management
  const addIncome = (
    incData: Omit<Income, 'id' | 'incomeId' | 'createdAt' | 'createdBy'>
  ) => {
    const incId = `INC-2026-${String(income.length + 1).padStart(3, '0')}`;
    const nowTime = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newInc: Income = {
      ...incData,
      id: `inc-${Date.now()}`,
      incomeId: incId,
      createdAt: nowTime,
      createdBy: currentUser.name,
    };

    // 1. Add to income list
    setIncome((prev) => [newInc, ...prev]);

    // 2. Increase account balance
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === incData.accountId
          ? { ...acc, currentBalance: acc.currentBalance + incData.totalAmount }
          : acc
      )
    );

    // 3. Create transaction
    const txnId = `TXN-${10000 + transactions.length + 1}`;
    const newTxn: Transaction = {
      id: `txn-${Date.now()}`,
      transactionId: txnId,
      date: incData.date,
      type: 'income',
      description: incData.description,
      category: incData.categoryName,
      amount: incData.totalAmount,
      accountId: incData.accountId,
      accountName: incData.accountName,
      reference: incData.referenceNumber,
      relatedCustomerId: incData.customerId,
      relatedCustomerName: incData.customerName,
      createdBy: currentUser.name,
      createdAt: nowTime,
    };
    setTransactions((prev) => [newTxn, ...prev]);

    // 4. Audit Log
    addAuditLog({
      action: `Added Income ${incId}`,
      recordType: 'Income',
      recordId: incId,
      oldValue: '-',
      newValue: `${company.currencySymbol}${incData.totalAmount} (${incData.categoryName})`,
      details: `Account: ${incData.accountName} | From: ${incData.customerName}`,
    });
  };

  const updateIncome = (id: string, incData: Partial<Income>) => {
    const old = income.find((i) => i.id === id);
    if (!old) return;

    // Balance adjustment if amount or account changed
    const oldAmount = old.totalAmount;
    const newAmount = incData.totalAmount ?? oldAmount;
    const oldAccountId = old.accountId;
    const newAccountId = incData.accountId ?? oldAccountId;

    setAccounts((prev) =>
      prev.map((acc) => {
        if (oldAccountId === newAccountId) {
          if (acc.id === oldAccountId) {
            return { ...acc, currentBalance: acc.currentBalance - oldAmount + newAmount };
          }
        } else {
          if (acc.id === oldAccountId) {
            return { ...acc, currentBalance: acc.currentBalance - oldAmount };
          }
          if (acc.id === newAccountId) {
            return { ...acc, currentBalance: acc.currentBalance + newAmount };
          }
        }
        return acc;
      })
    );

    setIncome((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...incData } : i))
    );

    addAuditLog({
      action: `Updated Income ${old.incomeId}`,
      recordType: 'Income',
      recordId: old.incomeId,
      oldValue: `${company.currencySymbol}${oldAmount}`,
      newValue: `${company.currencySymbol}${newAmount}`,
    });
  };

  const deleteIncome = (id: string) => {
    const target = income.find((i) => i.id === id);
    if (!target) return;

    // Reverse balance
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === target.accountId
          ? { ...acc, currentBalance: acc.currentBalance - target.totalAmount }
          : acc
      )
    );

    setIncome((prev) => prev.filter((i) => i.id !== id));
    setTransactions((prev) => prev.filter((t) => t.reference !== target.referenceNumber));

    addAuditLog({
      action: `Deleted Income ${target.incomeId}`,
      recordType: 'Income',
      recordId: target.incomeId,
      oldValue: `${company.currencySymbol}${target.totalAmount}`,
      newValue: 'Deleted',
    });
  };

  // Expense Management
  const addExpense = (
    expData: Omit<Expense, 'id' | 'expenseId' | 'createdAt' | 'createdBy'>
  ) => {
    const expId = `EXP-2026-${String(expenses.length + 1).padStart(3, '0')}`;
    const nowTime = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newExp: Expense = {
      ...expData,
      id: `exp-${Date.now()}`,
      expenseId: expId,
      createdAt: nowTime,
      createdBy: currentUser.name,
      paidDate: expData.isPaid ? expData.date : undefined,
    };

    setExpenses((prev) => [newExp, ...prev]);

    // If paid upfront, reduce bank balance and create transaction
    if (newExp.isPaid) {
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === expData.accountId
            ? { ...acc, currentBalance: acc.currentBalance - expData.totalAmount }
            : acc
        )
      );

      const txnId = `TXN-${10000 + transactions.length + 1}`;
      const newTxn: Transaction = {
        id: `txn-${Date.now()}`,
        transactionId: txnId,
        date: expData.date,
        type: 'expense',
        description: expData.description,
        category: expData.categoryName,
        amount: -expData.totalAmount,
        accountId: expData.accountId,
        accountName: expData.accountName,
        reference: expData.referenceNumber,
        relatedVendorId: expData.vendorId,
        relatedVendorName: expData.vendorName,
        createdBy: currentUser.name,
        createdAt: nowTime,
      };
      setTransactions((prev) => [newTxn, ...prev]);
    }

    addAuditLog({
      action: `Recorded Expense ${expId}`,
      recordType: 'Expense',
      recordId: expId,
      oldValue: '-',
      newValue: `${company.currencySymbol}${expData.totalAmount} (${expData.isPaid ? 'Paid' : 'Unpaid - AP'})`,
      details: `Vendor: ${expData.vendorName} | Category: ${expData.categoryName}`,
    });
  };

  // Mark an unpaid expense as Paid (Accounts Payable settlement)
  const payExpense = (
    id: string,
    accountId: string,
    paymentMethod: PaymentMethod,
    reference: string,
    date: string
  ) => {
    const target = expenses.find((e) => e.id === id);
    if (!target || target.isPaid) return;

    const acc = accounts.find((a) => a.id === accountId);
    const accountName = acc?.name || target.accountName;
    const nowTime = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // 1. Update expense to isPaid = true
    setExpenses((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              isPaid: true,
              paidDate: date,
              accountId,
              accountName,
              paymentMethod,
              referenceNumber: reference || e.referenceNumber,
            }
          : e
      )
    );

    // 2. Deduct from account balance
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === accountId
          ? { ...a, currentBalance: a.currentBalance - target.totalAmount }
          : a
      )
    );

    // 3. Create transaction
    const txnId = `TXN-${10000 + transactions.length + 1}`;
    const newTxn: Transaction = {
      id: `txn-${Date.now()}`,
      transactionId: txnId,
      date,
      type: 'expense',
      description: target.description,
      category: target.categoryName,
      amount: -target.totalAmount,
      accountId,
      accountName,
      reference: reference || target.referenceNumber,
      relatedVendorId: target.vendorId,
      relatedVendorName: target.vendorName,
      createdBy: currentUser.name,
      createdAt: nowTime,
    };
    setTransactions((prev) => [newTxn, ...prev]);

    // 4. Audit Log
    addAuditLog({
      action: `Paid Vendor Expense ${target.expenseId}`,
      recordType: 'Expense',
      recordId: target.expenseId,
      oldValue: 'Status: Unpaid (Accounts Payable)',
      newValue: `Status: Paid (${company.currencySymbol}${target.totalAmount})`,
      details: `Paid from ${accountName} via ${paymentMethod}`,
    });
  };

  const updateExpense = (id: string, expData: Partial<Expense>) => {
    const old = expenses.find((e) => e.id === id);
    if (!old) return;

    // If it was already paid, adjust balance
    if (old.isPaid) {
      const oldAmount = old.totalAmount;
      const newAmount = expData.totalAmount ?? oldAmount;
      const oldAccountId = old.accountId;
      const newAccountId = expData.accountId ?? oldAccountId;

      setAccounts((prev) =>
        prev.map((acc) => {
          if (oldAccountId === newAccountId) {
            if (acc.id === oldAccountId) {
              return { ...acc, currentBalance: acc.currentBalance + oldAmount - newAmount };
            }
          } else {
            if (acc.id === oldAccountId) {
              return { ...acc, currentBalance: acc.currentBalance + oldAmount };
            }
            if (acc.id === newAccountId) {
              return { ...acc, currentBalance: acc.currentBalance - newAmount };
            }
          }
          return acc;
        })
      );
    }

    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...expData } : e))
    );

    addAuditLog({
      action: `Updated Expense ${old.expenseId}`,
      recordType: 'Expense',
      recordId: old.expenseId,
      oldValue: `Old Amount: ${company.currencySymbol}${old.totalAmount}`,
      newValue: `New Amount: ${company.currencySymbol}${expData.totalAmount ?? old.totalAmount}`,
    });
  };

  const deleteExpense = (id: string) => {
    const target = expenses.find((e) => e.id === id);
    if (!target) return;

    if (target.isPaid) {
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === target.accountId
            ? { ...acc, currentBalance: acc.currentBalance + target.totalAmount }
            : acc
        )
      );
      setTransactions((prev) => prev.filter((t) => t.reference !== target.referenceNumber));
    }

    setExpenses((prev) => prev.filter((e) => e.id !== id));

    addAuditLog({
      action: `Deleted Expense ${target.expenseId}`,
      recordType: 'Expense',
      recordId: target.expenseId,
      oldValue: `${company.currencySymbol}${target.totalAmount}`,
      newValue: 'Deleted',
    });
  };

  // Helper date filter checking
  const isDateInRange = (dateStr: string, range?: DateFilterRange, customStart?: string, customEnd?: string): boolean => {
    if (!range || range === 'all') return true;
    if (!dateStr) return false;

    const itemDate = new Date(dateStr);
    const now = new Date();

    if (range === 'custom') {
      if (customStart && itemDate < new Date(customStart)) return false;
      if (customEnd) {
        const end = new Date(customEnd);
        end.setHours(23, 59, 59, 999);
        if (itemDate > end) return false;
      }
      return true;
    }

    if (range === 'today') {
      return (
        itemDate.getDate() === now.getDate() &&
        itemDate.getMonth() === now.getMonth() &&
        itemDate.getFullYear() === now.getFullYear()
      );
    }

    if (range === 'week') {
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(now.getDate() - 7);
      return itemDate >= oneWeekAgo && itemDate <= now;
    }

    if (range === 'month') {
      return (
        itemDate.getMonth() === now.getMonth() &&
        itemDate.getFullYear() === now.getFullYear()
      );
    }

    if (range === 'quarter') {
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const itemQuarter = Math.floor(itemDate.getMonth() / 3);
      return itemQuarter === currentQuarter && itemDate.getFullYear() === now.getFullYear();
    }

    if (range === 'year') {
      return itemDate.getFullYear() === now.getFullYear();
    }

    return true;
  };

  // Financial engine unified metrics calculation
  const calculateMetrics = (range?: DateFilterRange, customStart?: string, customEnd?: string) => {
    // 1. Total Income: Direct Income received + Invoice payments received within date range
    const directIncomeFiltered = income.filter((i) =>
      isDateInRange(i.date, range, customStart, customEnd)
    );
    const directIncomeSum = directIncomeFiltered.reduce((sum, i) => sum + i.totalAmount, 0);

    let invoicePaymentsSum = 0;
    invoices.forEach((inv) => {
      inv.payments.forEach((p) => {
        if (isDateInRange(p.paymentDate, range, customStart, customEnd)) {
          invoicePaymentsSum += p.amount;
        }
      });
    });

    const totalIncome = directIncomeSum + invoicePaymentsSum;

    // 2. Total Expenses: Paid expenses within date range
    const paidExpensesFiltered = expenses.filter(
      (e) => e.isPaid && isDateInRange(e.paidDate || e.date, range, customStart, customEnd)
    );
    const totalExpenses = paidExpensesFiltered.reduce((sum, e) => sum + e.totalAmount, 0);

    // 3. Net Profit
    const netProfit = totalIncome - totalExpenses;

    // 4. Total Cash & Bank Balances (liquid asset accounts: bank + cash + gateway)
    const totalCashBankBalance = accounts
      .filter((a) => a.type === 'bank' || a.type === 'cash' || a.type === 'gateway')
      .reduce((sum, a) => sum + a.currentBalance, 0);

    // 5. Accounts Receivable: All active, non-cancelled invoices with remaining unpaid amount
    let accountsReceivable = 0;
    let outstandingInvoicesCount = 0;
    let overdueInvoicesCount = 0;
    const todayStr = new Date().toISOString().split('T')[0];

    invoices.forEach((inv) => {
      if (inv.status !== 'cancelled') {
        const paid = inv.payments.reduce((sum, p) => sum + p.amount, 0);
        const outstanding = Math.max(0, inv.total - paid);
        if (outstanding > 0.01) {
          accountsReceivable += outstanding;
          outstandingInvoicesCount++;
          if (inv.dueDate < todayStr && inv.status !== 'draft') {
            overdueInvoicesCount++;
          }
        }
      }
    });

    // 6. Accounts Payable: Unpaid expenses
    const unpaidExpenses = expenses.filter((e) => !e.isPaid);
    const accountsPayable = unpaidExpenses.reduce((sum, e) => sum + e.totalAmount, 0);

    return {
      totalIncome,
      totalExpenses,
      netProfit,
      totalCashBankBalance,
      accountsReceivable,
      accountsPayable,
      outstandingInvoicesCount,
      overdueInvoicesCount,
    };
  };

  // Customer metrics helper
  const getCustomerMetrics = (customerId: string) => {
    const custInvoices = invoices.filter((i) => i.customerId === customerId && i.status !== 'cancelled');
    let totalInvoiced = 0;
    let totalPaid = 0;
    const allPayments: InvoicePayment[] = [];

    custInvoices.forEach((inv) => {
      totalInvoiced += inv.total;
      inv.payments.forEach((p) => {
        totalPaid += p.amount;
        allPayments.push(p);
      });
    });

    const outstanding = Math.max(0, totalInvoiced - totalPaid);

    return {
      totalInvoiced,
      totalPaid,
      outstanding,
      invoices: custInvoices,
      payments: allPayments,
    };
  };

  // Vendor metrics helper
  const getVendorMetrics = (vendorId: string) => {
    const vendExpenses = expenses.filter((e) => e.vendorId === vendorId);
    let totalExpenses = 0;
    let totalPaid = 0;

    vendExpenses.forEach((exp) => {
      totalExpenses += exp.totalAmount;
      if (exp.isPaid) totalPaid += exp.totalAmount;
    });

    const outstanding = Math.max(0, totalExpenses - totalPaid);

    return {
      totalExpenses,
      totalPaid,
      outstanding,
      expenses: vendExpenses,
    };
  };

  // Reset to initial demo data
  const resetToDemoData = () => {
    setCompany(INITIAL_COMPANY);
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setAccounts(INITIAL_ACCOUNTS);
    setCategories(INITIAL_CATEGORIES);
    setCustomers(INITIAL_CUSTOMERS);
    setVendors(INITIAL_VENDORS);
    setInvoices(INITIAL_INVOICES);
    setIncome(INITIAL_INCOME);
    setExpenses(INITIAL_EXPENSES);
    setTransactions(INITIAL_TRANSACTIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    localStorage.clear();
  };

  // Export DB
  const exportDatabaseJson = (): string => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      company,
      users,
      accounts,
      categories,
      customers,
      vendors,
      invoices,
      income,
      expenses,
      transactions,
      auditLogs,
    };
    return JSON.stringify(data, null, 2);
  };

  // Import DB
  const importDatabaseJson = (json: string): boolean => {
    try {
      const data = JSON.parse(json);
      if (data.company) setCompany(data.company);
      if (data.users) setUsers(data.users);
      if (data.accounts) setAccounts(data.accounts);
      if (data.categories) setCategories(data.categories);
      if (data.customers) setCustomers(data.customers);
      if (data.vendors) setVendors(data.vendors);
      if (data.invoices) setInvoices(data.invoices);
      if (data.income) setIncome(data.income);
      if (data.expenses) setExpenses(data.expenses);
      if (data.transactions) setTransactions(data.transactions);
      if (data.auditLogs) setAuditLogs(data.auditLogs);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        addUser,
        updateUser,
        deleteUser,

        company,
        updateCompany,

        accounts,
        addAccount,
        updateAccount,
        deleteAccount,

        categories,
        addCategory,
        updateCategory,
        toggleCategoryStatus,

        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,

        vendors,
        addVendor,
        updateVendor,
        deleteVendor,

        invoices,
        addInvoice,
        updateInvoice,
        duplicateInvoice,
        markInvoiceSent,
        cancelInvoice,
        deleteInvoice,
        recordInvoicePayment,

        income,
        addIncome,
        updateIncome,
        deleteIncome,

        expenses,
        addExpense,
        payExpense,
        updateExpense,
        deleteExpense,

        transactions,
        auditLogs,
        addAuditLog,

        calculateMetrics,
        getCustomerMetrics,
        getVendorMetrics,

        resetToDemoData,
        exportDatabaseJson,
        importDatabaseJson,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
