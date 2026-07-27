'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePosStore, CartItem } from '@/lib/store/usePosStore';
import { PaymentMethod } from '@/lib/types/database';
import ProductGrid from '@/components/pos/ProductGrid';
import CartDrawer from '@/components/pos/CartDrawer';
import PaymentModal from '@/components/pos/PaymentModal';
import ReceiptModal from '@/components/pos/ReceiptModal';
import QuickSaleModal from '@/components/pos/QuickSaleModal';
import BrandLogo from '@/components/brand/BrandLogo';
import { ShoppingBag, ArrowLeft, PauseCircle, Package, Calculator } from 'lucide-react';
import { recordAuditLog } from '@/lib/audit/logger';

export default function PosPage() {
  const { storeName, cart, getGrandTotal, clearCart, heldBills, setProducts } = usePosStore();

  useEffect(() => {
    fetch('/api/products')
      .then(async (response) => {
        if (!response.ok) throw new Error('Catalog load failed');
        const payload = await response.json();
        setProducts(payload.products || []);
      })
      .catch(() => {
        // ProductGrid already renders a clear empty state when Catalog is unavailable.
      });
  }, [setProducts]);

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [isQuickSaleOpen, setIsQuickSaleOpen] = useState(false);

  // Active receipt data state
  const [receiptData, setReceiptData] = useState<{
    orderNumber: string;
    paymentMethod: PaymentMethod;
    tendered: number;
    change: number;
    purchasedItems: CartItem[];
  }>({
    orderNumber: '',
    paymentMethod: 'cash',
    tendered: 0,
    change: 0,
    purchasedItems: [],
  });

  const handlePaymentSuccess = (data: {
    orderNumber: string;
    paymentMethod: PaymentMethod;
    tendered: number;
    change: number;
  }) => {
    // Record audit log for completed sale
    recordAuditLog(
      'store-1',
      'complete_sale',
      'order',
      data.orderNumber,
      { total: getGrandTotal(), paymentMethod: data.paymentMethod },
      'Sales transaction completed successfully'
    );

    setReceiptData({
      ...data,
      purchasedItems: [...cart],
    });
    setIsPaymentOpen(false);
    setIsMobileCartOpen(false);
    setIsReceiptOpen(true);
  };

  const handleNewOrder = () => {
    setIsReceiptOpen(false);
    clearCart();
  };

  return (
    <div className="min-h-screen bg-padaeng-surface flex flex-col font-sans">
      {/* Top Header Navigation */}
      <header className="bg-white border-b border-padaeng-border px-4 py-3 sticky top-0 z-30 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="w-10 h-10 rounded-xl bg-padaeng-surface hover:bg-padaeng-red-light border border-padaeng-border flex items-center justify-center text-padaeng-text touch-target"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <BrandLogo variant="mark" className="w-10 h-10 rounded-lg" priority />
          <div>
            <h1 className="font-bold text-base text-padaeng-text leading-tight">{storeName}</h1>
            <span className="text-xs text-padaeng-red font-semibold">หน้าขาย POS</span>
          </div>
        </div>

        {/* Quick Nav Shortcut Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsQuickSaleOpen(true)}
            className="px-3 py-2 rounded-xl bg-padaeng-red-light border border-padaeng-red/30 text-xs font-bold text-padaeng-red flex items-center space-x-1 touch-target"
          >
            <Calculator className="w-4 h-4" />
            <span className="hidden sm:inline">ขายด่วน Numpad</span>
          </button>
          <Link
            href="/held-bills"
            className="px-3 py-2 rounded-xl bg-padaeng-surface hover:bg-padaeng-red-light border border-padaeng-border text-xs font-bold text-padaeng-text flex items-center space-x-1 touch-target"
          >
            <PauseCircle className="w-4 h-4 text-padaeng-red" />
            <span className="hidden sm:inline">บิลพัก ({heldBills.length})</span>
          </Link>
          <Link
            href="/products"
            className="px-3 py-2 rounded-xl bg-padaeng-surface hover:bg-padaeng-red-light border border-padaeng-border text-xs font-bold text-padaeng-text flex items-center space-x-1 touch-target"
          >
            <Package className="w-4 h-4 text-padaeng-red" />
            <span className="hidden sm:inline">สินค้า</span>
          </Link>
        </div>
      </header>

      {/* Main Responsive Grid Layout */}
      <div className="flex-1 p-3 sm:p-4 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Side: Product Selection Grid (65% width on desktop) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col h-[calc(100vh-140px)]">
          <ProductGrid />
        </div>

        {/* Right Side: Cart Drawer (35% width on desktop) */}
        <div className="hidden lg:block lg:col-span-5 xl:col-span-4 h-[calc(100vh-140px)]">
          <CartDrawer onProceedToPayment={() => setIsPaymentOpen(true)} />
        </div>
      </div>

      {/* Mobile Floating Cart Trigger Bar (Mobile-First) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-padaeng-border shadow-lg z-20 flex items-center justify-between">
        <button
          onClick={() => setIsMobileCartOpen(true)}
          className="flex items-center space-x-2 text-padaeng-text font-bold text-sm touch-target"
        >
          <div className="relative">
            <ShoppingBag className="w-6 h-6 text-padaeng-red" />
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-padaeng-red text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {cart.length}
              </span>
            )}
          </div>
          <span>ดูตะกร้า ({cart.length})</span>
        </button>

        <button
          disabled={cart.length === 0}
          onClick={() => setIsPaymentOpen(true)}
          className="bg-padaeng-red hover:bg-padaeng-red-hover text-white disabled:opacity-40 font-bold px-6 py-3 rounded-xl min-h-btn text-base shadow-md active:scale-95 transition-all"
        >
          ชำระเงิน (฿{getGrandTotal().toLocaleString()})
        </button>
      </div>

      {/* Mobile Cart Full-Height Drawer Modal */}
      {isMobileCartOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-50 flex flex-col justify-end">
          <div className="bg-white rounded-t-padaeng h-[85vh] p-4 flex flex-col relative animate-in slide-in-from-bottom duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-padaeng-border mb-2">
              <h3 className="font-bold text-lg text-padaeng-text">ตะกร้าสินค้า</h3>
              <button
                onClick={() => setIsMobileCartOpen(false)}
                className="text-xs font-bold text-padaeng-muted px-3 py-1.5 bg-padaeng-surface rounded-lg"
              >
                ปิด [X]
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <CartDrawer onProceedToPayment={() => setIsPaymentOpen(true)} />
            </div>
          </div>
        </div>
      )}

      {/* Quick Sale Numpad Modal */}
      <QuickSaleModal
        isOpen={isQuickSaleOpen}
        onClose={() => setIsQuickSaleOpen(false)}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        orderNumber={receiptData.orderNumber}
        paymentMethod={receiptData.paymentMethod}
        tendered={receiptData.tendered}
        change={receiptData.change}
        purchasedItems={receiptData.purchasedItems}
        onNewOrder={handleNewOrder}
      />
    </div>
  );
}
