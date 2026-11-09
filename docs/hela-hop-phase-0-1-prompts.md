# Hela Hop — Phases 0 to 2 Task Breakdown + AI Prompts

> **Where to start:** Tasks 1.7 and 1.8 below are the original (deferred) versions. The live plan from here is: **1.6A → 1.9 → 1.9B → 1.10 → 1.11** (Phase 1), then **2.1 → 2.6** (Phase 2). Paste the **Shared rules block** at the top of every prompt.

> **Stack (already started):** Next.js 15 · TypeScript · Tailwind v4 · Supabase · Daraja API · IntaSend
> **Repo:** `C:\Hela_Hop_Fintech` — has scaffolding, Supabase client/server, Daraja STK Push helper, IntaSend helper, core migration (profiles, payment_links, transactions, ledger_entries with RLS).
>
> **Progress (9 Nov 2026):** Tasks 0.1 to 0.3 done. Phase 1 Tasks 1.1 to 1.6 built and reviewed (security and wording fixes applied; migrations `20261110000001` to `20261110000004` must be run on Supabase). Task 0.4 (interviews) is still open. Tasks 1.7 and 1.8 are deferred (D12). Next build tasks: **1.6A (tests)**, then **1.9 (hardening)**, 1.9B, 1.10 (deployment), 1.11.
> **Aligned with Master Plan v1.2** (decisions D9 to D12). Every Phase 1 prompt must follow these rules:
> - **Claim is not a receipt (D9):** a payer's M-PESA code is only a *claim*. A receipt exists only after the **seller confirms** it against their own M-PESA SMS. Never show "Verified".
> - **Random public links (D10):** receipts/invoices use long random tokens, never sequential IDs. Mask phone numbers on public pages (e.g. `0712 *** 678`).
> - **Plain wording (D11):** "Invoice", never "Official invoice" (not a KRA eTIMS invoice). Never call a seller "verified".
> - **Smaller Phase 1 (D12):** Billers/reminders (Task 1.7) move to **Week 10**; Demo Mode (Task 1.8) to **Week 14**, both after Gate G1.
> - **UI spec:** match `C:\Users\User\OneDrive\Desktop\Hela-Hop\wireframes\` (index.html + README.md). Tap targets at least 44px, never disable pinch-zoom, 320px wide, under 200KB per page.

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

### Task 0.3 — Screen Sketches / UI Wireframes (DONE)

**Status:** Done 7 Nov 2026 in `wireframes/index.html`, fixed for v1.2 (claim flow, wording, zoom, tap targets). Prompt kept for reference only.

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
   - "I've Paid — Enter Code" button (opens the claim form, Task 1.5). It creates a CLAIM, not a receipt.
   - Seller disclaimer: "Hela Hop does not verify this seller. Only pay people you trust." Never label the seller/username "verified".
   - Footer: "Get your own Hela Hop link" CTA
4. Generate a downloadable QR code for the link URL (use 'qrcode' npm package, generate server-side as SVG/PNG).
5. Swahili/English toggle on the /pay page (store in cookie, default English).

Mobile-first. Pages must work on slow 3G and cheap Android phones — keep under 200KB. Tap targets at least 44px; never set user-scalable=no or maximum-scale in the viewport. Follow wireframe Screen 5 (wireframes/index.html).
```

---

### Task 1.4 — Invoices

**Prompt:**
```
In Hela Hop (Next.js 15, Supabase, TypeScript):

Create the invoices feature. New migration for invoices table:
  id UUID PK, user_id FK profiles, code TEXT UNIQUE (random, unguessable, at least 10 chars from a crypto-secure generator; never sequential), customer_name TEXT, customer_phone TEXT, items JSONB (array of {description, quantity, unit_price_minor}), total_minor INTEGER, currency CHAR(3) default 'KES', due_date DATE nullable, status enum(unpaid/claimed/paid/cancelled), payout_method_id FK payout_methods, created_at, updated_at.
  RLS: owner can CRUD, public can SELECT by code.

Build:
1. src/app/dashboard/invoices/page.tsx — List invoices with status badges (color-coded), filter by status, create button.
2. src/app/dashboard/invoices/new/page.tsx — Create invoice: customer name, phone, line items (add/remove rows), due date, choose payout method. Auto-calculates total. Generates random code on save.
3. src/app/i/[code]/page.tsx — PUBLIC invoice view. Shows:
   - "Invoice from [Seller]" header. Label it "Invoice" only, never "Official invoice" (not a KRA eTIMS invoice).
   - Billed-to name with the customer phone MASKED (e.g. 0712 *** 678)
   - Line items table, total
   - Payout method number with Copy button
   - M-PESA instructions (same as /pay page)
   - If unpaid: "I've Paid" button → shows form for M-PESA confirmation code (a claim, Task 1.5)
   - If claimed: "Claim sent. Waiting for the seller to confirm." + CLAIMED badge. No receipt yet.
   - If paid (seller confirmed): shows "PAID" stamp + receipt link
   - Seller disclaimer
   - Swahili/English toggle
4. Share invoice via: copy link, WhatsApp share button (wa.me?text=...).

Mobile-first, accessible, under 200KB. Follow wireframe Screens 6 and 7.
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
1. Claim form (embedded in /pay/[slug] and /i/[code] pages): payer name, phone, M-PESA confirmation code, amount paid. Trim + uppercase the code and require exactly /^[A-Z0-9]{10}$/ on client AND server, with an inline error. Creates a payment_claim with status=pending and sets the invoice to claimed. Button text: "Send Payment Claim".
2. After submitting, the payer sees "Claim sent. Waiting for the seller to confirm." + CLAIMED badge (EN/SW). NO receipt is shown or created yet. Email the seller when a new claim arrives, linking to the claims page.
3. src/app/dashboard/claims/page.tsx — List pending claims for the seller. Each shows: payer name, code, amount, timestamp, and the hint "Check your M-PESA SMS shows this code and amount before you confirm."
4. For each claim: "Confirm" or "Reject" buttons (at least 44px). Only Confirm updates the claim to confirmed, the invoice to paid, and creates the receipt. Reject sets rejected with an optional reason and returns the invoice to unpaid.
5. Receipt: add a receipts table (id UUID, claim_id FK, receipt_number per seller for display only, public_token TEXT UNIQUE random, at least 10 chars, created_at). Public page at src/app/r/[token]/page.tsx (never /receipt/[id] or a sequential number). Shows "Payment Confirmed" + "Confirmed by the seller", seller, payer name with MASKED phone, amount, M-PESA code, date, receipt number, QR code linking to the /r/[token] URL. Printable layout. Never use the word "Verified".

The seller is expected to cross-check the M-PESA code against their actual M-PESA SMS before confirming. This is the trust model for Lite — no automatic verification (Master Plan D9). Follow wireframe Screens 3, 7 and 8.
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

Layout: sidebar nav on desktop (Dashboard, Links, Invoices, Claims, Settings; add Billers in Week 10 with Task 1.7), bottom tab bar on mobile. The nav should be in a dashboard layout at src/app/dashboard/layout.tsx.

Use server components to fetch data. Loading skeletons while data loads.
```

---

### Shared rules block (paste at the top of EVERY prompt below)

> Updated 9 Nov 2026 after the Task 1.1 to 1.6 review. These rules stop the
> mistakes found in that review (open database policies, fake "verified"
> wording, shortcuts around the claim flow).

```
Project: Hela Hop at C:\Hela_Hop_Fintech. Next.js 15 App Router, TypeScript,
Tailwind v4, Supabase (@supabase/ssr), zod.

Rules (follow strictly):
- D9: a payer's M-PESA code is only a claim. A receipt exists only after the
  seller confirms. Never show "Verified" anywhere.
- D10: public links use long random tokens. Mask phone numbers on public pages.
- D11: say "Invoice", never "Official invoice". Never call a seller "verified".
- Never create RLS policies with USING (true) or WITH CHECK (true).
  Public pages read data only through src/lib/public-data.ts (database
  functions). Claims and receipts change only through the functions
  submit_payment_claim / confirm_payment_claim / reject_payment_claim.
- Database changes go in a NEW file in supabase/migrations/ (never edit old
  ones). Update src/types/database.ts to match.
- Reuse existing helpers: safeRedirectPath (lib/safe-redirect),
  normalizeKenyanPhoneSync (lib/phone), maskPhoneNumber (lib/formatters),
  notifySellerOfClaim (lib/email), createAdminClient (lib/supabase/admin,
  server only, never import in a "use client" file).
- Tap targets at least 44px, never disable zoom, works at 320px wide,
  each page under 200KB.
- Do not add npm packages unless the prompt allows it.
- Do not run "npm run build" while "npm run dev" is running (they clash on
  the .next folder). Stop the dev server first.
- When finished: run npx tsc --noEmit, npm run lint and npm run build.
  Report the results and list every file you changed. Do not push to git.
```

---

### Task 1.6A — Stabilise and Test (Week 7)

**Why:** Tasks 1.1 to 1.6 were built quickly. Before adding anything, prove the core flow works and keep it working.

**Prompt:**
```
[Rules block]

Goal: prove the core flow works and keep it working. No new features.

1. Add Vitest as a dev dependency (allowed). Add "test": "vitest run" to
   package.json and a test step to .github/workflows/ci.yml.
2. Move the CSV escaping in src/app/api/export/payments/route.ts into
   src/lib/csv.ts (escapeCsvCell) so it can be tested.
3. Unit tests for: safeRedirectPath (including "//evil.com", "/\\evil.com",
   "@evil.com"), normalizeKenyanPhoneSync, maskPhoneNumber, escapeCsvCell
   (including "=SUM(A1)" and values with commas or quotes).
4. Create supabase/tests/claims_flow.sql. It runs in one transaction and
   ends with ROLLBACK. It must check:
   - an anonymous user cannot select from invoices, receipts, profiles or
     payout_methods
   - get_public_invoice returns a masked phone, not the real one
   - submit_payment_claim works on an unpaid invoice, then rejects the same
     M-PESA code again (duplicate_code) and rejects a cancelled invoice
   - confirm_payment_claim as the seller creates exactly one receipt, sets
     the invoice to paid, and fails a second time (not_pending)
   - another seller cannot confirm someone else's claim (not_found)
   Use SET ROLE and set_config('request.jwt.claims', ...) to act as users.
   Add a README note on how to run it in the Supabase SQL editor.
5. Write docs/manual-test-checklist.md: the full flow on a 320px screen
   (sign up, payout method, link, QR, invoice, payer claim in incognito,
   seller email, confirm, receipt, CSV export).

Do not change app behaviour. If a test finds a bug, list it and stop.
```

---
### Task 1.7 — Saved Billers & Reminders (MOVED TO WEEK 10, after Gate G1, D12)

**Do not build in Phase 1.** In Week 10 use **Task 2.2** below instead; it is this prompt rewritten for the current code (owner-only tables, cron secret, no open policies). This original is kept for the table design only.

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

### Task 1.8 — Demo Mode (Sandbox STK Push Page) (MOVED TO WEEK 14, after Gate G1, D12)

**Do not build in Phase 1.** The Task 0.2 sandbox STK Push is enough for now. In Week 14 use **Task 2.6** below instead (it swaps the in-memory rate limit for the shared one from Task 1.9). Build earlier only if a pitch deadline needs it. This original is kept for the page spec.

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


### Task 1.9 — Security Hardening (Week 8) — REWRITTEN

**What changed from the old 1.9:** the old prompt asked for an in-memory rate limiter. That does not work on Vercel (every server copy keeps its own count and forgets it on restart), and it only covered `/api/*` while the real risk is the claim form, which is a server action. Polish items moved to Task 1.9B. Three gaps found in the review were added (profile columns, /admin, password length).

**Prompt:**
```
[Rules block]

Security pass before beta. No new features.

1. Rate limiting that works on Vercel (shared, not in-memory):
   - New migration: table rate_limits (key TEXT, window_start TIMESTAMPTZ,
     count INT, PRIMARY KEY(key, window_start)), no RLS policies, plus a
     SECURITY DEFINER function hit_rate_limit(p_key, p_window_seconds, p_max)
     that returns true if allowed. Grant execute to anon and authenticated.
   - Use it in: submitClaimAction (5 per 10 min per IP + payment link or
     invoice), the report-abuse action (Task 1.9B), /api/mpesa/stk-push
     (5 per minute per IP). Get the IP from x-forwarded-for.
   - Delete rows older than 1 day inside the function (simple cleanup).
2. Security headers in next.config.ts: Strict-Transport-Security,
   X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy
   strict-origin-when-cross-origin, Permissions-Policy (camera, microphone,
   geolocation off), and a CSP:
   default-src 'self'; img-src 'self' data:; connect-src 'self'
   https://*.supabase.co; frame-ancestors 'none'; script-src 'self'
   'unsafe-inline'; style-src 'self' 'unsafe-inline'.
   Confirm every page still loads in dev with no CSP errors in the console.
3. Lock down profiles: sellers may only update full_name, phone and
   username. Use a migration with column-level GRANT UPDATE (or a BEFORE
   UPDATE trigger) so kyc_tier, kakitu_score_points, email and
   payout_method cannot be changed from the browser.
4. Protect /admin/*: check what src/app/admin/interviews/page.tsx stores and
   where. Require login in middleware for /admin/*, and add a simple admin
   allow-list (env var ADMIN_EMAILS) until Task 2.5.
5. Passwords: raise the minimum to 10 in the signup and reset schemas. List
   the Supabase dashboard settings I must change by hand (minimum length,
   leaked password protection, auth rate limits).
6. Validation audit: every server action validates input with zod on the
   server. List any that do not and fix them.
7. CSRF: Next.js server actions already check Origin. Confirm the API
   routes that change data (only stk-push today) reject requests whose
   Origin does not match NEXT_PUBLIC_APP_URL.
```

---

### Task 1.9B — Polish, Legal Pages and Report Abuse (Week 8)

**Prompt:**
```
[Rules block]

1. Branded src/app/not-found.tsx and src/app/error.tsx (error.tsx is a
   client component with a "Try again" button). Plain language, 44px
   buttons.
2. loading.tsx skeletons for /dashboard/links, /dashboard/invoices,
   /dashboard/claims, /pay/[slug], /i/[code], /r/[token].
3. Report abuse:
   - Migration: table abuse_reports (id, target_type enum(link, invoice),
     target_id UUID, reporter_name TEXT nullable, reason TEXT 10-500 chars,
     status enum(open, reviewed) default open, created_at). RLS on, no
     public policies. Insert only through a SECURITY DEFINER function
     submit_abuse_report(p_slug_or_code, p_type, p_name, p_reason) that
     looks up the target itself.
   - A small "Report this page" link at the bottom of /pay/[slug] and
     /i/[code] that opens a form (name optional, reason). Rate limited with
     hit_rate_limit. English and Swahili text in lib/i18n.ts.
4. /privacy and /terms pages with the right structure and placeholder text
   marked "DRAFT, to be reviewed by a lawyer". Privacy must cover: what we
   collect (seller email, phone, payout numbers; payer name, phone, M-PESA
   code), why, how long we keep it, how to ask for deletion or a copy, and
   that Hela Hop never holds money. Link both from the footer of every
   public page and from signup.
5. Privacy-friendly analytics: add @vercel/analytics (allowed), page views
   only, no personal data.
6. Check every page at 320px and with Slow 4G throttling. Fix layout
   breaks. Report the size of each public page.
```

---

### Task 1.10 — Deployment and Backups (Week 8) — REWRITTEN

**Prompt:**
```
[Rules block]

1. Add /api/health returning { status: "ok", timestamp } with no
   database call.
2. Update .env.example: mark each variable PUBLIC or SERVER-ONLY. Include
   RESEND_API_KEY, EMAIL_FROM, ADMIN_EMAILS.
3. Write docs/deploy.md with exact steps for me to follow:
   - Supabase: run every migration in supabase/migrations in filename
     order; turn on email auth; set Site URL and redirect URLs
     (https://<domain>/auth/callback); check the sending domain in Resend.
   - Vercel: import the GitHub repo, add env vars, deploy, add the custom
     domain, confirm HTTPS.
   - Backups: confirm which backups the Supabase plan includes. Write a
     restore test: export with pg_dump, restore into a fresh free project,
     check that row counts match. Record the date it was tested.
4. Write docs/smoke-test.md: 10 checks to run on the live site after each
   deploy.

The live site still uses sandbox Daraja keys. No real money until Phase 4.
```

---

### Task 1.11 — Beta Readiness (Week 8 to 9)

**Why:** Master Plan Section 8.2 needs "delete my account" and "download my data" (manual is fine at first), and beta needs a way to hear from sellers.

**Prompt:**
```
[Rules block]

1. "Download my data" in /dashboard/settings: a server route that returns
   a JSON file of the seller's own profile, payout methods, links,
   invoices, claims and receipts.
2. "Delete my account": a confirm screen (type DELETE). It records a
   deletion request in a new table account_deletion_requests and emails the
   admin. Manual processing is fine for now.
3. First-run checklist on /dashboard for new sellers: add payout method,
   create link, create invoice, share link. Each item ticks itself from
   real data. Hide it once all four are done.
4. A "Send feedback" link in the dashboard nav that opens a short form and
   stores it in a feedback table (seller only, RLS owner insert).
```

---

## PHASE 2 — Lite Beta + Pro Plan (Weeks 9–14)

> Start only after Gate G1. Week 9 is people work (onboard 5 to 10 beta
> sellers, watch them use it), so it has no build prompt. Write down every
> confusion; those notes feed Task 2.1.

### Task 2.1 — Google Sign-in and Onboarding Tips (Week 10)

**Prompt:**
```
[Rules block]

1. Add "Continue with Google" to /login and /signup using Supabase OAuth.
   Reuse /auth/callback (it already uses safeRedirectPath). List the
   Google Cloud and Supabase settings I must set by hand.
2. Make sure the profile row is still created for Google users (the
   handle_new_user trigger), and that their username is unique and valid.
3. Add short tips (one line, dismissible, remembered in localStorage) on
   the links, invoices and claims pages, based on the top 3 frictions from
   beta testing: [paste your notes here].
```

---

### Task 2.2 — Saved Billers and Reminders (Week 10) — replaces the old Task 1.7

**Prompt:**
```
[Rules block]

Use the table design from the old Task 1.7 (billers, reminders) with these
changes:
- RLS owner-only on both tables. No public access.
- Number validation reuses the same rules as payout methods.
- Daily job: a Vercel cron calling /api/cron/reminders, protected by a
  CRON_SECRET header. It uses createAdminClient, sends email through
  lib/email.ts (add a sendReminderEmail function), marks each reminder sent
  or failed, and never sends the same reminder twice.
- Add "Billers" back to the dashboard nav (it was removed in the Task 1.6
  review because the page did not exist).
- Add the cron to vercel.json.
Email only. No SMS yet.
```

---

### Task 2.3 — Pro Plan (Week 11)

**Prompt:**
```
[Rules block]

1. Migration: table plans (code, name, price_minor, limits JSONB, active),
   seeded with "free" and "pro". Prices and limits live here, not in code.
   Table subscriptions (user_id, plan_code, status enum(pending, active,
   expired), current_period_end, payment_reference). RLS: users read their
   own; changes only through SECURITY DEFINER functions.
2. Enforce free-plan limits inside the database functions and server
   actions (for example invoices per month), with a friendly "Upgrade to
   Pro" message.
3. Upgrade flow, Lite style (no gateway yet): the seller pays Hela Hop's
   own Till shown on /dashboard/upgrade, then enters the M-PESA code. It
   becomes a pending subscription that an admin confirms (Task 2.5). Same
   rule as D9: nothing is active until it is confirmed.
4. Pro features: custom link name and logo on the public pay page.
   Branded colours come later.
Do not use IntaSend for this yet. The company and Till are not registered.
```

---

### Task 2.4 — SMS Notifications (Week 12)

**Prompt:**
```
[Rules block]

1. Add lib/sms.ts that calls the Africa's Talking REST API with fetch (no
   SDK), sandbox first. Env: AT_USERNAME, AT_API_KEY, AT_SENDER_ID.
2. Pro sellers can send an SMS with the invoice link to the customer.
   Rate limited, and logged in a new sms_log table (to, type, status,
   cost).
3. Reminder emails from Task 2.2 can also go by SMS for Pro users.
4. Never put a full phone number in logs. Mask it.
```

---

### Task 2.5 — Admin Page and Audit Log (Week 13)

**Prompt:**
```
[Rules block]

1. Migration: table admin_users (user_id PK). No RLS policies, so only
   SECURITY DEFINER functions can read it. Add an is_admin() helper. Do NOT
   put an is_admin column on profiles (sellers can update their own row).
2. Table audit_log (id, actor_id, action, target_type, target_id, reason
   TEXT required, created_at). Insert only through a function.
   Append-only: block update and delete with a trigger.
3. /admin (replace the ADMIN_EMAILS check from Task 1.9 with is_admin()):
   users list, invoice and link search, open abuse reports, pending Pro
   payments to confirm, and "disable account" (sets profiles.disabled; the
   public functions then hide that seller's links and invoices). Every
   admin action requires a reason and writes to audit_log.
```

---

### Task 2.6 — Demo Mode and Catch-up (Week 14) — replaces the old Task 1.8

**Prompt:**
```
[Rules block]

1. Build the polished demo page described in the old Task 1.8, but use
   hit_rate_limit from Task 1.9 (not an in-memory counter) and keep the
   orange "DEMO — NO REAL MONEY" banner visible at all times.
2. Remove anything left over from the Task 0.2 test page that a visitor
   could misuse.
3. Run the backup restore test from docs/deploy.md again and record it.
4. Update the README and docs to match the current code.
```

---

## Summary Checklist

### Phase 0 Gates (end of Week 2)
- [x] CI runs lint + type-check + build on every push
- [x] Daraja sandbox STK Push works from the test script/API route (Task 0.2)
- [ ] At least 10 user interviews logged (Task 0.4; show the wireframes)
- [x] 8 screen wireframes done (fixed for v1.2)
- [ ] Name "Hela Hop" checked (domain, eCitizen, social handles)

### Phase 1 Gates (end of Week 8)
Built and code-reviewed (9 Nov 2026), still to be proven by running the flow
with the four `20261110…` migrations applied (Task 1.6A):
- [ ] Seller can: sign up → add payout method → get link + QR → create invoice
- [ ] Payer can: open link → see instructions → claim "I've paid" with M-PESA code
- [ ] Payer sees "waiting for seller" after claiming; NO receipt until the seller confirms
- [ ] Seller can: confirm/reject claims → receipt generated (random /r/[token] link, masked phone)
- [ ] Seller gets an email when a new claim arrives (needs RESEND_API_KEY)
- [x] Tap targets at least 44px, zoom allowed, no "Verified"/"Official" wording (fixed in the Task 1.6 review; re-check in Task 1.9B)

Still to build:
- [ ] Tests for the claim flow pass (Task 1.6A)
- [ ] Security checklist passed: shared rate limits, headers, profile column lock, /admin protected, validation (Task 1.9)
- [ ] Error pages, loading states, report-abuse link, Terms + Privacy placeholder pages (Task 1.9B)
- [ ] Deployed on HTTPS with custom domain (Task 1.10)
- [ ] Database backup restore tested (Task 1.10)
- [ ] Delete-my-account and download-my-data possible (Task 1.11)
- [ ] 5 design-partner sellers ready for beta
- *(Billers/reminders → Week 10; Demo Mode → Week 14. Not part of this gate, D12.)*

### Phase 2 Gates (end of Week 14)
- [ ] 30+ registered users, 15+ active weekly
- [ ] 100+ invoices / payment links paid through Lite
- [ ] 3+ paying Pro users (Task 2.3, admin-confirmed)
- [ ] Billers + reminders live (Task 2.2); SMS live (Task 2.4)
- [ ] Admin page with audit log (Task 2.5)
- [ ] Demo Mode live, clearly labelled (Task 2.6)
- [ ] Backup restore re-tested (Task 2.6)
- *(Company, KRA PIN, BOF1, eTIMS, ODPC and trademark are business tasks, tracked in the Master Plan, not here.)*
