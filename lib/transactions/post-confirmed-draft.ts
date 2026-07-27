import { createClient } from '@supabase/supabase-js';
import { CommandDraft } from '@/lib/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const storeId = process.env.PADAENG_STORE_ID || '00000000-0000-0000-0000-000000000001';
const branchId = process.env.PADAENG_BRANCH_ID || '00000000-0000-0000-0000-000000000002';

type SaleItem = {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  unitCost?: number;
};

type PostingResult =
  | { applied: true; orderId: string; paymentId: string }
  | { applied: false; reason: 'unsupported_intent' | 'missing_sale_items' | 'missing_server_config' | 'database_error' };

function readSaleItems(data: Record<string, unknown>): SaleItem[] {
  if (!Array.isArray(data.items)) return [];

  return data.items.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const value = item as Record<string, unknown>;
    const productId = typeof value.productId === 'string' ? value.productId : '';
    const name = typeof value.name === 'string' ? value.name : '';
    const quantity = Number(value.quantity);
    const unitPrice = Number(value.unitPrice);
    const unitCost = Number(value.unitCost || 0);
    if (!productId || !name || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(unitPrice) || unitPrice < 0) {
      return [];
    }
    return [{ productId, name, quantity, unitPrice, unitCost }];
  });
}

export async function postConfirmedDraft(draft: CommandDraft): Promise<PostingResult> {
  if (draft.intent !== 'create_sale') return { applied: false, reason: 'unsupported_intent' };
  const items = readSaleItems(draft.draft_data);
  if (!items.length || !supabaseUrl || !serviceRoleKey) {
    return { applied: false, reason: !supabaseUrl || !serviceRoleKey ? 'missing_server_config' : 'missing_sale_items' };
  }

  const admin = createClient(supabaseUrl, serviceRoleKey);
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const paymentMethod = draft.draft_data.paymentMethod === 'promptpay' ? 'promptpay' : 'cash';
  const orderNumber = `AI-${draft.id}`;

  const { data: existingPayment } = await admin.from('payments').select('id, order_id').eq('idempotency_key', `draft:${draft.id}`).maybeSingle();
  if (existingPayment) {
    return { applied: true, orderId: String(existingPayment.order_id), paymentId: String(existingPayment.id) };
  }

  const { data: order, error: orderError } = await admin
    .from('orders')
    .insert({
      store_id: storeId,
      branch_id: branchId,
      order_number: orderNumber,
      status: 'completed',
      subtotal,
      discount_amount: 0,
      tax_amount: 0,
      grand_total: subtotal,
      notes: `Created from confirmed Draft ${draft.id}`,
    })
    .select('id')
    .single();
  if (orderError || !order) {
    console.error('Confirmed Draft order insert failed:', orderError);
    return { applied: false, reason: 'database_error' };
  }

  const { error: itemsError } = await admin.from('order_items').insert(
    items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.name,
      unit_price: item.unitPrice,
      unit_cost: item.unitCost || 0,
      quantity: item.quantity,
      total_price: item.quantity * item.unitPrice,
    })),
  );
  if (itemsError) {
    console.error('Confirmed Draft order items insert failed:', itemsError);
    await admin.from('orders').delete().eq('id', order.id);
    return { applied: false, reason: 'database_error' };
  }

  const { data: payment, error: paymentError } = await admin
    .from('payments')
    .insert({
      store_id: storeId,
      order_id: order.id,
      payment_method: paymentMethod,
      amount: subtotal,
      status: 'completed',
      idempotency_key: `draft:${draft.id}`,
    })
    .select('id')
    .single();
  if (paymentError || !payment) {
    console.error('Confirmed Draft payment insert failed:', paymentError);
    await admin.from('orders').delete().eq('id', order.id);
    return { applied: false, reason: 'database_error' };
  }

  return { applied: true, orderId: String(order.id), paymentId: String(payment.id) };
}
