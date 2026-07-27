import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ป้าแดง POS (PaDaeng POS) — ป้าสายเทค ผู้ช่วยร้านค้า",
  description: "ระบบ POS, สต๊อก, รายจ่าย และผู้ช่วย LINE สำหรับร้านค้าปลีกและร้านอาหาร",
  icons: {
    icon: "/brand/padaeng-mark.png",
    apple: "/brand/padaeng-mark.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="antialiased bg-padaeng-surface min-h-screen text-padaeng-text">
        {children}
      </body>
    </html>
  );
}
