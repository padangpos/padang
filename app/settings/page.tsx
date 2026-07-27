'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Store, QrCode, Printer, Volume2, Save, Check } from 'lucide-react';
import { usePosStore } from '@/lib/store/usePosStore';

export default function SettingsPage() {
  const { storeName, branchName } = usePosStore();

  const [nameInput, setNameInput] = useState(storeName);
  const [promptpayInput, setPromptpayInput] = useState('');
  const [receiptFooterInput, setReceiptFooterInput] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => { fetch('/api/settings').then((r) => r.json()).then((body) => { const settings = body.settings; if (settings) { setPromptpayInput(settings.promptpay_id || ''); setReceiptFooterInput(settings.receipt_footer || ''); setSoundEnabled(settings.sound_enabled !== false); } }).catch(() => undefined); }, []);

  const handleSaveSettings = async () => {
    const response = await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: nameInput, promptpayId: promptpayInput, receiptFooter: receiptFooterInput, soundEnabled }) });
    if (!response.ok) { alert('บันทึกการตั้งค่าไม่สำเร็จ'); return; }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
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
            <h1 className="font-bold text-base text-padaeng-text leading-tight">ตั้งค่าร้านค้าและใบเสร็จ</h1>
            <span className="text-xs text-padaeng-red font-semibold">ปรับแต่งข้อมูลร้าน QR และการแจ้งเตือน</span>
          </div>
        </div>

        <button
          onClick={handleSaveSettings}
          className="px-4 py-2 rounded-xl bg-padaeng-red text-white text-xs font-bold flex items-center space-x-1 shadow-sm touch-target"
        >
          {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{isSaved ? 'บันทึกแล้ว' : 'บันทึกการตั้งค่า'}</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 max-w-2xl w-full mx-auto space-y-4">
        {/* Store Profile */}
        <div className="bg-white p-4 rounded-padaeng border border-padaeng-border space-y-3">
          <div className="flex items-center space-x-2 border-b border-padaeng-border pb-2">
            <Store className="w-5 h-5 text-padaeng-red" />
            <h3 className="font-bold text-sm text-padaeng-text">ข้อมูลทั่วไปของร้านค้า</h3>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-padaeng-text mb-1">ชื่อร้านค้า</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full p-2.5 border border-padaeng-border rounded-xl text-sm focus:outline-none focus:border-padaeng-red"
              />
            </div>
            <div>
              <label className="block font-bold text-padaeng-text mb-1">สาขาหลัก</label>
              <input
                type="text"
                disabled
                value={branchName}
                className="w-full p-2.5 border border-padaeng-border rounded-xl text-sm bg-padaeng-surface text-padaeng-muted"
              />
            </div>
          </div>
        </div>

        {/* PromptPay Config */}
        <div className="bg-white p-4 rounded-padaeng border border-padaeng-border space-y-3">
          <div className="flex items-center space-x-2 border-b border-padaeng-border pb-2">
            <QrCode className="w-5 h-5 text-padaeng-red" />
            <h3 className="font-bold text-sm text-padaeng-text">การรับเงิน PromptPay QR</h3>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-padaeng-text mb-1">เบอร์โทรศัพท์ / เลขประจำตัวผู้เสียภาษี (PromptPay ID)</label>
              <input
                type="text"
                value={promptpayInput}
                onChange={(e) => setPromptpayInput(e.target.value)}
                placeholder="08x-xxx-xxxx"
                className="w-full p-2.5 border border-padaeng-border rounded-xl text-sm focus:outline-none focus:border-padaeng-red font-bold"
              />
            </div>
          </div>
        </div>

        {/* Receipt Footer Message */}
        <div className="bg-white p-4 rounded-padaeng border border-padaeng-border space-y-3">
          <div className="flex items-center space-x-2 border-b border-padaeng-border pb-2">
            <Printer className="w-5 h-5 text-padaeng-red" />
            <h3 className="font-bold text-sm text-padaeng-text">ข้อความท้ายใบเสร็จ</h3>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-padaeng-text mb-1">ข้อความขอบคุณลูกค้า</label>
              <input
                type="text"
                value={receiptFooterInput}
                onChange={(e) => setReceiptFooterInput(e.target.value)}
                className="w-full p-2.5 border border-padaeng-border rounded-xl text-sm focus:outline-none focus:border-padaeng-red"
              />
            </div>
          </div>
        </div>

        {/* Sound & Feedback Settings */}
        <div className="bg-white p-4 rounded-padaeng border border-padaeng-border flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Volume2 className="w-5 h-5 text-padaeng-red" />
            <div>
              <h4 className="font-bold text-sm text-padaeng-text">เสียงตอบรับและปุ่มกด</h4>
              <p className="text-xs text-padaeng-muted">เปิดเสียงแจ้งเตือนเมื่อเพิ่มสินค้าและคิดเงินสำเร็จ</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={(e) => setSoundEnabled(e.target.checked)}
            className="w-5 h-5 accent-padaeng-red cursor-pointer"
          />
        </div>
      </main>
    </div>
  );
}
