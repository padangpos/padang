import { NextResponse } from 'next/server';
import { getStoreSettings, saveStoreSettings } from '@/lib/operations/server-operations';
export const dynamic = 'force-dynamic';
export async function GET() { try { return NextResponse.json({ settings: await getStoreSettings() }); } catch { return NextResponse.json({ error: 'โหลดการตั้งค่าไม่สำเร็จ' }, { status: 500 }); } }
export async function POST(request: Request) { try { const body = await request.json(); return NextResponse.json({ settings: await saveStoreSettings({ name: body.name ? String(body.name) : undefined, promptpayId: body.promptpayId ? String(body.promptpayId) : undefined, receiptFooter: body.receiptFooter ? String(body.receiptFooter) : undefined, soundEnabled: typeof body.soundEnabled === 'boolean' ? body.soundEnabled : true }) }); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'บันทึกการตั้งค่าไม่สำเร็จ' }, { status: 500 }); } }
