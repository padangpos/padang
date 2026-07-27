import { NextResponse } from 'next/server';
import { listAuditLogs } from '@/lib/operations/server-operations';
export const dynamic = 'force-dynamic';
export async function GET() { try { return NextResponse.json({ logs: await listAuditLogs() }); } catch { return NextResponse.json({ error: 'โหลด audit log ไม่สำเร็จ' }, { status: 500 }); } }
