# Hela Hop — Phase 0 & 1 Task Breakdown + AI Prompts

> **Stack (already started):** Next.js 15 · TypeScript · Tailwind v4 · Supabase · Daraja API · IntaSend
> **Repo:** `C:\Hela_Hop_Fintech` — has scaffolding, Supabase client/server, Daraja STK Push helper, IntaSend helper, core migration (profiles, payment_links, transactions, ledger_entries with RLS).

---

## PHASE 0 — Foundation (Week 1–2)

### Task 0.1 — Project Setup & CI

**What:** Complete the repo setup — linting, formatting, pre-commit, GitHub Actions CI, env validation, types directory.

**Prompt:**
```
You are working on the Hela Hop fintech project at C:\Hela_Hop_Fintech.
Stack: Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Supabase, already scaffolded.

Do the following:
1. Add ESLint + Prettier config (tailwind plugin, import sorting).
2. Create a GitHub Actions CI workflow at .github/workflows/ci.yml that runs lint + type-check + build on every push/PR.
3. Add a src/lib/env.ts that uses zod to validate all env vars at startup (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, DARAJA_*, INTASEND_*, NEXT_PUBLIC_APP_URL). Export typed env object.
4. Add a .env.example listing every variable with placeholder values and comments.
5. Create src/types/database.ts with TypeScript types matching the existing Supabase migration (profiles, payment_links, transactions, ledger_entries — see supabase/migrations/20261105000001_core_ledger_auth.sql).

Keep it minimal. No extra packages beyond what's needed.
```

---

### Task 0.2 — Daraja Sandbox STK Push Test Script

**What:** A working test page that fires an STK Push in the Daraja sandbox and shows the result.

**Prompt:**
```
In the Hela Hop project (C:\Hela_Hop_Fintech, Next.js 15 App Router + TypeScript):

There is already a Daraja STK Push helper at src/lib/mpesa/daraja.ts.

1. Create an API route at src/app/api/mpesa/stk-push/route.ts that:
   - Accepts POST { phone: string, amount: number }
   - Validates input (phone must be 2547XXXXXXXX format, amount > 0 and <= 150000)
   - Calls stkPush() from the existing daraja.ts helper
   - Returns the Daraja response JSON

2. Create an API route at src/app/api/webhooks/mpesa/route.ts that:
   - Accepts POST callbacks from Daraja
   - Logs the full callback body
   - Returns 200 OK
   - (For now just log — no DB write yet)

3. Create a simple test page at src/app/demo/page.tsx with:
   - A form: phone number input, amount input, submit button
   - Clearly labelled "SANDBOX — NO REAL MONEY"
   - Shows the API response after submit
   - Mobile-friendly, uses Tailwind

This is sandbox-only / demo mode. No auth required for this page.
```

---

### Task 0.3 — Screen Sketches / UI Wireframes

**What:** Design the 8 key screens in Figma or as simple HTML wireframes.

**Prompt (to a design AI like Figma AI, v0, or similar):**
```
Design mobile-first wireframes for "Hela Hop", a Kenyan M-PESA payment link app. Brand color: emerald green (#10b981). Target users: informal sellers on Instagram/WhatsApp in Kenya.

Design these 8 screens:
1. Landing page — "Get your payment link in 60 seconds" with sign-up CTA
2. Sign-up — email + password (simple, one step)
3. Seller dashboard — list of recent payments (paid/unpaid), totals, create new link button
4. Add payout method — form to add Till number, Paybill+account, Pochi la Biashara, or phone number
5. Payment link page (/pay/seller-name) — public page showing seller name, amount, their M-PESA number with a big "Copy" button, step-by-step pay instructions
6. Create invoice — form with customer name, phone, items, amount, due date
7. Invoice page (/i/abc123) — public invoice with "I've Paid" button and M-PESA code input
8. Receipt page — confirmation with QR code, transaction details

Requirements: Large tap targets (min 44px), works on 320px width screens, under 200KB per page, Swahili + English toggle on public pages (/pay and /i).
```

---

### Task 0.4 — User Interview Script & Tracking

**What:** Prepare the interview materials and a simple tracking sheet.

**Prompt:**
```
Create a simple Next.js page at src/app/admin/interviews/page.tsx for tracking user interviews internally (no auth needed yet, this is an internal tool).

The page should:
1. Show a hardcoded interview script (the 7 questions from the master plan):
   - How do you get paid by customers today?
   - What goes wrong?
   - How do you keep track of who paid?
   - Which bills do you pay monthly and how?
   - What have you tried to fix this?
   - What would a fix be worth per month?
   - Can I show you an idea and come back for you to try it?
2. Have a form to log an interview: date, person name, type (seller/student/freelancer), top 3 pain points (free text), would they try it (yes/maybe/no), referral name
3. Store interviews in localStorage for now
4. Show a summary: total interviews, top mentioned pains, count by type

Keep it simple and functional. Tailwind styling, mobile-friendly.
```

---

## PHASE 1 — Hela Hop Lite Build (Weeks 3–8)

### Task 1.1 — Auth: Sign-up, Login, Password Reset

**Prompt:**
```
In the Hela Hop project (C:\Hela_Hop_Fintech, Next.js 15 App Router, Supabase auth already configured with middleware at src/middleware.ts and client helpers at src/lib/supabase/):

Build the auth flow:
1. src/app/(auth)/signup/page.tsx — email + password sign-up form. On success, show "Check your email to confirm." Validate: email format, password min 8 chars.
2. src/app/(auth)/login/page.tsx — email + password login. Redirect to /dashboard on success.
3. src/app/(auth)/forgot-password/page.tsx — email input, calls supabase.auth.resetPasswordForEmail().
4. src/app/(auth)/reset-password/page.tsx — new password form for the reset link callback.
5. A (auth)/layout.tsx that centers the form, shows the Hela Hop logo/name, and redirects to /dashboard if already logged in.
6. Update src/middleware.ts to protect /dashboard/* routes — redirect to /login if no session.

Use Supabase Auth (already installed). Server actions or API routes for form handling. Show inline validation errors. Mobile-first Tailwind. No external UI libraries.
```

---

### Task 1.2 — Seller Profile & Payout Methods

**Prompt:**
```
In Hela Hop (Next.js 15, Supabase, TypeScript):

The profiles table already exists (see migration). Build:

1. src/app/dashboard/settings/page.tsx — Edit profile: full name, phone (E.164 +2547... validation), username (slug for payment link).
2. src/app/dashboard/payout-methods/page.tsx — CRUD for payout methods:
   - Types: till, paybill (requires account_ref), pochi, phone
   - Validate formats: Till (5-7 digits), Paybill (5-7 digits + account ref), phone (+2547XXXXXXXX)
   - Set one as default
   - Store in a new payout_methods table (create migration):
     id UUID PK, user_id FK profiles, type enum(till/paybill/pochi/phone), number TEXT, account_ref TEXT nullable, label TEXT, is_default BOOLEAN, created_at, updated_at
   - RLS: users see only their own

Use server actions. Show success/error toasts. Mobile-first.
```

---

### Task 1.3 — Payment Links + QR Code

**Prompt:**
```
In Hela Hop (Next.js 15, Supabase, TypeScript):

The payment_links table exists. Build:

1. src/app/dashboard/links/page.tsx — List user's payment links with status, copy URL button, delete.
2. src/app/dashboard/links/new/page.tsx — Create link form: title, optional fixed amount (KES), choose payout method. Auto-generates a slug from the username. Save to payment_links table.
3. src/app/pay/[slug]/page.tsx — PUBLIC page (no auth). Fetches the payment link by slug. Shows:
   - Seller name and title
   - Amount (or "Enter amount" if flexible)
   - The seller's payout method number with a big green "Copy Number" button
   - Step-by-step M-PESA instructions based on payout type:
     * Till: "Go to M-PESA > Lipa na M-PESA > Buy Goods > Enter Till Number..."
     * Paybill: "Go to M-PESA > Lipa na M-PESA > Pay Bill > Enter Business Number... Account..."
     * Pochi/Phone: "Go to M-PESA > Send Money > Enter Number..."
   - "I've Paid" button (links to a claim form — build in Task 1.5)
   - Seller disclaimer: "Hela Hop does not verify this seller. Only pay people you trust."
   - Footer: "Get your own Hela Hop link" CTA
4. Generate a downloadable QR code for the link URL (use 'qrcode' npm package, generate server-side as SVG/PNG).
5. Swahili/English toggle on the /pay page (store in cookie, default English).

Mobile-first. Pages must work on slow 3G and cheap Android phones — keep under 200KB.
```

---

### Task 1.4 — Invoices

**Prompt:**
```
In Hela Hop (Next.js 15, Supabase, TypeScript):

Create the invoices feature. New migration for invoices table:
  id UUID PK, user_id FK profiles, code TEXT UNIQUE (random 8-char alphanumeric), customer_name TEXT, customer_phone TEXT, items JSONB (array of {description, quantity, unit_price_minor}), total_minor INTEGER, currency CHAR(3) default 'KES', due_date DATE nullable, status enum(unpaid/claimed/paid/cancelled), payout_method_id FK payout_methods, created_at, updated_at.
  RLS: owner can CRUD, public can SELECT by code.

Build:
1. src/app/dashboard/invoices/page.tsx — List invoices with status badges (color-coded), filter by status, create button.
2. src/app/dashboard/invoices/new/page.tsx — Create invoice: customer name, phone, line items (add/remove rows), due date, choose payout method. Auto-calculates total. Generates random code on save.
3. src/app/i/[code]/page.tsx — PUBLIC invoice view. Shows:
   - "Invoice from [Seller]" header
   - Line items table, total
   - Payout method number with Copy button
   - M-PESA instructions (same as /pay page)
   - If unpaid: "I've Paid" button → shows form for M-PESA confirmation code
   - If paid: shows "PAID" stamp + receipt link
   - Seller disclaimer
   - Swahili/English toggle
4. Share invoice via: copy link, WhatsApp share button (wa.me?text=...).

Mobile-first, accessible, under 200KB.
```

---

### Task 1.5 — Payment Claims & Confirmation Flow

**Prompt:**
```
In Hela Hop (Next.js 15, Supabase, TypeScript):

Create the "I've Paid" claim and seller confirmation flow. New migration for payment_claims table:
  id UUID PK, invoice_id FK invoices nullable, payment_link_id FK payment_links nullable, payer_name TEXT, payer_phone TEXT, mpesa_code TEXT (10 chars, must match M-PESA format like [A-Z0-9]{10}), amount_minor INTEGER, status enum(pending/confirmed/rejected), created_at.
  Constraint: mpesa_code unique per seller (prevent reuse).
  RLS: seller can see claims on their invoices/links.

Build:
1. Claim form (embedded in /pay/[slug] and /i/[code] pages): payer name, phone, M-PESA confirmation code, amount paid. Validates M-PESA code format. Creates a payment_claim with status=pending.
2. src/app/dashboard/claims/page.tsx — List pending claims for the seller. Each shows: payer name, code, amount, timestamp.
3. For each claim: "Confirm" or "Reject" buttons. Confirm updates claim status to confirmed, updates invoice status to paid, and generates a receipt. Reject updates to rejected with optional reason.
4. Receipt: src/app/receipt/[id]/page.tsx — public page showing: seller, payer, amount, M-PESA code, date, receipt number (auto-increment per seller), QR code linking back to receipt URL. Printable layout.

The seller is expected to cross-check the M-PESA code against their actual M-PESA SMS before confirming. This is the trust model for Lite — no automatic verification.
```

---

### Task 1.6 — Seller Dashboard

**Prompt:**
```
In Hela Hop (Next.js 15, Supabase, TypeScript):

Build the main seller dashboard at src/app/dashboard/page.tsx:

1. Summary cards at top:
   - Total received (confirmed claims, this month)
   - Pending claims count
   - Unpaid invoices count
   - Total all-time
2. Recent activity feed: last 10 claims/invoices with status
3. Quick actions: "Create Link", "Create Invoice", "View All Claims"
4. A simple bar chart or number showing payments per day this week (can be a simple HTML/CSS chart, no charting library needed)
5. CSV export button: downloads all confirmed payments as CSV (date, payer, amount, M-PESA code, invoice/link)

Layout: sidebar nav on desktop (Dashboard, Links, Invoices, Claims, Billers, Settings), bottom tab bar on mobile. The nav should be in a dashboard layout at src/app/dashboard/layout.tsx.

Use server components to fetch data. Loading skeletons while data loads.
```

---

### Task 1.7 — Saved Billers & Reminders

**Prompt:**
```
In Hela Hop (Next.js 15, Supabase, TypeScript):

Create the billers/reminders feature. New migration for billers table:
  id UUID PK, user_id FK profiles, name TEXT, type enum(paybill/till), number TEXT, account_ref TEXT nullable, typical_amount_minor INTEGER nullable, due_day INTEGER (1-31) nullable, reminder_days_before INTEGER default 3, created_at, updated_at.
  RLS: owner only.

New migration for reminders table:
  id UUID PK, biller_id FK billers, user_id FK profiles, channel enum(email/push), scheduled_for TIMESTAMPTZ, sent_at TIMESTAMPTZ nullable, status enum(pending/sent/failed), created_at.

Build:
1. src/app/dashboard/billers/page.tsx — List saved billers with next due date.
2. Add/edit biller form: name (e.g. "KPLC Home"), type, number, account ref, typical amount, due day of month, reminder days before.
3. For each biller: "Pay Now" button that shows the number with copy button + M-PESA instructions (same pattern as /pay page).
4. A Supabase Edge Function or Next.js cron (using vercel cron or similar) that checks daily for billers due within reminder_days_before and creates reminder records + sends email via Supabase's built-in email or a simple SMTP call.

Keep the reminder system simple — email only for now. No SMS yet.
```

---

### Task 1.8 — Demo Mode (Sandbox STK Push Page)

**Prompt:**
```
In Hela Hop (Next.js 15, Supabase, TypeScript):

The Daraja sandbox STK Push helper already exists at src/lib/mpesa/daraja.ts and the API route from Task 0.2.

Create a polished demo page at src/app/demo/page.tsx:
1. Header: "Hela Hop Demo — Sandbox Mode" with a prominent orange banner: "⚠️ DEMO — NO REAL MONEY. This uses Safaricom's test environment."
2. A payment form: enter phone number and amount
3. On submit: triggers STK Push via the API route, shows a "Waiting for payment..." state
4. Polls the Daraja STK Query endpoint every 3 seconds (max 10 times) to check payment status
5. Shows result: success (green, confetti optional) or failed/cancelled (red with reason)
6. Below the form: explanation of what this demonstrates for investors/partners
7. Link to sign up for a real account

Add STK Query to daraja.ts:
- GET /mpesa/stkpushquery/v1/query with BusinessShortCode, Password, Timestamp, CheckoutRequestID
- New API route at src/app/api/mpesa/stk-query/route.ts

This page is public, no auth. Rate limit: max 5 requests per IP per minute (simple in-memory counter is fine).
```

---

### Task 1.9 — Security, Polish & Deploy Prep

**Prompt:**
```
In Hela Hop (Next.js 15, Supabase, TypeScript):

Security and polish pass before beta:

1. CSRF: Ensure all mutating server actions/API routes check origin header or use Next.js built-in CSRF. Add a reusable middleware.
2. Rate limiting: Add simple rate limiting to public routes (/pay/*, /i/*, /api/mpesa/*) — use an in-memory Map with IP + timestamp. 30 requests/minute for pages, 5/minute for API.
3. Security headers: Add to next.config.ts — Strict-Transport-Security, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin, basic CSP.
4. Input validation: Audit all forms — ensure Zod validation on both client and server side.
5. Error pages: Create src/app/not-found.tsx and src/app/error.tsx with branded Hela Hop styling.
6. Loading states: Add loading.tsx files in each route group with skeleton UI.
7. Report abuse: Add a small "Report this page" link on /pay/[slug] and /i/[code] that opens a simple form (name, reason) and stores in a reports table.
8. Privacy Policy page at /privacy and Terms page at /terms — placeholder content with the right structure.
9. Analytics: Add Vercel Analytics (or a simple privacy-friendly counter).
10. Verify the whole app works on a 320px screen, test with Chrome DevTools throttled to "Slow 3G".

No new features — just hardening.
```

---

### Task 1.10 — Deployment

**Prompt:**
```
Deploy the Hela Hop project (Next.js 15, Supabase) to Vercel:

1. Ensure next.config.ts has output settings suitable for Vercel deployment.
2. All env vars documented in .env.example with comments on which are public vs server-only.
3. Create a vercel.json if needed for:
   - Cron job for biller reminders (if using Vercel cron)
   - Headers/redirects
4. Add a health check API route at /api/health that returns { status: "ok", timestamp }.
5. Ensure the Supabase project has:
   - The migration applied
   - Email auth enabled
   - Site URL + redirect URLs configured for the production domain
6. Set up a custom domain (when purchased).
7. Verify HTTPS works, all pages load, auth flow works end-to-end.

The production database should still use sandbox Daraja keys — no real money until Phase 4.
```

---

## Summary Checklist

### Phase 0 Gates (end of Week 2)
- [ ] CI runs lint + type-check + build on every push
- [ ] Daraja sandbox STK Push works from demo page
- [ ] At least 10 user interviews logged
- [ ] 8 screen wireframes done
- [ ] Name "Hela Hop" checked (domain, eCitizen, social handles)

### Phase 1 Gates (end of Week 8)
- [ ] Seller can: sign up → add payout method → get link + QR → create invoice
- [ ] Payer can: open link → see instructions → claim "I've paid" with M-PESA code
- [ ] Seller can: confirm/reject claims → receipt generated
- [ ] Saved billers + email reminders work
- [ ] Demo Mode (sandbox STK Push) works and is clearly labelled
- [ ] Deployed on HTTPS with custom domain
- [ ] Security checklist passed (CSRF, rate limits, headers, validation)
- [ ] Terms + Privacy placeholder pages live
- [ ] 5 design-partner sellers ready for beta
