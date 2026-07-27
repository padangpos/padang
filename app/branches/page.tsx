'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Store, Plus, Check, MapPin } from 'lucide-react';

export default function BranchesPage() {
  const [branches, setBranches] = useState([
    { id: 'b-1', name: 'สาขาหลัก (สุขุมวิท)', code: 'MAIN', address: 'กรุงเทพฯ', isMain: true },
    { id: 'b-2', name: 'สาขา 2 (อารีย์)', code: 'ARI', address: 'กรุงเทพฯ', isMain: false },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [codeInput, setCodeInput] = useState('');

  const handleAddBranch = () => {
    if (!nameInput || !codeInput) return;
    const newB = {
      id: `b-${Date.now()}`,
      name: nameInput,
      code: codeInput.toUpperCase(),
      address: 'กรุงเทพฯ',
      isMain: false,
    };
    setBranches([...branches, newB]);
    setNameInput('');
    setCodeInput('');
    setShowAddModal(false);
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
            <h1 className="font-bold text-base text-padaeng-text leading-tight">จัดการสาขา (Branches)</h1>
            <span className="text-xs text-padaeng-red font-semibold">สาขาทั้งหมดในระบบ ({branches.length})</span>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-2 rounded-xl bg-padaeng-red text-white text-xs font-bold flex items-center space-x-1 shadow-sm touch-target"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มสาขา</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 max-w-2xl w-full mx-auto space-y-4">
        <div className="bg-white rounded-padaeng border border-padaeng-border divide-y divide-padaeng-border">
          {branches.map((b) => (
            <div key={b.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-sm text-padaeng-text">{b.name}</h4>
                  {b.isMain && (
                    <span className="bg-padaeng-red text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      สาขาหลัก
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-xs text-padaeng-muted mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>รหัสสาขา: {b.code} • {b.address}</span>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                เปิดบริการ
              </span>
            </div>
          ))}
        </div>
      </main>

      {/* Add Branch Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-padaeng max-w-sm w-full p-5 space-y-4 shadow-xl">
            <h3 className="font-bold text-lg text-padaeng-text">เพิ่มสาขาใหม่</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-padaeng-text mb-1">ชื่อสาขา</label>
                <input
                  type="text"
                  placeholder="เช่น สาขา 3 (พญาไท)"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full p-2.5 border border-padaeng-border rounded-xl text-sm focus:outline-none focus:border-padaeng-red"
                />
              </div>
              <div>
                <label className="block font-bold text-padaeng-text mb-1">รหัสสาขา (Branch Code)</label>
                <input
                  type="text"
                  placeholder="เช่น PYT"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  className="w-full p-2.5 border border-padaeng-border rounded-xl text-sm focus:outline-none focus:border-padaeng-red uppercase font-bold"
                />
              </div>
            </div>

            <button
              onClick={handleAddBranch}
              className="w-full bg-padaeng-red hover:bg-padaeng-red-hover text-white font-bold py-3 rounded-xl text-sm min-h-btn shadow-md active:scale-95 transition-all"
            >
              บันทึกสร้างสาขา
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
