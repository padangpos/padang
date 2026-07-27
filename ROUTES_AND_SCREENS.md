# PaDaeng POS — Routes & Screens Specification

> **Design Target:** Mobile-First & Tablet POS  
> **Main Navigation:** Simple Mode (Max 6 Main Items) + "More" Menu for Advanced Tools.

---

## 1. Simple Mode Navigation Structure

```
+-----------------------------------------------------------------------------------+
|                              PaDaeng POS Navigation                               |
+-------------------+-------------------+-------------------+-----------------------+
|  1. 🛒 ขาย        |  2. ⏸️ บิลพัก     |  3. 📦 สินค้า      |  4. 📊 สต๊อก           |
|     (/pos)        |     (/held-bills) |     (/products)   |     (/stock)          |
+-------------------+-------------------+-------------------+-----------------------+
|  5. 👥 ลูกค้า      |  6. 📈 สรุปยอด    |  ⚙️ เพิ่มเติม (More Menu)                 |
|     (/customers)  |     (/summary)    |  (/expenses, /reports, /staff, etc.)  |
+-------------------+-------------------+-------------------+-----------------------+
```

---

## 2. Route Directory & Screen Specifications

### 2.1 Authentication & Onboarding Routes

| Route | Screen Name | Description & Key Actions | Primary Action Button |
| :--- | :--- | :--- | :--- |
| `/login` | หน้าเข้าสู่ระบบ | LINE Login & standard login options | `เข้าสู่ระบบด้วย LINE` |
| `/auth/callback` | OAuth Handler | Auth callback processing & token store | N/A (Redirecting) |
| `/onboarding` | ตั้งค่าร้านใหม่ | Step-by-step 10-minute setup wizard (Store name, Type, First product) | `เริ่มต้นใช้งานร้านค้า` |

---

### 2.2 Core Simple Mode Routes (Max 6 Main Tabs)

#### 1. 🛒 `/pos` — หน้าขายสินค้า (POS & Cart)
- **Layout:** Mobile tabbed view (Catalog / Cart) or Split-screen on Tablet POS.
- **Features:**
  - Product grid filtered by categories.
  - Search bar with instant barcode scanning support.
  - Cart tray with quantity adjustments, variant selection, and discount controls.
  - Quick checkout overlay (Cash, PromptPay QR, Card).
- **Rule:** Product item added in **≤ 2 taps**; Cash checkout completed in **≤ 3 taps**.
- **Primary Action:** `ชำระเงิน` (Pay Now) or `พักบิล` (Hold Bill).

#### 2. ⏸️ `/held-bills` — หน้าบิลพัก (Held Bills)
- **Layout:** Card grid / list of active held bills with customer reference names and timestamps.
- **Features:**
  - Recall held bill back into active POS cart.
  - Clear / cancel held bill with confirmation modal.
- **Primary Action:** `เรียกคืนบิล` (Recall Bill).

#### 3. 📦 `/products` — หน้าจัดการสินค้า (Products & Categories)
- **Layout:** Tabbed view between Products catalog and Category manager.
- **Features:**
  - Quick product search & filter.
  - Add / edit product modal with image upload, barcode, price, cost, and stock tracking toggle.
  - Photo Menu OCR Import button (`ถ่ายรูปเมนูเพื่อเพิ่มสินค้า`).
- **Primary Action:** `เพิ่มสินค้าใหม่` (Add New Product).

#### 4. 📊 `/stock` — หน้าจัดการสต๊อก (Stock & Inventory)
- **Layout:** Stock balance table with color-coded low stock warnings (เหลือน้อย).
- **Features:**
  - Filter by branch or low-stock status.
  - Quick stock adjustment modal with audit reason dropdown (รับเข้า, ของเสีย, ปรับปรุง).
  - Stock movement audit history log.
- **Primary Action:** `ปรับยอดสต๊อก` (Adjust Stock).

#### 5. 👥 `/customers` — หน้าจัดการลูกค้าและคะแนน (Customers & Loyalty)
- **Layout:** Customer list with search by name/phone, points balance badge.
- **Features:**
  - Customer detail view with purchase history.
  - Points adjustment / redemption panel.
  - Add new customer modal.
- **Primary Action:** `เพิ่มลูกค้า` (Add Customer).

#### 6. 📈 `/summary` — หน้าสรุปยอดและปิดกะ (Summary & Shift Close)
- **Layout:** Daily financial overview cards (Cash, PromptPay, Card, Expenses, Net Total).
- **Features:**
  - Current shift status & drawer cash calculator.
  - Cash discrepancy calculation (เงินขาด/เกิน).
  - Shift closing confirmation modal.
  - Send summary to LINE button (`ส่งสรุปเข้า LINE`).
- **Primary Action:** `ปิดกะและสรุปยอด` (Close Shift & Summarize).

---

### 2.3 Advanced Routes ("เพิ่มเติม" / More Menu)

| Route | Screen Name | Description |
| :--- | :--- | :--- |
| `/expenses` | บันทึกรายจ่าย | Record operating expenses & upload photo receipt for OCR draft creation |
| `/reports` | รายงานเชิงลึก | Detailed sales performance, top selling items, expense analysis |
| `/staff` | จัดการพนักงาน | Staff invitation, role assignment (Owner, Manager, Cashier, Staff) |
| `/settings` | ตั้งค่าระบบ | Store profile, branch details, tax settings, printer setup |
| `/audit-logs` | ประวัติตรวจสอบ | Immutable audit log of refunds, cancellations, and stock modifications |

---

### 2.4 LIFF & LINE Assistant Interfaces

| Route | Screen Name | Target Device | Purpose |
| :--- | :--- | :--- | :--- |
| `/liff/drafts/[id]` | หน้าตรวจและยืนยัน Draft | LINE Mobile | Interactive confirmation screen for voice/text/photo commands |
| `/liff/quick-sale` | หน้าขายแบบเร่งด่วน | LINE Mobile | Simplified mobile sales entry via LIFF |
| `/liff/receipt/[orderId]`| Digital Receipt | Customer Phone | Web receipt viewable by customer via LINE |

---

## 3. UI State Requirements (Mandatory for Every Screen)

Every screen **MUST** implement the following 3 distinct states:

1. **Loading State:** Skeleton loaders matching the page layout with high contrast spinner (`#D72638`).
2. **Empty State:** Friendly graphic/icon + clear explanation in plain Thai + Primary call-to-action button (e.g., "ยังไม่มีสินค้าในร้าน - [เพิ่มสินค้าแรก]").
3. **Error State:** Friendly message in plain Thai with retry button + contact support option ("เกิดข้อผิดพลาดในการโหลดข้อมูล - [ลองใหม่อีกครั้ง]").
