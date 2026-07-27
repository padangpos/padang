import Link from "next/link";
import {
  ShoppingCart,
  PauseCircle,
  Package,
  BarChart3,
  Users,
  PieChart,
  Sparkles,
  FileText,
  ShieldCheck,
  TrendingUp,
  Store,
  History,
  MessageSquare,
  Settings,
} from "lucide-react";

export default function HomePage() {
  const mainMenus = [
    { title: "ขาย", desc: "หน้าชำระเงิน POS", icon: ShoppingCart, href: "/pos", bg: "bg-padaeng-red text-white" },
    { title: "บิลพัก", desc: "รายการพักบิล", icon: PauseCircle, href: "/held-bills", bg: "bg-white text-padaeng-text border border-padaeng-border" },
    { title: "สินค้า", desc: "จัดการสินค้าและเมนู", icon: Package, href: "/products", bg: "bg-white text-padaeng-text border border-padaeng-border" },
    { title: "สต๊อก", desc: "ยอดคงเหลือและตัดสต๊อก", icon: BarChart3, href: "/stock", bg: "bg-white text-padaeng-text border border-padaeng-border" },
    { title: "ลูกค้า", desc: "สมาชิกและสะสมคะแนน", icon: Users, href: "/customers", bg: "bg-white text-padaeng-text border border-padaeng-border" },
    { title: "สรุปยอด", desc: "ยอดขายและปิดกะ", icon: PieChart, href: "/summary", bg: "bg-white text-padaeng-text border border-padaeng-border" },
  ];

  const advancedMenus = [
    { title: "รายจ่าย", desc: "จดรายจ่าย & OCR ใบเสร็จ", icon: FileText, href: "/expenses" },
    { title: "รายงานเชิงลึก", desc: "ยอดขาย & สินค้าขายดี", icon: TrendingUp, href: "/reports" },
    { title: "พนักงาน", desc: "สิทธิ์ & เชิญพนักงาน", icon: ShieldCheck, href: "/staff" },
    { title: "ประวัติตรวจสอบ", desc: "Audit Log ระบบ", icon: History, href: "/audit-logs" },
    { title: "จัดการสาขา", desc: "Multi-branch Settings", icon: Store, href: "/branches" },
    { title: "ตั้งค่าระบบ", desc: "PromptPay & ใบเสร็จ", icon: Settings, href: "/settings" },
    { title: "ตรวจ Draft LIFF", desc: "หน้ายืนยันบิล LINE", icon: MessageSquare, href: "/liff/drafts/draft-101" },
  ];

  return (
    <main className="max-w-md mx-auto min-h-screen bg-white p-4 flex flex-col justify-between">
      <div>
        {/* Brand Header */}
        <header className="py-5 text-center border-b border-padaeng-border mb-5">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-padaeng-red text-white text-2xl font-black mb-2 shadow-md">
            ป้า
          </div>
          <h1 className="text-2xl font-bold text-padaeng-text">ป้าแดง POS</h1>
          <p className="text-xs text-padaeng-red font-semibold mt-0.5">ป้าสายเทค ผู้ช่วยร้านค้า</p>
        </header>

        {/* AI Assistant Banner */}
        <div className="bg-padaeng-red-light border border-padaeng-red/20 rounded-padaeng p-3.5 mb-5 flex items-start space-x-3">
          <Sparkles className="w-5 h-5 text-padaeng-red shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-padaeng-red text-xs">ผู้ช่วย LINE ป้าแดง</h3>
            <p className="text-[11px] text-padaeng-text mt-0.5">
              พิมพ์ เสียง หรือถ่ายรูปบิลให้ป้าจดได้ตลอดเวลาผ่าน LINE OA
            </p>
          </div>
        </div>

        {/* Simple Mode Navigation Grid (Max 6 Main Items) */}
        <h2 className="text-xs font-bold text-padaeng-muted uppercase tracking-wider mb-2.5">
          เมนูหลัก (Simple Mode - 6 เมนู)
        </h2>
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          {mainMenus.map((menu, idx) => {
            const Icon = menu.icon;
            return (
              <Link
                key={idx}
                href={menu.href}
                className={`p-3.5 rounded-padaeng flex flex-col justify-between h-24 min-h-touch active:scale-95 transition-transform ${menu.bg}`}
              >
                <Icon className="w-6 h-6" />
                <div>
                  <span className="font-bold text-sm block">{menu.title}</span>
                  <span className="text-[11px] opacity-80 block truncate">{menu.desc}</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Advanced Features (More Menu) */}
        <h2 className="text-xs font-bold text-padaeng-muted uppercase tracking-wider mb-2.5">
          เมนูเพิ่มเติม (More Tools)
        </h2>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {advancedMenus.map((menu, idx) => {
            const Icon = menu.icon;
            return (
              <Link
                key={idx}
                href={menu.href}
                className="p-3 bg-padaeng-surface hover:bg-padaeng-red-light border border-padaeng-border rounded-xl flex items-center space-x-2.5 touch-target active:scale-95 transition-all"
              >
                <Icon className="w-5 h-5 text-padaeng-red shrink-0" />
                <div className="overflow-hidden">
                  <span className="font-bold text-xs text-padaeng-text block truncate">{menu.title}</span>
                  <span className="text-[10px] text-padaeng-muted block truncate">{menu.desc}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer info */}
      <footer className="py-3 text-center text-xs text-padaeng-muted border-t border-padaeng-border">
        <p>ป้าแดง POS v1.1.0 (Master Premium Edition)</p>
      </footer>
    </main>
  );
}
