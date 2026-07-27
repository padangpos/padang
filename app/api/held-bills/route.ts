import { NextResponse } from 'next/server';
import { createHeldBill, deleteHeldBill, listHeldBills, recallHeldBill } from '@/lib/operations/server-operations';

export const dynamic = 'force-dynamic';
export async function GET() { try { return NextResponse.json({ bills: await listHeldBills() }); } catch { return NextResponse.json({ error: 'โหลดบิลพักไม่สำเร็จ' }, { status: 500 }); } }
export async function POST(request: Request) {
  try { const body = await request.json(); if (body.action === 'delete') { await deleteHeldBill(String(body.id)); return NextResponse.json({ ok: true }); } if (body.action === 'recall') { return NextResponse.json({ recalled: await recallHeldBill(String(body.id)) }); } const referenceName = String(body.referenceName || '').trim(); const totalAmount = Number(body.totalAmount); if (!referenceName || !Number.isFinite(totalAmount) || !body.payload) return NextResponse.json({ error: 'ข้อมูลบิลพักไม่ถูกต้อง' }, { status: 400 }); return NextResponse.json({ bill: await createHeldBill({ referenceName, totalAmount, payload: body.payload }) }, { status: 201 }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'บันทึกบิลพักไม่สำเร็จ' }, { status: 500 }); }
}
