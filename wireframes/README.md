# Hela Hop — Mobile-First Wireframes & Design Specification (8 Screens)

> **Product:** Hela Hop (`helahop.app`) — Kenyan M-PESA Payment Link App  
> **Brand Color:** Emerald Green (`#10b981`)  
> **Target Audience:** Informal micro-merchants & social sellers on Instagram and WhatsApp in Kenya (thrift vendors, bakers, hair stylists, electronics shops)  
> **Deliverable:** Mobile-First Wireframes (8 Screens) + Interactive HTML Prototype + Design System Guide  

---

## 1. Design System & Mobile Foundation

### 1.1 Brand Color Palette
| Token | Hex | Role | Contrast Ratio |
|---|---|---|---|
| `--primary` | `#10b981` | Primary emerald brand action, active states, verified badges | 4.8:1 on dark, AA |
| `--primary-hover` | `#059669` | Pressed / hover button state, emphasis text | 5.2:1 on light |
| `--primary-light` | `#ecfdf5` | Highlight surfaces, callout cards, active tab pills | Subdued tint |
| `--primary-border`| `#a7f3d0` | Subtle emerald borders for verified items | Clean delimiter |
| `--dark` | `#0f172a` | High-contrast typography, topbars, phone frames | 14.5:1 on light, AAA |
| `--slate-600` | `#475569` | Secondary instructional body text | 6.8:1 on light |
| `--slate-50` | `#f8fafc` | Background canvas for nested cards | Neutral backdrop |
| `--amber` | `#d97706` | Pending / unclaimed invoices, caution badges | 4.9:1 on light |

### 1.2 Strict Mobile-First Touch & Screen Constraints
- **Minimum Tap Target:** Every interactive element (buttons, form inputs, toggles, icon hit-zones) is **≥ 44px** (most primary CTAs are 48px to 52px). Pinch-zoom is **not** blocked (accessibility).
- **320px Width Viewport Compliant:** Designed and stress-tested for 320px width screens (e.g., budget Tecno, Itel, Neon Ray, iPhone SE).
  - Horizontal padding: `12px` to `14px` on 320px, expanding to `16px` on 375px+.
  - Monospace font for digits and M-PESA transaction codes to prevent layout shifting.
  - Zero horizontal overflow (`overflow-x: hidden`, flexible flexbox wrapping).
- **Performance Budget (< 200KB per page):**
  - Zero heavy external web fonts or CDN icon packages.
  - All icons are pure SVG or native Unicode glyphs.
  - Entire interactive wireframe suite (HTML + CSS + JS) is **~97KB uncompressed** (~20KB gzipped, measured 7 Nov 2026), well under the 200KB limit.
- **Bilingual Support (Swahili + English):**
  - Public-facing payment links (`/pay/:seller`) and invoice pages (`/i/:code`) feature a 44px language toggle switch between Kenyan English and natural Swahili.

---

## 2. The 8 Core Wireframe Screens

### Screen 1: Landing Page (`/`)
* **Purpose:** Convert informal Instagram/WhatsApp sellers with a fast, zero-paperwork value proposition.
* **Layout Anatomy:**
  1. **Topbar:** Brand logo (emerald "H" badge) + "Log In / Ingia" link.
  2. **Trust Tag:** `🇰🇪 Direct to your M-PESA` pill.
  3. **Headline:** *"Get your payment link in 60 seconds."*
  4. **Subhead:** *"Sell on WhatsApp & Instagram without mistyped Paybills or asking customers 'umesend screenshot?'"*
  5. **Primary CTA:** High-contrast emerald button `[ Get Started Free ➔ ]` (48px height) linking straight to Sign-Up.
  6. **Interactive CSS Phone Mockup:** Visual preview showing `helahop.app/pay/mama-shiro` with a 1-tap copy button for a Till number.
  7. **3 Seller Pains Solved:**
     - *No More Mistyped Paybills:* 1-tap copy guarantees customers never send money to the wrong person.
     - *Track Paid vs Unpaid:* Customers submit their M-PESA code; seller confirms in one tap.
     - *Zero Commission in Phase 1:* Direct peer-to-merchant payment; Hela Hop never touches the cash.

### Screen 2: Sign-Up (`/signup`)
* **Purpose:** Single-step seller registration. Eliminates drop-offs by omitting national ID, business registration, or SIM card requirements at sign-up.
* **Layout Anatomy:**
  1. **Topbar:** Back button (44px hit-box) + Hela Hop logo.
  2. **Headline:** *"Create Seller Account — One simple step to get your M-PESA payment link."*
  3. **Email Input:** `type="email"`, `inputmode="email"`, min 48px height.
  4. **Password Input:** Min 10 characters with a dedicated 44px `[ Show / Hide ]` toggle button.
  5. **Terms & Legal Checkbox:** 44px tap zone with plain-language disclosure: *"I agree to the Terms & Privacy Policy. Hela Hop does not hold my funds."*
  6. **Primary CTA:** `[ Create Account & Setup Link ➔ ]` (48px height).
  7. **Alternative Auth:** Google button, labelled **Phase 2 / not in the first build** (Master Plan schedules Google sign-in for Week 10).

### Screen 3: Seller Dashboard (`/dashboard`)
* **Purpose:** Daily financial command center for tracking order collections and chasing pending payments.
* **Layout Anatomy:**
  1. **Topbar:** Seller avatar ("MS"), business nickname ("Mama Shiro Thrift"), active payout indicator (`🟢 Pochi: 0722***456`), and Payout Settings gear (44px).
  2. **Monthly Summary Card:** High-contrast gradient card showing `KES 42,850` total volume, `Paid (14 orders)` in emerald, and `Unpaid (3 pending)` in amber.
  3. **Quick Action Bar:** Two 44px buttons side-by-side: `[ ➕ Create Invoice ]` and `[ 🔗 View Pay Link ]`.
  4. **Public Link Bar:** Shows `helahop.app/pay/shiro-thrift` with a 1-tap `[ Copy ]` button.
  5. **Payment Stream with Status Tabs:** Segmented filter tabs `All (3)`, `Paid (2)`, `Unpaid (1)`.
  6. **Transaction Cards:** Displays customer name, item summary, timestamp, KES amount, and status badge. For pending claims, shows a direct `[ Confirm KES 2,000 ]` action button.
  7. **Bottom Tab Navigation:** 44px navigation bar for mobile thumb-zone navigation: `Home`, `Invoice`, `My Link`, `Payouts`.

### Screen 4: Add Payout Method (`/settings/payout`)
* **Purpose:** Dynamic configuration of where customer funds should land.
* **Layout Anatomy:**
  1. **4-Way Payout Method Selector:** Large segmented cards (54px height) covering the 4 primary Kenyan M-PESA channels:
     - **Buy Goods Till:** (5–7 digits)
     - **Paybill:** (5–6 digit business number + account number prompt)
     - **Pochi la Biashara:** (Safaricom phone number)
     - **Send Money Phone:** (Personal 07xx / 01xx phone line)
  2. **Dynamic Form Fields:** Automatically swaps input fields based on the selected method.
  3. **Friendly Nickname Field:** e.g., *"Nairobi CBD Stall Till"*.
  4. **Default Toggle:** Large 44px checkbox to set as the primary receiving destination.
  5. **Security Reassurance Note:** Informs the seller that payments will be sent directly from the buyer to this destination.

### Screen 5: Public Payment Link (`/pay/:seller-name`)
* **Purpose:** Public landing page shared in Instagram bios or WhatsApp chats.
* **Layout Anatomy:**
  1. **Topbar:** Brand logo + **English / Kiswahili Toggle Pill** (44px touch area).
  2. **Seller Identity:** Profile avatar, username (`@amani-crafts`), location. The word "verified" is deliberately **not** used: Hela Hop does not verify sellers until KYC exists (Phase 3+).
  3. **Mandatory Disclaimer Banner:** *"⚠️ Hela Hop does not verify this seller. Only send money to sellers you trust."* (Swahili: *"⚠️ Hela Hop haithibitishi muuzaji huyu. Lipa tu watu unaowaamini."*)
  4. **Order / Item Card:** Item title and bold amount (`KES 2,500`).
  5. **Prominent Number Card with BIG Copy Button:**
     - Giant 32px monospace shortcode: **`5492103`**.
     - Registered store name confirmation: **AMANI CRAFTS**.
     - Giant 52px high `[ 📋 Copy Till Number (5492103) ]` button with instant visual feedback (`✅ Copied!`).
  6. **Step-by-Step Instructions:** Accordion guide formatted for Safaricom SIM Toolkit or M-PESA App.
  7. **Action CTA:** `[ ✅ I've Sent Payment — Enter Code ]` (50px height).

### Screen 6: Create Invoice (`/invoices/new`)
* **Purpose:** Create itemized, professional invoices in seconds for WhatsApp buyers.
* **Layout Anatomy:**
  1. **Topbar:** Back button + Invoice Code indicator (`#INV-8493`).
  2. **Customer Details Card:** Customer full name + WhatsApp phone number (`07XX XXX XXX`).
  3. **Itemized Builder:**
     - Item description input.
     - Quantity and Unit Price inputs (44px).
     - `+ Add Item` button.
     - Optional Delivery Fee line item (e.g., `CBD Delivery: KES 200`).
     - Real-time total calculation in bold emerald (`KES 2,000`).
  4. **Due Date & Payout Selector:** Quick date picker ("Due Today", "Tomorrow") + dropdown to select which saved payout method receives the funds.
  5. **Submit CTA:** `[ Generate & View Invoice Link ➔ ]` (50px height).

### Screen 7: Public Invoice Page (`/i/:code`)
* **Purpose:** Payer-facing invoice link with the "I've Paid" claim and verification loop.
* **Layout Anatomy:**
  1. **Topbar:** Hela Hop logo + **EN / SW Language Switcher** (44px).
  2. **Invoice Summary Card:** Invoice `#INV-8492` (not labelled "official": it is not a KRA eTIMS tax invoice), status pill (`DUE TODAY` / `INAPASA LEO`, becomes `CLAIMED` / `IMEDAIWA` after a claim), Seller name, Billed-to details, and full itemized pricing breakdown.
  3. **Payout Details Card:** Clear display of receiving Pochi/Till number with 1-tap `[ Copy ]` button.
  4. **"I've Paid" Verification Section:**
     - Highlighted emerald callout box.
     - Explanation: *"Paste the 10-character M-PESA confirmation code from your Safaricom SMS."*
     - High-contrast monospace code input field: `e.g. SDF4891K2`.
     - Code input accepts exactly 10 letters/numbers (e.g. `SDF489K1L2`); anything else shows an inline error.
     - Primary button: `[ ✅ Send Payment Claim ]` (48px height).
     - After submitting, the form is replaced by a **"Claim sent. Waiting for the seller to confirm."** state with a `CLAIMED` badge. **No receipt is issued yet.**

### Screen 8: Receipt Page (`/receipt/:id`)
* **Purpose:** Permanent proof of payment and trust artifact for buyers and sellers.
* **Layout Anatomy:**
  1. **Success Hero:** Emerald checkmark icon + *"Payment Confirmed"* with the line *"Confirmed by the seller"*. A receipt only exists **after the seller confirms** the claim against their own M-PESA SMS (Screen 3).
  2. **Receipt ID:** `#REC-2026-9041`.
  3. **Vector QR Code:** Standalone vector SVG (3KB) linking to `helahop.app/r/k7Qm2xP9aT`. **Build rule:** the public receipt link uses a long random token, never a sequential number, so receipts cannot be guessed; payer phone numbers are masked (e.g. `0712 *** 678`).
  4. **Transaction Metadata Table:** Amount Paid (`KES 2,000`), M-PESA Code (`SDF489K1L2`), Paid To, Paid By, Timestamp (`07 Nov 2026, 21:42 EAT`), and item list.
  5. **Share Actions (48px height):**
     - `[ 💬 Share on WhatsApp ]` (pre-fills confirmation message to the seller).
     - `[ 📥 Download Receipt (PDF) ]`.
  6. **Viral Growth Referral Footer:** *"Are you also a seller on IG or WhatsApp? Get your free link in 60s."*

---

## 3. English <-> Kiswahili Localization Matrix

| Component / UI Element | English (EN) | Kiswahili (SW) |
|---|---|---|
| Disclaimer Banner | ⚠️ Hela Hop does not verify this seller. Only send money to sellers you trust. | ⚠️ Hela Hop haithibitishi muuzaji huyu. Lipa tu watu unaowaamini. |
| Item / Purpose Label | FOR ORDER / ITEM | MALIPO YA BIDHAA |
| Till Header | BUY GOODS TILL NUMBER | NAMBARI YA TILL (BUY GOODS) |
| Paybill Header | PAYBILL BUSINESS NUMBER | NAMBARI YA BIASHARA (PAYBILL) |
| Pochi Header | POCHI LA BIASHARA NUMBER | NAMBARI YA POCHI LA BIASHARA |
| Store Name Label | Store Name: | Jina la Duka: |
| Copy Button | Copy Till Number (5492103) | Nakili Nambari ya Till (5492103) |
| Copy Feedback | ✅ Copied to clipboard! | ✅ Nambari imenakiliwa! |
| Instructions Header | How to Pay via M-PESA | Jinsi ya Kulipa kupitia M-PESA |
| Step 1 | Open SIM Toolkit or M-PESA App. | Fungua SIM Toolkit au M-PESA App. |
| Step 2 | Select Lipa na M-PESA > Buy Goods. | Chagua Lipa na M-PESA > Buy Goods and Services. |
| Step 3 | Enter Till Number: 5492103 | Weka Nambari ya Till: 5492103 |
| Step 4 | Enter Amount: KES 2,500 | Weka Kiasi cha Pesa: KES 2,500 |
| Step 5 | Enter your M-PESA PIN and press OK. | Weka PIN yako ya M-PESA na ubonyeze OK. |
| I've Paid Button | I've Sent Payment — Enter Code | Nimeshatuma Malipo — Weka Msimbo |
| Invoice Header | INVOICE | ANKARA YA MALIPO |
| Billed To | Billed to: | Inalipwa na: |
| Due Today | DUE TODAY | INAPASA LEO |
| Total Due | Total Due: | Jumla Inayopasa: |
| Code Input Prompt | Paste the 10-character M-PESA confirmation code from your Safaricom SMS. | Weka msimbo wenye herufi na nambari 10 kutoka ujumbe wako wa Safaricom SMS. |
| Submit Claim CTA | Send Payment Claim | Tuma Dai la Malipo |
| Claim Sent | Claim sent. Waiting for the seller to confirm. | Dai limetumwa. Subiri muuzaji athibitishe. |
| Payment Disclaimer | Hela Hop is a peer payment bridge. Funds go straight to the seller's M-PESA account. | Hela Hop haishiki pesa zako. Malipo yanaenda moja kwa moja kwa M-PESA ya muuzaji. |
| Receipt Confirmed | Payment Confirmed (by the seller) | Malipo Yamethibitishwa (na muuzaji) |

---

## 4. How to Preview the Wireframes

1. Open `wireframes/index.html` in any modern desktop or mobile browser.
2. Use the top switcher to jump between screens (1 to 8).
3. Click the viewport width pills (`📱 320px`, `375px`, `412px`) to inspect layout behavior on budget Androids vs standard smartphones.
4. On Screen 5 (`/pay`) and Screen 7 (`/i`), click the `EN` / `SW` toggle to preview the bilingual translation in real time.
5. Test interactive components:
   - Tap `[ Copy Till Number ]` to test clipboard interaction and visual confirmation.
   - Switch payout tabs on Screen 4 to watch the form inputs adapt dynamically.
   - Submit a 10-character M-PESA code on Screen 7: it shows "Claim sent, waiting for the seller". Then open Screen 3 and tap `Confirm KES 2,000` to reach the receipt on Screen 8 (this mirrors the real claim → seller confirms → receipt flow).
   - Swahili for the claim screen is only previewed after tapping `SW` before or after submitting.
