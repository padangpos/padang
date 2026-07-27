# PaDaeng POS — Master Test Plan & Quality Assurance Specification

> **Quality Goal:** Zero cross-tenant data leaks, sub-second POS calculations, 100% human confirmation on AI drafts.

---

## 1. Test Strategy Overview

```
+-----------------------------------------------------------------------+
|                       End-to-End (E2E) Tests                          |
|         (Playwright: Onboarding, 2-Tap Cart, 3-Tap Checkout)          |
+-----------------------------------------------------------------------+
|                    Integration & Security Tests                       |
|         (Supabase RLS Multi-Tenant Isolation, API Endpoints)          |
+-----------------------------------------------------------------------+
|                        Unit & Logic Tests                             |
|         (Vitest: Cart Calculations, Change Cash, AI Parser)           |
+-----------------------------------------------------------------------+
```

---

## 2. Unit Testing Suite (Vitest)

### 2.1 POS Calculation Engine
- [x] Subtotal calculation from item quantities & prices.
- [x] Discount application (Percentage vs. Fixed amount).
- [x] Tax calculation (Inclusive vs. Exclusive VAT).
- [x] Change calculation given tendered cash (Ensure non-negative results).

### 2.2 Draft & Intent Parsing Logic
- [x] Text intent parser maps `"ป้าแดง ขายน้ำ 3 ขวด เงินสด"` to draft payload (`store_id`, `product`, `qty: 3`, `payment: cash`).
- [x] Low confidence triggers clarification flag instead of guessing.

---

## 3. Integration & RLS Security Testing

### 3.1 Multi-Tenant Isolation Verification
- **Test Case:** User `MemberA` of `StoreA` attempts to query `products` or `orders` of `StoreB`.
- **Expected Outcome:** Supabase RLS returns 0 records (HTTP 200 with empty set or 403 Forbidden). Cross-tenant access strictly blocked.

### 3.2 Inventory & Payment Idempotency
- **Test Case:** Duplicate payment request sent with identical `idempotency_key`.
- **Expected Outcome:** Second request returns existing receipt without double-charging or double-deducting stock balance.

---

## 4. End-to-End (E2E) Acceptance Criteria (Playwright)

1. **Store Onboarding Test:**
   - User creates store, adds 1 category & 1 product, and completes test checkout within **< 10 minutes**.
2. **POS Speed Test:**
   - Cashier selects item and adds to cart (**≤ 2 taps**).
   - Cashier selects cash payment and confirms (**≤ 3 taps** from payment screen).
3. **AI Draft Safety Test:**
   - Simulated LINE webhook submits voice text `"จดค่าน้ำแข็ง 500 บาท"`.
   - Verify `command_drafts` created with `status: 'pending'`.
   - Verify zero financial balance changes until user clicks `[ยืนยัน]`.

---

## 5. Automated CI Checks (`npm test` / Github Actions)

```bash
# Executed on every pull request & commit
npm run lint          # ESLint rules check
npm run typecheck     # TypeScript strict mode verification
npm run test:unit     # Vitest unit test suite
npm run test:security # RLS & Multi-tenant security audit scripts
```
