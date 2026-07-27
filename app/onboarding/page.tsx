'use client';

import { useState } from 'react';
import useRouter from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, Sparkles, Store, ShoppingBag } from 'lucide-react';
import { usePosStore } from '@/lib/store/usePosStore';

export default function OnboardingPage() {
  const { addProduct } = usePosStore();
  const [step, setStep] = useState(1);

  // Form states
  const [storeNameInput, setStoreNameInput] = useState('ร้านกาแฟป้าแดง');
  const [businessType, setBusinessType] = useState<'cafe' | 'restaurant' | 'grocery' | 'retail' | 'food_truck'>('cafe');
  
  // Product state
  const [categoryName, setCategoryName] = useState('เครื่องดื่ม');
  const [productName, setProductName] = useState('เอสเพรสโซ ร้อน');
  const [productPrice, setProductPrice] = useState('45');

  const businessTypes = [
    { id: 'restaurant', title: 'ร้านอาหาร', desc: 'อาหารตามสั่ง, ก๋วยเตี๋ยว, อาหารจานเดียว' },
    { id: 'cafe', title: 'ร้านกาแฟ / คาเฟ่', desc: 'เครื่องดื่ม, เบเกอรี, ชานม' },
    { id: 'grocery', title: 'ร้านของชำ / โชห่วย', desc: 'ของใช้, มินิมาร์ท' },
    { id: 'retail', title: 'ร้านค้าปลีก', desc: 'เสื้อผ้า, ของฝาก, สินค้าทั่วไป' },
    { id: 'food_truck', title: 'Food Stall / Food Truck', desc: 'ร้านตลาดนัด, ซุ้มเครื่องดื่ม' },
  ];

  const handleCompleteSetup = () => {
    // Add first product to store
    if (productName && productPrice) {
      addProduct({
        id: `prod-${Date.now()}`,
        store_id: 'store-1',
        category_id: 'cat-1',
        name: productName,
        base_price: parseFloat(productPrice) || 0,
        cost_price: Math.round((parseFloat(productPrice) || 0) * 0.35),
        is_active: true,
        track_inventory: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    setStep(3);
  };

  return (
    <div className="min-h-screen bg-padaeng-surface flex flex-col justify-between p-4 max-w-md mx-auto font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between py-4 border-b border-padaeng-border mb-6">
          <Link
            href="/"
            className="w-10 h-10 rounded-xl bg-white border border-padaeng-border flex items-center justify-center text-padaeng-text touch-target"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-xs font-bold text-padaeng-red bg-padaeng-red-light px-3 py-1 rounded-full">
            ตั้งค่าร้านใหม่ (ขั้นตอน {step}/3)
          </span>
        </div>

        {/* Step 1: Store Basics */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-bold text-padaeng-text">ตั้งชื่อร้านค้าของคุณ</h2>
              <p className="text-xs text-padaeng-muted mt-1">ใช้เวลาตั้งค่าเพียงไม่เกิน 10 นาทีเพื่อเปิดขายบิลแรก</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-padaeng-text mb-1.5">ชื่อร้านค้า</label>
              <input
                type="text"
                value={storeNameInput}
                onChange={(e) => setStoreNameInput(e.target.value)}
                placeholder="เช่น ร้านกาแฟป้าแดง"
                className="w-full p-3.5 border border-padaeng-border rounded-xl text-base focus:outline-none focus:border-padaeng-red bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-padaeng-text mb-1.5">ประเภทธุรกิจร้านค้า</label>
              <div className="space-y-2">
                {businessTypes.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => setBusinessType(b.id as any)}
                    className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                      businessType === b.id
                        ? 'bg-padaeng-red-light border-padaeng-red text-padaeng-text'
                        : 'bg-white border-padaeng-border text-padaeng-text'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-sm">{b.title}</h4>
                      <p className="text-xs text-padaeng-muted">{b.desc}</p>
                    </div>
                    {businessType === b.id && (
                      <div className="w-6 h-6 rounded-full bg-padaeng-red text-white flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full bg-padaeng-red hover:bg-padaeng-red-hover text-white font-bold py-3.5 rounded-xl min-h-btn text-base shadow-md active:scale-95 transition-all mt-4"
            >
              ถัดไป (เพิ่มสินค้าแรก)
            </button>
          </div>
        )}

        {/* Step 2: Add First Product */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-bold text-padaeng-text">เพิ่มสินค้าแรกของร้าน</h2>
              <p className="text-xs text-padaeng-muted mt-1">สามารถแก้ไข หรือถ่ายรูปเมนูเพิ่มทีหลังได้ตลอดเวลา</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-padaeng-text mb-1.5">ชื่อหมวดหมู่</label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="เช่น เครื่องดื่ม"
                className="w-full p-3.5 border border-padaeng-border rounded-xl text-base focus:outline-none focus:border-padaeng-red bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-padaeng-text mb-1.5">ชื่อสินค้า</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="เช่น เอสเพรสโซ ร้อน"
                className="w-full p-3.5 border border-padaeng-border rounded-xl text-base focus:outline-none focus:border-padaeng-red bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-padaeng-text mb-1.5">ราคาขาย (บาท)</label>
              <input
                type="number"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                placeholder="45"
                className="w-full p-3.5 border border-padaeng-border rounded-xl text-base focus:outline-none focus:border-padaeng-red bg-white text-right font-bold"
              />
            </div>

            <button
              onClick={handleCompleteSetup}
              className="w-full bg-padaeng-red hover:bg-padaeng-red-hover text-white font-bold py-3.5 rounded-xl min-h-btn text-base shadow-md active:scale-95 transition-all mt-4"
            >
              บันทึกและทดลองทำบิลแรก
            </button>
          </div>
        )}

        {/* Step 3: Success & Launch */}
        {step === 3 && (
          <div className="text-center py-10 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 rounded-full bg-padaeng-red text-white flex items-center justify-center mx-auto text-3xl font-black shadow-lg">
              ป้า
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-padaeng-text">ร้านของคุณพร้อมเปิดขายแล้ว!</h2>
              <p className="text-xs text-padaeng-muted mt-1 max-w-xs mx-auto">
                ป้าจดสินค้าแรกเข้าสู่ระบบเรียบร้อย พร้อมสำหรับเปิดขายบิลแรกภายในหน้า POS
              </p>
            </div>

            <div className="p-4 bg-white border border-padaeng-border rounded-padaeng text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-padaeng-muted">ชื่อร้าน:</span>
                <span className="font-bold text-padaeng-text">{storeNameInput}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-padaeng-muted">สินค้าแรก:</span>
                <span className="font-bold text-padaeng-red">{productName} (฿{productPrice})</span>
              </div>
            </div>

            <Link
              href="/pos"
              className="w-full bg-padaeng-red hover:bg-padaeng-red-hover text-white font-bold py-4 rounded-xl min-h-btn text-base shadow-md block text-center active:scale-95 transition-all"
            >
              เข้าสู่หน้าขาย POS (ทำบิลแรก)
            </Link>
          </div>
        )}
      </div>

      <footer className="text-center py-4 text-xs text-padaeng-muted">
        ป้าแดง POS — ตั้งค่าง่าย เสร็จไว พร้อมขายจริง
      </footer>
    </div>
  );
}
