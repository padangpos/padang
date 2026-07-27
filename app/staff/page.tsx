'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, UserPlus, ShieldCheck, Users, X, Check } from 'lucide-react';
import { RoleName } from '@/lib/types/database';

export default function StaffPage() {
  const [staffMembers, setStaffMembers] = useState<Array<{ id: string; name: string; role: RoleName; phone: string; status: string }>>([]);
  useEffect(() => { fetch('/api/staff').then((r) => r.json()).then((body) => setStaffMembers((body.staff || []).map((staff: { id: string; display_name: string; role_name: RoleName; phone_number: string; status: string }) => ({ id: staff.id, name: staff.display_name, role: staff.role_name, phone: staff.phone_number, status: staff.status })))).catch(() => undefined); }, []);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [roleInput, setRoleInput] = useState<RoleName>('cashier');

  const roleLabels: Record<RoleName, { title: string; badgeBg: string }> = {
    owner: { title: 'เจ้าของร้าน (Owner)', badgeBg: 'bg-padaeng-red text-white' },
    manager: { title: 'ผู้จัดการ (Manager)', badgeBg: 'bg-blue-600 text-white' },
    cashier: { title: 'พนักงานคิดเงิน (Cashier)', badgeBg: 'bg-emerald-600 text-white' },
    staff: { title: 'พนักงานทั่วไป (Staff)', badgeBg: 'bg-gray-600 text-white' },
  };

  const handleInviteStaff = async () => {
    if (!nameInput || !phoneInput) return;
    const response = await fetch('/api/staff', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ displayName: nameInput, phoneNumber: phoneInput, roleName: roleInput }) });
    if (!response.ok) { alert('เชิญพนักงานไม่สำเร็จ'); return; }
    const body = await response.json();
    setStaffMembers((current) => [{ id: body.staff.id, name: body.staff.display_name, role: body.staff.role_name, phone: body.staff.phone_number, status: body.staff.status }, ...current]);
    setNameInput('');
    setPhoneInput('');
    setShowInviteModal(false);
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
            <h1 className="font-bold text-base text-padaeng-text leading-tight">จัดการพนักงานและสิทธิ์</h1>
            <span className="text-xs text-padaeng-red font-semibold">รายชื่อสมาชิกร้านค้า ({staffMembers.length})</span>
          </div>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="px-3 py-2 rounded-xl bg-padaeng-red text-white text-xs font-bold flex items-center space-x-1 shadow-sm touch-target"
        >
          <UserPlus className="w-4 h-4" />
          <span>เชิญพนักงาน</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 max-w-2xl w-full mx-auto space-y-4">
        {/* Role Presets Card */}
        <div className="bg-white p-4 rounded-padaeng border border-padaeng-border space-y-2">
          <div className="flex items-center space-x-2 border-b border-padaeng-border pb-2">
            <ShieldCheck className="w-5 h-5 text-padaeng-red" />
            <h3 className="font-bold text-sm text-padaeng-text">สิทธิ์และระดับการเข้าถึงในระบบ</h3>
          </div>
          <p className="text-xs text-padaeng-muted">
            • <b>Cashier / Staff:</b> ขาย POS, พักบิล, ค้นหาลูกค้า (ไม่เห็นรายงานกำไร/เจ้าของ)<br />
            • <b>Manager:</b> จัดการสินค้า, สต๊อก, พนักงาน และดูรายงาน<br />
            • <b>Owner:</b> สิทธิ์สูงสุด จัดการร้าน การเงิน และแพ็กเกจ
          </p>
        </div>

        {/* Staff Members List */}
        <div className="bg-white rounded-padaeng border border-padaeng-border divide-y divide-padaeng-border">
          {staffMembers.map((s) => (
            <div key={s.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-sm text-padaeng-text">{s.name}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleLabels[s.role].badgeBg}`}>
                    {roleLabels[s.role].title.split(' ')[0]}
                  </span>
                </div>
                <span className="text-xs text-padaeng-muted">{s.phone}</span>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                ใช้งานอยู่
              </span>
            </div>
          ))}
        </div>
      </main>

      {/* Invite Staff Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-padaeng max-w-sm w-full p-5 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-padaeng-border pb-2">
              <h3 className="font-bold text-lg text-padaeng-text">เชิญพนักงานใหม่</h3>
              <button onClick={() => setShowInviteModal(false)} className="p-1 text-padaeng-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-padaeng-text mb-1">ชื่อพนักงาน</label>
                <input
                  type="text"
                  placeholder="เช่น น้องมุก"
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

              <div>
                <label className="block font-bold text-padaeng-text mb-1">ตำแหน่ง / สิทธิ์การใช้งาน</label>
                <select
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value as RoleName)}
                  className="w-full p-2.5 border border-padaeng-border rounded-xl text-sm focus:outline-none focus:border-padaeng-red bg-white"
                >
                  <option value="cashier">พนักงานคิดเงิน (Cashier)</option>
                  <option value="manager">ผู้จัดการ (Manager)</option>
                  <option value="staff">พนักงานทั่วไป (Staff)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleInviteStaff}
              className="w-full bg-padaeng-red hover:bg-padaeng-red-hover text-white font-bold py-3 rounded-xl text-sm min-h-btn shadow-md active:scale-95 transition-all"
            >
              ส่งคำเชิญพนักงาน
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
