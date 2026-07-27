'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, History, Search } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs] = useState([
    {
      id: 'audit-101',
      action: 'complete_sale',
      actor: 'พนักงานคิดเงิน (น้องนก)',
      entity: 'Order #REC-98214',
      details: 'ชำระเงินสำเร็จ ฿450 (เงินสด)',
      reason: 'การขาย POS ปกติ',
      time: 'วันนี้ 15:42 น.',
    },
    {
      id: 'audit-102',
      action: 'adjust_stock',
      actor: 'ผู้จัดการ (คุณสมชาย)',
      entity: 'Product: ครัวซองต์เนยสด',
      details: 'ตัดของเสีย -2 ชิ้น',
      reason: 'ขนมหมดอายุ',
      time: 'วันนี้ 14:15 น.',
    },
    {
      id: 'audit-103',
      action: 'confirm_ai_draft',
      actor: 'เจ้าของร้าน (ป้าแดง)',
      entity: 'Draft #draft-101',
      details: 'ยืนยันบิลเสียง "ขายน้ำ 3 ขวด"',
      reason: 'ยืนยันผ่าน LIFF',
      time: 'วันนี้ 11:05 น.',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.entity.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <h1 className="font-bold text-base text-padaeng-text leading-tight">ประวัติตรวจสอบระบบ (Audit Trail)</h1>
            <span className="text-xs text-padaeng-red font-semibold">บันทึกการเปลี่ยนแปลงการเงิน สต๊อก และสิทธิ์</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 max-w-2xl w-full mx-auto space-y-4">
        <div className="bg-white p-3 rounded-padaeng border border-padaeng-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-padaeng-muted" />
            <input
              type="text"
              placeholder="ค้นหาประวัติการทำงาน..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-padaeng-border rounded-xl text-sm focus:outline-none focus:border-padaeng-red"
            />
          </div>
        </div>

        <div className="bg-white rounded-padaeng border border-padaeng-border divide-y divide-padaeng-border">
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-4 space-y-1 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-padaeng-red bg-padaeng-red-light px-2 py-0.5 rounded">
                  {log.action}
                </span>
                <span className="text-padaeng-muted">{log.time}</span>
              </div>
              <div className="flex justify-between items-center font-bold text-sm text-padaeng-text pt-0.5">
                <span>{log.entity}</span>
                <span className="text-xs font-normal text-padaeng-muted">{log.actor}</span>
              </div>
              <p className="text-padaeng-text">{log.details}</p>
              {log.reason && <p className="text-padaeng-muted italic">เหตุผล: {log.reason}</p>}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
