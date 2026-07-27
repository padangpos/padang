'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, Award, TrendingUp } from 'lucide-react';

type ReportSummary = { sales: number; orders: number; cost: number; profit: number };
type TopProduct = { name: string; qty: number; sales: number };

export default function ReportsPage() {
  const [summary, setSummary] = useState<ReportSummary>({ sales: 0, orders: 0, cost: 0, profit: 0 });
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

  useEffect(() => {
    fetch('/api/reports').then(async (response) => {
      if (!response.ok) throw new Error('report load failed');
      const payload = await response.json();
      setSummary(payload.summary);
      setTopProducts(payload.topProducts || []);
    }).catch(() => undefined);
  }, []);

  return (
    <div className="min-h-screen bg-padaeng-surface flex flex-col font-sans">
      <header className="bg-white border-b border-padaeng-border px-4 py-3 sticky top-0 z-30 shadow-sm flex items-center space-x-3">
        <Link href="/pos" className="w-10 h-10 rounded-xl bg-padaeng-surface border border-padaeng-border flex items-center justify-center text-padaeng-text touch-target"><ArrowLeft className="w-5 h-5" /></Link>
        <div><h1 className="font-bold text-base text-padaeng-text">รายงานยอดขาย</h1><span className="text-xs text-padaeng-red font-semibold">ข้อมูลจากรายการขายจริง</span></div>
      </header>
      <main className="flex-1 p-4 max-w-2xl w-full mx-auto space-y-4">
        <div className="bg-white p-4 rounded-padaeng border border-padaeng-border grid grid-cols-2 gap-3 shadow-sm">
          <div><span className="text-xs text-padaeng-muted font-medium block">ยอดขายรวม</span><h3 className="text-2xl font-black text-padaeng-red">฿{summary.sales.toLocaleString()}</h3><span className="text-[10px] text-padaeng-muted">{summary.orders} ออเดอร์</span></div>
          <div><span className="text-xs text-padaeng-muted font-medium block">กำไรขั้นต้น</span><h3 className="text-2xl font-black text-emerald-600">฿{summary.profit.toLocaleString()}</h3><span className="text-[10px] text-padaeng-muted">ต้นทุน ฿{summary.cost.toLocaleString()}</span></div>
        </div>
        <div className="bg-white p-4 rounded-padaeng border border-padaeng-border space-y-3">
          <div className="flex items-center space-x-2 border-b border-padaeng-border pb-2"><Award className="w-5 h-5 text-padaeng-red" /><h3 className="font-bold text-sm text-padaeng-text">สินค้าขายดี</h3></div>
          {topProducts.length === 0 ? <p className="p-4 text-center text-sm text-padaeng-muted">ยังไม่มีรายการขายในฐานข้อมูล</p> : topProducts.map((item, index) => (
            <div key={item.name} className="flex justify-between items-center bg-padaeng-surface p-3 rounded-xl">
              <div className="flex items-center space-x-3"><span className="w-6 h-6 rounded-full bg-padaeng-red text-white flex items-center justify-center font-black text-xs">{index + 1}</span><div><h4 className="font-bold text-padaeng-text">{item.name}</h4><span className="text-[11px] text-padaeng-muted">ขายได้ {item.qty} ชิ้น</span></div></div>
              <span className="font-extrabold text-sm text-padaeng-red">฿{item.sales.toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className="text-xs text-padaeng-muted flex items-center gap-2"><TrendingUp className="w-4 h-4 text-padaeng-red" />รายงานนี้ไม่ใช้ข้อมูลตัวอย่าง</div>
      </main>
    </div>
  );
}
