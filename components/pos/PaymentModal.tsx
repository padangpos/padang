'use client';

import { useState } from 'react';
import { usePosStore } from '@/lib/store/usePosStore';
import { PaymentMethod } from '@/lib/types/database';
import { Banknote, QrCode, CreditCard, X, Check } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (receiptData: {
    orderNumber: string;
    paymentMethod: PaymentMethod;
    tendered: number;
    change: number;
  }) => void;
}

export default function PaymentModal({ isOpen, onClose, onPaymentSuccess }: PaymentModalProps) {
  const { getGrandTotal, getChange } = usePosStore();
  const grandTotal = getGrandTotal();

  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [tenderedInput, setTenderedInput] = useState<string>(grandTotal.toString());

  if (!isOpen) return null;

  const tenderedAmount = parseFloat(tenderedInput) || 0;
  const changeAmount = getChange(tenderedAmount);
  const isValidCash = method !== 'cash' || tenderedAmount >= grandTotal;

  const quickAmounts = [
    { label: 'พอดี', value: grandTotal },
    { label: '฿50', value: 50 },
    { label: '฿100', value: 100 },
    { label: '฿500', value: 500 },
    { label: '฿1,000', value: 1000 },
  ];

  const handleConfirmPayment = () => {
    if (!isValidCash) return;
    const orderNumber = `REC-${Date.now().toString().slice(-6)}`;
    onPaymentSuccess({
      orderNumber,
      paymentMethod: method,
      tendered: method === 'cash' ? tenderedAmount : grandTotal,
      change: method === 'cash' ? changeAmount : 0,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-padaeng max-w-md w-full p-5 space-y-5 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-padaeng-border pb-3">
          <div>
            <h3 className="font-bold text-xl text-padaeng-text">ชำระเงิน</h3>
            <span className="text-xs text-padaeng-muted">เลือกช่องทางรับเงินและยืนยันยอด</span>
          </div>
          <button onClick={onClose} className="p-2 text-padaeng-muted hover:text-padaeng-text touch-target">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total Display */}
        <div className="bg-padaeng-red-light border border-padaeng-red/20 rounded-padaeng p-4 text-center">
          <span className="text-xs text-padaeng-muted font-medium block">ยอดชำระทั้งสิ้น</span>
          <span className="text-3xl font-black text-padaeng-red">฿{grandTotal.toLocaleString()}</span>
        </div>

        {/* Payment Method Tabs */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => { setMethod('cash'); setTenderedInput(grandTotal.toString()); }}
            className={`p-3 rounded-xl flex flex-col items-center justify-center space-y-1 font-bold text-sm min-h-btn border transition-all ${
              method === 'cash'
                ? 'bg-padaeng-red text-white border-padaeng-red shadow-sm'
                : 'bg-padaeng-surface text-padaeng-text border-padaeng-border'
            }`}
          >
            <Banknote className="w-5 h-5" />
            <span>เงินสด</span>
          </button>
          <button
            onClick={() => setMethod('promptpay')}
            className={`p-3 rounded-xl flex flex-col items-center justify-center space-y-1 font-bold text-sm min-h-btn border transition-all ${
              method === 'promptpay'
                ? 'bg-padaeng-red text-white border-padaeng-red shadow-sm'
                : 'bg-padaeng-surface text-padaeng-text border-padaeng-border'
            }`}
          >
            <QrCode className="w-5 h-5" />
            <span>สแกน QR</span>
          </button>
          <button
            onClick={() => setMethod('card')}
            className={`p-3 rounded-xl flex flex-col items-center justify-center space-y-1 font-bold text-sm min-h-btn border transition-all ${
              method === 'card'
                ? 'bg-padaeng-red text-white border-padaeng-red shadow-sm'
                : 'bg-padaeng-surface text-padaeng-text border-padaeng-border'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span>บัตรเครดิต</span>
          </button>
        </div>

        {/* Cash Specific Controls */}
        {method === 'cash' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-padaeng-muted mb-1">
                จำนวนเงินที่รับ (บาท)
              </label>
              <input
                type="number"
                value={tenderedInput}
                onChange={(e) => setTenderedInput(e.target.value)}
                className="w-full text-2xl font-bold text-padaeng-text p-3 border border-padaeng-border rounded-xl focus:outline-none focus:border-padaeng-red text-right"
              />
            </div>

            {/* Quick Cash Buttons (≤ 3 Taps Cash Checkout) */}
            <div className="grid grid-cols-5 gap-1.5">
              {quickAmounts.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setTenderedInput(q.value.toString())}
                  className="py-2 px-1 bg-padaeng-surface border border-padaeng-border rounded-lg text-xs font-bold text-padaeng-text hover:bg-padaeng-red-light hover:border-padaeng-red/30 touch-target"
                >
                  {q.label}
                </button>
              ))}
            </div>

            {/* Change Display */}
            <div className="flex justify-between items-center bg-padaeng-surface p-3 rounded-xl border border-padaeng-border">
              <span className="text-sm font-semibold text-padaeng-text">เงินทอน</span>
              <span className={`text-xl font-black ${tenderedAmount < grandTotal ? 'text-padaeng-muted' : 'text-padaeng-red'}`}>
                ฿{changeAmount.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* PromptPay QR Preview */}
        {method === 'promptpay' && (
          <div className="bg-padaeng-surface border border-padaeng-border rounded-xl p-4 text-center space-y-2">
            <div className="w-40 h-40 mx-auto bg-white border border-padaeng-border rounded-xl flex items-center justify-center p-2">
              <QrCode className="w-32 h-32 text-padaeng-text" />
            </div>
            <p className="text-xs text-padaeng-muted font-medium">
              ให้ลูกค้าสแกน QR Code PromptPay เพื่อชำระเงิน ฿{grandTotal.toLocaleString()}
            </p>
          </div>
        )}

        {/* Card Note */}
        {method === 'card' && (
          <div className="bg-padaeng-surface border border-padaeng-border rounded-xl p-4 text-center">
            <p className="text-sm font-semibold text-padaeng-text">รูด/แตะบัตร EDC</p>
            <p className="text-xs text-padaeng-muted mt-1">กดรับชำระเมื่อเครื่อง EDC แสดงสถานะอนุมัติเรียบร้อย</p>
          </div>
        )}

        {/* Final Action Button */}
        <button
          disabled={!isValidCash}
          onClick={handleConfirmPayment}
          className="w-full bg-padaeng-red hover:bg-padaeng-red-hover text-white disabled:opacity-40 font-bold py-3.5 rounded-xl flex items-center justify-center space-x-2 text-base min-h-btn shadow-md active:scale-95 transition-all"
        >
          <Check className="w-5 h-5" />
          <span>บันทึกการรับเงิน (฿{grandTotal.toLocaleString()})</span>
        </button>
      </div>
    </div>
  );
}
