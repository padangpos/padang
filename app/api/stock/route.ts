import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const storeId = process.env.PADAENG_STORE_ID || '00000000-0000-0000-0000-000000000001';
const branchId = process.env.PADAENG_BRANCH_ID || '00000000-0000-0000-0000-000000000002';

export async function GET() {
  if (!url || !key) return NextResponse.json({ balances: {} });
  const admin = createClient(url, key);
  const { data, error } = await admin.from('inventory_balances').select('product_id,quantity,min_stock_alert').eq('store_id', storeId).eq('branch_id', branchId).is('variant_id', null);
  if (error) return NextResponse.json({ error: 'โหลดสต็อกไม่สำเร็จ' }, { status: 500 });
  return NextResponse.json({ balances: Object.fromEntries((data || []).map((row) => [row.product_id, Number(row.quantity)])) });
}

export async function POST(request: Request) {
  if (!url || !key) return NextResponse.json({ error: 'ยังไม่ได้ตั้งค่า Supabase server' }, { status: 503 });
  try {
    const body = await request.json() as Record<string, unknown>;
    const productId = typeof body.productId === 'string' ? body.productId : '';
    const movementType = body.movementType === 'waste' || body.movementType === 'adjustment' ? body.movementType : 'received';
    const quantityChange = Number(body.quantityChange);
    if (!productId || !Number.isFinite(quantityChange) || quantityChange === 0) return NextResponse.json({ error: 'ข้อมูลปรับสต็อกไม่ถูกต้อง' }, { status: 400 });
    const admin = createClient(url, key);
    const { data: current } = await admin.from('inventory_balances').select('id,quantity').eq('store_id', storeId).eq('branch_id', branchId).eq('product_id', productId).is('variant_id', null).maybeSingle();
    const nextQuantity = Math.max(0, Number(current?.quantity || 0) + quantityChange);
    const balance = current
      ? await admin.from('inventory_balances').update({ quantity: nextQuantity, updated_at: new Date().toISOString() }).eq('id', current.id).select('quantity').single()
      : await admin.from('inventory_balances').insert({ store_id: storeId, branch_id: branchId, product_id: productId, quantity: nextQuantity, min_stock_alert: 5 }).select('quantity').single();
    if (balance.error) throw balance.error;
    const movement = await admin.from('stock_movements').insert({ store_id: storeId, branch_id: branchId, product_id: productId, movement_type: movementType, quantity_change: quantityChange, note: typeof body.note === 'string' ? body.note : null }).select('id').single();
    if (movement.error) throw movement.error;
    return NextResponse.json({ quantity: nextQuantity, movementId: movement.data.id });
  } catch (error) {
    console.error('Stock adjustment failed:', error);
    return NextResponse.json({ error: 'บันทึกสต็อกไม่สำเร็จ' }, { status: 500 });
  }
}
