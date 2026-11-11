# Hela Hop — Manual Test Checklist (Core Flow at 320px)

This checklist walks through the complete end-to-end payment and verification flow on a **320px mobile viewport** (e.g., iPhone SE / Chrome DevTools Responsive Mode set to 320 × 568 or 320 × 667).

---

## 0. Prerequisite Rules & Standards Checklist

Throughout testing, strictly verify the core fintech domain rules:

- [ ] **Rule D9:** Payer M-PESA code is treated strictly as a **claim**. A receipt exists **only** after the seller confirms. The word **"Verified"** must **never** appear anywhere in the UI, claims, receipts, or emails.
- [ ] **Rule D10:** Public links (`/pay/[slug]`, `/i/[code]`, `/r/[token]`) use unguessable, long random tokens. Phone numbers displayed on public pages are **masked** (e.g., `+254 712 *** 678` or `0712 *** 678`).
- [ ] **Rule D11:** Pages and documents must say **"Invoice"**, never "Official invoice". A seller or account must never be labelled **"verified"**.
- [ ] **Mobile Responsive (320px):**
  - Viewport meta tag allows zoom (no `maximum-scale=1` or `user-scalable=no`).
  - No horizontal scrolling or content clipping at 320px width.
  - All tap targets (buttons, links, form inputs) are at least **44 × 44px**.
  - Total transferred page weight is under **200KB**.

---

## 1. Seller Sign Up & Profile Setup

- **URL:** `/signup`
- **Viewport:** 320px width

### Test Steps:

1. Open Chrome DevTools, toggle Device Mode, select **Responsive**, and set width to `320px`.
2. Navigate to `http://localhost:3000/signup`.
3. Verify form layout:
   - [ ] No horizontal scrollbar.
   - [ ] Inputs (Email, Password) and "Sign Up" button have a tap height $\ge 44\text{px}$.
4. Test validation:
   - [ ] Blur email when empty: shows error message.
   - [ ] Enter password under 8 characters: shows validation warning.
5. Complete registration:
   - [ ] Enter a unique email (e.g. `seller.test+1@example.com`) and password $\ge 8$ chars.
   - [ ] Tap **Create Account** / **Sign Up**.
   - [ ] Verify successful redirection to `/dashboard` or confirmation prompt.

---

## 2. Configure Payout Method

- **URL:** `/dashboard/payout-methods`
- **Viewport:** 320px width

### Test Steps:

1. From the mobile navigation menu, tap **Payout Methods**.
2. Verify page layout at 320px:
   - [ ] "Add Payout Method" form fields fit without overflow.
   - [ ] Type selector buttons / dropdown options (Till, Paybill, Pochi, Phone) are $\ge 44\text{px}$ high.
3. Add a Till Number:
   - [ ] Select **Buy Goods (Till Number)**.
   - [ ] Enter Till Number: `888123`.
   - [ ] Enter Label: `Main Shop Till`.
   - [ ] Check **Set as default payout method**.
   - [ ] Tap **Save Payout Method**.
4. Verification:
   - [ ] Toast notification confirms creation.
   - [ ] Newly added payout method card appears in the list showing `Till: 888123` and a `Default` badge.
   - [ ] Action buttons (Delete / Set Default) have adequate spacing and touch targets.

---

## 3. Create Payment Link & Inspect QR Code

- **URL:** `/dashboard/links/new` & `/dashboard/links`
- **Viewport:** 320px width

### Test Steps:

1. Tap **Payment Links** in the menu, then tap **Create Link** (`/dashboard/links/new`).
2. Fill out link details:
   - [ ] Title: `Summer Consultation`.
   - [ ] Amount type: Fixed amount `1500` (KES 1,500.00).
   - [ ] Payout method: Select the default Till (`888123`).
   - [ ] Verify slug preview is generated cleanly (e.g., `[username]-summer-consultation`).
3. Tap **Create Payment Link**.
4. Verify link in links list:
   - [ ] Payment link appears with title, amount (KES 1,500.00), and status `Active`.
   - [ ] Tap **QR Code** button:
     - [ ] QR code loads via `/api/qr?data=...`.
     - [ ] QR code image fits comfortably within the 320px viewport without clipping.
     - [ ] "Download QR" button meets the 44px tap target rule.
   - [ ] Tap **Copy Link** to copy the public URL (`/pay/[slug]`).

---

## 4. Create an Invoice

- **URL:** `/dashboard/invoices/new` & `/dashboard/invoices`
- **Viewport:** 320px width

### Test Steps:

1. Navigate to **Invoices** -> **New Invoice** (`/dashboard/invoices/new`).
2. Verify Rule D11 compliance:
   - [ ] Page header strictly reads **"Invoice"** (never "Official invoice").
3. Fill customer details:
   - [ ] Customer Name: `Jane Wanjiku`.
   - [ ] Customer Phone: `0712345678`.
   - [ ] Due Date: Today or upcoming date.
   - [ ] Payout Method: Select default Till (`888123`).
4. Add line items:
   - [ ] Description: `Design Consulting`.
   - [ ] Quantity: `1`.
   - [ ] Unit Price (KES): `2500`.
   - [ ] Total automatically calculates: `KES 2,500.00`.
5. Tap **Create Invoice**:
   - [ ] Redirects to `/dashboard/invoices`.
   - [ ] Invoice row shows invoice code starting with `inv-` (unguessable random string $\ge 10$ chars).
   - [ ] Status badge shows **Unpaid** (amber/gray badge).
   - [ ] Tap **Copy Link** to obtain the public invoice URL (e.g., `http://localhost:3000/i/inv-xxxx-yyyy`).

---

## 5. Payer Claim in Incognito Window

- **URL:** `/i/[code]` (or `/pay/[slug]`)
- **Viewport:** 320px width (Incognito / Private Window)

### Test Steps:

1. Open a new **Incognito / Private** window with DevTools Responsive set to `320px`.
2. Paste the public invoice URL (`/i/[code]`).
3. Verify public page protections & layout:
   - [ ] **Rule D10:** Customer phone is **masked** as `0712 *** 678` or `+254 712 *** 678`. Plaintext phone is **not** exposed in DOM or page source.
   - [ ] **Rule D11:** Page title is strictly **"Invoice"** (no "Official invoice"). Seller profile has no "Verified" badge.
   - [ ] Payout instructions clearly display: `Buy Goods Till: 888123` and Total: `KES 2,500.00`.
   - [ ] The "I've Paid" claim section is visible.
4. Submit payment claim:
   - [ ] Payer Name: `Jane Wanjiku`.
   - [ ] Payer Phone: `0712345678`.
   - [ ] M-PESA Confirmation Code: Enter a 10-character code, e.g., `QA12345678`.
   - [ ] Tap **I've Paid — Submit Claim** (tap target $\ge 44\text{px}$).
5. Verify post-submission state:
   - [ ] **Rule D9:** Screen confirms receipt of the **claim**. Text states: _"Claim submitted. The seller has been notified to confirm payment before receipt issuance."_
   - [ ] The word **"Verified"** does **NOT** appear.
   - [ ] Submitting the same M-PESA code again shows an error (`duplicate_code`).

---

## 6. Seller Email Notification

### Test Steps:

1. Check the seller's email inbox (or dev server console logs if running locally without `RESEND_API_KEY`).
2. Verify notification details:
   - [ ] Subject: `New M-PESA payment claim: KES 2,500.00 from Jane Wanjiku`.
   - [ ] Email body specifies the M-PESA transaction code (`QA12345678`).
   - [ ] Reminds seller to verify the code against their Safaricom M-PESA SMS.
   - [ ] Adheres to **D9**: States that a receipt will only be issued upon confirmation.
   - [ ] Link in email targets `/dashboard/claims` using safe redirect path.

---

## 7. Seller Reviews & Confirms Claim

- **URL:** `/dashboard/claims`
- **Viewport:** 320px width (Seller session)

### Test Steps:

1. In the seller browser session, navigate to `/dashboard/claims`.
2. Inspect the Pending claims tab:
   - [ ] Pending claim appears showing:
     - M-PESA Code: `QA12345678` (labeled as **Claim**).
     - Payer: `Jane Wanjiku` (`0712345678`).
     - Reference: `Invoice #inv-xxxx-yyyy`.
     - Amount: `KES 2,500.00`.
   - [ ] Action buttons **Confirm Payment** and **Reject** are clearly separated and $\ge 44\text{px}$ touch targets.
3. Confirm the claim:
   - [ ] Tap **Confirm Payment**.
   - [ ] Button displays loading spinner while calling `confirm_payment_claim`.
   - [ ] Success toast appears: _"Payment confirmed. Receipt created."_
   - [ ] Claim automatically moves to the **Confirmed** tab.
   - [ ] In **Confirmed** tab, "View Receipt" button appears.
4. Check invoice status:
   - [ ] Navigate to `/dashboard/invoices`.
   - [ ] Invoice status is now updated to **Paid** (green badge).

---

## 8. View & Share Public Receipt

- **URL:** `/r/[token]`
- **Viewport:** 320px width

### Test Steps:

1. Tap **View Receipt** from the confirmed claim or navigate to `/r/[token]`.
2. Verify receipt details at 320px:
   - [ ] Public token in URL is a random, unguessable string $\ge 10$ chars (e.g. `rec-xxxxxxxxxxxx`).
   - [ ] Receipt Number is sequential per seller (e.g. `REC-0001`).
   - [ ] Amount: `KES 2,500.00`.
   - [ ] M-PESA Code: `QA12345678`.
   - [ ] Payer Name: `Jane Wanjiku`.
   - [ ] **Rule D10:** Payer phone is masked (`0712 *** 678` or `+254 712 *** 678`).
   - [ ] **Rule D9 & D11:** No "Verified" badges appear.
   - [ ] Action buttons ("Download Receipt" / "Copy Link") fit 320px width without overlapping and are $\ge 44\text{px}$ tall.

---

## 9. Payments CSV Export

- **URL:** `/api/export/payments` (Triggered from `/dashboard`)
- **Viewport:** 320px width

### Test Steps:

1. On the seller Dashboard (`/dashboard`), locate the **CSV Export** action button.
2. Verify button touch target is $\ge 44\text{px}$.
3. Tap **CSV Export**:
   - [ ] File downloads with name format `helahop-payments-YYYY-MM-DD.csv`.
4. Open the CSV in a text editor to verify contents:
   - [ ] Headers: `Date,Payer Name,Payer Phone,Amount (KES),M-PESA Code,Reference,Receipt Number`.
   - [ ] Contains row for confirmed claim (`Jane Wanjiku`, `2500.00`, `QA12345678`, `REC-0001`).
   - [ ] Formula injection security: any field starting with `=`, `+`, `-`, `@`, `\t`, `\r` is escaped with a leading apostrophe (`'`).
   - [ ] Values containing commas or quotes are properly wrapped and escaped in double quotes per RFC 4180.

---

## 10. Pass / Fail Acceptance Criteria

| Check                      | Expected Result                                                                           | Pass/Fail |
| -------------------------- | ----------------------------------------------------------------------------------------- | --------- |
| Responsive at 320px        | No horizontal scroll, all components readable and functional                              | [ ]       |
| Touch Targets              | All clickable/tappable elements $\ge 44 \times 44\text{px}$                               | [ ]       |
| Zoom Enabled               | User can pinch-to-zoom on public and authenticated pages                                  | [ ]       |
| D9: Claims vs Receipts     | Payer M-PESA code labeled as claim until seller confirms; zero occurrences of "Verified"  | [ ]       |
| D10: Token & Phone Masking | Codes/tokens are unguessable; phone numbers masked on public pages                        | [ ]       |
| D11: Invoice Naming        | Labeled strictly as "Invoice" (never "Official invoice"); seller never labeled "verified" | [ ]       |
| Database RLS               | Anonymous queries to protected tables return 0 rows                                       | [ ]       |
| CSV Security               | Cells starting with formula characters prefixed with apostrophe                           | [ ]       |
| Build & Lint               | `tsc --noEmit`, `npm run lint`, `npm test`, and `npm run build` all pass                  | [ ]       |
