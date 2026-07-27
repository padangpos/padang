'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, CheckCircle2, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { recordAuditLog } from '@/lib/audit/logger';

export default function LiffDraftConfirmationPage({ params }: { params: { id: string } }) {
  const [draftStatus, setDraftStatus] = useState<'pending' | 'confirmed' | 'rejected'>('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const [draftData, setDraftData] = useState({
    id: params.id || 'draft-101',
    intent: 'create_sale',
    rawInput: 'ป้าแดง ขายน้ำ 3 ขวด เงินสด',
    inputType: 'text',
    confidenceScore: 0.92,
    storeName: 'ร้านกาแฟป้าแดง (สาขาหลัก)',
    items: [
      { name: 'น้ำดื่มสิงห์ (ขวด)', quantity: 3, unitPrice: 10, total: 30 },
    ],
    paymentMethod: 'cash',
    totalAmount: 30,
    createdTime: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
  });

  useEffect(() => {
    let isMounted = true;

    fetch(`/api/drafts/${params.id}`)
      .then(async (response) => {
        if (!response.ok) return null;
        const payload = await response.json();
        return payload.draft;
      })
      .then((draft) => {
        if (!isMounted || !draft) return;
        const data = draft.draft_data as { quantity?: number; paymentMethod?: string; totalAmount?: number };
        setDraftStatus(draft.status);
        setDraftData((current) => ({
          ...current,
          id: draft.id,
          intent: draft.intent,
          rawInput: draft.raw_input || 'ไม่ได้รับข้อความต้นฉบับ',
          inputType: draft.input_type,
          confidenceScore: draft.confidence_score,
          paymentMethod: data.paymentMethod || 'cash',
          totalAmount: data.totalAmount || 0,
          items: data.quantity
            ? [{ name: 'รายการจาก Draft', quantity: data.quantity, unitPrice: 0, total: data.totalAmount || 0 }]
            : [],
        }));
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [params.id]);

  const updateDraft = async (status: 'confirmed' | 'rejected') => {
    setIsUpdating(true);
    const response = await fetch(`/api/drafts/${draftData.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (response.ok) {
      setDraftStatus(status);
      if (status === 'confirmed') {
        recordAuditLog('store-1', 'confirm_ai_draft', 'command_draft', draftData.id, {
          rawInput: draftData.rawInput,
          intent: draftData.intent,
          totalAmount: draftData.totalAmount,
        }, 'User confirmed AI draft via LIFF');
      }
    }
    setIsUpdating(false);
  };

  const handleConfirmDraft = () => {
    void updateDraft('confirmed');
  };

  const handleRejectDraft = () => {
    void updateDraft('rejected');
  };

  return (
    <div className="min-h-screen bg-padaeng-surface flex flex-col justify-between p-4 max-w-md mx-auto font-sans">
      <div>
        {/* LIFF Header */}
        <div className="flex items-center space-x-3 py-3 border-b border-padaeng-border mb-4 bg-white p-3 rounded-padaeng border shadow-sm">
          <div className="w-10 h-10 rounded-full bg-padaeng-red text-white flex items-center justify-center text-xl font-black shrink-0">
            ป้า
          </div>
          <div>
            <h1 className="font-bold text-sm text-padaeng-text">ผู้ช่วย LINE ป้าแดง (LIFF)</h1>
            <span className="text-[11px] text-padaeng-red font-semibold">ตรวจสอบและยืนยันรายการ</span>
          </div>
        </div>

        {isLoading && (
          <div className="bg-white rounded-padaeng p-5 border border-padaeng-border text-sm text-padaeng-muted">
            กำลังโหลด Draft จาก LINE...
          </div>
        )}

        {/* Draft Confirmation Card */}
        {!isLoading && draftStatus === 'pending' && (
          <div className="bg-white rounded-padaeng p-5 border border-padaeng-border shadow-md space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center space-x-2 border-b border-padaeng-border pb-2.5">
              <Sparkles className="w-5 h-5 text-padaeng-red" />
              <h3 className="font-bold text-base text-padaeng-text">ป้าสร้างรายการร่าง (Draft) ให้แล้ว</h3>
            </div>

            {/* AI Safety Rule Notice */}
            <div className="bg-padaeng-red-light border border-padaeng-red/20 rounded-xl p-3 flex items-start space-x-2 text-xs">
              <ShieldCheck className="w-4 h-4 text-padaeng-red shrink-0 mt-0.5" />
              <p className="text-padaeng-text">
                <b>กฎความปลอดภัยการเงิน:</b> รายการนี้ยังไม่ถูกบันทึกลงในบัญชีจริงจนกว่าคุณจะกด <b>[ยืนยันบันทึกจริง]</b>
              </p>
            </div>

            {/* Draft Details */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-padaeng-muted">ข้อความเดิมที่ได้รับ:</span>
                <span className="font-bold text-padaeng-text">"{draftData.rawInput}"</span>
              </div>
              <div className="flex justify-between">
                <span className="text-padaeng-muted">ความแม่นยำ AI (Confidence):</span>
                <span className="font-bold text-emerald-600">{(draftData.confidenceScore * 100).toFixed(0)}%</span>
              </div>

              {/* Extracted Items */}
              <div className="bg-padaeng-surface p-3 rounded-xl border border-padaeng-border space-y-1.5 mt-2">
                <span className="font-bold text-padaeng-text block mb-1">รายการที่สกัดได้:</span>
                {draftData.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between font-medium">
                    <span>{item.name} x{item.quantity}</span>
                    <span className="font-bold">฿{item.total}</span>
                  </div>
                ))}
                <div className="flex justify-between font-extrabold text-sm text-padaeng-text pt-1.5 border-t border-padaeng-border">
                  <span>ยอดรวม (เงินสด):</span>
                  <span className="text-padaeng-red">฿{draftData.totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={handleRejectDraft}
                disabled={isUpdating}
                className="py-3 rounded-xl border border-padaeng-border bg-padaeng-surface hover:bg-padaeng-border text-padaeng-text font-bold text-xs min-h-btn active:scale-95 transition-all"
              >
                ยกเลิกรายการ
              </button>
              <button
                onClick={handleConfirmDraft}
                disabled={isUpdating}
                className="py-3 rounded-xl bg-padaeng-red hover:bg-padaeng-red-hover text-white font-bold text-sm min-h-btn shadow-md active:scale-95 transition-all"
              >
                ยืนยันบันทึกจริง
              </button>
            </div>
          </div>
        )}

        {/* Confirmed Success State */}
        {draftStatus === 'confirmed' && (
          <div className="bg-white rounded-padaeng p-6 border border-padaeng-border text-center space-y-4 shadow-md animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-padaeng-text">ยืนยัน Draft สำเร็จ!</h3>
              <p className="text-xs text-padaeng-muted mt-1">
                Draft นี้ได้รับการยืนยันแล้ว แต่ยังไม่มีการตัดยอดเงินหรือสต๊อกจนกว่าจะเชื่อมต่อ transaction backend
              </p>
            </div>
            <Link
              href="/pos"
              className="w-full bg-padaeng-red text-white font-bold py-3 rounded-xl text-sm min-h-btn block text-center shadow-md active:scale-95"
            >
              ไปที่หน้าขาย POS
            </Link>
          </div>
        )}

        {/* Rejected State */}
        {draftStatus === 'rejected' && (
          <div className="bg-white rounded-padaeng p-6 border border-padaeng-border text-center space-y-4 shadow-md animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-red-50 text-padaeng-red flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-padaeng-text">ยกเลิกรายการร่างแล้ว</h3>
              <p className="text-xs text-padaeng-muted mt-1">
                ไม่มีการบันทึกข้อมูลการเงินหรือตัดสต๊อกในระบบ
              </p>
            </div>
            <Link
              href="/pos"
              className="w-full bg-padaeng-surface border border-padaeng-border text-padaeng-text font-bold py-3 rounded-xl text-sm min-h-btn block text-center active:scale-95"
            >
              กลับหน้าขาย POS
            </Link>
          </div>
        )}
      </div>

      <footer className="text-center py-3 text-xs text-padaeng-muted">
        ป้าแดง POS — Draft-First AI Human Confirmation Engine
      </footer>
    </div>
  );
}
