'use client';

import { useEffect, useRef } from 'react';
import { usePosStore, CartItem } from '@/lib/store/usePosStore';
import { PaymentMethod } from '@/lib/types/database';
import { CheckCircle2, Printer, RotateCcw } from 'lucide-react';
import { animatePaymentSuccess } from '@/lib/animations/gsap';

interface ReceiptModalProps {
  isOpen: boolean;
  orderNumber: string;
  paymentMethod: PaymentMethod;
  tendered: number;
  change: number;
  purchasedItems: CartItem[];
  onNewOrder: () => void;
}

export default function ReceiptModal({
  isOpen,
  orderNumber,
  paymentMethod,
  tendered,
  change,
  purchasedItems,
  onNewOrder,
}: ReceiptModalProps) {
  const { storeName, branchName, getSubtotal, getDiscountAmount, getGrandTotal } = usePosStore();
  const checkmarkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && checkmarkRef.current) {
      animatePaymentSuccess(checkmarkRef.current);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const paymentLabel = paymentMethod === 'cash' ? 'เงินสด' : paymentMethod === 'promptpay' ? 'สแกน QR' : 'บัตรเครดิต';

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-padaeng max-w-md w-full p-6 space-y-4 shadow-xl relative overflow-hidden max-h-[90vh] flex flex-col">
        {/* Animated Checkmark Header */}
        <div className="text-center pt-2">
          <div ref={checkmarkRef} className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-padaeng-red-light text-padaeng-red mb-2">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="font-extrabold text-xl text-padaeng-text">ชำระเงินสำเร็จ</h3>
          <p className="text-xs text-padaeng-muted">ป้าจดรายการและบันทึกยอดขายให้เรียบร้อยแล้ว</p>
        </div>

        {/* Printable Receipt Paper */}
        <div className="flex-1 overflow-y-auto border border-dashed border-padaeng-border rounded-xl p-4 bg-padaeng-surface text-xs space-y-3 font-mono">
          <div className="text-center border-b border-padaeng-border pb-2 space-y-0.5">
            <div className="inline-block px-2 py-0.5 bg-padaeng-red text-white text-[10px] font-bold rounded mb-1">
              ป้าแดง POS
            </div>
            <h4 className="font-bold text-sm text-padaeng-text">{storeName}</h4>
            <p className="text-[11px] text-padaeng-muted">{branchName}</p>
            <p className="text-[10px] text-padaeng-muted">เลขที่บิล: {orderNumber}</p>
            <p className="text-[10px] text-padaeng-muted">
              {new Date().toLocaleString('th-TH')}
            </p>
          </div>

          {/* Purchased Items List */}
          <div className="space-y-1.5 border-b border-padaeng-border pb-2">
            {purchasedItems.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start">
                <span className="flex-1 font-medium pr-2">
                  {item.product.name} x{item.quantity}
                </span>
                <span className="font-bold">
                  ฿{(item.unitPrice * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Totals & Change */}
          <div className="space-y-1 pt-1 font-sans">
            <div className="flex justify-between text-padaeng-muted">
              <span>ยอดรวมสินค้า</span>
              <span>฿{getSubtotal().toLocaleString()}</span>
            </div>
            {getDiscountAmount() > 0 && (
              <div className="flex justify-between text-padaeng-red">
                <span>ส่วนลด</span>
                <span>-฿{getDiscountAmount().toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-extrabold text-sm text-padaeng-text pt-1 border-t border-padaeng-border">
              <span>สุทธิ</span>
              <span className="text-padaeng-red">฿{getGrandTotal().toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-padaeng-muted pt-1">
              <span>รับเงิน ({paymentLabel})</span>
              <span>฿{tendered.toLocaleString()}</span>
            </div>
            {paymentMethod === 'cash' && (
              <div className="flex justify-between text-padaeng-text font-bold">
                <span>เงินทอน</span>
                <span>฿{change.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={() => window.print()}
            className="border border-padaeng-border bg-white hover:bg-padaeng-surface text-padaeng-text font-bold py-3 rounded-xl flex items-center justify-center space-x-1.5 text-sm min-h-btn active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์ใบเสร็จ</span>
          </button>
          <button
            onClick={onNewOrder}
            className="bg-padaeng-red hover:bg-padaeng-red-hover text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-1.5 text-sm min-h-btn active:scale-95 shadow-md"
          >
            <RotateCcw className="w-4 h-4" />
            <span>ขายบิลถัดไป</span>
          </button>
        </div>
      </div>
    </div>
  );
}
