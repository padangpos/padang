'use client';

import { useState } from 'react';
import { usePosStore } from '@/lib/store/usePosStore';
import { Search, Plus, Image as ImageIcon } from 'lucide-react';
import { animateCartAdd } from '@/lib/animations/gsap';

export default function ProductGrid() {
  const { products, categories, addToCart } = usePosStore();
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter((product) => {
    const matchesCat = selectedCatId ? product.category_id === selectedCatId : true;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleProductTap = (product: typeof products[0], targetEl: HTMLElement | null) => {
    addToCart(product);
    animateCartAdd(targetEl);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-padaeng p-4 border border-padaeng-border">
      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-padaeng-muted" />
        <input
          type="text"
          placeholder="ค้นหาสินค้า / บาร์โค้ด..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-padaeng-border rounded-xl focus:outline-none focus:border-padaeng-red min-h-touch text-base"
        />
      </div>

      {/* Category Pills (Touch Target >= 44px) */}
      <div className="flex space-x-2 overflow-x-auto pb-3 mb-4 no-scrollbar">
        <button
          onClick={() => setSelectedCatId(null)}
          className={`px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap min-h-touch min-w-touch transition-colors ${
            selectedCatId === null
              ? 'bg-padaeng-red text-white font-bold'
              : 'bg-padaeng-surface text-padaeng-text border border-padaeng-border'
          }`}
        >
          ทั้งหมด ({products.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCatId(cat.id)}
            className={`px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap min-h-touch min-w-touch transition-colors ${
              selectedCatId === cat.id
                ? 'bg-padaeng-red text-white font-bold'
                : 'bg-padaeng-surface text-padaeng-text border border-padaeng-border'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Product Cards Grid (≤ 2 Taps to Cart with Product Images) */}
      {filteredProducts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 text-padaeng-muted">
          <p className="text-base font-semibold">ไม่พบสินค้า</p>
          <p className="text-xs text-padaeng-muted mt-1">ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่ใหม่</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto pr-1">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={(e) => handleProductTap(product, e.currentTarget)}
              className="group p-2.5 bg-padaeng-surface hover:bg-padaeng-red-light border border-padaeng-border hover:border-padaeng-red/30 rounded-padaeng flex flex-col justify-between cursor-pointer transition-all active:scale-95 min-h-[140px]"
            >
              <div>
                {/* Product Image Thumbnail */}
                <div className="w-full h-24 rounded-lg overflow-hidden bg-white border border-padaeng-border mb-2 relative">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-padaeng-muted bg-padaeng-surface">
                      <ImageIcon className="w-8 h-8 opacity-40" />
                    </div>
                  )}
                </div>

                <span className="text-[10px] text-padaeng-muted block mb-0.5">
                  {categories.find((c) => c.id === product.category_id)?.name || 'ทั่วไป'}
                </span>
                <h4 className="font-bold text-padaeng-text text-sm line-clamp-1 leading-snug">
                  {product.name}
                </h4>
              </div>

              <div className="flex items-center justify-between mt-2 pt-1 border-t border-padaeng-border/50">
                <span className="font-bold text-padaeng-red text-base">
                  ฿{product.base_price.toLocaleString()}
                </span>
                <span className="w-7 h-7 rounded-full bg-padaeng-red text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Plus className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
