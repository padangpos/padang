import { create } from 'zustand';
import { Product, Category, PaymentMethod } from '../types/database';
import { calculateCartSubtotal, calculateDiscount, calculateTax, calculateGrandTotal, calculateChange } from '../pos/calculator';

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
}

export interface HeldBillItem {
  id: string;
  referenceName: string;
  items: CartItem[];
  createdAt: string;
  totalAmount: number;
}

interface PosState {
  // Store & Catalog
  storeName: string;
  branchName: string;
  categories: Category[];
  products: Product[];
  
  // Cart
  cart: CartItem[];
  discountType: 'fixed' | 'percent';
  discountValue: number;
  taxRate: number;
  isTaxInclusive: boolean;

  // Held Bills
  heldBills: HeldBillItem[];

  // Cart Actions
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setDiscount: (type: 'fixed' | 'percent', value: number) => void;

  // Held Bill Actions
  holdCurrentBill: (referenceName: string) => void;
  recallHeldBill: (billId: string) => void;
  deleteHeldBill: (billId: string) => void;

  // Catalog Actions
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  setCategories: (categories: Category[]) => void;

  // Calculations
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getTaxAmount: () => number;
  getGrandTotal: () => number;
  getChange: (tenderedAmount: number) => number;
}

const initialCategories: Category[] = [
  { id: 'cat-1', store_id: 'store-1', name: 'เครื่องดื่มร้อน', color_code: '#D72638', sort_order: 1, is_active: true, created_at: '', updated_at: '' },
  { id: 'cat-2', store_id: 'store-1', name: 'เครื่องดื่มเย็น', color_code: '#D72638', sort_order: 2, is_active: true, created_at: '', updated_at: '' },
  { id: 'cat-3', store_id: 'store-1', name: 'เบเกอรี & ขนม', color_code: '#D72638', sort_order: 3, is_active: true, created_at: '', updated_at: '' },
];

const initialProducts: Product[] = [
  {
    id: 'prod-1',
    store_id: 'store-1',
    category_id: 'cat-1',
    name: 'เอสเพรสโซ ร้อน',
    base_price: 45,
    cost_price: 15,
    image_url: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=300&q=80',
    is_active: true,
    track_inventory: true,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'prod-2',
    store_id: 'store-1',
    category_id: 'cat-2',
    name: 'ชาไทย เย็น',
    base_price: 50,
    cost_price: 18,
    image_url: 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=300&q=80',
    is_active: true,
    track_inventory: true,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'prod-3',
    store_id: 'store-1',
    category_id: 'cat-2',
    name: 'กาแฟลาเต้ เย็น',
    base_price: 60,
    cost_price: 22,
    image_url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300&q=80',
    is_active: true,
    track_inventory: true,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'prod-4',
    store_id: 'store-1',
    category_id: 'cat-3',
    name: 'ครัวซองต์เนยสด',
    base_price: 65,
    cost_price: 25,
    image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=300&q=80',
    is_active: true,
    track_inventory: true,
    created_at: '',
    updated_at: '',
  },
];

export const usePosStore = create<PosState>((set, get) => ({
  storeName: 'ร้านกาแฟป้าแดง (สาขาหลัก)',
  branchName: 'สาขาหลัก',
  categories: initialCategories,
  products: initialProducts,

  cart: [],
  discountType: 'fixed',
  discountValue: 0,
  taxRate: 7,
  isTaxInclusive: false,

  heldBills: [],

  addToCart: (product) => {
    const { cart } = get();
    const existing = cart.find(item => item.product.id === product.id);

    if (existing) {
      set({
        cart: cart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      });
    } else {
      set({
        cart: [...cart, { product, quantity: 1, unitPrice: product.base_price }],
      });
    }
  },

  removeFromCart: (productId) => {
    set({ cart: get().cart.filter(item => item.product.id !== productId) });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }
    set({
      cart: get().cart.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      ),
    });
  },

  clearCart: () => set({ cart: [], discountValue: 0 }),

  setDiscount: (type, value) => set({ discountType: type, discountValue: value }),

  holdCurrentBill: (referenceName) => {
    const { cart, getGrandTotal, heldBills, clearCart } = get();
    if (cart.length === 0) return;

    const newHeldBill: HeldBillItem = {
      id: `bill-${Date.now()}`,
      referenceName: referenceName || `บิลโต๊ะ/ลูกค้า ${heldBills.length + 1}`,
      items: [...cart],
      createdAt: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      totalAmount: getGrandTotal(),
    };

    set({ heldBills: [...heldBills, newHeldBill] });
    clearCart();
  },

  recallHeldBill: (billId) => {
    const { heldBills } = get();
    const target = heldBills.find(b => b.id === billId);
    if (!target) return;

    set({
      cart: target.items,
      heldBills: heldBills.filter(b => b.id !== billId),
    });
  },

  deleteHeldBill: (billId) => {
    set({ heldBills: get().heldBills.filter(b => b.id !== billId) });
  },

  setProducts: (products) => set({ products }),
  addProduct: (product) => set({ products: [product, ...get().products] }),
  setCategories: (categories) => set({ categories }),

  getSubtotal: () => calculateCartSubtotal(get().cart),

  getDiscountAmount: () => {
    const { getSubtotal, discountType, discountValue } = get();
    return calculateDiscount(getSubtotal(), discountType, discountValue);
  },

  getTaxAmount: () => {
    const { getSubtotal, getDiscountAmount, taxRate, isTaxInclusive } = get();
    const afterDiscount = getSubtotal() - getDiscountAmount();
    return calculateTax(afterDiscount, taxRate, isTaxInclusive);
  },

  getGrandTotal: () => {
    const { getSubtotal, getDiscountAmount, getTaxAmount, isTaxInclusive } = get();
    return calculateGrandTotal(getSubtotal(), getDiscountAmount(), getTaxAmount(), isTaxInclusive);
  },

  getChange: (tenderedAmount) => {
    return calculateChange(get().getGrandTotal(), tenderedAmount);
  },
}));
