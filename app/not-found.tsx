import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-padaeng-surface flex flex-col items-center justify-center p-4 text-center font-sans">
      <div className="bg-white p-8 rounded-padaeng border border-padaeng-border max-w-sm w-full space-y-4 shadow-md">
        <div className="w-16 h-16 rounded-full bg-padaeng-red text-white flex items-center justify-center mx-auto text-2xl font-black">
          ป้า
        </div>
        <h2 className="text-xl font-bold text-padaeng-text">ไม่พบหน้านี้ (404 Not Found)</h2>
        <p className="text-xs text-padaeng-muted">
          ป้าหาหน้าที่คุณต้องการไม่พบ ลองกลับไปที่หน้าหลักดูนะ
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center space-x-2 w-full bg-padaeng-red hover:bg-padaeng-red-hover text-white font-bold py-3 rounded-xl text-sm min-h-btn shadow-md active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับหน้าหลักป้าแดง POS</span>
        </Link>
      </div>
    </div>
  );
}
