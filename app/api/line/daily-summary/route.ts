import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const ownerUserId = process.env.LINE_OWNER_USER_ID;
  if (!token || !ownerUserId) return NextResponse.json({ error: 'ยังไม่ได้ตั้งค่า LINE_OWNER_USER_ID หรือ LINE_CHANNEL_ACCESS_TOKEN' }, { status: 503 });
  const body = await request.json();
  const response = await fetch('https://api.line.me/v2/bot/message/push', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ to: ownerUserId, messages: [{ type: 'text', text: String(body.text || 'สรุปยอดป้าแดง POS') }] }) });
  if (!response.ok) return NextResponse.json({ error: 'ส่งสรุปเข้า LINE ไม่สำเร็จ' }, { status: 502 });
  return NextResponse.json({ sent: true });
}
