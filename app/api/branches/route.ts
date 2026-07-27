import { NextResponse } from 'next/server';
import { createBranch, listBranches } from '@/lib/operations/server-operations';

export async function GET() { try { return NextResponse.json({ branches: await listBranches() }); } catch { return NextResponse.json({ error: 'โหลดสาขาไม่สำเร็จ' }, { status: 500 }); } }
export async function POST(request: Request) {
  try { const body = await request.json(); const name = String(body.name || '').trim(); const code = String(body.code || '').trim(); if (!name || !code) return NextResponse.json({ error: 'กรุณาระบุชื่อและรหัสสาขา' }, { status: 400 }); return NextResponse.json({ branch: await createBranch({ name, code, address: body.address ? String(body.address) : undefined }) }, { status: 201 }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'เพิ่มสาขาไม่สำเร็จ' }, { status: 500 }); }
}
