import { NextResponse } from 'next/server';
import { createExpense, listExpenses } from '@/lib/operations/server-operations';

export const dynamic = 'force-dynamic';

export async function GET() {
  try { return NextResponse.json({ expenses: await listExpenses() }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'โหลดรายจ่ายไม่สำเร็จ' }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const title = String(body.title || '').trim();
    const amount = Number(body.amount);
    if (!title || !Number.isFinite(amount) || amount < 0) return NextResponse.json({ error: 'ข้อมูลรายจ่ายไม่ถูกต้อง' }, { status: 400 });
    return NextResponse.json({ expense: await createExpense({ title, amount, category: String(body.category || 'อื่นๆ'), receiptUrl: body.receiptUrl ? String(body.receiptUrl) : undefined }) }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'บันทึกรายจ่ายไม่สำเร็จ' }, { status: 500 }); }
}
