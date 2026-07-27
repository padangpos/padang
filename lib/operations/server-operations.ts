import { createClient } from '@supabase/supabase-js';

const storeId = process.env.PADAENG_STORE_ID || '00000000-0000-0000-0000-000000000001';
const branchId = process.env.PADAENG_BRANCH_ID || '00000000-0000-0000-0000-000000000002';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const admin = url && key ? createClient(url, key) : null;

export type ExpenseRecord = { id: string; title: string; amount: number; category: string; receipt_url?: string; created_at: string };
export type CustomerRecord = { id: string; display_name: string; phone_number?: string; points: number; created_at: string };
export type BranchRecord = { id: string; name: string; code: string; address?: string; is_main: boolean; is_active: boolean };

async function ensureTenant() {
  if (!admin) return;
  await admin.from('stores').upsert({ id: storeId, name: 'PaDaeng POS', business_type: 'retail' });
  await admin.from('branches').upsert({ id: branchId, store_id: storeId, name: 'สาขาหลัก', code: 'MAIN', is_main: true });
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
  return data;
}

export async function closeShift(id: string, closingCash: number) {
  if (!admin) throw new Error('Supabase server configuration is missing');
  const { data, error } = await admin.from('shifts').update({ closing_cash: closingCash, closed_at: new Date().toISOString(), status: 'closed' }).eq('id', id).eq('status', 'open').select('*').single();
  if (error || !data) throw error || new Error('Shift close returned no data');
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
  return transfer.data;
}
