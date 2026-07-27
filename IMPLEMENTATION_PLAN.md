# PaDaeng POS (ป้าแดง POS) — Master Implementation Plan

> **Slogan:** ป้าสายเทค ผู้ช่วยร้านค้า  
> **Brand Colors:** Primary Red `#D72638`, White `#FFFFFF`  
> **Animation Engine:** GSAP (GreenSock) for high-performance micro-animations & mascot interactions  
> **Target:** ร้านอาหาร, คาเฟ่, ร้านของชำ, ร้านค้าปลีก, Food Stall / Food Truck  
> **Strictly Excluded:** โรงแรม (PMS), สปา, คลินิก, ระบบนัดหมาย

---

## 1. Executive Summary & Strategy

PaDaeng POS is a modern, simple-first POS, Inventory, Expense, and LINE Assistant platform designed for Thai SMB owners and retail staff. The system operates on a **Draft-First AI Architecture** (Voice, Text, Vision/OCR) with mandatory human confirmation for financial transactions and inventory mutations. 

Rich visual aesthetics and smooth micro-animations powered by **GSAP** ensure an engaging, premium user experience on mobile and tablet displays.

### Key Objectives
1. **10-minute Store Setup:** Onboard store and run test bill in <10 minutes.
2. **5-minute Cashier Learning:** Cashiers master POS UI in <5 minutes.
3. **Fast POS Execution:** Add item to cart in ≤ 2 taps; cash checkout in ≤ 3 taps.
4. **Simple Mode Navigation (Max 6 Main Items):**
   - 🛒 ขาย (POS / Cart)
   - ⏸️ บิลพัก (Held Bills)
   - 📦 สินค้า (Products)
   - 📊 สต๊อก (Stock)
   - 👥 ลูกค้า (Customers)
   - 📈 สรุปยอด (Summary)
   *(Advanced features such as Expenses, Staff, Detailed Reports & Settings live under "เพิ่มเติม / More")*

---

## 2. Phase Breakdown & Execution Roadmap

### Phase 0 — Foundation & Infrastructure (Current Scope)
- [x] Repository setup & structure validation
- [x] Technical specification & design documentation
- [ ] Next.js + TypeScript + Tailwind CSS + GSAP project scaffolding
- [ ] Design Tokens implementation (`#D72638` primary red, GSAP motion utility tokens, touch targets ≥44px)
- [ ] Database Schema & Supabase SQL migrations (`store_id` multi-tenancy)
- [ ] Supabase Row-Level Security (RLS) policies for complete multi-tenant isolation
- [ ] Authentication abstraction layer & LINE Identity Mapping (`profiles` + `line_accounts`)
- [ ] Mock / Seed data generators for dev & test environments
- [ ] CI pipeline configuration (Linting, TypeScript checking, Test suite)

### Phase 1 — Core POS (Upcoming)
- Store onboarding flow & initial setup wizard
- Product catalog, categories, pricing, and variants
- Mobile-first & Tablet POS checkout UI with GSAP micro-interactions (cart pop, button feedback)
- Held bill management & recall
- Basic receipt rendering & printing logic
- Audit logging for all financial mutations

### Phase 2 — Operations (Upcoming)
- Inventory balance tracking & stock movements (Idempotent updates)
- Expense logging & photo receipt OCR draft flow
- Staff roles (Owner, Manager, Cashier, Staff) and permission checks
- Shift management (Open/Close shift) & cash discrepancy tracking
- Basic operational reports

### Phase 3 — LINE Assistant & AI Draft Flow (Upcoming)
- LINE Official Account webhook integration & LIFF application
- Intent parser adapter interface (Text, Speech-to-Text, OCR)
- Draft confirmation engine (Never mutate finance/stock without user verification)
- Quick Reply keyboard & push notifications
- Daily closing summary pushed via LINE

### Phase 4 — Customer & Loyalty (Upcoming)
- Customer profiles & LINE registration
- Loyalty points & transaction ledger
- Basic coupon & promotion rules

### Phase 5 — Scale (Future)
- Multi-branch hierarchy
- Central catalog sync
- Advanced stock transfer & analytics

---

## 3. Architecture & Tech Stack

```
+-----------------------------------------------------------------------+
|                         LINE Official Account                         |
|                (Voice, Text, Photo Receipt, Photo Menu)              |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                    PaDaeng LINE Assistant / LIFF                      |
|                  (Draft Presentation & Confirmation)                  |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|               PaDaeng POS Web Application (Next.js PWA)               |
|  - Simple Mode (6 tabs)                 - GSAP Micro-animations     |
|  - AI Draft Confirmation                - State (Zustand/Query)     |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                     Supabase Backend Platform                        |
|  - Auth & LINE Identity Mapping         - PostgreSQL Engine           |
|  - Strict Row-Level Security (RLS)      - Edge Functions / Storage    |
+-----------------------------------------------------------------------+
```

---

## 4. Security & Multi-Tenancy Rules

1. **Multi-Tenant Isolation:** Every business table MUST include `store_id UUID` tied to RLS policies. Cross-tenant reads or writes are strictly blocked at database level.
2. **Audit Logging:** Every price override, order cancellation, refund, stock adjustment, or permission modification MUST produce an `audit_logs` record.
3. **Idempotency:** Payment processing and stock movement operations require idempotency keys to prevent double-counting.
4. **AI Safety Guarantee:** AI intent parsing strictly creates a `command_drafts` record. No financial balance or stock ledger is updated until the user explicitly confirms the draft.

---

## 5. Phase 0 Verification & Definition of Done

To pass Phase 0:
1. All scaffolding files built cleanly without TypeScript errors (`tsc --noEmit`).
2. ESLint checks pass without warnings or errors.
3. Database migrations and RLS tests verify multi-tenant data separation.
4. CI test scripts execute and pass 100%.
5. Security verification confirms zero exposed secrets or RLS leaks.
