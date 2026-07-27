-- Phase 2 durable operations tables. Run after 20260726000000_phase0_init.sql.
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  category TEXT NOT NULL DEFAULT 'other',
  receipt_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  opening_cash NUMERIC(12,2) NOT NULL DEFAULT 0,
  closing_cash NUMERIC(12,2),
  status TEXT NOT NULL DEFAULT 'open'
);
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  line_user_id TEXT,
  display_name TEXT NOT NULL,
  phone_number TEXT,
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(store_id, line_user_id)
);
ALTER TABLE inventory_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Store members inventory balances access" ON inventory_balances;
CREATE POLICY "Store members inventory balances access" ON inventory_balances FOR ALL USING (public.is_store_member(store_id));
DROP POLICY IF EXISTS "Store members expenses access" ON expenses;
CREATE POLICY "Store members expenses access" ON expenses FOR ALL USING (public.is_store_member(store_id));
DROP POLICY IF EXISTS "Store members shifts access" ON shifts;
CREATE POLICY "Store members shifts access" ON shifts FOR ALL USING (public.is_store_member(store_id));
DROP POLICY IF EXISTS "Store members customers access" ON customers;
CREATE POLICY "Store members customers access" ON customers FOR ALL USING (public.is_store_member(store_id));
