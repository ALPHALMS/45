import React from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency } from '../utils/formatters';

interface AnalyticsViewProps {
  transactions: Transaction[];
  currencySymbol: string;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  transactions,
  currencySymbol,
}) => {
  // Compute monthly totals for the last 6 months
  const now = new Date();
  const monthsData: { label: string; income: number; expense: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthYearStr = d.toLocaleDateString('ar-SA', { month: 'short', year: 'numeric' });
    const yearMonthISO = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    let mIncome = 0;
    let mExpense = 0;

    transactions.forEach(t => {
      if (t.date.startsWith(yearMonthISO)) {
        if (t.type === 'income') mIncome += t.amount;
        if (t.type === 'expense') mExpense += t.amount;
      }
    });

    monthsData.push({
      label: monthYearStr,
      income: mIncome,
      expense: mExpense,
    });
  }

  // Expense categories breakdown
  const categoryMap: Record<string, number> = {};
  let totalExpenses = 0;

  transactions.filter(t => t.type === 'expense').forEach(t => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    totalExpenses += t.amount;
  });

  const categoryBreakdown = Object.entries(categoryMap)
    .map(([cat, amount]) => ({
      category: cat,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Find max value for chart scaling
  const maxMonthVal = Math.max(
    ...monthsData.map(m => Math.max(m.income, m.expense)),
    1000
  );

  return (
    <div id="analytics-section" className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      
      {/* Monthly Cash Flow Chart */}
      <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>مقارنة الإيرادات والمصروفات (آخر 6 أشهر)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              متابعة النمو المالي واستقرار التدفقات النقدية
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-3 h-3 rounded-xs bg-emerald-500"></span>
              <span>إيرادات</span>
            </span>
            <span className="flex items-center gap-1.5 text-rose-700">
              <span className="w-3 h-3 rounded-xs bg-rose-500"></span>
              <span>مصروفات</span>
            </span>
          </div>
        </div>

        {/* Custom Bar Visualization */}
        <div className="h-56 flex items-end justify-between gap-2 pt-6 px-2">
          {monthsData.map((m, idx) => {
            const incomeHeight = Math.min(100, Math.round((m.income / maxMonthVal) * 100));
            const expenseHeight = Math.min(100, Math.round((m.expense / maxMonthVal) * 100));

            return (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-[10px] py-1 px-2 rounded-md pointer-events-none z-10 whitespace-nowrap">
                  إيراد: {formatCurrency(m.income, currencySymbol)} | صرف: {formatCurrency(m.expense, currencySymbol)}
                </div>

                <div className="w-full max-w-[48px] flex items-end justify-center gap-1 h-44">
                  {/* Income Bar */}
                  <div
                    style={{ height: `${Math.max(incomeHeight, 4)}%` }}
                    className="w-1/2 bg-emerald-500 rounded-t-sm hover:bg-emerald-600 transition"
                    title={`إيرادات: ${formatCurrency(m.income, currencySymbol)}`}
                  ></div>

                  {/* Expense Bar */}
                  <div
                    style={{ height: `${Math.max(expenseHeight, 4)}%` }}
                    className="w-1/2 bg-rose-500 rounded-t-sm hover:bg-rose-600 transition"
                    title={`مصروفات: ${formatCurrency(m.expense, currencySymbol)}`}
                  ></div>
                </div>

                {/* Month Label */}
                <span className="text-[11px] font-semibold text-slate-500 mt-2 truncate max-w-full">
                  {m.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expense Categories Breakdown */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col">
        <div className="pb-3 border-b border-slate-100 mb-3">
          <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-rose-600" />
            <span>توزيع بنود المصروفات</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            أين تذهب الأموال وكيفية ترشيد الإنفاق
          </p>
        </div>

        <div className="flex-1 overflow-y-auto max-h-60 space-y-3 pr-1">
          {categoryBreakdown.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400 py-10">
              لا توجد مصروفات مسجلة بعد
            </div>
          ) : (
            categoryBreakdown.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 truncate">{item.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-900 font-semibold">
                      {formatCurrency(item.amount, currencySymbol)}
                    </span>
                    <span className="text-[10px] text-slate-400 w-9 text-left">
                      {item.percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Insight note */}
        {categoryBreakdown.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>
              أعلى تكلفة: <strong className="text-slate-800">{categoryBreakdown[0].category}</strong> (
              {categoryBreakdown[0].percentage.toFixed(0)}% من المصروفات)
            </span>
          </div>
        )}
      </div>

    </div>
  );
};
