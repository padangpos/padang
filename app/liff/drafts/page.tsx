import { redirect } from 'next/navigation';

export default function LiffDraftEntryPage({ searchParams }: { searchParams: { draftId?: string } }) {
  if (searchParams.draftId) {
    redirect(`/liff/drafts/${encodeURIComponent(searchParams.draftId)}`);
  }

  return (
    <main className="min-h-screen bg-padaeng-surface p-6 flex items-center justify-center">
      <div className="max-w-md rounded-padaeng bg-white border border-padaeng-border p-6 text-center shadow-sm">
        <h1 className="text-lg font-bold text-padaeng-text">ไม่พบ Draft</h1>
        <p className="mt-2 text-sm text-padaeng-muted">กรุณาเปิดลิงก์ยืนยัน Draft จาก LINE อีกครั้ง</p>
      </div>
    </main>
  );
}
