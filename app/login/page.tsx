'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import BrandLogo from '@/components/brand/BrandLogo';

export default function LoginPage() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError('');
    const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accessToken }) });
    setBusy(false);
    if (!response.ok) { setError('รหัสเข้าระบบไม่ถูกต้อง'); return; }
    router.replace('/'); router.refresh();
  };
  return <main className="min-h-screen bg-padaeng-surface flex items-center justify-center p-4"><form onSubmit={submit} className="w-full max-w-sm bg-white rounded-padaeng border border-padaeng-border p-6 space-y-5 shadow-md"><BrandLogo variant="mark" className="w-20 h-20 mx-auto" priority /><div className="text-center"><h1 className="text-xl font-black text-padaeng-text">เข้าสู่ป้าแดง POS</h1><p className="text-xs text-padaeng-muted mt-1">ใช้รหัสเจ้าของร้านเพื่อเปิดระบบ</p></div><div><label className="block text-xs font-bold mb-1">รหัสเข้าระบบ</label><input autoFocus type="password" value={accessToken} onChange={(event) => setAccessToken(event.target.value)} className="w-full p-3 border border-padaeng-border rounded-xl" autoComplete="current-password" /></div>{error && <p className="text-xs text-red-600">{error}</p>}<button disabled={busy || !accessToken} className="w-full bg-padaeng-red text-white font-bold py-3 rounded-xl disabled:opacity-40">{busy ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}</button></form></main>;
}
