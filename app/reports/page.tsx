'use client';

import Link from 'next/link';
import { ArrowLeft, TrendingUp, Award, CreditCard, DollarSign } from 'lucide-react';

export default function ReportsPage() {
  const topProducts = [
    { rank: 1, name: 'กาแฟลาเต้ เย็น', qty: 45, sales: 2700 },
    { rank: 2, name: 'ชาไทย เย็น', qty: 38, sales: 1900 },
    { rank: 3, name: 'เอสเพรสโซ ร้อน', qty: 25, sales: 1125 },
    { rank: 4, name: 'ครัวซองต์เนยสด', qty: 15, sales: 975 },
  ];

  return (
    <div className="min-h-screen bg-padaeng-surface flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-padaeng-border px-4 py-3 sticky top-0 z-30 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            href="/pos"
            className="w-10 h-10 rounded-xl bg-padaeng-surface hover:bg-padaeng-red-light border border-padaeng-border flex items-center justify-center text-padaeng-text touch-target"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-bold text-base text-padaeng-text leading-tight">รายงานยอดขายเชิงลึก</h1>
            <span className="text-xs text-padaeng-red font-semibold">วิเคราะห์การขายและสินค้าขายดี</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 max-w-2xl w-full mx-auto space-y-4">
        {/* Gross Profit Margin Card */}
        <div className="bg-white p-4 rounded-padaeng border border-padaeng-border grid grid-cols-2 gap-3 shadow-sm">
          <div>
            <span className="text-xs text-padaeng-muted font-medium block">กำไรขั้นต้น (Est. Profit)</span>
            <h3 className="text-2xl font-black text-emerald-600">฿5,250</h3>
            <span className="text-[10px] text-padaeng-muted">คิดเป็น 62.1% ของยอดขาย</span>
          </div>
          <div>
            <span className="text-xs text-padaeng-muted font-medium block">ต้นทุนวัตถุดิบรวม</span>
            <h3 className="text-2xl font-black text-padaeng-muted">฿3,200</h3>
            <span className="text-[10px] text-padaeng-muted">คิดเป็น 37.9% ของยอดขาย</span>
          </div>
        </div>

        {/* Top Selling Products Leaderboard */}
        <div className="bg-white p-4 rounded-padaeng border border-padaeng-border space-y-3">
          <div className="flex items-center space-x-2 border-b border-padaeng-border pb-2">
            <Award className="w-5 h-5 text-padaeng-red" />
            <h3 className="font-bold text-sm text-padaeng-text">สินค้าขายดีประจำเดือน (Top Performers)</h3>
          </div>
          <div className="space-y-2 text-xs">
            {topProducts.map((item) => (
              <div key={item.rank} className="flex justify-between items-center bg-padaeng-surface p-3 rounded-xl">
                <div className="flex items-center space-x-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                      item.rank === 1
                        ? 'bg-yellow-400 text-yellow-950'
                        : item.rank === 2
                        ? 'bg-gray-300 text-gray-800'
                        : 'bg-amber-600 text-white'
                    }`}
                  >
                    {item.rank}
                  </span>
                  <div>
                    <h4 className="font-bold text-padaeng-text">{item.name}</h4>
                    <span className="text-[11px] text-padaeng-muted">ขายได้ {item.qty} ชิ้น</span>
                  </div>
                </div>
                <span className="font-extrabold text-sm text-padaeng-red">
                  ฿{item.sales.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
