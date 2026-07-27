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
    const productIds = [...new Set(items.map((item) => item.productId))];
    const { data: catalog, error: catalogError } = await admin.from('products').select('id,name,base_price,cost_price,is_active').eq('store_id', storeId).in('id', productIds).eq('is_active', true);
    if (catalogError) throw catalogError;
    const catalogById = new Map((catalog || []).map((product) => [String(product.id), product]));
    if (catalogById.size !== productIds.length) return NextResponse.json({ error: 'มีสินค้าที่ไม่พร้อมขายหรือไม่อยู่ในร้านนี้' }, { status: 400 });
    const trustedItems = items.map((item) => { const product = catalogById.get(item.productId)!; return { ...item, name: String(product.name), unitPrice: Number(product.base_price), unitCost: Number(product.cost_price || 0) }; });
    const subtotal = trustedItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const total = Math.round((subtotal * 1.07) * 100) / 100;
    const tendered = Number(body.tendered);
    const change = Number(body.change);
    if (paymentMethod === 'cash' && (!Number.isFinite(tendered) || tendered < total)) return NextResponse.json({ error: 'เงินสดที่รับไม่พอชำระยอดจริง' }, { status: 400 });
    const { data, error } = await admin.rpc('complete_pos_sale', {
      p_store_id: storeId,
      p_branch_id: branchId,
      p_order_number: orderNumber,
      p_payment_method: paymentMethod,
      p_tendered: Number.isFinite(tendered) ? tendered : total,
      p_change: Number.isFinite(change) ? change : 0,
      p_grand_total: total,
      p_items: trustedItems,
      p_customer_id: typeof body.customerId === 'string' ? body.customerId : null,
    });
    if (error || !data) throw error || new Error('sale RPC returned no data');
    return NextResponse.json(data, { status: data.alreadyApplied ? 200 : 201 });
  } catch (error) {
    console.error('POS sale persistence failed:', error);
    return NextResponse.json({ error: 'บันทึกการขายไม่สำเร็จ กรุณาลองใหม่' }, { status: 500 });
  }
}
