'use client';

import { useState } from 'react';
import { usePosStore } from '@/lib/store/usePosStore';
import { Calculator, X, Plus } from 'lucide-react';

interface QuickSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickSaleModal({ isOpen, onClose }: QuickSaleModalProps) {
  const { addProduct } = usePosStore();
  const [amountInput, setAmountInput] = useState('');
  const [titleInput, setTitleInput] = useState('สินค้าขายด่วน');

  if (!isOpen) return null;

  const handleAddQuickSale = () => {
    const amount = parseFloat(amountInput);
    if (!amount || amount <= 0) return;

    addProduct({
      id: `prod-quick-${Date.now()}`,
      store_id: 'store-1',
      category_id: 'cat-1',
      name: titleInput || 'สินค้าขายด่วน',
      base_price: amount,
      cost_price: Math.round(amount * 0.4),
      is_active: true,
      track_inventory: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    setAmountInput('');
    onClose();
  };

  const handleNumpadKey = (val: string) => {
    if (val === 'C') {
      setAmountInput('');
    } else if (val === 'backspace') {
      setAmountInput(prev => prev.slice(0, -1));
    } else {
      setAmountInput(prev => prev + val);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-padaeng max-w-xs w-full p-5 space-y-4 shadow-xl">
        <div className="flex justify-between items-center border-b border-padaeng-border pb-2">
          <div className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-padaeng-red" />
            <h3 className="font-bold text-base text-padaeng-text">ขายด่วนตามราคา (Quick Sale)</h3>
          </div>
          <button onClick={onClose} className="p-1 text-padaeng-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          <input
            type="text"
            placeholder="ชื่อรายการ (ระบุได้)"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            className="w-full p-2 border border-padaeng-border rounded-xl text-xs focus:outline-none focus:border-padaeng-red"
          />
          <div className="bg-padaeng-surface border border-padaeng-border rounded-xl p-3 text-right">
            <span className="text-2xl font-black text-padaeng-red">
              ฿{amountInput || '0'}
            </span>
          </div>
        </div>

        {/* Interactive Touch Numpad */}
        <div className="grid grid-cols-3 gap-1.5 text-lg font-bold">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '00'].map((key) => (
            <button
              key={key}
              onClick={() => handleNumpadKey(key)}
              className="py-3 bg-padaeng-surface hover:bg-padaeng-red-light border border-padaeng-border rounded-xl active:scale-95 text-padaeng-text touch-target"
            >
              {key}
            </button>
          ))}
        </div>

        <button
          disabled={!amountInput || parseFloat(amountInput) <= 0}
          onClick={handleAddQuickSale}
          className="w-full bg-padaeng-red hover:bg-padaeng-red-hover text-white disabled:opacity-40 font-bold py-3 rounded-xl text-sm min-h-btn shadow-md active:scale-95 transition-all flex items-center justify-center space-x-1"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มลงตะกร้า (฿{amountInput || '0'})</span>
        </button>
      </div>
    </div>
  );
}
