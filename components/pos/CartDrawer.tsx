'use client';

import { useState } from 'react';
import { usePosStore } from '@/lib/store/usePosStore';
import { Trash2, Plus, Minus, PauseCircle, CreditCard } from 'lucide-react';

interface CartDrawerProps {
  onProceedToPayment: () => void;
}

export default function CartDrawer({ onProceedToPayment }: CartDrawerProps) {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getSubtotal,
    getDiscountAmount,
    getGrandTotal,
    holdCurrentBill,
  } = usePosStore();

  const [holdNote, setHoldNote] = useState('');
  const [showHoldModal, setShowHoldModal] = useState(false);

  const handleConfirmHold = async () => {
    if (!cart.length) return;
    const response = await fetch('/api/held-bills', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ referenceName: holdNote || `บิลโต๊ะ/ลูกค้า`, items: cart, payload: { items: cart }, totalAmount: getGrandTotal() }) });
    if (!response.ok) { window.alert('บันทึกบิลพักไม่สำเร็จ'); return; }
    holdCurrentBill(holdNote);
    setHoldNote('');
    setShowHoldModal(false);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-padaeng p-4 border border-padaeng-border">
      {/* Cart Header */}
      <div className="flex items-center justify-between border-b border-padaeng-border pb-3 mb-3">
        <div>
          <h3 className="font-bold text-lg text-padaeng-text">ตะกร้าสินค้า</h3>
          <span className="text-xs text-padaeng-muted">{cart.length} รายการ</span>
        </div>
        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-padaeng-muted hover:text-padaeng-red flex items-center space-x-1 p-2 touch-target"
          >
            <Trash2 className="w-4 h-4" />
            <span>ล้างตะกร้า</span>
          </button>
        )}
      </div>

      {/* Cart Items List */}
      {cart.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 text-padaeng-muted text-center">
          <div className="w-16 h-16 rounded-full bg-padaeng-surface flex items-center justify-center mb-3">
            <span className="text-2xl">🛒</span>
          </div>
          <p className="text-sm font-semibold">ตะกร้ายังว่างอยู่</p>
          <p className="text-xs text-padaeng-muted mt-1">กดเลือกสินค้าจากเมนูด้านซ้ายเพื่อเริ่มขายได้เลย</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-4">
          {cart.map((item) => (
            <div
              key={item.product.id}
              className="p-3 bg-padaeng-surface border border-padaeng-border rounded-xl flex items-center justify-between"
            >
              <div className="flex-1 pr-2">
                <h5 className="font-bold text-sm text-padaeng-text leading-snug">
                  {item.product.name}
                </h5>
                <span className="text-xs text-padaeng-red font-semibold">
                  ฿{item.unitPrice.toLocaleString()}
                </span>
              </div>

              {/* Quantity Selector Controls (Touch Target >= 44px) */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  className="w-9 h-9 rounded-lg bg-white border border-padaeng-border flex items-center justify-center font-bold text-padaeng-text active:scale-95 touch-target"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  className="w-9 h-9 rounded-lg bg-white border border-padaeng-border flex items-center justify-center font-bold text-padaeng-text active:scale-95 touch-target"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cart Summary & Actions */}
      <div className="border-t border-padaeng-border pt-3 mt-auto">
        <div className="space-y-1.5 text-sm mb-3">
          <div className="flex justify-between text-padaeng-muted">
            <span>ยอดรวมสินค้า</span>
            <span>฿{getSubtotal().toLocaleString()}</span>
          </div>
          {getDiscountAmount() > 0 && (
            <div className="flex justify-between text-padaeng-red font-medium">
              <span>ส่วนลด</span>
              <span>-฿{getDiscountAmount().toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-extrabold text-padaeng-text pt-1 border-t border-dashed border-padaeng-border">
            <span>ยอดรวมสุทธิ</span>
            <span className="text-padaeng-red">฿{getGrandTotal().toLocaleString()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button
            disabled={cart.length === 0}
            onClick={() => setShowHoldModal(true)}
            className="col-span-1 border border-padaeng-border bg-white hover:bg-padaeng-surface text-padaeng-text disabled:opacity-40 font-bold py-3 rounded-xl flex items-center justify-center space-x-1 min-h-btn active:scale-95 transition-all text-xs sm:text-sm"
          >
            <PauseCircle className="w-4 h-4" />
            <span>พักบิล</span>
          </button>

          <button
            disabled={cart.length === 0}
            onClick={onProceedToPayment}
            className="col-span-2 bg-padaeng-red hover:bg-padaeng-red-hover text-white disabled:opacity-40 font-bold py-3 rounded-xl flex items-center justify-center space-x-2 min-h-btn active:scale-95 transition-all text-base shadow-md"
          >
            <CreditCard className="w-5 h-5" />
            <span>ชำระเงิน (฿{getGrandTotal().toLocaleString()})</span>
          </button>
        </div>
      </div>

      {/* Hold Bill Modal */}
      {showHoldModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-padaeng max-w-sm w-full p-5 space-y-4">
            <h3 className="font-bold text-lg text-padaeng-text">พักบิลรายการนี้</h3>
            <p className="text-xs text-padaeng-muted">
              ใส่ชื่อลูกค้า หรือเลขโต๊ะเพื่อเรียกคืนบิลภายหลัง
            </p>
            <input
              type="text"
              placeholder="เช่น โต๊ะ 5 หรือ คุณสมชาย"
              value={holdNote}
              onChange={(e) => setHoldNote(e.target.value)}
              className="w-full p-3 border border-padaeng-border rounded-xl text-sm focus:outline-none focus:border-padaeng-red"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowHoldModal(false)}
                className="px-4 py-2 text-sm font-semibold text-padaeng-muted rounded-xl hover:bg-padaeng-surface"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmHold}
                className="px-5 py-2 text-sm font-bold bg-padaeng-red text-white rounded-xl hover:bg-padaeng-red-hover"
              >
                ยืนยันพักบิล
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
