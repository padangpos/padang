'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, PieChart, Send, CheckCircle2, Lock, Unlock, AlertCircle } from 'lucide-react';
import { recordAuditLog } from '@/lib/audit/logger';

export default function SummaryPage() {
  const [shiftStatus, setShiftStatus] = useState<'open' | 'closed'>('open');
  const [shiftId, setShiftId] = useState('');
  const [loading, setLoading] = useState(true);
  const [openingCash, setOpeningCash] = useState(1000);
  const [countedCashInput, setCountedCashInput] = useState('');
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showLineModal, setShowLineModal] = useState(false);

  const [totalSales, setTotalSales] = useState(0);
  const [cashSales, setCashSales] = useState(0);
  const [promptpaySales, setPromptpaySales] = useState(0);
  const [cardSales, setCardSales] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  useEffect(() => {
    Promise.all([fetch('/api/reports').then((r) => r.json()), fetch('/api/shifts').then((r) => r.json())]).then(([report, shift]) => {
      setTotalSales(Number(report.summary?.totalSales || 0));
      setTotalExpenses(Number(report.summary?.totalExpenses || 0));
      setCashSales(Number(report.summary?.cashSales || 0));
      setPromptpaySales(Number(report.summary?.promptpaySales || 0));
      setCardSales(Number(report.summary?.cardSales || 0));
      if (shift.shift) { setShiftId(shift.shift.id); setShiftStatus('open'); setOpeningCash(Number(shift.shift.opening_cash || 0)); }
      else setShiftStatus('closed');
    }).catch(() => undefined).finally(() => setLoading(false));
  }, []);
  const netTotal = totalSales - totalExpenses;

  const expectedCashInDrawer = openingCash + cashSales;
  const countedCash = parseFloat(countedCashInput) || 0;
  const discrepancy = countedCash - expectedCashInDrawer;

  const handleCloseShift = () => {
    if (!shiftId) return;
    fetch('/api/shifts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'close', id: shiftId, closingCash: countedCash }) }).then((response) => { if (!response.ok) throw new Error(); setShiftStatus('closed'); }).catch(() => alert('ปิดกะขายไม่สำเร็จ'));
    recordAuditLog('store-1', 'close_shift', 'shift', 'shift-1', {
      openingCash,
      expectedCash: expectedCashInDrawer,
      countedCash,
      discrepancy,
      totalSales,
    });
    setShowCloseModal(false);
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
            <h1 className="font-bold text-base text-padaeng-text leading-tight">สรุปยอดและปิดกะ</h1>
            <span className="text-xs text-padaeng-red font-semibold">ยอดขายประจำวัน {new Date().toLocaleDateString('th-TH')}</span>
          </div>
        </div>

        <button
          onClick={() => setShowLineModal(true)}
          className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1 shadow-sm touch-target"
        >
          <Send className="w-4 h-4" />
          <span>ส่งสรุปเข้า LINE</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 max-w-2xl w-full mx-auto space-y-4">
        {/* Net Financial Overview Card */}
        <div className="bg-padaeng-red text-white p-5 rounded-padaeng shadow-md space-y-3">
          <span className="text-xs opacity-90 font-medium">ยอดขายสุทธิประจำวัน (Net Total)</span>
          <h2 className="text-3xl font-black">฿{netTotal.toLocaleString()}</h2>
          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-white/20">
            <div>
              <span className="opacity-80 block">ยอดขายรวม:</span>
              <span className="font-bold">฿{totalSales.toLocaleString()}</span>
            </div>
            <div>
              <span className="opacity-80 block">รายจ่ายรวม:</span>
              <span className="font-bold text-yellow-300">-฿{totalExpenses.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Breakdown by Payment Channels */}
        <div className="bg-white p-4 rounded-padaeng border border-padaeng-border space-y-3">
          <h3 className="font-bold text-sm text-padaeng-text border-b border-padaeng-border pb-2">
            แยกตามช่องทางชำระเงิน
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center bg-padaeng-surface p-2.5 rounded-xl">
              <span className="font-bold text-padaeng-text">💵 เงินสด (Cash)</span>
              <span className="font-extrabold text-sm text-padaeng-text">฿{cashSales.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center bg-padaeng-surface p-2.5 rounded-xl">
              <span className="font-bold text-padaeng-text">📲 สแกน QR (PromptPay)</span>
              <span className="font-extrabold text-sm text-padaeng-text">฿{promptpaySales.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center bg-padaeng-surface p-2.5 rounded-xl">
              <span className="font-bold text-padaeng-text">💳 บัตรเครดิต (Card)</span>
              <span className="font-extrabold text-sm text-padaeng-text">฿{cardSales.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Shift Manager Card */}
        <div className="bg-white p-4 rounded-padaeng border border-padaeng-border space-y-3">
          <div className="flex justify-between items-center border-b border-padaeng-border pb-2">
            <div className="flex items-center space-x-2">
              {shiftStatus === 'open' ? (
                <Unlock className="w-5 h-5 text-emerald-600" />
              ) : (
                <Lock className="w-5 h-5 text-padaeng-red" />
              )}
              <h3 className="font-bold text-sm text-padaeng-text">สถานะกะการขายปัจจุบัน</h3>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                shiftStatus === 'open' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {shiftStatus === 'open' ? 'กะกำลังเปิดขาย' : 'ปิดกะเรียบร้อย'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-padaeng-muted">เงินทอนตั้งต้น (Opening Cash):</span>
              <span className="font-bold">฿{openingCash.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-padaeng-muted">เงินสดขายได้:</span>
              <span className="font-bold">฿{cashSales.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-padaeng-text pt-1 border-t border-padaeng-border">
              <span>เงินสดที่ควรมีในเก๊ะ:</span>
              <span className="text-padaeng-red">฿{expectedCashInDrawer.toLocaleString()}</span>
            </div>
          </div>

          {shiftStatus === 'open' && (
            <button
              onClick={() => setShowCloseModal(true)}
              className="w-full bg-padaeng-red hover:bg-padaeng-red-hover text-white font-bold py-3 rounded-xl text-sm min-h-btn shadow-md active:scale-95 transition-all mt-2"
            >
              นับเงินและปิดกะประจำวัน
            </button>
          )}
        </div>
      </main>

      {/* Close Shift Cash Counter Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-padaeng max-w-sm w-full p-5 space-y-4 shadow-xl">
            <h3 className="font-bold text-lg text-padaeng-text">ปิดกะและนับเงินในเก๊ะ</h3>
            <p className="text-xs text-padaeng-muted">
              เงินสดที่ควรมีในเก๊ะคือ <b>฿{expectedCashInDrawer.toLocaleString()}</b>
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-padaeng-text mb-1">เงินสดที่นับได้จริง (บาท)</label>
                <input
                  type="number"
                  placeholder="5250"
                  value={countedCashInput}
                  onChange={(e) => setCountedCashInput(e.target.value)}
                  className="w-full p-3 border border-padaeng-border rounded-xl text-lg font-bold text-right focus:outline-none focus:border-padaeng-red"
                />
              </div>

              {countedCashInput !== '' && (
                <div
                  className={`p-3 rounded-xl flex justify-between items-center font-bold text-xs ${
                    discrepancy === 0
                      ? 'bg-emerald-50 text-emerald-700'
                      : discrepancy > 0
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  <span>ผลต่าง (เงินขาด/เกิน):</span>
                  <span>
                    {discrepancy === 0
                      ? 'เงินครบพอดี'
                      : discrepancy > 0
                      ? `เกิน +฿${discrepancy.toLocaleString()}`
                      : `ขาด -฿${Math.abs(discrepancy).toLocaleString()}`}
                  </span>
                </div>
              )}
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setShowCloseModal(false)}
                className="flex-1 py-2.5 text-xs font-semibold text-padaeng-muted bg-padaeng-surface rounded-xl hover:bg-padaeng-border"
              >
                ยกเลิก
              </button>
              <button
                disabled={countedCashInput === ''}
                onClick={handleCloseShift}
                className="flex-1 py-2.5 text-xs font-bold bg-padaeng-red hover:bg-padaeng-red-hover disabled:opacity-40 text-white rounded-xl shadow-sm"
              >
                ยืนยันปิดกะ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LINE Summary Push Modal */}
      {showLineModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-padaeng max-w-sm w-full p-5 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-padaeng-border pb-2">
              <div className="flex items-center space-x-2">
                <Send className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-padaeng-text">พรีวิวข้อความสรุปยอดเข้า LINE</h3>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs space-y-2 text-emerald-950 font-mono">
              <p className="font-bold">📢 [ป้าแดง POS] สรุปยอดขายประจำวัน</p>
              <p>ร้านกาแฟป้าแดง (สาขาหลัก)</p>
              <p>------------------------</p>
              <p>ยอดขายรวม: ฿8,450</p>
              <p>• เงินสด: ฿4,250</p>
              <p>• สแกน QR: ฿3,200</p>
              <p>• บัตรเครดิต: ฿1,000</p>
              <p>รายจ่ายรวม: ฿850</p>
              <p className="font-bold text-padaeng-red">ยอดขายสุทธิ: ฿7,600</p>
              <p>------------------------</p>
              <p className="text-[10px] text-emerald-700">ส่งเมื่อ 26/07/2026 22:30 น.</p>
            </div>

            <button
              onClick={() => setShowLineModal(false)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm min-h-btn shadow-md active:scale-95 transition-all"
            >
              ส่งสรุปเข้า LINE เจ้าของร้านเรียบร้อย
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
