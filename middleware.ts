import { NextRequest, NextResponse } from 'next/server';
import { isValidSessionValue, sessionCookieName } from '@/lib/auth/app-session';

const publicPaths = ['/login', '/api/auth/login', '/api/auth/logout', '/api/webhooks/line', '/api/drafts', '/liff/drafts'];
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (publicPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))) return NextResponse.next();
  if (isValidSessionValue(request.cookies.get(sessionCookieName)?.value)) return NextResponse.next();
  if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'ต้องเข้าสู่ระบบก่อน' }, { status: 401 });
  const loginUrl = new URL('/login', request.url); loginUrl.searchParams.set('next', pathname); return NextResponse.redirect(loginUrl);
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|brand/).*)'] };
