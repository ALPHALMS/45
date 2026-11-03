export type TransactionType = 'income' | 'expense' | 'receivable' | 'payable';

export type PaymentMethod = 'cash' | 'bank' | 'card' | 'credit';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // ISO date string YYYY-MM-DD
  description: string;
  contactName?: string; // Client or Vendor name
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  isSettled?: boolean; // For receivables/payables: whether it has been paid/collected
  settledDate?: string;
  notes?: string;
  createdAt: number;
}

export interface CategoryOption {
  id: string;
  label: string;
  type: 'income' | 'expense' | 'both';
  iconName: string;
  color: string;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  subunit: string; // Halala, Cent, Piastre, etc.
}

export type TimeFilter = 'all' | 'today' | 'week' | 'month' | 'year' | 'custom';
