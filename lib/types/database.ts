export type BusinessType = 'restaurant' | 'cafe' | 'grocery' | 'retail' | 'food_truck';

export interface Profile {
  id: string;
  line_user_id?: string;
  display_name: string;
  picture_url?: string;
  phone_number?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface Store {
  id: string;
  name: string;
  business_type: BusinessType;
  logo_url?: string;
  tax_id?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface Branch {
  id: string;
  store_id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  is_main: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type RoleName = 'owner' | 'manager' | 'cashier' | 'staff';

export interface StoreMember {
  id: string;
  store_id: string;
  profile_id: string;
  role_id: string;
  branch_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  store_id: string;
  name: string;
  color_code: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  store_id: string;
  category_id?: string;
  name: string;
  sku?: string;
  barcode?: string;
  description?: string;
  image_url?: string;
  base_price: number;
  cost_price: number;
  is_active: boolean;
  track_inventory: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  store_id: string;
  product_id: string;
  variant_name: string;
  sku?: string;
  barcode?: string;
  price_adjustment: number;
  is_active: boolean;
  created_at: string;
}

export interface InventoryBalance {
  id: string;
  store_id: string;
  branch_id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  min_stock_alert: number;
  updated_at: string;
}

export type MovementType = 'sale' | 'refund' | 'adjustment' | 'received' | 'waste';

export interface StockMovement {
  id: string;
  store_id: string;
  branch_id: string;
  product_id: string;
  variant_id?: string;
  movement_type: MovementType;
  quantity_change: number;
  reference_id?: string;
  note?: string;
  created_by?: string;
  created_at: string;
}

export type OrderStatus = 'pending' | 'completed' | 'cancelled' | 'refunded';

export interface Order {
  id: string;
  store_id: string;
  branch_id: string;
  order_number: string;
  status: OrderStatus;
  customer_id?: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  grand_total: number;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id?: string;
  product_name: string;
  variant_name?: string;
  unit_price: number;
  unit_cost: number;
  quantity: number;
  total_price: number;
}

export type PaymentMethod = 'cash' | 'promptpay' | 'card';

export interface Payment {
  id: string;
  store_id: string;
  order_id: string;
  payment_method: PaymentMethod;
  amount: number;
  tendered_amount?: number;
  change_amount?: number;
  status: string;
  idempotency_key?: string;
  created_at: string;
}

export type DraftStatus = 'pending' | 'confirmed' | 'rejected';
export type DraftInputType = 'text' | 'voice' | 'image';

export interface CommandDraft {
  id: string;
  store_id: string;
  branch_id?: string;
  created_by?: string;
  intent: string;
  raw_input?: string;
  input_type: DraftInputType;
  draft_data: Record<string, unknown>;
  confidence_score: number;
  status: DraftStatus;
  created_at: string;
  confirmed_at?: string;
}

export interface AuditLog {
  id: string;
  store_id: string;
  actor_id?: string;
  action: string;
  target_entity: string;
  entity_id?: string;
  changes?: Record<string, unknown>;
  reason?: string;
  created_at: string;
}
