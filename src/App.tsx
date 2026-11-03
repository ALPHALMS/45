import React, { useState, useEffect, useMemo } from 'react';
import { 
  Transaction, 
  TransactionType, 
  CurrencyConfig 
} from './types';
import { CURRENCIES, exportToCSV } from './utils/formatters';
import { INITIAL_SAMPLE_TRANSACTIONS } from './utils/sampleData';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { TransactionList } from './components/TransactionList';
import { TransactionModal } from './components/TransactionModal';
import { VoucherPrintModal } from './components/VoucherPrintModal';
import { ReportPrintView } from './components/ReportPrintView';
import { AnalyticsView } from './components/AnalyticsView';
import { 
  BookOpen, 
  BarChart3, 
  PlusCircle, 
  MinusCircle, 
  Clock, 
  CheckCircle2 
} from 'lucide-react';

const STORAGE_KEY = 'simple_accounting_transactions_v1';
const CURRENCY_STORAGE_KEY = 'simple_accounting_currency_v1';

export default function App() {
  // 1. Currency state
  const [currency, setCurrency] = useState<CurrencyConfig>(() => {
    try {
      const saved = localStorage.getItem(CURRENCY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const match = CURRENCIES.find(c => c.code === parsed.code);
        if (match) return match;
      }
    } catch (e) {
      console.error(e);
    }
    return CURRENCIES[0]; // Default SAR
  });

  // 2. Transactions state
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_SAMPLE_TRANSACTIONS;
  });

  // 3. UI states
  const [activeTab, setActiveTab] = useState<'journal' | 'analytics'>('journal');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<TransactionType>('income');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [voucherTx, setVoucherTx] = useState<Transaction | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch (e) {
      console.error(e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, JSON.stringify(currency));
    } catch (e) {
      console.error(e);
    }
  }, [currency]);

  // Show temporary toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Financial calculations
  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    let cashBalance = 0;
    let receivables = 0;
    let payables = 0;

    transactions.forEach(t => {
      if (t.type === 'income') {
        income += t.amount;
        cashBalance += t.amount;
      } else if (t.type === 'expense') {
        expense += t.amount;
        cashBalance -= t.amount;
      } else if (t.type === 'receivable') {
        if (t.isSettled) {
          income += t.amount;
          cashBalance += t.amount;
        } else {
          receivables += t.amount;
        }
      } else if (t.type === 'payable') {
        if (t.isSettled) {
          expense += t.amount;
          cashBalance -= t.amount;
        } else {
          payables += t.amount;
        }
      }
    });

    const netProfit = income - expense;

    return {
      totalIncome: income,
      totalExpense: expense,
      netProfit,
      cashBalance,
      totalReceivables: receivables,
      totalPayables: payables,
    };
  }, [transactions]);

  // Handlers
  const handleOpenAddModal = (type: TransactionType) => {
    setEditingTransaction(null);
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setModalType(tx.type);
    setIsModalOpen(true);
  };

  const handleSaveTransaction = (
    txData: Omit<Transaction, 'id' | 'createdAt'>, 
    editingId?: string
  ) => {
    if (editingId) {
      setTransactions(prev => prev.map(t => 
        t.id === editingId 
          ? { ...t, ...txData }
          : t
      ));
      showToast('تم تحديث المعاملة بنجاح');
    } else {
      const newTx: Transaction = {
        ...txData,
        id: 'tx-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        createdAt: Date.now(),
      };
      setTransactions(prev => [newTx, ...prev]);
      showToast('تم تسجيل القيد المحاسبي بنجاح');
    }
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    showToast('تم حذف القيد المحاسبي');
  };

  const handleSettleDebt = (id: string) => {
    setTransactions(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          isSettled: true,
          settledDate: new Date().toISOString().slice(0, 10),
        };
      }
      return t;
    }));
    showToast('تمت تسوية الدين بنجاح وإدراجه في الرصيد الفعلي');
  };

  const handleResetData = () => {
    setTransactions([]);
    showToast('تم مسح جميع المعاملات');
  };

  const handleLoadSampleData = () => {
    setTransactions(INITIAL_SAMPLE_TRANSACTIONS);
    showToast('تم استعادة البيانات التوضيحية');
  };

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col font-['Cairo',sans-serif] text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Top Header */}
      <Header
        currentCurrency={currency}
        onCurrencyChange={setCurrency}
        onOpenModal={handleOpenAddModal}
        onExportCSV={() => exportToCSV(transactions, currency.symbol)}
        onPrintReport={() => setIsReportOpen(true)}
        onResetData={handleResetData}
        onLoadSampleData={handleLoadSampleData}
        transactionsCount={transactions.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* KPI Summary Cards */}
        <SummaryCards
          totalIncome={stats.totalIncome}
          totalExpense={stats.totalExpense}
          netProfit={stats.netProfit}
          cashBalance={stats.cashBalance}
          totalReceivables={stats.totalReceivables}
          totalPayables={stats.totalPayables}
          currencySymbol={currency.symbol}
        />

        {/* View Switcher Tabs (Journal vs Analytics) */}
        <div id="app-tabs" className="flex items-center justify-between border-b border-slate-200 pb-3 mb-5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('journal')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === 'journal'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>دفتر اليومية والقيود</span>
              <span className="text-[11px] bg-slate-700/50 px-1.5 py-0.2 rounded-full font-mono">
                {transactions.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>التحليل والرسوم البيانية</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <span>تحديث فوري وتلقائي للحسابات</span>
          </div>
        </div>

        {/* Main Tab Views */}
        {activeTab === 'journal' ? (
          <TransactionList
            transactions={transactions}
            currencySymbol={currency.symbol}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
            onPrintVoucher={(tx) => setVoucherTx(tx)}
            onSettleDebt={handleSettleDebt}
            onAddNew={handleOpenAddModal}
          />
        ) : (
          <AnalyticsView
            transactions={transactions}
            currencySymbol={currency.symbol}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>المحاسب البسيط • نظام القيود المحاسبية وإدارة الدفاتر للمتاجر والأعمال</span>
          <div className="flex items-center gap-3 text-slate-400">
            <span>بيانات محفوظة محلياً بأمان</span>
            <span>•</span>
            <span>إصدار {currency.code}</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
        initialType={modalType}
        currencySymbol={currency.symbol}
      />

      <VoucherPrintModal
        isOpen={!!voucherTx}
        onClose={() => setVoucherTx(null)}
        transaction={voucherTx}
        currency={currency}
      />

      <ReportPrintView
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        transactions={transactions}
        currency={currency}
        totalIncome={stats.totalIncome}
        totalExpense={stats.totalExpense}
        netProfit={stats.netProfit}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
