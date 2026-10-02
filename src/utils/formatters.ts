export const formatCurrency = (
  amount: number | undefined | null,
  currencySymbol = '₹'
): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return `${currencySymbol}0.00`;
  }
  const formatted = Math.abs(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (amount < 0) {
    return `-${currencySymbol}${formatted}`;
  }
  return `${currencySymbol}${formatted}`;
};

export const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const formatDateTime = (dateStr?: string): string => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return dateStr;
  }
};

export const getInvoiceStatusStyle = (
  status: string
): { label: string; textClass: string; bgClass: string; dotClass: string } => {
  switch (status.toLowerCase()) {
    case 'paid':
      return {
        label: 'Paid',
        textClass: 'text-emerald-700',
        bgClass: 'bg-emerald-50 border-emerald-200',
        dotClass: 'bg-emerald-500',
      };
    case 'partially_paid':
      return {
        label: 'Partially Paid',
        textClass: 'text-amber-700',
        bgClass: 'bg-amber-50 border-amber-200',
        dotClass: 'bg-amber-500',
      };
    case 'sent':
      return {
        label: 'Sent',
        textClass: 'text-blue-700',
        bgClass: 'bg-blue-50 border-blue-200',
        dotClass: 'bg-blue-500',
      };
    case 'overdue':
      return {
        label: 'Overdue',
        textClass: 'text-rose-700',
        bgClass: 'bg-rose-50 border-rose-200',
        dotClass: 'bg-rose-500',
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        textClass: 'text-slate-600',
        bgClass: 'bg-slate-100 border-slate-200',
        dotClass: 'bg-slate-400',
      };
    case 'draft':
    default:
      return {
        label: 'Draft',
        textClass: 'text-slate-700',
        bgClass: 'bg-slate-100 border-slate-300',
        dotClass: 'bg-slate-400',
      };
  }
};
