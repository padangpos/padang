# PaDaeng POS — Design System & CI Guidelines

> **Brand Name:** ป้าแดง POS (PaDaeng POS)  
> **Brand Slogan:** ป้าสายเทค ผู้ช่วยร้านค้า  
> **Core CI Palette:** Primary Red (`#D72638`), Pure White (`#FFFFFF`)  
> **Motion Engine:** GSAP (GreenSock) for micro-animations, transitions & mascot feedback

---

## 1. Brand Identity & Visual Personality

### 1.1 Mascot & Logo Character
- **Mascot:** Auntie PaDaeng — A friendly, confident, local Thai auntie wearing modern red sunglasses.
- **Personality Attributes:**
  - **Friendly & Approachable:** Warm, plain-language assistant.
  - **Confident & Capable:** Expert tech assistant who makes shop management effortless.
  - **Thai Local Context:** Uses familiar everyday Thai phrases.
  - **Modern & Clean:** Sleek, high-contrast, uncluttered user interface.

### 1.2 Color Palette Tokens

```css
:root {
  /* Brand Core Colors */
  --primary-red: #D72638;         /* Main Red CI */
  --primary-red-hover: #B81D2D;   /* Hover State */
  --primary-red-active: #961523;  /* Active/Pressed State */
  --primary-red-light: #FDF2F3;   /* Light Red Background Tint */

  /* Neutral Spectrum */
  --background: #FFFFFF;          /* Pure White Background */
  --surface: #F8F9FA;             /* Surface Card Fill */
  --border: #E9ECEF;              /* Clean Subtle Border */
  --text-main: #1A1A1A;           /* High-Contrast Main Text */
  --text-muted: #6C757D;          /* Subtitle & Meta Text */

  /* System Feedback Colors */
  --success: #2E7D32;             /* Success / Payment Completed */
  --warning: #ED6C02;             /* Low Stock / Warning Alert */
  --error: #D32F2F;               /* Error State / Cancelled */
  --info: #0288D1;                /* Informational Alert */
}
```

> **Strict Rule:** Avoid multi-color gradients, heavy drop shadows, or auxiliary colors that distort the red-white CI.

---

## 2. GSAP Motion & Micro-Animations System

### 2.1 Motion Design Guidelines
- **Cart Badge Pulse:** When an item is added to cart, GSAP animates a subtle scale bounce (`scale: [1, 1.25, 1]`, duration: 0.25s, ease: `"back.out(2)"`).
- **Checkout Payment Success:** Animated checkmark SVG draw + scale up upon successful transaction completion.
- **Draft Slide-In:** AI Draft confirmation cards slide up from the bottom (`y: 50` to `y: 0`, opacity: 0 to 1, ease: `"power2.out"`).
- **Mascot Interaction:** Auntie PaDaeng sunglasses glint / subtle node idle floating effect for friendly tech vibe.

### 2.2 Reusable GSAP Utility Functions (`lib/animations/gsap.ts`)
- `animateCartAdd(targetRef)`
- `animateSuccessModal(containerRef)`
- `animateDraftCard(cardRef)`
- `animateMascotIdle(mascotRef)`

---

## 3. Typography & Tone of Voice

### 3.1 Font Hierarchy
- **Primary Thai Font:** `Prompt`, `Sarabun`, or clean system sans-serif fallback.
- **Heading 1 (Page Titles):** 24px - 28px / Bold (700)
- **Heading 2 (Card Titles / Totals):** 18px - 20px / SemiBold (600)
- **Body Text:** 16px / Regular (400)
- **Small / Meta Text:** 14px / Regular (400)

### 3.2 Tone of Voice Guidelines
- Use natural, conversational Thai with short, clear sentences.
- **Do:**
  - "ป้าจดให้แล้ว"
  - "วันนี้ขายได้ 8,450 บาท"
  - "กาแฟเหลือ 5 ถุง ให้ป้าเตือนไหม"
  - "ตรวจอีกครั้งแล้วกดยืนยันนะ"
  - "รายการนี้ยังไม่ถูกบันทึก"
- **Don't:** Avoid jargon without explanation (e.g., "การซิงโครไนซ์ฐานข้อมูลล้มเหลว"), and avoid overly joke-heavy tone that degrades financial trustworthiness.

---

## 4. UI Component Specifications & Touch Metrics

### 4.1 Touch Targets & Spacing
- **Minimum Touch Target:** All interactive elements (buttons, cart counters, category tabs) **MUST** be at least `44px x 44px`.
- **Primary Buttons:** Minimum height `48px`, rounded corners (`8px` or `12px`), bold text, background `#D72638`, text `#FFFFFF`.
- **Card Padding:** Minimum `16px` padding around product cards and list items for easy tap accuracy.

### 4.2 Key Component Primitives

#### 1. Primary Action Button (`<Button variant="primary">`)
```tsx
// High contrast, large touch target, red fill, GSAP hover scale
<button className="h-12 px-6 bg-[#D72638] hover:bg-[#B81D2D] text-white font-bold rounded-xl active:scale-95 transition-all text-base min-w-[44px]">
  ชำระเงิน (3,450 บาท)
</button>
```

#### 2. Simple Mode Navigation Bar (`<SimpleNav>`)
- Fixed bottom bar on Mobile, sidebar on Tablet POS.
- Icon + Text label for all 6 main tabs.
- Active tab indicator highlighted with `#D72638`.

#### 3. AI Draft Confirmation Banner (`<DraftBanner>`)
- Displays draft metadata, confidence score, raw input summary.
- Clear `[ยืนยันบันทึก]` (Confirm) and `[แก้ไข/ยกเลิก]` (Edit/Cancel) buttons.

#### 4. Audit & Warning Badge (`<Badge variant="warning">`)
- Clear visual indicator for items needing attention (e.g., `ของใกล้หมด`, `รอการยืนยัน`).

---

## 5. UI/UX Rules & Guidelines

1. **Max 2 Taps to Cart:** Selecting an item from the POS screen adds it to cart in no more than 2 taps.
2. **Max 3 Taps Cash Checkout:** From the payment view, complete cash checkout in no more than 3 taps.
3. **No Hidden Costs:** Order totals, discounts, taxes, and change amounts must be clearly displayed before confirmation.
4. **Draft-First Guarantee:** Any action originating from AI or external webhooks must render a confirmation screen before mutating persistent storage.
