-- PaDaeng POS Phase 4-5 durable schema.
-- Applied to the project SQL editor on 2026-07-27.
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  points_delta INTEGER NOT NULL CHECK (points_delta <> 0),
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  code TEXT NOT NULL, name TEXT NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent','fixed')),
  discount_value NUMERIC(12,2) NOT NULL CHECK (discount_value > 0),
  min_order_amount NUMERIC(12,2) NOT NULL DEFAULT 0, is_active BOOLEAN NOT NULL DEFAULT TRUE,
  starts_at TIMESTAMPTZ, ends_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(store_id, code)
);
CREATE TABLE IF NOT EXISTS stock_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  from_branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  to_branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity NUMERIC(12,3) NOT NULL CHECK (quantity > 0),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending','completed','cancelled')),
  idempotency_key TEXT NOT NULL UNIQUE, note TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (from_branch_id <> to_branch_id)
);
CREATE TABLE IF NOT EXISTS catalog_sync_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  source_branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL DEFAULT 'upsert', payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_sync_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Store members loyalty transactions access" ON loyalty_transactions;
CREATE POLICY "Store members loyalty transactions access" ON loyalty_transactions FOR ALL USING (public.is_store_member(store_id));
DROP POLICY IF EXISTS "Store members coupons access" ON coupons;
CREATE POLICY "Store members coupons access" ON coupons FOR ALL USING (public.is_store_member(store_id));
DROP POLICY IF EXISTS "Store members stock transfers access" ON stock_transfers;
CREATE POLICY "Store members stock transfers access" ON stock_transfers FOR ALL USING (public.is_store_member(store_id));
DROP POLICY IF EXISTS "Store members catalog sync access" ON catalog_sync_events;
CREATE POLICY "Store members catalog sync access" ON catalog_sync_events FOR ALL USING (public.is_store_member(store_id));
CREATE INDEX IF NOT EXISTS loyalty_transactions_customer_created_idx ON loyalty_transactions(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS stock_transfers_store_created_idx ON stock_transfers(store_id, created_at DESC);
CREATE INDEX IF NOT EXISTS catalog_sync_events_product_created_idx ON catalog_sync_events(product_id, created_at DESC);
