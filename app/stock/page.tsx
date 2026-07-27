'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePosStore } from '@/lib/store/usePosStore';
import { ArrowLeft, Package, Plus, Search, AlertTriangle, History, X, Check } from 'lucide-react';
import { recordAuditLog } from '@/lib/audit/logger';

export default function StockPage() {
  const { products, categories } = usePosStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'low'>('all');

  // Stock Balances Local State
  const [stockMap, setStockMap] = useState<Record<string, number>>({
    'prod-1': 85,
    'prod-2': 40,
    'prod-3': 12,
    'prod-4': 3, // Low stock!
  });

  // Movement Logs State
  const [movements, setMovements] = useState<
    { id: string; productName: string; type: string; change: number; note: string; time: string }[]
  >([
    { id: 'm-1', productName: 'ครัวซองต์เนยสด', type: 'waste', change: -2, note: 'ขนมหมดอายุ', time: '10:30 น.' },
    { id: 'm-2', productName: 'เอสเพรสโซ ร้อน', type: 'received', change: 50, note: 'รับเมล็ดกาแฟเข้าสต๊อก', time: '09:00 น.' },
  ]);

  // Adjust Modal State
  const [selectedProd, setSelectedProd] = useState<typeof products[0] | null>(null);
  const [adjustType, setAdjustType] = useState<'received' | 'waste' | 'adjustment'>('received');
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustNote, setAdjustNote] = useState('');

  const filteredProducts = products.filter((p) => {
    const qty = stockMap[p.id] ?? 50;
    const isLow = qty <= 5;
    const matchesFilter = filterStatus === 'low' ? isLow : true;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleSaveStockAdjust = () => {
    if (!selectedProd || !adjustQty) return;
    const qtyNum = parseInt(adjustQty, 10) || 0;
    const change = adjustType === 'waste' ? -Math.abs(qtyNum) : Math.abs(qtyNum);
    const currentQty = stockMap[selectedProd.id] ?? 50;
    const newQty = Math.max(0, currentQty + change);

    // Update stock balance
    setStockMap((prev) => ({ ...prev, [selectedProd.id]: newQty }));

    // Add Stock Movement Log
    const newLog = {
      id: `m-${Date.now()}`,
      productName: selectedProd.name,
      type: adjustType,
      change,
      note: adjustNote || (adjustType === 'received' ? 'รับสินค้าเข้า' : adjustType === 'waste' ? 'สินค้าเสียหาย' : 'ปรับปรุงสต๊อก'),
      time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    };
    setMovements([newLog, ...movements]);

    // Record Audit Log
    recordAuditLog('store-1', 'adjust_stock', 'product', selectedProd.id, {
      productName: selectedProd.name,
      previousQty: currentQty,
      newQty,
      change,
      reason: adjustNote,
    });

    setSelectedProd(null);
    setAdjustQty('');
    setAdjustNote('');
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
            <h1 className="font-bold text-base text-padaeng-text leading-tight">จัดการสต๊อกสินค้า</h1>
            <span className="text-xs text-padaeng-red font-semibold">ยอดคงเหลือและประวัติการตัดสต๊อก</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 max-w-4xl w-full mx-auto space-y-4">
        {/* Controls Bar */}
        <div className="bg-white p-3 rounded-padaeng border border-padaeng-border space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-padaeng-muted" />
            <input
              type="text"
              placeholder="ค้นหาชื่อสินค้าในสต๊อก..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-padaeng-border rounded-xl text-sm focus:outline-none focus:border-padaeng-red"
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                filterStatus === 'all' ? 'bg-padaeng-red text-white' : 'bg-padaeng-surface text-padaeng-text'
              }`}
            >
              สินค้าทั้งหมด ({products.length})
            </button>
            <button
              onClick={() => setFilterStatus('low')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 ${
                filterStatus === 'low' ? 'bg-padaeng-red text-white' : 'bg-padaeng-surface text-padaeng-text'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>ของใกล้หมด</span>
            </button>
          </div>
        </div>

        {/* Stock Balance List */}
        <div className="bg-white rounded-padaeng border border-padaeng-border divide-y divide-padaeng-border">
          {filteredProducts.map((p) => {
            const qty = stockMap[p.id] ?? 50;
            const isLow = qty <= 5;
            return (
              <div key={p.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-sm text-padaeng-text">{p.name}</h4>
                    {isLow && (
                      <span className="bg-padaeng-red-light text-padaeng-red text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>ของใกล้หมด</span>
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-padaeng-muted">
                    หมวด: {categories.find((c) => c.id === p.category_id)?.name || 'ทั่วไป'}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <span className="font-extrabold text-base text-padaeng-text block">
                      {qty} ชิ้น
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedProd(p)}
                    className="px-3 py-1.5 bg-padaeng-surface hover:bg-padaeng-red-light border border-padaeng-border text-xs font-bold text-padaeng-text rounded-xl touch-target"
                  >
                    ปรับสต๊อก
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Stock Movement Ledger */}
        <div className="bg-white p-4 rounded-padaeng border border-padaeng-border space-y-3">
          <div className="flex items-center space-x-2 border-b border-padaeng-border pb-2">
            <History className="w-4 h-4 text-padaeng-red" />
            <h3 className="font-bold text-sm text-padaeng-text">ประวัติการปรับยอดและตัดสต๊อกล่าสุด</h3>
          </div>
          <div className="space-y-2 text-xs">
            {movements.map((m) => (
              <div key={m.id} className="flex justify-between items-center bg-padaeng-surface p-2.5 rounded-xl">
                <div>
                  <span className="font-bold text-padaeng-text block">{m.productName}</span>
                  <span className="text-[11px] text-padaeng-muted">{m.note} • {m.time}</span>
                </div>
                <span className={`font-bold ${m.change > 0 ? 'text-green-600' : 'text-padaeng-red'}`}>
                  {m.change > 0 ? `+${m.change}` : m.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Adjust Stock Modal */}
      {selectedProd && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-padaeng max-w-sm w-full p-5 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-padaeng-border pb-2">
              <div>
                <h3 className="font-bold text-base text-padaeng-text">ปรับยอดสต๊อก</h3>
                <span className="text-xs text-padaeng-red font-bold">{selectedProd.name}</span>
              </div>
              <button onClick={() => setSelectedProd(null)} className="p-1 text-padaeng-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-padaeng-text mb-1">ประเภทการปรับยอด</label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value as any)}
                  className="w-full p-2.5 border border-padaeng-border rounded-xl text-sm focus:outline-none focus:border-padaeng-red bg-white font-medium"
                >
                  <option value="received">📦 รับสินค้าเข้า (+)</option>
                  <option value="waste">🗑️ ของเสีย / หมดอายุ (-)</option>
                  <option value="adjustment">✏️ ปรับปรุงยอดนับจริง</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-padaeng-text mb-1">จำนวนที่ต้องการปรับ</label>
                <input
                  type="number"
                  placeholder="เช่น 10"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  className="w-full p-2.5 border border-padaeng-border rounded-xl text-sm focus:outline-none focus:border-padaeng-red text-right font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-padaeng-text mb-1">เหตุผล / หมายเหตุ</label>
                <input
                  type="text"
                  placeholder="เช่น สั่งของล็อตใหม่เข้ามาเพิ่ม"
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  className="w-full p-2.5 border border-padaeng-border rounded-xl text-sm focus:outline-none focus:border-padaeng-red"
                />
              </div>
            </div>

            <button
              onClick={handleSaveStockAdjust}
              className="w-full bg-padaeng-red hover:bg-padaeng-red-hover text-white font-bold py-3 rounded-xl text-sm min-h-btn shadow-md active:scale-95 transition-all"
            >
              บันทึกและสร้าง Stock Movement
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
