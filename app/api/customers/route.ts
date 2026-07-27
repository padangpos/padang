import { NextResponse } from 'next/server';
import { adjustCustomerPoints, createCustomer, listCustomers } from '@/lib/operations/server-operations';

export const dynamic = 'force-dynamic';
export async function GET() { try { return NextResponse.json({ customers: await listCustomers() }); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'โหลดลูกค้าไม่สำเร็จ' }, { status: 500 }); } }
export async function POST(request: Request) { try { const body = await request.json(); if (body.action === 'points') return NextResponse.json({ customer: await adjustCustomerPoints(String(body.id), Number(body.amount)) }); const displayName = String(body.displayName || '').trim(); if (!displayName) return NextResponse.json({ error: 'กรุณาระบุชื่อลูกค้า' }, { status: 400 }); return NextResponse.json({ customer: await createCustomer({ displayName, phoneNumber: body.phoneNumber ? String(body.phoneNumber) : undefined }) }, { status: 201 }); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'บันทึกลูกค้าไม่สำเร็จ' }, { status: 500 }); } }
