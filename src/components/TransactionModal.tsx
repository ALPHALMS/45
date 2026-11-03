import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Calendar, 
  Tag, 
  CreditCard, 
  User, 
  FileText, 
  Hash,
  Check
} from 'lucide-react';
import { 
  Transaction, 
  TransactionType, 
  PaymentMethod, 
  CategoryOption 
} from '../types';
import { DEFAULT_CATEGORIES } from '../utils/sampleData';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id' | 'createdAt'>, editingId?: string) => void;
  editingTransaction?: Transaction | null;
  initialType?: TransactionType;
  currencySymbol: string;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTransaction,
  initialType = 'income',
  currencySymbol,
}) => {
  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [isCustomCategory, setIsCustomCategory] = useState<boolean>(false);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState<string>('');
  const [contactName, setContactName] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(editingTransaction.amount.toString());
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
      setDescription(editingTransaction.description);
      setContactName(editingTransaction.contactName || '');
      setPaymentMethod(editingTransaction.paymentMethod);
      setReferenceNumber(editingTransaction.referenceNumber || '');
      setNotes(editingTransaction.notes || '');
      setIsCustomCategory(false);
    } else {
      setType(initialType);
      setAmount('');
      const defaultCat = DEFAULT_CATEGORIES.find(c => 
        initialType === 'income' ? c.type === 'income' : c.type === 'expense'
      );
      setCategory(defaultCat ? defaultCat.label : 'عام');
      setDate(new Date().toISOString().slice(0, 10));
      setDescription('');
      setContactName('');
      setPaymentMethod(initialType === 'receivable' || initialType === 'payable' ? 'credit' : 'cash');
      setReferenceNumber(`TX-${Math.floor(1000 + Math.random() * 9000)}`);
      setNotes('');
      setIsCustomCategory(false);
    }
  }, [editingTransaction, initialType, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('يرجى إدخال مبلغ صحيح أكبر من صفر');
      return;
    }

    const finalCategory = isCustomCategory && customCategory.trim() 
      ? customCategory.trim() 
      : category;

    if (!description.trim()) {
      alert('يرجى كتابة بيان أو وصف للمعاملة');
      return;
    }

    onSave({
      type,
      amount: parsedAmount,
      category: finalCategory || 'عام',
      date,
      description: description.trim(),
      contactName: contactName.trim() || undefined,
      paymentMethod,
      referenceNumber: referenceNumber.trim() || undefined,
      notes: notes.trim() || undefined,
      isSettled: editingTransaction ? editingTransaction.isSettled : false,
    }, editingTransaction?.id);

    onClose();
  };

  const filteredCategories = DEFAULT_CATEGORIES.filter(c => {
    if (type === 'income') return c.type === 'income' || c.type === 'both';
    if (type === 'expense') return c.type === 'expense' || c.type === 'both';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              {editingTransaction ? 'تعديل المعاملة' : 'تسجيل معاملة مالية جديدة'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              أدخل تفاصيل الإيراد، المصروف، أو الذمة المالية بدقة
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Transaction Type Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">نوع المعاملة</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setType('income');
                  if (paymentMethod === 'credit') setPaymentMethod('cash');
                }}
                className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                  type === 'income' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                + إيراد (دخل)
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setType('expense');
                  if (paymentMethod === 'credit') setPaymentMethod('cash');
                }}
                className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                  type === 'expense' 
                    ? 'bg-rose-600 text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                - مصروف (صرف)
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('receivable');
                  setPaymentMethod('credit');
                }}
                className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                  type === 'receivable' 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                دين لنا (مستحق)
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('payable');
                  setPaymentMethod('credit');
                }}
                className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                  type === 'payable' 
                    ? 'bg-purple-600 text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                دين علينا (مطلوب)
              </button>
            </div>
          </div>

          {/* Amount and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                المبلغ ({currencySymbol}) *
              </label>
              <div className="relative">
                <input
                  id="tx-amount-input"
                  type="number"
                  step="any"
                  min="0"
                  required
                  autoFocus
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-300 text-base font-bold font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <span className="absolute left-3 top-2.5 text-xs font-semibold text-slate-400">
                  {currencySymbol}
                </span>
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">التاريخ *</label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

          </div>

          {/* Description / Statement */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">البيان / الوصف *</label>
            <input
              id="tx-desc-input"
              type="text"
              required
              placeholder="مثال: مبيعات نقدية، فاتورة كهرباء، صيانة أجهزة..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Category & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Category */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-600">التصنيف</label>
                <button
                  type="button"
                  onClick={() => setIsCustomCategory(!isCustomCategory)}
                  className="text-[11px] text-emerald-600 hover:underline cursor-pointer"
                >
                  {isCustomCategory ? 'اختر من القائمة' : '+ تصنيف مخصص'}
                </button>
              </div>

              {isCustomCategory ? (
                <input
                  type="text"
                  placeholder="أدخل اسماً للتصنيف"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              ) : (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {filteredCategories.map((c) => (
                    <option key={c.id} value={c.label}>
                      {c.label}
                    </option>
                  ))}
                  <option value="أخرى">أخرى / غير مصنف</option>
                </select>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">طريقة الدفع</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="cash">نقداً (كاش)</option>
                <option value="bank">تحويل بنكي / شيك</option>
                <option value="card">بطاقة مدى / دفع إلكتروني</option>
                <option value="credit">آجل (ذمة مالية)</option>
              </select>
            </div>

          </div>

          {/* Contact Name & Reference No */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Contact Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                {type === 'income' || type === 'receivable' ? 'اسم العميل / المستلم منه' : 'اسم المورد / المدفوع له'}
                <span className="text-slate-400 font-normal"> (اختياري)</span>
              </label>
              <input
                type="text"
                placeholder="اسم الشخص أو المؤسسة"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Reference / Invoice number */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                رقم السند أو الفاتورة
                <span className="text-slate-400 font-normal"> (اختياري)</span>
              </label>
              <input
                type="text"
                placeholder="INV-001"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              إلغاء
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{editingTransaction ? 'حفظ التعديلات' : 'تسجيل المعاملة'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
