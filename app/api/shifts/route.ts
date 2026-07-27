import { NextResponse } from 'next/server';
import { closeShift, getCurrentShift, openShift } from '@/lib/operations/server-operations';

export const dynamic = 'force-dynamic';

export async function GET() { try { return NextResponse.json({ shift: await getCurrentShift() }); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'โหลดกะขายไม่สำเร็จ' }, { status: 500 }); } }
export async function POST(request: Request) {
  try { const body = await request.json(); const action = body.action; if (action === 'open') return NextResponse.json({ shift: await openShift(Number(body.openingCash || 0)) }, { status: 201 }); if (action === 'close') return NextResponse.json({ shift: await closeShift(String(body.id), Number(body.closingCash)) }); return NextResponse.json({ error: 'คำสั่งกะขายไม่ถูกต้อง' }, { status: 400 }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'บันทึกกะขายไม่สำเร็จ' }, { status: 500 }); }
}
