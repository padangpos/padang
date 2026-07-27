import { NextResponse } from 'next/server';
import { expectedSessionValue, sessionCookieName } from '@/lib/auth/app-session';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const supplied = typeof body.accessToken === 'string' ? body.accessToken : '';
  const configured = process.env.PADAENG_ACCESS_TOKEN;
  if (!configured || supplied.length === 0 || supplied !== configured) return NextResponse.json({ error: 'รหัสเข้าระบบไม่ถูกต้อง' }, { status: 401 });
  const response = NextResponse.json({ authenticated: true });
  response.cookies.set(sessionCookieName, expectedSessionValue() || '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 12 });
  return response;
}
