import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  let ownerUserId = process.env.LINE_OWNER_USER_ID;
  if (!ownerUserId && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const latest = await admin.from('command_drafts').select('draft_data').order('created_at', { ascending: false }).limit(20);
    const candidate = (latest.data || []).find((row) => typeof row.draft_data?.lineUserId === 'string');
    ownerUserId = candidate?.draft_data?.lineUserId;
  }
  if (!token || !ownerUserId) return NextResponse.json({ error: 'ยังไม่ได้ตั้งค่า LINE_OWNER_USER_ID หรือ LINE_CHANNEL_ACCESS_TOKEN' }, { status: 503 });
  const body = await request.json();
  const response = await fetch('https://api.line.me/v2/bot/message/push', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ to: ownerUserId, messages: [{ type: 'text', text: String(body.text || 'สรุปยอดป้าแดง POS') }] }) });
  if (!response.ok) return NextResponse.json({ error: 'ส่งสรุปเข้า LINE ไม่สำเร็จ' }, { status: 502 });
  return NextResponse.json({ sent: true });
}
