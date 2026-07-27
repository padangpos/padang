import { createClient } from '@supabase/supabase-js';

const storeId = process.env.PADAENG_STORE_ID || '00000000-0000-0000-0000-000000000001';
const branchId = process.env.PADAENG_BRANCH_ID || '00000000-0000-0000-0000-000000000002';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const admin = url && key ? createClient(url, key) : null;

export type ExpenseRecord = { id: string; title: string; amount: number; category: string; receipt_url?: string; created_at: string };
export type CustomerRecord = { id: string; display_name: string; phone_number?: string; points: number; created_at: string };
export type BranchRecord = { id: string; name: string; code: string; address?: string; is_main: boolean; is_active: boolean };
export type HeldBillRecord = { id: string; reference_name: string; payload: Record<string, unknown>; total_amount: number; created_at: string };

async function ensureTenant() {
  if (!admin) return;
  await admin.from('stores').upsert({ id: storeId, name: 'PaDaeng POS', business_type: 'retail' });
  await admin.from('branches').upsert({ id: branchId, store_id: storeId, name: 'สาขาหลัก', code: 'MAIN', is_main: true });
}

export async function recordServerAudit(action: string, targetEntity: string, entityId: string | null, changes: Record<string, unknown>, reason?: string) {
  if (!admin) return;
  const { error } = await admin.from('audit_logs').insert({ store_id: storeId, action, target_entity: targetEntity, entity_id: entityId, changes, reason: reason || null });
  if (error) throw error;
}

export async function listExpenses(): Promise<ExpenseRecord[]> {
  if (!admin) return [];
  const { data, error } = await admin.from('expenses').select('id,title,amount,category,receipt_url,created_at').eq('store_id', storeId).eq('branch_id', branchId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((row) => ({ ...row, amount: Number(row.amount) })) as ExpenseRecord[];
}

export async function createExpense(input: { title: string; amount: number; category: string; receiptUrl?: string }) {
  if (!admin) throw new Error('Supabase server configuration is missing');
  await ensureTenant();
  const { data, error } = await admin.from('expenses').insert({ store_id: storeId, branch_id: branchId, title: input.title.trim(), amount: input.amount, category: input.category, receipt_url: input.receiptUrl || null }).select('id,title,amount,category,receipt_url,created_at').single();
  if (error || !data) throw error || new Error('Expense insert returned no data');
  await recordServerAudit('create_expense', 'expense', String(data.id), { title: input.title, amount: input.amount, category: input.category });
  return { ...data, amount: Number(data.amount) } as ExpenseRecord;
}

export async function getCurrentShift() {
  if (!admin) return null;
  const { data, error } = await admin.from('shifts').select('*').eq('store_id', storeId).eq('branch_id', branchId).eq('status', 'open').order('opened_at', { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return data;
}

export async function openShift(openingCash: number) {
  if (!admin) throw new Error('Supabase server configuration is missing');
  await ensureTenant();
  const current = await getCurrentShift();
  if (current) return current;
  const { data, error } = await admin.from('shifts').insert({ store_id: storeId, branch_id: branchId, opening_cash: openingCash, status: 'open' }).select('*').single();
  if (error || !data) throw error || new Error('Shift insert returned no data');
  await recordServerAudit('open_shift', 'shift', String(data.id), { openingCash });
  return data;
}

export async function closeShift(id: string, closingCash: number) {
  if (!admin) throw new Error('Supabase server configuration is missing');
  const { data, error } = await admin.from('shifts').update({ closing_cash: closingCash, closed_at: new Date().toISOString(), status: 'closed' }).eq('id', id).eq('status', 'open').select('*').single();
  if (error || !data) throw error || new Error('Shift close returned no data');
  await recordServerAudit('close_shift', 'shift', String(data.id), { closingCash });
  return data;
}

export async function listCustomers(): Promise<CustomerRecord[]> {
  if (!admin) return [];
  const { data, error } = await admin.from('customers').select('id,display_name,phone_number,points,created_at').eq('store_id', storeId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((row) => ({ ...row, points: Number(row.points) })) as CustomerRecord[];
}

export async function createCustomer(input: { displayName: string; phoneNumber?: string }) {
  if (!admin) throw new Error('Supabase server configuration is missing');
  await ensureTenant();
  const { data, error } = await admin.from('customers').insert({ store_id: storeId, display_name: input.displayName.trim(), phone_number: input.phoneNumber || null, points: 10 }).select('id,display_name,phone_number,points,created_at').single();
  if (error || !data) throw error || new Error('Customer insert returned no data');
  await recordServerAudit('create_customer', 'customer', String(data.id), { displayName: input.displayName });
  return { ...data, points: Number(data.points) } as CustomerRecord;
}

export async function adjustCustomerPoints(id: string, amount: number) {
  if (!admin) throw new Error('Supabase server configuration is missing');
  const { data: current, error: readError } = await admin.from('customers').select('points').eq('id', id).eq('store_id', storeId).single();
  if (readError || !current) throw readError || new Error('Customer not found');
  const next = Math.max(0, Number(current.points) + amount);
  if (!amount) throw new Error('Points adjustment must not be zero');
  const { error: ledgerError } = await admin.from('loyalty_transactions').insert({ store_id: storeId, customer_id: id, points_delta: amount, reason: 'manual_adjustment' });
  if (ledgerError) throw ledgerError;
  const { data, error } = await admin.from('customers').update({ points: next }).eq('id', id).eq('store_id', storeId).select('id,display_name,phone_number,points,created_at').single();
  if (error || !data) throw error || new Error('Customer update returned no data');
  await recordServerAudit('adjust_points', 'customer', String(data.id), { amount, points: data.points });
  return { ...data, points: Number(data.points) } as CustomerRecord;
}

export async function listBranches(): Promise<BranchRecord[]> {
  if (!admin) return [];
  await ensureTenant();
  const { data, error } = await admin.from('branches').select('id,name,code,address,is_main,is_active').eq('store_id', storeId).order('is_main', { ascending: false }).order('name');
  if (error) throw error;
  return (data || []) as BranchRecord[];
}

export async function createBranch(input: { name: string; code: string; address?: string }) {
  if (!admin) throw new Error('Supabase server configuration is missing');
  await ensureTenant();
  const { data, error } = await admin.from('branches').insert({ store_id: storeId, name: input.name.trim(), code: input.code.trim().toUpperCase(), address: input.address || null, is_main: false, is_active: true }).select('id,name,code,address,is_main,is_active').single();
  if (error || !data) throw error || new Error('Branch insert returned no data');
  await recordServerAudit('create_branch', 'branch', String(data.id), { name: input.name, code: input.code });
  return data as BranchRecord;
}

export async function listLoyaltyTransactions(customerId: string) {
  if (!admin) return [];
  const { data, error } = await admin.from('loyalty_transactions').select('id,points_delta,reason,created_at').eq('store_id', storeId).eq('customer_id', customerId).order('created_at', { ascending: false }).limit(50);
  if (error) throw error;
  return data || [];
}

export async function createStockTransfer(input: { fromBranchId: string; toBranchId: string; productId: string; quantity: number; idempotencyKey: string; note?: string }) {
  if (!admin) throw new Error('Supabase server configuration is missing');
  await ensureTenant();
  const existing = await admin.from('stock_transfers').select('*').eq('idempotency_key', input.idempotencyKey).maybeSingle();
  if (existing.data) return existing.data;
  if (input.fromBranchId === input.toBranchId || input.quantity <= 0) throw new Error('Invalid stock transfer');
  const source = await admin.from('inventory_balances').select('id,quantity').eq('store_id', storeId).eq('branch_id', input.fromBranchId).eq('product_id', input.productId).is('variant_id', null).maybeSingle();
  if (Number(source.data?.quantity || 0) < input.quantity) throw new Error('Insufficient source stock');
  const transfer = await admin.from('stock_transfers').insert({ store_id: storeId, from_branch_id: input.fromBranchId, to_branch_id: input.toBranchId, product_id: input.productId, quantity: input.quantity, idempotency_key: input.idempotencyKey, note: input.note || null }).select('*').single();
  if (transfer.error || !transfer.data) throw transfer.error || new Error('Transfer insert failed');
  await admin.from('inventory_balances').update({ quantity: Number(source.data!.quantity) - input.quantity, updated_at: new Date().toISOString() }).eq('id', source.data!.id);
  const destination = await admin.from('inventory_balances').select('id,quantity').eq('store_id', storeId).eq('branch_id', input.toBranchId).eq('product_id', input.productId).is('variant_id', null).maybeSingle();
  if (destination.data) await admin.from('inventory_balances').update({ quantity: Number(destination.data.quantity) + input.quantity, updated_at: new Date().toISOString() }).eq('id', destination.data.id);
  else await admin.from('inventory_balances').insert({ store_id: storeId, branch_id: input.toBranchId, product_id: input.productId, quantity: input.quantity, min_stock_alert: 5 });
  await recordServerAudit('stock_transfer', 'stock_transfer', String(transfer.data.id), { productId: input.productId, quantity: input.quantity, fromBranchId: input.fromBranchId, toBranchId: input.toBranchId });
  return transfer.data;
}

export async function listHeldBills(): Promise<HeldBillRecord[]> {
  if (!admin) return [];
  const { data, error } = await admin.from('held_bills').select('id,reference_name,payload,total_amount,created_at').eq('store_id', storeId).eq('branch_id', branchId).eq('status', 'held').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((row) => ({ ...row, total_amount: Number(row.total_amount) })) as HeldBillRecord[];
}

export async function createHeldBill(input: { referenceName: string; payload: Record<string, unknown>; totalAmount: number }) {
  if (!admin) throw new Error('Supabase server configuration is missing');
  await ensureTenant();
  const { data, error } = await admin.from('held_bills').insert({ store_id: storeId, branch_id: branchId, reference_name: input.referenceName.trim() || 'บิลพัก', payload: input.payload, total_amount: input.totalAmount, status: 'held' }).select('id,reference_name,payload,total_amount,created_at').single();
  if (error || !data) throw error || new Error('Held bill insert returned no data');
  return { ...data, total_amount: Number(data.total_amount) } as HeldBillRecord;
}

export async function deleteHeldBill(id: string) {
  if (!admin) throw new Error('Supabase server configuration is missing');
  const { error } = await admin.from('held_bills').update({ status: 'deleted' }).eq('id', id).eq('store_id', storeId).eq('branch_id', branchId).eq('status', 'held');
  if (error) throw error;
}

export async function recallHeldBill(id: string) {
  if (!admin) throw new Error('Supabase server configuration is missing');
  const { data, error } = await admin.from('held_bills').update({ status: 'recalled' }).eq('id', id).eq('store_id', storeId).eq('branch_id', branchId).eq('status', 'held').select('id').maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function listAuditLogs() {
  if (!admin) return [];
  const { data, error } = await admin.from('audit_logs').select('id,action,target_entity,entity_id,changes,reason,created_at').eq('store_id', storeId).order('created_at', { ascending: false }).limit(100);
  if (error) throw error;
  return data || [];
}

export async function listCoupons() {
  if (!admin) return [];
  const { data, error } = await admin.from('coupons').select('id,code,name,discount_type,discount_value,min_order_amount,is_active,starts_at,ends_at').eq('store_id', storeId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((coupon) => ({ ...coupon, discount_value: Number(coupon.discount_value), min_order_amount: Number(coupon.min_order_amount) }));
}

export async function createCoupon(input: { code: string; name: string; discountType: 'percent' | 'fixed'; discountValue: number; minOrderAmount: number }) {
  if (!admin) throw new Error('Supabase server configuration is missing');
  await ensureTenant();
  if (input.discountType === 'percent' && input.discountValue > 100) throw new Error('Percent discount cannot exceed 100');
  const { data, error } = await admin.from('coupons').insert({ store_id: storeId, code: input.code.trim().toUpperCase(), name: input.name.trim(), discount_type: input.discountType, discount_value: input.discountValue, min_order_amount: input.minOrderAmount, is_active: true }).select('id,code,name,discount_type,discount_value,min_order_amount,is_active,starts_at,ends_at').single();
  if (error || !data) throw error || new Error('Coupon insert returned no data');
  await recordServerAudit('create_coupon', 'coupon', String(data.id), { code: input.code, discountType: input.discountType, discountValue: input.discountValue });
  return { ...data, discount_value: Number(data.discount_value), min_order_amount: Number(data.min_order_amount) };
}

export async function listCatalogSyncEvents() {
  if (!admin) return [];
  const { data, error } = await admin.from('catalog_sync_events').select('id,product_id,source_branch_id,event_type,payload,created_at').eq('store_id', storeId).order('created_at', { ascending: false }).limit(100);
  if (error) throw error;
  return data || [];
}

export async function recordCatalogSync(input: { productId: string; payload: Record<string, unknown>; eventType?: string }) {
  if (!admin) throw new Error('Supabase server configuration is missing');
  const { data, error } = await admin.from('catalog_sync_events').insert({ store_id: storeId, product_id: input.productId, source_branch_id: branchId, event_type: input.eventType || 'upsert', payload: input.payload }).select('id,product_id,event_type,payload,created_at').single();
  if (error || !data) throw error || new Error('Catalog sync event insert failed');
  return data;
}

export async function listStaffInvites() {
  if (!admin) return [];
  const { data, error } = await admin.from('staff_invites').select('id,display_name,phone_number,role_name,status,created_at').eq('store_id', storeId).order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createStaffInvite(input: { displayName: string; phoneNumber: string; roleName: 'owner' | 'manager' | 'cashier' | 'staff' }) {
  if (!admin) throw new Error('Supabase server configuration is missing');
  await ensureTenant();
  const { data, error } = await admin.from('staff_invites').insert({ store_id: storeId, display_name: input.displayName.trim(), phone_number: input.phoneNumber.trim(), role_name: input.roleName, status: 'pending' }).select('id,display_name,phone_number,role_name,status,created_at').single();
  if (error || !data) throw error || new Error('Staff invite insert returned no data');
  await recordServerAudit('create_staff_invite', 'staff_invite', String(data.id), { displayName: input.displayName, roleName: input.roleName });
  return data;
}

export async function getStoreSettings() {
  if (!admin) return null;
  await ensureTenant();
  const { data, error } = await admin.from('store_settings').select('promptpay_id,receipt_footer,sound_enabled').eq('store_id', storeId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveStoreSettings(input: { name?: string; promptpayId?: string; receiptFooter?: string; soundEnabled?: boolean }) {
  if (!admin) throw new Error('Supabase server configuration is missing');
  await ensureTenant();
  if (input.name) { const { error } = await admin.from('stores').update({ name: input.name.trim(), updated_at: new Date().toISOString() }).eq('id', storeId); if (error) throw error; }
  const { data, error } = await admin.from('store_settings').upsert({ store_id: storeId, promptpay_id: input.promptpayId || null, receipt_footer: input.receiptFooter || null, sound_enabled: input.soundEnabled ?? true, updated_at: new Date().toISOString() }).select('promptpay_id,receipt_footer,sound_enabled').single();
  if (error || !data) throw error || new Error('Settings save returned no data');
  await recordServerAudit('update_store_settings', 'store', storeId, { name: input.name, promptpayId: input.promptpayId, soundEnabled: input.soundEnabled });
  return data;
}
