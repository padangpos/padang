import { NextResponse } from 'next/server';
import { listLoyaltyTransactions } from '@/lib/operations/server-operations';
export async function GET(request: Request) { const id = new URL(request.url).searchParams.get('customerId'); if (!id) return NextResponse.json({ error: 'customerId is required' }, { status: 400 }); try { return NextResponse.json({ transactions: await listLoyaltyTransactions(id) }); } catch { return NextResponse.json({ error: 'โหลดประวัติแต้มไม่สำเร็จ' }, { status: 500 }); } }
