import React from 'react';
import { X, Printer, FileText } from 'lucide-react';
import { Transaction, CurrencyConfig } from '../types';
import { formatCurrency, formatDateArabic } from '../utils/formatters';

interface ReportPrintViewProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  currency: CurrencyConfig;
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
}

export const ReportPrintView: React.FC<ReportPrintViewProps> = ({
  isOpen,
  onClose,
  transactions,
  currency,
  totalIncome,
  totalExpense,
  netProfit,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Controls */}
        <div className="px-6 py-3.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-bold text-slate-800">معاينة التقرير المالي الشامل</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة كشف الحساب</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document */}
        <div className="p-8 print:p-0 bg-white font-['Cairo',sans-serif]">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900">المحاسب البسيط</h1>
              <p className="text-xs text-slate-600">كشف حساب وتقرير مالي شامل</p>
            </div>
            <div className="text-left text-xs font-mono">
              <p className="text-slate-500">تاريخ التقرير: <span className="font-bold text-slate-900">{new Date().toISOString().slice(0, 10)}</span></p>
              <p className="text-slate-500">العملة: <span className="font-bold text-slate-900">{currency.name} ({currency.symbol})</span></p>
            </div>
          </div>

          {/* KPI Mini-Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6 text-center">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <span className="text-xs text-emerald-800 font-semibold block">إجمالي الإيرادات</span>
              <span className="text-lg font-black text-emerald-700 font-mono">
                {formatCurrency(totalIncome, currency.symbol)}
              </span>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
              <span className="text-xs text-rose-800 font-semibold block">إجمالي المصروفات</span>
              <span className="text-lg font-black text-rose-700 font-mono">
                {formatCurrency(totalExpense, currency.symbol)}
              </span>
            </div>

            <div className={`p-3 border rounded-lg ${
              netProfit >= 0 ? 'bg-teal-50 border-teal-200' : 'bg-amber-50 border-amber-200'
            }`}>
              <span className="text-xs text-slate-700 font-semibold block">صافي النتيجة (الأرباح/الخسائر)</span>
              <span className={`text-lg font-black font-mono ${
                netProfit >= 0 ? 'text-teal-700' : 'text-amber-700'
              }`}>
                {formatCurrency(netProfit, currency.symbol)}
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                  <th className="py-2.5 px-3 font-bold">#</th>
                  <th className="py-2.5 px-3 font-bold">التاريخ</th>
                  <th className="py-2.5 px-3 font-bold">النوع</th>
                  <th className="py-2.5 px-3 font-bold">البيان / الوصف</th>
                  <th className="py-2.5 px-3 font-bold">التصنيف</th>
                  <th className="py-2.5 px-3 font-bold">الطرف الثاني</th>
                  <th className="py-2.5 px-3 font-bold">طريقة الدفع</th>
                  <th className="py-2.5 px-3 font-bold text-left">المبلغ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {transactions.map((tx, idx) => {
                  const isInc = tx.type === 'income';
                  const isExp = tx.type === 'expense';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-slate-500 font-mono">{idx + 1}</td>
                      <td className="py-2 px-3 font-mono">{tx.date}</td>
                      <td className="py-2 px-3 font-semibold">
                        {isInc && <span className="text-emerald-700">إيراد</span>}
                        {isExp && <span className="text-rose-700">مصروف</span>}
                        {tx.type === 'receivable' && <span className="text-blue-700">دين لنا</span>}
                        {tx.type === 'payable' && <span className="text-purple-700">دين علينا</span>}
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-900">{tx.description}</td>
                      <td className="py-2 px-3 text-slate-600">{tx.category}</td>
                      <td className="py-2 px-3 text-slate-600">{tx.contactName || '-'}</td>
                      <td className="py-2 px-3 text-slate-600">{tx.paymentMethod}</td>
                      <td className={`py-2 px-3 font-bold font-mono text-left ${
                        isInc ? 'text-emerald-700' : isExp ? 'text-rose-700' : 'text-slate-800'
                      }`}>
                        {formatCurrency(tx.amount, currency.symbol)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Signatures */}
          <div className="mt-12 pt-6 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <p className="font-bold text-slate-700 mb-8">إعداد وتدقيق المحاسب</p>
              <div className="w-40 mx-auto border-b border-slate-400"></div>
            </div>
            <div>
              <p className="font-bold text-slate-700 mb-8">اعتماد المدير المالي / صاحب المنشأة</p>
              <div className="w-40 mx-auto border-b border-slate-400"></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
