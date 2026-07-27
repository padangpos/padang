import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const storeId = process.env.PADAENG_STORE_ID || '00000000-0000-0000-0000-000000000001';
const branchId = process.env.PADAENG_BRANCH_ID || '00000000-0000-0000-0000-000000000002';

type SaleItemInput = { productId: string; name: string; quantity: number; unitPrice: number; unitCost?: number };

export async function POST(request: Request) {
  if (!supabaseUrl || !serviceRoleKey) return NextResponse.json({ error: 'ยังไม่ได้ตั้งค่า Supabase server' }, { status: 503 });
  try {
    const body = await request.json() as Record<string, unknown>;
    const orderNumber = typeof body.orderNumber === 'string' ? body.orderNumber : '';
    const paymentMethod = body.paymentMethod === 'promptpay' || body.paymentMethod === 'card' ? body.paymentMethod : 'cash';
    const items = Array.isArray(body.items) ? body.items.flatMap((item): SaleItemInput[] => {
      if (!item || typeof item !== 'object') return [];
      const row = item as Record<string, unknown>;
      const quantity = Number(row.quantity);
      const unitPrice = Number(row.unitPrice);
      if (typeof row.productId !== 'string' || typeof row.name !== 'string' || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(unitPrice) || unitPrice < 0) return [];
      return [{ productId: row.productId, name: row.name, quantity, unitPrice, unitCost: Number(row.unitCost || 0) }];
    }) : [];
    if (!orderNumber || !items.length) return NextResponse.json({ error: 'ข้อมูลรายการขายไม่ครบ' }, { status: 400 });

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const idempotencyKey = `pos:${orderNumber}`;
    const { data: existing } = await admin.from('payments').select('id,order_id').eq('idempotency_key', idempotencyKey).maybeSingle();
    if (existing) return NextResponse.json({ orderId: existing.order_id, paymentId: existing.id, alreadyApplied: true });

    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const grandTotal = Number(body.grandTotal);
    const total = Number.isFinite(grandTotal) && grandTotal >= 0 ? grandTotal : subtotal;
    const { data: order, error: orderError } = await admin.from('orders').insert({ store_id: storeId, branch_id: branchId, order_number: orderNumber, status: 'completed', subtotal, discount_amount: 0, tax_amount: Math.max(0, total - subtotal), grand_total: total }).select('id').single();
    if (orderError || !order) throw orderError || new Error('order insert failed');

    const { error: itemError } = await admin.from('order_items').insert(items.map((item) => ({ order_id: order.id, product_id: item.productId, product_name: item.name, unit_price: item.unitPrice, unit_cost: item.unitCost || 0, quantity: item.quantity, total_price: item.quantity * item.unitPrice })));
    if (itemError) { await admin.from('orders').delete().eq('id', order.id); throw itemError; }

    const tendered = Number(body.tendered);
    const change = Number(body.change);
    const { data: payment, error: paymentError } = await admin.from('payments').insert({ store_id: storeId, order_id: order.id, payment_method: paymentMethod, amount: total, tendered_amount: Number.isFinite(tendered) ? tendered : total, change_amount: Number.isFinite(change) ? change : 0, status: 'completed', idempotency_key: idempotencyKey }).select('id').single();
    if (paymentError || !payment) { await admin.from('orders').delete().eq('id', order.id); throw paymentError || new Error('payment insert failed'); }
    return NextResponse.json({ orderId: order.id, paymentId: payment.id, alreadyApplied: false }, { status: 201 });
  } catch (error) {
    console.error('POS sale persistence failed:', error);
    return NextResponse.json({ error: 'บันทึกการขายไม่สำเร็จ กรุณาลองใหม่' }, { status: 500 });
  }
}
