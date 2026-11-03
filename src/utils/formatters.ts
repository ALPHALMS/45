import { CurrencyConfig, Transaction } from '../types';

export const CURRENCIES: CurrencyConfig[] = [
  { code: 'SAR', symbol: 'ر.س', name: 'ريال سعودي', subunit: 'هللة' },
  { code: 'AED', symbol: 'د.إ', name: 'درهم إماراتي', subunit: 'فلس' },
  { code: 'KWD', symbol: 'د.ك', name: 'دينار كويتي', subunit: 'فلس' },
  { code: 'EGP', symbol: 'ج.م', name: 'جنيه مصري', subunit: 'قرش' },
  { code: 'USD', symbol: '$', name: 'دولار أمريكي', subunit: 'سنت' },
  { code: 'EUR', symbol: '€', name: 'يورو', subunit: 'سنت' },
  { code: 'IQD', symbol: 'د.ع', name: 'دينار عراقي', subunit: 'فلس' },
  { code: 'JOD', symbol: 'د.أ', name: 'دينار أردني', subunit: 'قرش' },
  { code: 'QAR', symbol: 'ر.ق', name: 'ريال قطري', subunit: 'درهم' },
  { code: 'OMR', symbol: 'ر.ع', name: 'ريال عماني', subunit: 'بيسة' },
];

export function formatCurrency(amount: number, currencySymbol: string = 'ر.س'): string {
  const isNegative = amount < 0;
  const absVal = Math.abs(amount);
  const formatted = new Intl.NumberFormat('ar-SA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absVal);

  return `${isNegative ? '-' : ''}${formatted} ${currencySymbol}`;
}

export function formatDateArabic(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  if (isNaN(date.getTime())) return dateStr;

  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

// Tafqeet - convert number to Arabic words for official vouchers
export function numberToArabicWords(number: number, currencyName: string = 'ريال سعودي', subunitName: string = 'هللة'): string {
  if (number === 0) return `صفر ${currencyName} فقط لا غير`;

  const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
  const tens = ['', 'عشرة', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
  const teens = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
  const hundreds = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];

  function convertGroup(num: number): string {
    let result = '';
    const h = Math.floor(num / 100);
    const remainder = num % 100;
    const t = Math.floor(remainder / 10);
    const o = remainder % 10;

    if (h > 0) {
      result += hundreds[h];
    }

    if (remainder > 0) {
      if (h > 0) result += ' و ';
      if (remainder >= 11 && remainder <= 19) {
        result += teens[remainder - 10];
      } else if (remainder === 10) {
        result += tens[1];
      } else if (remainder < 10) {
        result += ones[remainder];
      } else {
        if (o > 0) {
          result += `${ones[o]} و ${tens[t]}`;
        } else {
          result += tens[t];
        }
      }
    }
    return result;
  }

  const intPart = Math.floor(Math.abs(number));
  const decPart = Math.round((Math.abs(number) - intPart) * 100);

  let text = '';

  const billions = Math.floor(intPart / 1000000000);
  const millions = Math.floor((intPart % 1000000000) / 1000000);
  const thousands = Math.floor((intPart % 1000000) / 1000);
  const remainder = intPart % 1000;

  const parts: string[] = [];

  if (billions > 0) {
    parts.push(`${convertGroup(billions)} مليار`);
  }
  if (millions > 0) {
    if (millions === 1) parts.push('مليون');
    else if (millions === 2) parts.push('مليونان');
    else if (millions <= 10) parts.push(`${convertGroup(millions)} ملايين`);
    else parts.push(`${convertGroup(millions)} مليون`);
  }
  if (thousands > 0) {
    if (thousands === 1) parts.push('ألف');
    else if (thousands === 2) parts.push('ألفان');
    else if (thousands <= 10) parts.push(`${convertGroup(thousands)} آلاف`);
    else parts.push(`${convertGroup(thousands)} ألف`);
  }
  if (remainder > 0) {
    parts.push(convertGroup(remainder));
  }

  text = parts.join(' و ');
  if (!text) text = 'صفر';

  text = `فقط ${text} ${currencyName}`;

  if (decPart > 0) {
    text += ` و ${convertGroup(decPart)} ${subunitName}`;
  }

  text += ' لا غير';

  return text;
}

// Export data to CSV
export function exportToCSV(transactions: Transaction[], currencySymbol: string) {
  const headers = ['المعرف', 'التاريخ', 'النوع', 'التصنيف', 'البيان/الوصف', 'المبلغ', 'العملة', 'طريقة الدفع', 'الطرف الثاني/العميل', 'حالة السداد'];
  
  const typeLabels: Record<string, string> = {
    income: 'إيراد',
    expense: 'مصروف',
    receivable: 'دين لنا (مستحق)',
    payable: 'دين علينا (مطلوب)',
  };

  const paymentLabels: Record<string, string> = {
    cash: 'نقداً',
    bank: 'تحويل بنكي',
    card: 'بطاقة مدى/ائتمان',
    credit: 'آجل',
  };

  const rows = transactions.map(t => [
    t.referenceNumber || t.id.slice(0, 8),
    t.date,
    typeLabels[t.type] || t.type,
    `"${(t.category || '').replace(/"/g, '""')}"`,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    t.amount.toString(),
    currencySymbol,
    paymentLabels[t.paymentMethod] || t.paymentMethod,
    `"${(t.contactName || '').replace(/"/g, '""')}"`,
    t.type === 'receivable' || t.type === 'payable' ? (t.isSettled ? 'تم السداد' : 'معلق') : 'مكتمل',
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `سجل_المحاسبة_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
