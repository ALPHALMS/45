import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Calendar, 
  User, 
  Tag, 
  Receipt, 
  Pencil, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  PlusCircle,
  CreditCard
} from 'lucide-react';
import { Transaction, TransactionType, TimeFilter } from '../types';
import { formatCurrency, formatDateArabic } from '../utils/formatters';

interface TransactionListProps {
  transactions: Transaction[];
  currencySymbol: string;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
  onPrintVoucher: (tx: Transaction) => void;
  onSettleDebt: (id: string) => void;
  onAddNew: (type: TransactionType) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  currencySymbol,
  onEdit,
  onDelete,
  onPrintVoucher,
  onSettleDebt,
  onAddNew,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter logic
  const filtered = transactions.filter((tx) => {
    // Type Filter
    if (filterType === 'income' && tx.type !== 'income') return false;
    if (filterType === 'expense' && tx.type !== 'expense') return false;
    if (filterType === 'debts' && tx.type !== 'receivable' && tx.type !== 'payable') return false;

    // Time Filter
    if (timeFilter !== 'all') {
      const txDate = new Date(tx.date + 'T00:00:00');
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      if (timeFilter === 'today') {
        if (txDate.getTime() !== today.getTime()) return false;
      } else if (timeFilter === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        if (txDate < weekAgo) return false;
      } else if (timeFilter === 'month') {
        if (txDate.getMonth() !== today.getMonth() || txDate.getFullYear() !== today.getFullYear()) return false;
      }
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDesc = tx.description.toLowerCase().includes(q);
      const matchCat = tx.category.toLowerCase().includes(q);
      const matchContact = tx.contactName?.toLowerCase().includes(q);
      const matchRef = tx.referenceNumber?.toLowerCase().includes(q);
      if (!matchDesc && !matchCat && !matchContact && !matchRef) return false;
    }

    return true;
  });

  const paymentLabels: Record<string, string> = {
    cash: 'كاش',
    bank: 'تحويل',
    card: 'بطاقة',
    credit: 'آجل',
  };

  return (
    <div id="transactions-section" className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      
      {/* Filters & Search Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          
          {/* Main Type Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto text-xs font-bold">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
                filterType === 'all' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              كافة المعاملات ({transactions.length})
            </button>

            <button
              onClick={() => setFilterType('income')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
                filterType === 'income' 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              الإيرادات
            </button>

            <button
              onClick={() => setFilterType('expense')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
                filterType === 'expense' 
                  ? 'bg-rose-600 text-white shadow-xs' 
                  : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              المصروفات
            </button>

            <button
              onClick={() => setFilterType('debts')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
                filterType === 'debts' 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : 'text-indigo-700 hover:bg-indigo-50'
              }`}
            >
              الديون والذمم
            </button>
          </div>

          {/* Time Filter Buttons */}
          <div className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-1">
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                timeFilter === 'all' ? 'bg-slate-800 text-white font-semibold' : 'hover:bg-slate-200'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setTimeFilter('today')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                timeFilter === 'today' ? 'bg-slate-800 text-white font-semibold' : 'hover:bg-slate-200'
              }`}
            >
              اليوم
            </button>
            <button
              onClick={() => setTimeFilter('week')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                timeFilter === 'week' ? 'bg-slate-800 text-white font-semibold' : 'hover:bg-slate-200'
              }`}
            >
              أسبوع
            </button>
            <button
              onClick={() => setTimeFilter('month')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                timeFilter === 'month' ? 'bg-slate-800 text-white font-semibold' : 'hover:bg-slate-200'
              }`}
            >
              شهر
            </button>
          </div>

        </div>

        {/* Search Input Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          <input
            type="text"
            placeholder="بحث بالوصف، التصنيف، اسم العميل أو المورد، أو رقم الفاتورة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              إلغاء البحث
            </button>
          )}
        </div>
      </div>

      {/* Transactions List Content */}
      <div className="divide-y divide-slate-100">
        {filtered.length === 0 ? (
          <div className="py-14 px-4 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
              <Receipt className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-800">لا توجد معاملات مطابقة</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              لم يتم العثور على أي قيود محاسبية تطابق معايير البحث الحالية. يمكنك إضافة قيد جديد الآن.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => onAddNew('income')}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition cursor-pointer"
              >
                + إضافة إيراد
              </button>
              <button
                onClick={() => onAddNew('expense')}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition cursor-pointer"
              >
                + إضافة مصروف
              </button>
            </div>
          </div>
        ) : (
          filtered.map((tx) => {
            const isIncome = tx.type === 'income';
            const isExpense = tx.type === 'expense';
            const isReceivable = tx.type === 'receivable';
            const isPayable = tx.type === 'payable';

            return (
              <div
                key={tx.id}
                id={`tx-row-${tx.id}`}
                className="p-4 sm:px-6 hover:bg-slate-50/80 transition flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >
                {/* Left (RTL Right): Icon & Details */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Type Icon */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isIncome
                        ? 'bg-emerald-100 text-emerald-700'
                        : isExpense
                        ? 'bg-rose-100 text-rose-700'
                        : isReceivable
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {isIncome && <ArrowDownLeft className="w-5 h-5" />}
                    {isExpense && <ArrowUpRight className="w-5 h-5" />}
                    {isReceivable && <Clock className="w-5 h-5" />}
                    {isPayable && <Clock className="w-5 h-5" />}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                        {tx.description}
                      </h4>

                      {/* Type Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isIncome
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isExpense
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : isReceivable
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}
                      >
                        {isIncome && 'إيراد'}
                        {isExpense && 'مصروف'}
                        {isReceivable && 'دين لنا'}
                        {isPayable && 'دين علينا'}
                      </span>

                      {/* Settled Badge for Debts */}
                      {(isReceivable || isPayable) && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            tx.isSettled
                              ? 'bg-teal-50 text-teal-700 border border-teal-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {tx.isSettled ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>تم السداد</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
                              <span>معلق</span>
                            </>
                          )}
                        </span>
                      )}
                    </div>

                    {/* Metadata Subtitle */}
                    <div className="mt-1 flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDateArabic(tx.date)}</span>
                      </span>

                      <span className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5 text-slate-400" />
                        <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-md text-[11px] font-medium">
                          {tx.category}
                        </span>
                      </span>

                      {tx.contactName && (
                        <span className="flex items-center gap-1 text-slate-700 font-medium">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{tx.contactName}</span>
                        </span>
                      )}

                      <span className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
                        <span>طريقة الدفع: {paymentLabels[tx.paymentMethod] || tx.paymentMethod}</span>
                      </span>

                      {tx.referenceNumber && (
                        <span className="text-slate-400 font-mono text-[11px]">
                          #{tx.referenceNumber}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right (RTL Left): Amount & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  
                  {/* Amount Display */}
                  <div className="text-left">
                    <div
                      className={`text-base sm:text-lg font-black font-mono ${
                        isIncome
                          ? 'text-emerald-600'
                          : isExpense
                          ? 'text-rose-600'
                          : isReceivable
                          ? 'text-blue-600'
                          : 'text-purple-600'
                      }`}
                    >
                      {isIncome && '+'}
                      {isExpense && '-'}
                      {formatCurrency(tx.amount, currencySymbol)}
                    </div>
                  </div>

                  {/* Actions Buttons */}
                  <div className="flex items-center gap-1">
                    
                    {/* Settle Debt Button */}
                    {(isReceivable || isPayable) && !tx.isSettled && (
                      <button
                        onClick={() => onSettleDebt(tx.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        title="تسوية هذا الدين واعتباره مسدداً"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">تسوية</span>
                      </button>
                    )}

                    {/* Print Voucher */}
                    <button
                      onClick={() => onPrintVoucher(tx)}
                      className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                      title="معاينة وطباعة سند رسمي"
                    >
                      <Receipt className="w-4 h-4" />
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => onEdit(tx)}
                      className="p-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                      title="تعديل المعاملة"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => {
                        if (window.confirm('هل تريد بالتأكيد حذف هذا القيد المحاسبي؟')) {
                          onDelete(tx.id);
                        }
                      }}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Footer count */}
      {filtered.length > 0 && (
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>يتم عرض {filtered.length} معاملة من أصل {transactions.length}</span>
          <span className="text-slate-400">جميع المبالغ مسجلة بالعملة المختارة</span>
        </div>
      )}

    </div>
  );
};
