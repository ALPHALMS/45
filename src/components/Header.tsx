import React, { useState } from 'react';
import { 
  Calculator, 
  Download, 
  Printer, 
  RotateCcw, 
  Plus, 
  Minus, 
  Clock, 
  Coins,
  FileSpreadsheet
} from 'lucide-react';
import { CurrencyConfig, TransactionType } from '../types';
import { CURRENCIES } from '../utils/formatters';

interface HeaderProps {
  currentCurrency: CurrencyConfig;
  onCurrencyChange: (c: CurrencyConfig) => void;
  onOpenModal: (type: TransactionType) => void;
  onExportCSV: () => void;
  onPrintReport: () => void;
  onResetData: () => void;
  onLoadSampleData: () => void;
  transactionsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentCurrency,
  onCurrencyChange,
  onOpenModal,
  onExportCSV,
  onPrintReport,
  onResetData,
  onLoadSampleData,
  transactionsCount,
}) => {
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  return (
    <header id="app-header" className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  المحاسب البسيط
                </h1>
                <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                  دفتر حسابات ميسّر
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                إدارة الإيرادات، المصروفات، والديون بكل دقة ووضوح
              </p>
            </div>
          </div>

          {/* Action Buttons & Currency Selector */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-3">
            
            {/* Currency Selector */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
              <Coins className="w-4 h-4 text-slate-500 mr-1.5 ml-1" />
              <select
                id="currency-select"
                value={currentCurrency.code}
                onChange={(e) => {
                  const selected = CURRENCIES.find(c => c.code === e.target.value);
                  if (selected) onCurrencyChange(selected);
                }}
                className="bg-transparent text-xs sm:text-sm font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
                title="تغيير العملة"
              >
                {CURRENCIES.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.symbol} ({curr.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Add Buttons */}
            <button
              id="btn-add-income"
              onClick={() => onOpenModal('income')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-xs sm:text-sm font-bold hover:bg-emerald-700 transition shadow-xs cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>إيراد</span>
            </button>

            <button
              id="btn-add-expense"
              onClick={() => onOpenModal('expense')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-600 text-white text-xs sm:text-sm font-bold hover:bg-rose-700 transition shadow-xs cursor-pointer active:scale-95"
            >
              <Minus className="w-4 h-4" />
              <span>مصروف</span>
            </button>

            <button
              id="btn-add-debt"
              onClick={() => onOpenModal('receivable')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-xs sm:text-sm font-semibold transition cursor-pointer"
              title="تسجيل دين مستحق لنا أو علينا"
            >
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">دين / ذمة</span>
              <span className="sm:hidden">دين</span>
            </button>

            {/* Secondary actions: Export CSV & Print */}
            <div className="relative">
              <button
                id="btn-settings-menu"
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition cursor-pointer border border-slate-200"
                title="خيارات إضافية وتصدير"
              >
                <Download className="w-4 h-4" />
              </button>

              {showSettingsMenu && (
                <div 
                  className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setShowSettingsMenu(false)}
                >
                  <button
                    id="btn-export-csv"
                    onClick={onExportCSV}
                    className="w-full px-4 py-2.5 text-right text-xs sm:text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>تصدير إلى Excel (CSV)</span>
                  </button>

                  <button
                    id="btn-print-summary"
                    onClick={onPrintReport}
                    className="w-full px-4 py-2.5 text-right text-xs sm:text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-blue-600" />
                    <span>طباعة التقرير المالي</span>
                  </button>

                  <div className="border-t border-slate-100 my-1"></div>

                  <button
                    id="btn-load-sample"
                    onClick={onLoadSampleData}
                    className="w-full px-4 py-2 text-right text-xs sm:text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 text-amber-500" />
                    <span>تحميل بيانات توضيحية</span>
                  </button>

                  {transactionsCount > 0 && (
                    <button
                      id="btn-reset-data"
                      onClick={() => {
                        if (window.confirm('هل أنت متأكد من مسح جميع المعاملات المحفوظة؟')) {
                          onResetData();
                        }
                      }}
                      className="w-full px-4 py-2 text-right text-xs sm:text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4 text-rose-600" />
                      <span>مسح كافة المعاملات</span>
                    </button>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
