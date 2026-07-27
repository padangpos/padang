'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePosStore } from '@/lib/store/usePosStore';
import { ArrowLeft, Plus, Camera, Search, Sparkles, X, Check, Image as ImageIcon, Upload } from 'lucide-react';
import { Product } from '@/lib/types/database';

export default function ProductsPage() {
  const { products, categories, addProduct, setProducts } = usePosStore();
  const [isLoading, setIsLoading] = useState(true);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    fetch('/api/products')
      .then(async (response) => {
        if (!response.ok) throw new Error('โหลดสินค้าไม่สำเร็จ');
        const payload = await response.json();
        setProducts(payload.products || []);
      })
      .catch(() => setSaveError('ยังโหลด Catalog จากฐานข้อมูลไม่ได้'))
      .finally(() => setIsLoading(false));
  }, [setProducts]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPhotoMenuModal, setShowPhotoMenuModal] = useState(false);

  // Add Product form state
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductCost, setNewProductCost] = useState('');
  const [newProductImageUrl, setNewProductImageUrl] = useState('');
  const [newProductCatId, setNewProductCatId] = useState(categories[0]?.id || 'cat-1');

  // Photo Menu Draft Items state
  const [draftItems, setDraftItems] = useState<{ name: string; price: number; imageUrl?: string; selected: boolean }[]>([
    { name: 'กาแฟอเมริกาโน ร้อน', price: 40, imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&q=80', selected: true },
    { name: 'คาปูชิโน เย็น', price: 55, imageUrl: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=300&q=80', selected: true },
    { name: 'ชาเขียวมัทฉะ เย็น', price: 60, imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=300&q=80', selected: true },
    { name: 'เค้กช็อกโกแลตหน้านิ่ม', price: 75, imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&q=80', selected: true },
  ]);

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCatId ? p.category_id === selectedCatId : true;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSaveProduct = async () => {
    if (!newProductName || !newProductPrice) return;
    setSaveError('');
    const response = await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newProductName, base_price: parseFloat(newProductPrice), cost_price: parseFloat(newProductCost) || 0, image_url: newProductImageUrl || undefined }) });
    const payload = await response.json();
    if (!response.ok) { setSaveError(payload.error || 'บันทึกสินค้าไม่สำเร็จ'); return; }
    addProduct(payload.product);
    setNewProductName('');
    setNewProductPrice('');
    setNewProductCost('');
    setNewProductImageUrl('');
    setShowAddModal(false);
  };

  const handleConfirmPhotoMenuDraft = () => {
    const selectedDrafts = draftItems.filter((item) => item.selected);
    selectedDrafts.forEach((item, idx) => {
      addProduct({
        id: `prod-draft-${Date.now()}-${idx}`,
        store_id: 'store-1',
        category_id: categories[0]?.id || 'cat-1',
        name: item.name,
        base_price: item.price,
        cost_price: Math.round(item.price * 0.35),
        image_url: item.imageUrl,
        is_active: true,
        track_inventory: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    });
    setShowPhotoMenuModal(false);
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
            <h1 className="font-bold text-base text-padaeng-text leading-tight">จัดการสินค้าและรูปเมนู</h1>
            <span className="text-xs text-padaeng-red font-semibold">รายการสินค้าทั้งหมด ({products.length})</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowPhotoMenuModal(true)}
            className="px-3 py-2 rounded-xl bg-padaeng-red-light border border-padaeng-red/30 text-xs font-bold text-padaeng-red flex items-center space-x-1 touch-target"
          >
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">ถ่ายรูปเมนู</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-2 rounded-xl bg-padaeng-red text-white text-xs font-bold flex items-center space-x-1 shadow-sm touch-target"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มสินค้า</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 max-w-4xl w-full mx-auto space-y-4">
        {saveError && <div className="rounded-xl border border-padaeng-red/30 bg-padaeng-red-light px-3 py-2 text-sm text-padaeng-red">{saveError}</div>}
        {/* Search & Category Filter */}
        <div className="bg-white p-3 rounded-padaeng border border-padaeng-border space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-padaeng-muted" />
            <input
              type="text"
              placeholder="ค้นหาชื่อสินค้า..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-padaeng-border rounded-xl text-sm focus:outline-none focus:border-padaeng-red"
            />
          </div>

          <div className="flex space-x-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedCatId(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                selectedCatId === null ? 'bg-padaeng-red text-white' : 'bg-padaeng-surface text-padaeng-text'
              }`}
            >
              ทั้งหมด ({products.length})
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCatId(c.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                  selectedCatId === c.id ? 'bg-padaeng-red text-white' : 'bg-padaeng-surface text-padaeng-text'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product List with Image Thumbnails */}
        <div className="bg-white rounded-padaeng border border-padaeng-border divide-y divide-padaeng-border">
          {isLoading ? <div className="p-6 text-center text-sm text-padaeng-muted">กำลังโหลด Catalog…</div> : filteredProducts.length === 0 ? <div className="p-6 text-center text-sm text-padaeng-muted">ยังไม่มีสินค้าใน Catalog — เพิ่มสินค้าเพื่อให้ Draft จาก LINE จับคู่ได้</div> : filteredProducts.map((p) => (
            <div key={p.id} className="p-3.5 flex items-center justify-between space-x-3">
              <div className="flex items-center space-x-3">
                {/* Image Thumbnail */}
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-padaeng-surface border border-padaeng-border shrink-0 flex items-center justify-center">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-padaeng-muted opacity-40" />
                  )}
                </div>

                <div>
                  <span className="text-[11px] text-padaeng-muted block">
                    {categories.find((c) => c.id === p.category_id)?.name || 'ทั่วไป'}
                  </span>
                  <h4 className="font-bold text-sm text-padaeng-text">{p.name}</h4>
                  <p className="text-xs text-padaeng-muted">ต้นทุน: ฿{p.cost_price.toLocaleString()}</p>
                </div>
              </div>

              <span className="font-extrabold text-padaeng-red text-base">
                ฿{p.base_price.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </main>

      {/* Add Product Modal with Image Input Field */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-padaeng max-w-sm w-full p-5 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-padaeng-border pb-2">
              <h3 className="font-bold text-lg text-padaeng-text">เพิ่มสินค้าใหม่</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-padaeng-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-padaeng-text mb-1">หมวดหมู่</label>
                <select
                  value={newProductCatId}
                  onChange={(e) => setNewProductCatId(e.target.value)}
                  className="w-full p-2.5 border border-padaeng-border rounded-xl text-sm focus:outline-none focus:border-padaeng-red bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-padaeng-text mb-1">ชื่อสินค้า</label>
                <input
                  type="text"
                  placeholder="เช่น กาแฟอเมริกาโน ร้อน"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full p-2.5 border border-padaeng-border rounded-xl text-sm focus:outline-none focus:border-padaeng-red"
                />
              </div>

              {/* Image Input Field */}
              <div>
                <label className="block font-bold text-padaeng-text mb-1">ลิงก์รูปภาพสินค้า (Image URL)</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="https://example.com/coffee.jpg"
                    value={newProductImageUrl}
                    onChange={(e) => setNewProductImageUrl(e.target.value)}
                    className="flex-1 p-2.5 border border-padaeng-border rounded-xl text-xs focus:outline-none focus:border-padaeng-red"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-padaeng-text mb-1">ราคาขาย (บาท)</label>
                  <input
                    type="number"
                    placeholder="50"
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    className="w-full p-2.5 border border-padaeng-border rounded-xl text-sm focus:outline-none focus:border-padaeng-red"
                  />
                </div>
                <div>
                  <label className="block font-bold text-padaeng-text mb-1">ราคาต้นทุน (บาท)</label>
                  <input
                    type="number"
                    placeholder="18"
                    value={newProductCost}
                    onChange={(e) => setNewProductCost(e.target.value)}
                    className="w-full p-2.5 border border-padaeng-border rounded-xl text-sm focus:outline-none focus:border-padaeng-red"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveProduct}
              className="w-full bg-padaeng-red hover:bg-padaeng-red-hover text-white font-bold py-3 rounded-xl text-sm min-h-btn shadow-md active:scale-95 transition-all"
            >
              บันทึกสินค้า
            </button>
          </div>
        </div>
      )}

      {/* Photo Menu Draft Importer Modal */}
      {showPhotoMenuModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-padaeng max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-padaeng-border pb-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-padaeng-red" />
                <h3 className="font-bold text-base text-padaeng-text">ป้าพบสินค้า 4 รายการจากรูปเมนู</h3>
              </div>
              <button onClick={() => setShowPhotoMenuModal(false)} className="p-1 text-padaeng-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-padaeng-muted">
              ป้าแปลงรูปภาพเป็นรายการร่าง (Draft) พร้อมรูปเมนูให้ตรวจและเลือกบันทึกเข้าสู่ร้านค้าได้เลย
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {draftItems.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    const next = [...draftItems];
                    next[idx].selected = !next[idx].selected;
                    setDraftItems(next);
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    item.selected
                      ? 'bg-padaeng-red-light border-padaeng-red/40 text-padaeng-text'
                      : 'bg-padaeng-surface border-padaeng-border text-padaeng-muted opacity-60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center border ${
                        item.selected ? 'bg-padaeng-red border-padaeng-red text-white' : 'border-padaeng-border bg-white'
                      }`}
                    >
                      {item.selected && <Check className="w-3.5 h-3.5" />}
                    </div>
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded-lg object-cover border border-padaeng-border" />
                    )}
                    <span className="font-bold text-sm">{item.name}</span>
                  </div>
                  <span className="font-bold text-padaeng-red text-sm">฿{item.price}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowPhotoMenuModal(false)}
                className="px-4 py-2 text-xs font-semibold text-padaeng-muted rounded-xl hover:bg-padaeng-surface"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmPhotoMenuDraft}
                className="px-5 py-2.5 text-xs font-bold bg-padaeng-red text-white rounded-xl hover:bg-padaeng-red-hover shadow-sm"
              >
                เพิ่มรายการที่เลือกเข้าสู่ร้าน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
