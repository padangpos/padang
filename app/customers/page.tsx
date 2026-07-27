'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, UserPlus, Award, Search, X, Plus, Star } from 'lucide-react';
import { recordAuditLog } from '@/lib/audit/logger';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([
    { id: 'c-1', name: 'คุณสมชาย ใจดี', phone: '081-999-8888', points: 145, tier: 'Gold' },
    { id: 'c-2', name: 'คุณนภา สุขสันต์', phone: '089-777-6666', points: 60, tier: 'Standard' },
    { id: 'c-3', name: 'คุณอนันต์ มั่นคง', phone: '082-555-4444', points: 20, tier: 'Standard' },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCust, setSelectedCust] = useState<typeof customers[0] | null>(null);

  // Add Customer Form
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');

  // Points Adjustment Form
  const [pointsInput, setPointsInput] = useState('');
  const [adjustReason, setAdjustReason] = useState('สะสมคะแนนเพิ่ม');

  const filteredCustomers = customers.filter(
    (c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery)
  );

  const handleSaveCustomer = () => {
    if (!nameInput || !phoneInput) return;
    const newCust = {
      id: `c-${Date.now()}`,
      name: nameInput,
      phone: phoneInput,
      points: 10, // Welcome bonus
      tier: 'Standard',
    };
    setCustomers([newCust, ...customers]);
    setNameInput('');
    setPhoneInput('');
    setShowAddModal(false);
  };

  const handleSavePoints = () => {
    if (!selectedCust || !pointsInput) return;
    const pts = parseInt(pointsInput, 10) || 0;
    const newPoints = Math.max(0, selectedCust.points + pts);

    setCustomers(customers.map((c) => (c.id === selectedCust.id ? { ...c, points: newPoints } : c)));
    recordAuditLog('store-1', 'adjust_points', 'customer', selectedCust.id, {
      previousPoints: selectedCust.points,
      newPoints,
      adjusted: pts,
      reason: adjustReason,
    });

    setSelectedCust(null);
    setPointsInput('');
  };

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
            <h1 className="font-bold text-base text-padaeng-text leading-tight">จัดการลูกค้าและคะแนน</h1>
            <span className="text-xs text-padaeng-red font-semibold">ระบบสมาชิกสะสมคะแนน ({customers.length})</span>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-2 rounded-xl bg-padaeng-red text-white text-xs font-bold flex items-center space-x-1 shadow-sm touch-target"
        >
          <UserPlus className="w-4 h-4" />
          <span>เพิ่มลูกค้า</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 max-w-2xl w-full mx-auto space-y-4">
        {/* Search */}
        <div className="bg-white p-3 rounded-padaeng border border-padaeng-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-padaeng-muted" />
            <input
              type="text"
              placeholder="ค้นชื่อ หรือเบอร์โทรศัพท์ลูกค้า..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-padaeng-border rounded-xl text-sm focus:outline-none focus:border-padaeng-red"
            />
          </div>
        </div>

        {/* Customer List */}
        <div className="bg-white rounded-padaeng border border-padaeng-border divide-y divide-padaeng-border">
          {filteredCustomers.map((c) => (
            <div key={c.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-sm text-padaeng-text">{c.name}</h4>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full flex items-center space-x-1">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>{c.tier}</span>
                  </span>
                </div>
                <span className="text-xs text-padaeng-muted">{c.phone}</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <span className="font-extrabold text-padaeng-red text-base block">
                    {c.points} แต้ม
                  </span>
                </div>
                <button
                  onClick={() => setSelectedCust(c)}
                  className="px-3 py-1.5 bg-padaeng-surface hover:bg-padaeng-red-light border border-padaeng-border text-xs font-bold text-padaeng-text rounded-xl touch-target"
                >
                  ปรับคะแนน
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-padaeng max-w-sm w-full p-5 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-padaeng-border pb-2">
              <h3 className="font-bold text-lg text-padaeng-text">สมัครสมาชิกลูกค้าใหม่</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-padaeng-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-padaeng-text mb-1">ชื่อ-นามสกุล ลูกค้า</label>
                <input
                  type="text"
                  placeholder="เช่น คุณสมชาย ใจดี"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full p-2.5 border border-padaeng-border rounded-xl text-sm focus:outline-none focus:border-padaeng-red"
                />
              </div>

              <div>
                <label className="block font-bold text-padaeng-text mb-1">เบอร์โทรศัพท์</label>
                <input
                  type="text"
                  placeholder="08x-xxx-xxxx"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full p-2.5 border border-padaeng-border rounded-xl text-sm focus:outline-none focus:border-padaeng-red"
                />
              </div>
            </div>

            <button
              onClick={handleSaveCustomer}
              className="w-full bg-padaeng-red hover:bg-padaeng-red-hover text-white font-bold py-3 rounded-xl text-sm min-h-btn shadow-md active:scale-95 transition-all"
            >
              บันทึกสมัครสมาชิก (+10 แต้มต้อนรับ)
            </button>
          </div>
        </div>
      )}

      {/* Points Adjustment Modal */}
      {selectedCust && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-padaeng max-w-sm w-full p-5 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-padaeng-border pb-2">
              <div>
                <h3 className="font-bold text-base text-padaeng-text">ปรับคะแนนสะสม</h3>
                <span className="text-xs text-padaeng-red font-bold">{selectedCust.name} (ปัจจุบัน {selectedCust.points} แต้ม)</span>
              </div>
              <button onClick={() => setSelectedCust(null)} className="p-1 text-padaeng-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-padaeng-text mb-1">จำนวนคะแนน (ใส่บวก/ลบ)</label>
                <input
                  type="number"
                  placeholder="เช่น +20 หรือ -50"
                  value={pointsInput}
                  onChange={(e) => setPointsInput(e.target.value)}
                  className="w-full p-2.5 border border-padaeng-border rounded-xl text-sm focus:outline-none focus:border-padaeng-red font-bold text-right"
                />
              </div>

              <div>
                <label className="block font-bold text-padaeng-text mb-1">เหตุผล</label>
                <input
                  type="text"
                  placeholder="เช่น คะแนนโปรโมชันวันเกิด"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full p-2.5 border border-padaeng-border rounded-xl text-sm focus:outline-none focus:border-padaeng-red"
                />
              </div>
            </div>

            <button
              onClick={handleSavePoints}
              className="w-full bg-padaeng-red hover:bg-padaeng-red-hover text-white font-bold py-3 rounded-xl text-sm min-h-btn shadow-md active:scale-95 transition-all"
            >
              บันทึกปรับคะแนนสะสม
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
