import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Scale, 
  ArrowUpRight, 
  ArrowDownLeft,
  CheckCircle2
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface SummaryCardsProps {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  cashBalance: number;
  totalReceivables: number; // لنا
  totalPayables: number; // علينا
  currencySymbol: string;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalIncome,
  totalExpense,
  netProfit,
  cashBalance,
  totalReceivables,
  totalPayables,
  currencySymbol,
}) => {
  const isProfitable = netProfit >= 0;
  const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : '0';

  return (
    <div id="summary-cards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* Card 1: Total Income */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-emerald-300 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase">إجمالي الإيرادات</span>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-xl sm:text-2xl font-bold text-emerald-600 font-mono tracking-tight">
            {formatCurrency(totalIncome, currencySymbol)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>كافة المبيعات والعوائد المقبوضة</span>
          </div>
        </div>
      </div>

      {/* Card 2: Total Expenses */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-rose-300 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase">إجمالي المصروفات</span>
          <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-xl sm:text-2xl font-bold text-rose-600 font-mono tracking-tight">
            {formatCurrency(totalExpense, currencySymbol)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="inline-block w-2 h-2 rounded-full bg-rose-500"></span>
            <span>التكاليف، الفواتير والمشتريات</span>
          </div>
        </div>
      </div>

      {/* Card 3: Net Profit / Loss */}
      <div className={`bg-white rounded-xl p-4 sm:p-5 border shadow-xs transition ${
        isProfitable ? 'border-slate-200 hover:border-teal-300' : 'border-amber-200 bg-amber-50/20'
      }`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase">
            {isProfitable ? 'صافي الأرباح' : 'صافي العجز'}
          </span>
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
            isProfitable ? 'bg-teal-50 text-teal-600' : 'bg-amber-100 text-amber-700'
          }`}>
            <Scale className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className={`text-xl sm:text-2xl font-bold font-mono tracking-tight ${
            isProfitable ? 'text-teal-700' : 'text-amber-700'
          }`}>
            {formatCurrency(netProfit, currencySymbol)}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
            <span className={`px-1.5 py-0.5 rounded-sm font-semibold text-[11px] ${
              isProfitable ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-amber-100 text-amber-800'
            }`}>
              هامش الربح: {profitMargin}%
            </span>
            <span>{isProfitable ? 'أداء إيجابي' : 'تنبيه عجز'}</span>
          </div>
        </div>
      </div>

      {/* Card 4: Debts & Liquidity Overview */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-indigo-300 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase">الذمم والديون المعلقة</span>
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 flex items-center gap-1">
              <ArrowDownLeft className="w-3.5 h-3.5 text-blue-600" />
              <span>مستحقات لنا:</span>
            </span>
            <span className="font-bold font-mono text-blue-600">
              {formatCurrency(totalReceivables, currencySymbol)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-purple-600" />
              <span>ديون علينا:</span>
            </span>
            <span className="font-bold font-mono text-purple-600">
              {formatCurrency(totalPayables, currencySymbol)}
            </span>
          </div>

          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>السيولة النقدية المتوفرة:</span>
            <span className="font-semibold text-slate-700 font-mono">
              {formatCurrency(cashBalance, currencySymbol)}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
