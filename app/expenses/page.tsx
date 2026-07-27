'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Camera, Sparkles, X, Check, FileText } from 'lucide-react';
import { recordAuditLog } from '@/lib/audit/logger';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([
    { id: 'exp-1', title: 'ค่าน้ำแข็งประจำวัน', amount: 350, category: 'วัตถุดิบ & สินค้า', date: 'วันนี้ 14:20 น.' },
    { id: 'exp-2', title: 'ค่าไฟฟ้าประจำเดือน', amount: 4200, category: 'ค่าน้ำ/ค่าไฟ/สาธารณูปโภค', date: 'เมื่อวาน' },
    { id: 'exp-3', title: 'ค่าแก้วและถุงพลาสติก', amount: 850, category: 'วัสดุสิ้นเปลือง', date: '24 ก.ค. 2026' },
  ]);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPhotoReceiptModal, setShowPhotoReceiptModal] = useState(false);

  // Manual Form State
  const [titleInput, setTitleInput] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('วัตถุดิบ & สินค้า');

  // Photo Receipt OCR Draft State
  const [draftReceipt, setDraftReceipt] = useState({
    storeName: 'ร้านน้ำแข็งใสเจริญ',
    date: '26/07/2026 15:30',
    title: 'ค่าน้ำแข็ง 10 ถุง',
    amount: 500,
    category: 'วัตถุดิบ & สินค้า',
    confidence: 0.94,
  });

  const categories = [
    'วัตถุดิบ & สินค้า',
    'ค่าน้ำ/ค่าไฟ/สาธารณูปโภค',
    'ค่าเช่าสถานที่',
    'ค่าแรงพนักงาน',
    'วัสดุสิ้นเปลือง',
    'อื่นๆ',
  ];

  const totalExpenseSum = expenses.reduce((sum, item) => sum + item.amount, 0);

  const handleSaveExpense = () => {
    if (!titleInput || !amountInput) return;
    const newExpense = {
      id: `exp-${Date.now()}`,
      title: titleInput,
      amount: parseFloat(amountInput) || 0,
      category: categoryInput,
      date: 'วันนี้ ' + new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    };

    setExpenses([newExpense, ...expenses]);
    recordAuditLog('store-1', 'create_expense', 'expense', newExpense.id, { title: titleInput, amount: newExpense.amount });

    setTitleInput('');
    setAmountInput('');
    setShowAddModal(false);
  };

  const handleConfirmPhotoReceiptDraft = () => {
    const newExpense = {
      id: `exp-ocr-${Date.now()}`,
      title: draftReceipt.title,
      amount: draftReceipt.amount,
      category: draftReceipt.category,
      date: 'วันนี้ ' + new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    };

    setExpenses([newExpense, ...expenses]);
    recordAuditLog('store-1', 'confirm_expense_draft', 'expense', newExpense.id, draftReceipt);
    setShowPhotoReceiptModal(false);
  };

  return (
    <div className="min-h-screen bg-padaeng-surface flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-padaeng-border px-4 py-3 sticky top-0 z-30 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            href="/pos"
            className="w-10 h-10 rounded-xl bg-padaeng-surface hover:bg-padaeng-red-light border border-padaeng-border flex items-center justify-center text-padaeng-text touch-target"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-bold text-base text-padaeng-text leading-tight">บันทึกรายจ่าย</h1>
            <span className="text-xs text-padaeng-red font-semibold">รายจ่ายร้านค้าประจำวัน/เดือน</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowPhotoReceiptModal(true)}
            className="px-3 py-2 rounded-xl bg-padaeng-red-light border border-padaeng-red/30 text-xs font-bold text-padaeng-red flex items-center space-x-1 touch-target"
          >
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">ถ่ายรูปใบเสร็จ</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-2 rounded-xl bg-padaeng-red text-white text-xs font-bold flex items-center space-x-1 shadow-sm touch-target"
          >
            <Plus className="w-4 h-4" />
            <span>จดรายจ่าย</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 max-w-2xl w-full mx-auto space-y-4">
        {/* Total Expense Summary Card */}
        <div className="bg-white p-4 rounded-padaeng border border-padaeng-border flex justify-between items-center shadow-sm">
          <div>
            <span className="text-xs text-padaeng-muted font-medium block">รวมรายจ่ายทั้งหมด</span>
            <h3 className="text-2xl font-black text-padaeng-red">฿{totalExpenseSum.toLocaleString()}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-padaeng-red-light flex items-center justify-center text-padaeng-red">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Expense List */}
        <div className="bg-white rounded-padaeng border border-padaeng-border divide-y divide-padaeng-border">
          {expenses.map((e) => (
            <div key={e.id} className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-padaeng-muted block">{e.category}</span>
                <h4 className="font-bold text-sm text-padaeng-text">{e.title}</h4>
                <p className="text-[11px] text-padaeng-muted">{e.date}</p>
              </div>
              <span className="font-extrabold text-padaeng-text text-base">
                ฿{e.amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </main>

      {/* Manual Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-padaeng max-w-sm w-full p-5 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-padaeng-border pb-2">
              <h3 className="font-bold text-lg text-padaeng-text">บันทึกรายจ่ายใหม่</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-padaeng-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-padaeng-text mb-1">หมวดหมู่รายจ่าย</label>
                <select
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  className="w-full p-2.5 border border-padaeng-border rounded-xl text-sm focus:outline-none focus:border-padaeng-red bg-white"
                >
                  {categories.map((c, idx) => (
                    <option key={idx} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-padaeng-text mb-1">รายการรายจ่าย</label>
                <input
                  type="text"
                  placeholder="เช่น ค่าน้ำแข็ง 10 ถุง"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="w-full p-2.5 border border-padaeng-border rounded-xl text-sm focus:outline-none focus:border-padaeng-red"
                />
              </div>

              <div>
                <label className="block font-bold text-padaeng-text mb-1">จำนวนเงิน (บาท)</label>
                <input
                  type="number"
                  placeholder="500"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="w-full p-2.5 border border-padaeng-border rounded-xl text-sm focus:outline-none focus:border-padaeng-red text-right font-bold"
                />
              </div>
            </div>

            <button
              onClick={handleSaveExpense}
              className="w-full bg-padaeng-red hover:bg-padaeng-red-hover text-white font-bold py-3 rounded-xl text-sm min-h-btn shadow-md active:scale-95 transition-all"
            >
              บันทึกรายจ่าย
            </button>
          </div>
        </div>
      )}

      {/* Photo Receipt OCR Draft Importer Modal (Draft-First Rule) */}
      {showPhotoReceiptModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-padaeng max-w-sm w-full p-5 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-padaeng-border pb-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-padaeng-red" />
                <h3 className="font-bold text-base text-padaeng-text">ป้าอ่านใบเสร็จให้อย่างถูกต้อง</h3>
              </div>
              <button onClick={() => setShowPhotoReceiptModal(false)} className="p-1 text-padaeng-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-padaeng-muted">
              ป้าสแกนภาพใบเสร็จแล้วสร้างรายการร่าง (Draft) ให้ตรวจและยืนยันก่อนบันทึกจริงนะ
            </p>

            <div className="bg-padaeng-surface p-3.5 rounded-xl border border-padaeng-border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-padaeng-muted">ร้านค้า:</span>
                <span className="font-bold text-padaeng-text">{draftReceipt.storeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-padaeng-muted">รายการ:</span>
                <span className="font-bold text-padaeng-text">{draftReceipt.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-padaeng-muted">หมวดหมู่:</span>
                <span className="font-bold text-padaeng-text">{draftReceipt.category}</span>
              </div>
              <div className="flex justify-between items-center border-t border-padaeng-border pt-1">
                <span className="text-padaeng-muted">ยอดรวม:</span>
                <span className="text-lg font-black text-padaeng-red">฿{draftReceipt.amount}</span>
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setShowPhotoReceiptModal(false)}
                className="flex-1 py-2.5 text-xs font-semibold text-padaeng-muted bg-padaeng-surface rounded-xl hover:bg-padaeng-border"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmPhotoReceiptDraft}
                className="flex-1 py-2.5 text-xs font-bold bg-padaeng-red text-white rounded-xl hover:bg-padaeng-red-hover shadow-sm"
              >
                ยืนยันบันทึกรายจ่าย
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
