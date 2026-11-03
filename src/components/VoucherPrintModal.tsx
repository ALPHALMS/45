import React from 'react';
import { X, Printer, CheckCircle, Receipt } from 'lucide-react';
import { Transaction, CurrencyConfig } from '../types';
import { formatCurrency, formatDateArabic, numberToArabicWords } from '../utils/formatters';

interface VoucherPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  currency: CurrencyConfig;
}

export const VoucherPrintModal: React.FC<VoucherPrintModalProps> = ({
  isOpen,
  onClose,
  transaction,
  currency,
}) => {
  if (!isOpen || !transaction) return null;

  const isIncome = transaction.type === 'income' || transaction.type === 'receivable';
  const voucherTitle = isIncome ? 'سند قبض نقدي / بنكي' : 'سند صرف نقدي / بنكي';
  const voucherSubtitle = isIncome ? 'Receipt Voucher' : 'Payment Voucher';
  const partyLabel = isIncome ? 'استلمنا من المكرم / السادة:' : 'صرفنا إلى المكرم / السادة:';

  const paymentLabels: Record<string, string> = {
    cash: 'نقداً',
    bank: 'تحويل بنكي',
    card: 'بطاقة مدى / دفع إلكتروني',
    credit: 'على الحساب (آجل)',
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Controls (Hidden in Print) */}
        <div className="px-6 py-3.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-bold text-slate-800">معاينة وطباعة السند المالي</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة السند</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Official Printable Voucher Area */}
        <div id="printable-voucher" className="p-8 print:p-0 bg-white font-['Cairo',sans-serif]">
          
          {/* Voucher Box */}
          <div className="border-2 border-slate-800 rounded-xl p-6 relative">
            
            {/* Header */}
            <div className="border-b-2 border-slate-800 pb-4 mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">المحاسب البسيط</h2>
                  <p className="text-xs text-slate-500">إدارة المعاملات المالية المعتمدة</p>
                </div>

                <div className="text-center">
                  <div className="inline-block px-4 py-1.5 bg-slate-100 border-2 border-slate-800 rounded-lg">
                    <h3 className="text-base sm:text-lg font-black text-slate-900">{voucherTitle}</h3>
                    <p className="text-[10px] text-slate-600 uppercase tracking-widest font-mono">{voucherSubtitle}</p>
                  </div>
                </div>

                <div className="text-left text-xs space-y-1 font-mono">
                  <div>
                    <span className="text-slate-500">الرقم: </span>
                    <span className="font-bold text-slate-900">{transaction.referenceNumber || transaction.id.slice(0, 8)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">التاريخ: </span>
                    <span className="font-bold text-slate-900">{transaction.date}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Amount Box */}
            <div className="flex items-center justify-between bg-slate-50 border border-slate-300 rounded-lg p-3 mb-5">
              <span className="text-xs font-bold text-slate-700">المبلغ الرقمي:</span>
              <span className="text-xl font-black text-slate-900 font-mono tracking-wider">
                {formatCurrency(transaction.amount, currency.symbol)}
              </span>
            </div>

            {/* Content Details */}
            <div className="space-y-3.5 text-xs sm:text-sm text-slate-800 leading-relaxed">
              
              {/* Party Name */}
              <div className="flex items-baseline gap-2 border-b border-dashed border-slate-300 pb-2">
                <span className="font-bold text-slate-700 min-w-36">{partyLabel}</span>
                <span className="font-semibold text-slate-900 flex-1">
                  {transaction.contactName || 'عميل / طرف عام'}
                </span>
              </div>

              {/* Tafqeet (Written Amount in Arabic) */}
              <div className="flex items-baseline gap-2 border-b border-dashed border-slate-300 pb-2">
                <span className="font-bold text-slate-700 min-w-36">مبلغ وقدره كتابةً:</span>
                <span className="font-semibold text-slate-900 flex-1 text-emerald-800">
                  {numberToArabicWords(transaction.amount, currency.name, currency.subunit)}
                </span>
              </div>

              {/* For / Reason */}
              <div className="flex items-baseline gap-2 border-b border-dashed border-slate-300 pb-2">
                <span className="font-bold text-slate-700 min-w-36">وذلك عن (البيان):</span>
                <span className="text-slate-900 flex-1">
                  {transaction.description} {transaction.category ? `(${transaction.category})` : ''}
                </span>
              </div>

              {/* Payment Method */}
              <div className="flex items-baseline gap-2 border-b border-dashed border-slate-300 pb-2">
                <span className="font-bold text-slate-700 min-w-36">طريقة الدفع:</span>
                <span className="text-slate-900 flex-1">
                  {paymentLabels[transaction.paymentMethod] || transaction.paymentMethod}
                  {transaction.notes && <span className="text-slate-500 mr-2">- ملاحظات: {transaction.notes}</span>}
                </span>
              </div>

            </div>

            {/* Signatures Area */}
            <div className="mt-10 pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
              <div>
                <p className="font-bold text-slate-700 mb-8">توقيع المستلم</p>
                <div className="w-36 mx-auto border-b border-slate-400"></div>
              </div>
              <div>
                <p className="font-bold text-slate-700 mb-8">المحاسب / المسؤول المالي</p>
                <div className="w-36 mx-auto border-b border-slate-400"></div>
              </div>
            </div>

            {/* Watermark / Verification */}
            <div className="mt-6 text-center text-[10px] text-slate-400">
              حرر إلكترونياً بواسطة نظام المحاسب البسيط • وثيقة غير قابلة للتعديل
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
