import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const storeId = process.env.PADAENG_STORE_ID || '00000000-0000-0000-0000-000000000001';

export async function GET(request: Request) {
  if (!url || !key) return NextResponse.json({ summary: { sales: 0, orders: 0, cost: 0, profit: 0, totalSales: 0, totalExpenses: 0, cashSales: 0, promptpaySales: 0, cardSales: 0 }, topProducts: [] });
  const { searchParams } = new URL(request.url);
  const admin = createClient(url, key);
  let query = admin.from('orders').select('id,grand_total,created_at,order_items(product_name,quantity,total_price,unit_cost)').eq('store_id', storeId).eq('status', 'completed').order('created_at', { ascending: false });
  if (searchParams.get('from')) query = query.gte('created_at', searchParams.get('from')!);
  if (searchParams.get('to')) query = query.lt('created_at', searchParams.get('to')!);
  const { data, error } = await query;
  if (error) { console.error('Report query failed:', error); return NextResponse.json({ error: 'โหลดรายงานไม่สำเร็จ' }, { status: 500 }); }
  let paymentsQuery = admin.from('payments').select('amount,payment_method,created_at').eq('store_id', storeId);
  let expensesQuery = admin.from('expenses').select('amount,created_at').eq('store_id', storeId);
  if (searchParams.get('from')) { paymentsQuery = paymentsQuery.gte('created_at', searchParams.get('from')!); expensesQuery = expensesQuery.gte('created_at', searchParams.get('from')!); }
  if (searchParams.get('to')) { paymentsQuery = paymentsQuery.lt('created_at', searchParams.get('to')!); expensesQuery = expensesQuery.lt('created_at', searchParams.get('to')!); }
  const [{ data: payments }, { data: expenses }] = await Promise.all([paymentsQuery, expensesQuery]);
  const top = new Map<string, { qty: number; sales: number; cost: number }>();
  let sales = 0;
  let cost = 0;
  for (const order of data || []) {
    sales += Number(order.grand_total || 0);
    for (const item of (order.order_items || []) as Array<Record<string, unknown>>) {
      const name = String(item.product_name || 'ไม่ระบุสินค้า');
      const qty = Number(item.quantity || 0);
      const itemSales = Number(item.total_price || 0);
      const itemCost = Number(item.unit_cost || 0) * qty;
      const current = top.get(name) || { qty: 0, sales: 0, cost: 0 };
      top.set(name, { qty: current.qty + qty, sales: current.sales + itemSales, cost: current.cost + itemCost });
      cost += itemCost;
    }
  }
  const cashSales = (payments || []).filter((payment) => payment.payment_method === 'cash').reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const promptpaySales = (payments || []).filter((payment) => payment.payment_method === 'promptpay').reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const cardSales = (payments || []).filter((payment) => payment.payment_method === 'card').reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const totalExpenses = (expenses || []).reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  return NextResponse.json({ summary: { sales, orders: data?.length || 0, cost, profit: sales - cost, totalSales: sales, totalExpenses, cashSales, promptpaySales, cardSales }, topProducts: [...top.entries()].map(([name, value]) => ({ name, ...value })).sort((a, b) => b.sales - a.sales).slice(0, 10) });
}
