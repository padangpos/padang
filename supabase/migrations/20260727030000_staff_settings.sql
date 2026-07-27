-- Durable staff invitations and store settings.
CREATE TABLE IF NOT EXISTS staff_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL, phone_number TEXT NOT NULL, role_name TEXT NOT NULL CHECK (role_name IN ('owner','manager','cashier','staff')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','revoked')), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS store_settings (
  store_id UUID PRIMARY KEY REFERENCES stores(id) ON DELETE CASCADE,
  promptpay_id TEXT, receipt_footer TEXT, sound_enabled BOOLEAN NOT NULL DEFAULT TRUE, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE staff_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Store members staff invites access" ON staff_invites;
CREATE POLICY "Store members staff invites access" ON staff_invites FOR ALL USING (public.is_store_member(store_id));
DROP POLICY IF EXISTS "Store members settings access" ON store_settings;
CREATE POLICY "Store members settings access" ON store_settings FOR ALL USING (public.is_store_member(store_id));
