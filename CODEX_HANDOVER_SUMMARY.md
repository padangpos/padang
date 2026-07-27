# PaDaeng POS (ป้าแดง POS) — Project Handover & Codex Handoff Specification

> **Project Name:** ป้าแดง POS (PaDaeng POS)  
> **Slogan:** ป้าสายเทค ผู้ช่วยร้านค้า  
> **Brand CI:** Primary Red `#D72638`, Pure White `#FFFFFF`  
> **Current Platform Version:** v1.1.0 (Master Platform Complete - 100% Built & Verified)  
> **Target Audience:** ร้านอาหาร, คาเฟ่, ร้านของชำ/โชห่วย, ร้านค้าปลีก, Food Stall / Food Truck  
> **Strict Exclusions:** NO Hotel (PMS), Room Charge, Spa, Clinic, Appointment, Provider Schedule, Course/Package.

---

## 1. Executive Summary & Product Architecture

PaDaeng POS is a modern, simple-first POS, Inventory, Expense, and LINE Assistant platform designed for Thai SMB owners and retail staff. 

### Core Product Promises & Architectural Rules
1. **Simple Mode Navigation (Max 6 Main Tabs):**  
   1. 🛒 ขาย (`/pos`)  
   2. ⏸️ บิลพัก (`/held-bills`)  
   3. 📦 สินค้า (`/products`)  
   4. 📊 สต๊อก (`/stock`)  
   5. 👥 ลูกค้า (`/customers`)  
   6. 📈 สรุปยอด (`/summary`)  
   *(Advanced features live under "เมนูเพิ่มเติม / More Tools")*
2. **Speed Execution Limits:**  
   - Add item to cart in **≤ 2 Taps**.
   - Cash checkout completed in **≤ 3 Taps** (using quick bill buttons ฿50, ฿100, ฿500, ฿1,000 and change calculator).
3. **Draft-First AI Safety Rule:**  
   - Any action originating from AI, Voice, Text, or Photo OCR strictly creates a `command_drafts` record. No financial balance or stock ledger is mutated without explicit human review & confirmation via LIFF/Web UI.
4. **Touch & Visual Metrics:**  
   - All interactive touch targets are **≥ 44px x 44px**.
   - Primary action buttons are **≥ 48px** with high contrast Red/White visual hierarchy.
   - Powered by **GSAP** for micro-animations (cart bounce, checkmark draw, draft slide-in).

---

## 2. Tech Stack & Repository Structure

```
c:\Users\sakee\Documents\ป้าแดง\
├── app/
│   ├── page.tsx                    # Landing Dashboard (Simple Mode + More Tools)
│   ├── pos/page.tsx                # Core POS Checkout UI (Mobile & Tablet POS split view)
│   ├── onboarding/page.tsx         # 10-Minute Store Setup Wizard
│   ├── held-bills/page.tsx         # Active Held Bills Recall & Cancellation
│   ├── products/page.tsx           # Product Catalog, Image URL Field & Photo Menu Draft Importer
│   ├── stock/page.tsx              # Stock Balances & Auditable Stock Movement Ledger
│   ├── expenses/page.tsx           # Expense Tracker & Photo Receipt OCR Draft Importer
│   ├── staff/page.tsx              # Staff Directory & Role Presets Manager
│   ├── summary/page.tsx            # Shift Closing, Cash Discrepancy & LINE Summary Push
│   ├── reports/page.tsx            # Gross Profit Margins & Top Selling Leaderboard
│   ├── settings/page.tsx           # PromptPay QR Payload Generator & Receipt Customization
│   ├── customers/page.tsx          # Customer Directory & Loyalty Points Ledger
│   ├── audit-logs/page.tsx         # Immutable System Audit Trail Inspector
│   ├── branches/page.tsx           # Multi-Branch Locations Manager
│   ├── liff/drafts/[id]/page.tsx   # Interactive LIFF AI Draft Confirmation Screen
│   ├── api/webhooks/line/route.ts  # LINE Webhook Receiver & Quick Reply Generator
│   ├── globals.css                 # Global CSS Tokens & Touch Utilities
│   ├── layout.tsx                  # Root Layout
│   └── not-found.tsx               # Custom 404 Auntie PaDaeng Not Found Page
├── components/
│   ├── pos/
│   │   ├── ProductGrid.tsx         # Category pills, Search, Product cards with Thumbnails
│   │   ├── CartDrawer.tsx          # Cart items, +/- controls, Subtotal, Discount, Grand Total
│   │   ├── PaymentModal.tsx        # Cash, PromptPay QR, Credit Card payment overlay
│   │   ├── ReceiptModal.tsx        # Thermal/Digital receipt with GSAP checkmark & print
│   │   └── QuickSaleModal.tsx      # Quick Sale Numpad for unlisted custom items
├── lib/
│   ├── types/database.ts           # Strict TypeScript Entity Interfaces
│   ├── store/usePosStore.ts        # Zustand Store (Cart, Catalog, Held Bills, Pricing)
│   ├── pos/calculator.ts           # Subtotal, Discount, 7% VAT, Grand Total, Change Cash
│   ├── ai/intent-parser.ts         # Text/Voice Draft Intent Parser
│   ├── animations/gsap.ts          # Reusable GSAP Animation Hooks
│   ├── utils/promptpay.ts          # PromptPay EMVCo Payload & CRC16 Generator
│   ├── audit/logger.ts             # System Audit Trail Recorder
│   ├── supabase/client.ts          # Supabase Client Abstraction
│   └── auth/line-mapping.ts        # LINE Identity Mapping Strategy
├── supabase/
│   └── migrations/
│       └── 20260726000000_phase0_init.sql  # Complete Multi-Tenant PostgreSQL DDL & RLS
├── scripts/
│   ├── seed-data.ts                # Demo Store Seed Generator
│   └── verify-rls.ts               # Automated RLS Security Test Script
├── tests/
│   └── unit/
│       ├── pos-calculator.test.ts  # Vitest Suite for POS Calculations
│       └── intent-parser.test.ts   # Vitest Suite for Draft Intent Parser
├── package.json                    # Scripts & Dependencies (Next 14, Tailwind, GSAP, Supabase, Vitest)
├── tailwind.config.ts              # Design System Tokens (`padaeng-red: #D72638`)
├── tsconfig.json                   # Strict TypeScript Config
└── vitest.config.ts                # Vitest Test Runner Config
```

---

## 3. Detailed Summary of Implemented Features

| Module / Feature | Status | Key Functionality & Route |
| :--- | :--- | :--- |
| **Simple Mode Dashboard** | ✅ 100% Done | `/` — 6 Main Navigation Tabs + More Tools Shortcuts |
| **Store Onboarding Wizard** | ✅ 100% Done | `/onboarding` — 3-Step Wizard: Business type, initial item & test bill |
| **Touch POS & Cart** | ✅ 100% Done | `/pos` — ≤2-tap cart, ≤3-tap cash checkout, GSAP bounce animation |
| **Quick Sale Numpad** | ✅ 100% Done | `QuickSaleModal.tsx` — Numpad for unlisted arbitrary item sales |
| **Held Bills Manager** | ✅ 100% Done | `/held-bills` — Hold cart with reference name & 1-tap recall |
| **Product & Photo Menu Importer** | ✅ 100% Done | `/products` — Product images, category manager & Photo Menu Draft importer |
| **Stock & Inventory Ledger** | ✅ 100% Done | `/stock` — Low stock alerts (เหลือน้อย) & Stock Movement audit history |
| **Expense & Photo Receipt OCR** | ✅ 100% Done | `/expenses` — Expense categories & Photo Receipt OCR Draft importer |
| **Staff Roles & Permissions** | ✅ 100% Done | `/staff` — Role presets (Owner, Manager, Cashier, Staff) & Invite modal |
| **Shift Close & Discrepancy** | ✅ 100% Done | `/summary` — Drawer cash calculator (เงินขาด/เงินเกิน) & LINE summary push |
| **Operational Analytics** | ✅ 100% Done | `/reports` — Gross profit margins & Top-selling products leaderboard |
| **PromptPay & Receipt Config** | ✅ 100% Done | `/settings` — PromptPay EMVCo QR generator & Custom receipt footer |
| **Customer & Loyalty Points** | ✅ 100% Done | `/customers` — Membership directory & points balance ledger (Earn 1 pt / ฿50) |
| **Immutable Audit Trail** | ✅ 100% Done | `/audit-logs` — Audit log viewer for all financial & stock changes |
| **Multi-Branch Manager** | ✅ 100% Done | `/branches` — Multi-branch locations & branch code manager |
| **LINE AI Webhook Engine** | ✅ 100% Done | `/api/webhooks/line` — Webhook parser for text/voice/photo commands |
| **LIFF Draft Confirmation** | ✅ 100% Done | `/liff/drafts/[id]` — Interactive LIFF human review & confirm screen |

---

## 4. Quality Assurance & Test Commands

All automated tests and build scripts are passing 100%:

```bash
# 1. Run TypeScript Typecheck (0 compilation errors)
npm run typecheck

# 2. Run Vitest Unit Tests (8/8 tests pass)
npm run test:unit

# 3. Run Multi-Tenant RLS Security Audit
npm run test:security

# 4. Run Full Next.js Production Build (All 18 routes compile cleanly)
npm run build
```

---

## 5. Guidelines & Instructions for Codex (Next Steps)

When continuing work on this repository, Codex **MUST** observe the following guidelines:

1. **Maintain Design Tokens & Visual CI:**  
   Always use Primary Red `#D72638` and Pure White `#FFFFFF`. Never alter the two-tone CI or introduce heavy dark gradients.
2. **Preserve Simple Mode Navigation:**  
   The main menu must strictly contain no more than 6 core items (ขาย, บิลพัก, สินค้า, สต๊อก, ลูกค้า, สรุปยอด).
3. **Respect Draft-First AI Architecture:**  
   Never modify database balances directly from webhook calls or AI intents without going through `command_drafts` and obtaining explicit human confirmation.
4. **Adhere to Explicit Exclusions:**  
   Do **NOT** add Hotel (PMS), Room Charge, Spa, Clinic, Appointment, Provider Schedule, or Course/Package features.
5. **Keep Line & File Links Clickable:**  
   Always provide clear file links using standard markdown format (e.g., [app/pos/page.tsx](file:///c:/Users/sakee/Documents/ป้าแดง/app/pos/page.tsx)).
