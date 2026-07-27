'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { usePosStore } from '@/lib/store/usePosStore';
import { ArrowLeft, RotateCcw, Trash2, Clock, PauseCircle } from 'lucide-react';

export default function HeldBillsPage() {
  const { heldBills, recallHeldBill, deleteHeldBill, setHeldBills } = usePosStore();
  useEffect(() => { fetch('/api/held-bills').then((r) => r.json()).then((body) => { if (Array.isArray(body.bills)) setHeldBills(body.bills.map((bill: { id: string; reference_name: string; payload: { items: typeof heldBills[number]['items'] }; total_amount: number; created_at: string }) => ({ id: bill.id, referenceName: bill.reference_name, items: bill.payload.items, totalAmount: Number(bill.total_amount), createdAt: new Date(bill.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) }))); }).catch(() => undefined); }, [setHeldBills]);

  const handleRecall = (id: string) => {
    fetch('/api/held-bills', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'recall', id }) }).then((r) => { if (!r.ok) throw new Error(); recallHeldBill(id); window.location.href = '/pos'; }).catch(() => alert('เรียกคืนบิลไม่สำเร็จ'));
  };

  return (
    <div className="min-h-screen bg-padaeng-surface flex flex-col font-sans">
      {/* Top Header Navigation */}
      <header className="bg-white border-b border-padaeng-border px-4 py-3 sticky top-0 z-30 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            href="/pos"
            className="w-10 h-10 rounded-xl bg-padaeng-surface hover:bg-padaeng-red-light border border-padaeng-border flex items-center justify-center text-padaeng-text touch-target"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-bold text-base text-padaeng-text leading-tight">รายการบิลพัก</h1>
            <span className="text-xs text-padaeng-red font-semibold">บิลที่รอเรียกคืน ({heldBills.length})</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 max-w-2xl w-full mx-auto">
        {heldBills.length === 0 ? (
          <div className="bg-white rounded-padaeng p-8 border border-padaeng-border text-center space-y-3 py-16">
            <div className="w-16 h-16 rounded-full bg-padaeng-surface flex items-center justify-center mx-auto text-padaeng-muted">
              <PauseCircle className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-base text-padaeng-text">ไม่มีรายการบิลพัก</h3>
            <p className="text-xs text-padaeng-muted max-w-xs mx-auto">
              เมื่อมีลูกค้าขอพักบิลชั่วคราว สามารถกดปุ่ม "พักบิล" ในหน้าขาย POS เพื่อเก็บรายการไว้ที่นี่ได้
            </p>
            <Link
              href="/pos"
              className="inline-block bg-padaeng-red text-white font-bold px-6 py-2.5 rounded-xl text-sm min-h-btn active:scale-95 transition-all shadow-sm mt-2"
            >
              กลับไปหน้าขาย POS
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {heldBills.map((bill) => (
              <div
                key={bill.id}
                className="p-4 bg-white border border-padaeng-border rounded-padaeng shadow-sm flex flex-col justify-between space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-base text-padaeng-text">{bill.referenceName}</h3>
                    <div className="flex items-center space-x-2 text-xs text-padaeng-muted mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{bill.createdAt}</span>
                      <span>•</span>
                      <span>{bill.items.length} รายการ</span>
                    </div>
                  </div>
                  <span className="font-extrabold text-padaeng-red text-lg">
                    ฿{bill.totalAmount.toLocaleString()}
                  </span>
                </div>

                {/* Items Summary */}
                <div className="bg-padaeng-surface p-2.5 rounded-xl text-xs space-y-1">
                  {bill.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-padaeng-muted">
                      <span>{item.product.name} x{item.quantity}</span>
                      <span>฿{(item.unitPrice * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-1">
                  <button
                    onClick={() => { fetch('/api/held-bills', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', id: bill.id }) }).then((r) => { if (!r.ok) throw new Error(); deleteHeldBill(bill.id); }).catch(() => alert('ลบบิลพักไม่สำเร็จ')); }}
                    className="p-2.5 text-padaeng-muted hover:text-padaeng-red border border-padaeng-border rounded-xl touch-target"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRecall(bill.id)}
                    className="flex-1 bg-padaeng-red hover:bg-padaeng-red-hover text-white font-bold py-2.5 rounded-xl text-sm min-h-btn flex items-center justify-center space-x-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>ดึงบิลกลับเข้าหน้าขาย</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
