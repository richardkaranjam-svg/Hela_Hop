# Hela Hop — Master Plan
### Get paid by your customers through the M-PESA you already use: payment links, invoices and "who paid?" tracking for Kenyan sellers. Built step by step, legally, on almost no money.
*(Long-term vision: receive M-PESA from anyone, anywhere. See Section 1.7 and Phase 6.)*

| | |
|---|---|
| **Document version** | v1.2 |
| **Created** | 6 November 2026 (v1.1 same day; v1.2 on 7 November 2026; see Change History 0.5) |
| **Plan start date** | Monday 9 November 2026 (Week 1) |
| **Working time assumed** | 20–25 hours per week, founder working mostly solo |
| **Owner** | Founder |
| **Replaces** | `archive/kakitu-product-summary.md` and `archive/kakitu-30-day-plan.md` |
| **Status** | Active. Review every Sunday (template in Section 19.3) |

> **Important:** This plan contains legal and regulatory notes. They are research-based guidance, **not legal advice**. Every item marked ⚖️ must be confirmed with a Kenyan advocate before real money moves.

---

## Table of Contents

0. [How to Use This Document](#0-how-to-use-this-document)
1. [Product Summary](#1-product-summary)
2. [Reality Check — The Rules of the Game](#2-reality-check--the-rules-of-the-game)
3. [Strategy — From Zero to the Full Vision](#3-strategy--from-zero-to-the-full-vision)
4. [Master Timeline](#4-master-timeline)
5. [Sequence of Events and Gates](#5-sequence-of-events-and-gates)
6. [Phase-by-Phase Detail](#6-phase-by-phase-detail)
7. [Technical Plan](#7-technical-plan)
8. [Security and Compliance Checklist](#8-security-and-compliance-checklist)
9. [Partners and Contracts](#9-partners-and-contracts)
10. [Money Plan — Costs, Revenue, Funding](#10-money-plan--costs-revenue-funding)
11. [Getting Users](#11-getting-users)
12. [Metrics — The Numbers We Track](#12-metrics--the-numbers-we-track)
13. [Risk Register](#13-risk-register)
14. [Team and Roles](#14-team-and-roles)
15. [Decision Log and Open Questions](#15-decision-log-and-open-questions)
16. [Parked Ideas From Earlier Documents](#16-parked-ideas-from-earlier-documents)
17. [What Happened to the Old Files](#17-what-happened-to-the-old-files)
18. [Glossary](#18-glossary)
19. [Appendix — Checklists and Templates](#19-appendix--checklists-and-templates)

---

## 0. How to Use This Document

### 0.1 Who should read what

| You are... | Read these sections |
|---|---|
| **The founder** | Everything, once. Then Sections 4, 5 and 12 every week. |
| **A developer joining** | 0, 1, 3, 7, 8, 15, 18, then Appendix 19.1 (day-one setup). |
| **A business / operations helper** | 0, 1, 2, 3, 9, 10, 11, 13. |
| **A mentor, accelerator or investor** | 1, 2, 3, 4, 10, 12, 13. |
| **A lawyer reviewing the setup** | 1, 2, 8, 9, and the ⚖️ items in Section 15. |

### 0.2 Rules for this document

1. **This file is the single source of truth.** If something is decided in a chat, call or meeting, it goes into Section 15 (Decision Log), otherwise it did not happen.
2. **Update it; don't create copies.** Keep one master plan. When you change something, bump the version at the top and add a line to the Change History (0.5).
3. **Checkboxes are real.** Tick `[x]` when done so anyone can see progress.
4. **Dates are targets, not promises.** If a week slips, move the dates honestly. **Never skip a Gate (Section 5) to "catch up".**
5. **Plain language.** If you use a technical word, add it to the Glossary (Section 18).

### 0.3 How to read the symbols

| Symbol | Meaning |
|---|---|
| `[ ]` / `[x]` | Task not done / done |
| ⚖️ | Legal or regulatory: confirm with a lawyer |
| 💰 | Costs money |
| 🚦 | A Gate: must be passed before moving on |
| ⭐ | Milestone worth celebrating and screenshotting (evidence for investors) |

### 0.4 Where things live

| What | Where |
|---|---|
| This plan | `C:\Users\User\OneDrive\Desktop\Hela-Hop\HELA-HOP-MASTER-PLAN.md` |
| Old documents (kept for reference) | `C:\Users\User\OneDrive\Desktop\Hela-Hop\archive\` |
| Old HTML prototype ("Kakitu Pay Pro") | `C:\Users\User\OneDrive\Desktop\stock-price-predictor\Eddy project\` (see Section 17) |
| **Code repository** | GitHub repo (already created), cloned to **`C:\dev\hela-hop`**, *outside* OneDrive (see Risk R14) |
| Copy of this plan inside the repo | `C:\dev\hela-hop\docs\MASTER-PLAN.md`. From Week 1, **the repo copy becomes the master** and this Desktop copy is archived. |
| Task board | GitHub Projects board on the repo (one card per checkbox task) |
| Secrets (API keys, passwords) | A password manager (e.g. Bitwarden, free) plus local `.env` files. **Never** in Git, WhatsApp or email. |

### 0.5 Change history

| Version | Date | What changed | By |
|---|---|---|---|
| v1.0 | 6 Nov 2026 | First full master plan. Replaces the Kakitu summary and 30-day plan. | Founder + AI assistant |
| v1.1 | 6 Nov 2026 | Gap review. **Added:** competitors (1.9), hypotheses to test (1.10), stop/pivot rules (3.5), best/likely dates (4.10), partner questions 7–8, wind-down plan, consent for future scoring, data-hosting rules, excise duty + eTIMS, employment-contract check, seller disclaimer, Swahili, accessibility, Airtel Money/USSD, CRB, insurance, dormant accounts, 6 new risks (R19–R24), 4 new open questions (Q14–Q17). **Corrected (facts checked online 6 Nov 2026):** ODPC registration is mandatory for financial services regardless of size; added eTIMS, 15% excise duty and the Finance Act 2026 16% VAT on payment-service fees; company fee shown as a range; the KES 1,000 margin example now includes taxes; the tourist segment is weaker than first thought. | Founder + AI assistant |
| v1.2 | 7 Nov 2026 | Progress review after the 8-screen wireframes were built (`wireframes/`). **Added:** hypothesis H7 (payers submit their M-PESA code); decisions D8–D12; open question Q18 (receipt/invoice wording and eTIMS). **Changed:** headline now leads with the Kenyan-seller pitch; saved billers/reminders and sandbox Demo Mode moved to *after Gate G1* so Phase 1 focuses on the core seller loop; Gate G1 and Weeks 6–7 updated to match; Week 2 wireframe task ticked. **Wireframes fixed:** a payer's code is now only a *claim* until the seller confirms (no "Verified" receipt before that); removed "verified" from seller identity and "official" from invoices; 10-character code validation; pinch-zoom re-enabled; tap targets ≥ 44px; random receipt links and masked phone numbers. Footer version corrected. | Founder + AI assistant |

---

## 1. Product Summary

> This is the old Kakitu product summary, renamed to **Hela Hop**, with nothing removed. Places where the original was too optimistic are marked **[Corrected]**.

### 1.1 The problem

M-PESA is Kenya's dominant payment network, used by over 32 million people for everything from electricity bills to groceries. But it has a hidden wall:

**If you don't have a Kenyan phone line or a Kenyan bank account, collecting M-PESA payments is nearly impossible.**

This locks out:
- Freelancers and remote workers outside Kenya doing work for Kenyan clients.
- Small informal sellers in Kenya who cannot qualify for an official merchant Till.
- Tourists and expats in Kenya who can't tap into the local payment economy.
- Anyone who wants to invoice a Kenyan client and receive funds without bureaucratic hoops.

Meanwhile, millions of Kenyans struggle daily with:
- Memorising and mistyping long Paybill and Till numbers.
- No smart way to track, manage or automate recurring utility bill payments.
- Running short of cash mid-payment with no lightweight, low-cost backup option.

### 1.2 The solution: Hela Hop

**Hela Hop is a payment bridge app that lets anyone, inside or outside Kenya, send and receive M-PESA with just a link, with no Kenyan bank account needed.**

How the full product works (the end vision):

1. **Sign up** with just an email address or Google account. No Kenyan ID or SIM card is needed *to start*. **[Corrected]** Before a user can withdraw real money they must pass identity checks (KYC). This is a legal requirement for anyone handling money.
2. **Generate a personal payment link** (e.g. `helahop.app/pay/your-name`; domain to be confirmed, see Q3 in Section 15).
3. **Share the link** with a client, customer or anyone who wants to pay you.
4. **The payer opens the link**, enters their M-PESA number, and gets a PIN prompt on their phone, just like any normal M-PESA payment.
5. **You receive the funds** in your Hela Hop wallet and can withdraw to M-PESA, a bank account or (later) a foreign account. **[Corrected]** Not "in seconds" everywhere: M-PESA payouts are usually fast, bank and international payouts can take hours to days, and new accounts have safety holds.

No forms. No queuing at a Safaricom shop. No business registration certificate needed *for the user*. (Hela Hop itself must be a registered company working with licensed partners; see Section 2.)

### 1.3 The credit layer (later phase)

Once a user has a history of consistent transactions, Hela Hop unlocks a **smart micro-credit feature**:

- Users who regularly pay bills (electricity, Wi-Fi, rent, subscriptions) through Hela Hop build a **"Hela Hop Score"**, a trust rating based on real spending patterns.
- When they fall short on an essential payment, Hela Hop steps in with a **small, instant top-up** (e.g. KES 300–2,000), paid directly to the utility or merchant, not as cash.
- On-time repayment grows their limit over time.

This is not a predatory loan app. It is a **safety net built on trust earned through everyday behaviour**.

**[Corrected]** Hela Hop will **not** lend its own money. Credit is offered only through a partner licensed by the Central Bank of Kenya (CBK) as a Digital Credit Provider. Hela Hop provides the app and the score; the partner provides the licence and the loan money.

### 1.4 Who it is for, and when we serve them

| User type | Their problem | How Hela Hop helps | Served from |
|---|---|---|---|
| Informal Kenyan sellers (Instagram, WhatsApp, market stalls) | No official Till; messy "who paid?" tracking | Payment links, QR codes, invoices, payment tracking | **Phase 1 (first!)** |
| Young Kenyans and students | Irregular income, mistyped Paybills, no credit access | Saved billers, reminders, history, and later the score and top-ups | **Phase 1** (bills) / Phase 7 (credit) |
| African freelancers and remote workers | Cannot easily collect M-PESA from Kenyan clients | Payment link + wallet + withdrawal | Phase 4–5 (needs licensed partner) |
| Tourists and expats in Kenya | No local SIM or M-PESA wallet | Pay any Paybill or Till using a card | Phase 6 (needs card + cross-border partner) |

> **[Corrected in v1.1] The tourist segment is weaker than the original summary suggested.** Visitors can already buy a Safaricom tourist SIM, register it with a passport and load M-PESA at an agent. Treat tourists as a **later, optional** segment and test demand before building for them (Hypothesis H5, Section 1.10). The strongest early segments are **sellers** and **bill-payers**.

### 1.5 Business model

| Revenue stream | Description | Starts in |
|---|---|---|
| **Pro subscription** *(added)* | Monthly plan for sellers: branded links, invoices, reminders, analytics | Phase 2 |
| **Transaction fees** | Small flat or percentage fee per payment processed | Phase 4 |
| **Withdrawal fee** *(added)* | Small flat fee per payout | Phase 4 |
| **Bill-payment convenience fee** *(added)* | Small fee per bill paid through the wallet | Phase 5 |
| **FX spread** | Transparent margin on currency conversion for international payouts | Phase 6 |
| **Credit facility fees** | Share of the licensed lender's flat service fee (not compounding interest) | Phase 7 |

Full numbers are in Section 10.

### 1.6 Why now

- Safaricom's **Daraja API** is open for developers to build and test on, free. **[Corrected]** *Going live* requires a registered business with its own Paybill/Till, or a licensed partner.
- The African gig economy is growing fast; many people earn from clients who prefer local payment methods.
- The CBK **Digital Credit Providers Regulations (2022)** created a legal path for credit through licensed providers.
- No single app today combines **payment links + bill management + earned micro-credit** for this audience.

### 1.7 The vision

Hela Hop starts as a payment utility. It earns trust through daily use. Then it becomes the financial backbone for the millions of people traditional banks have ignored: not by replacing M-PESA, but by making M-PESA work for everyone.

### 1.8 One-sentence pitch

> *"Hela Hop gives anyone a link to get paid via M-PESA, keeps their bills under control, and turns good payment habits into a safety net."*

### 1.9 Competitors and alternatives *(added in v1.1)*

Users already have ways to solve these problems. If Hela Hop is not clearly better for a specific group, nobody will switch. **Update this table after every 10 interviews.**

| Alternative | What it does well | Where it falls short (our opening) | How Hela Hop must be better |
|---|---|---|---|
| **Plain M-PESA** (Till, Paybill, Pochi la Biashara, Send Money) | Everyone has it; free to receive on Pochi; instant SMS | No invoices, no "who hasn't paid?" list, no reminders, numbers easy to mistype | Invoices, tracking, reminders and copy-proof payment pages **on top of** M-PESA, not instead of it |
| **M-PESA app / Safaricom features** (bill manager, GlobalPay virtual card, Fuliza overdraft) | Built in; huge trust; Fuliza covers shortfalls instantly | GlobalPay is for Kenyans paying *abroad*, not for receiving; Fuliza can become an expensive habit | Seller tools and a *fair, explained* bill safety net. **Do not compete head-on with Fuliza** on speed; compete on fairness and paying the biller directly |
| **Payment gateways with payment links** (e.g. IntaSend, Paystack, Pesapal) | Real automatic confirmation, cards, payouts | Built for registered businesses and developers; KYC/onboarding friction for tiny sellers | Simpler for informal sellers; works in minutes with their **existing** Till/Pochi |
| **Freelancer payout services** (e.g. Wise, Payoneer, Grey, Chipper Cash; also IntaSend for Kenyan freelancers) | Trusted for cross-border payments | Not M-PESA-first for *collecting from Kenyan clients* | Phase 4–6 only; must be cheaper or simpler for a specific corridor |
| **Spreadsheets, notebooks, WhatsApp chats** | Free and familiar | Messy, error-prone, no reminders | Make Lite **faster than a notebook**, or it fails |
| **Digital lenders and M-Shwari/KCB M-PESA loans** | Instant credit | Can be costly; aggressive collections damage trust | Phase 7: tiny top-ups paid directly to billers, flat fee, ethical collections |

**Our wedge (the first thing we must win):** *informal sellers who want invoices, payment tracking and reminders that work with the M-PESA numbers they already have.*

**Biggest competitive threat:** Safaricom adds the same seller tools to the M-PESA app. **Defence:** move fast, serve one group deeply, build trust and data, and stay a partner to the ecosystem, not a rival (Risk R19).

### 1.10 Hypotheses we must test *(added in v1.1)*

Each hypothesis is a bet. If the evidence says "no", we change the plan (see the stop/pivot rules in 3.5).

| ID | We believe that... | How we test it | Pass if... | Test by |
|---|---|---|---|---|
| **H1** | Informal sellers have a real pain tracking who paid and chasing unpaid customers | 20 interviews (11.2) | ≥ 12 of 20 describe this pain unprompted | Week 3 |
| **H2** | Hela Hop Lite (no automatic confirmation) is still useful enough to use weekly | Beta usage | ≥ 50% of beta sellers active weekly after 4 weeks | Week 14 |
| **H3** | Sellers will pay for Pro | Pro plan launch | ≥ 3 paying users by Week 14, ≥ 10% of active sellers by Week 20 | Week 14–20 |
| **H4** | A licensed partner will let us open wallets for users who are **not Kenyan citizens/residents** (the original "no Kenyan bank needed" promise) | Partner question 7 (9.3) | ≥ 1 partner says yes in writing | Week 15 |
| **H5** | Foreign freelancers / tourists want this enough to switch from what they use now | 10 interviews + waitlist sign-ups | ≥ 50 waitlist sign-ups from the target group | Week 20 |
| **H6** | Users trust a new brand with money | Pilot behaviour | ≥ 60% of pilot users make a 2nd payment within 30 days | Week 28 |
| **H7** *(v1.2)* | Payers will actually tap "I've paid" and submit their M-PESA code (Lite depends on this) | Beta usage: count invoices paid vs claims submitted; ask sellers how often they still chase payers | ≥ 40% of payments are claimed by the payer without the seller chasing | Week 14 |

> If **H4 fails**, the cross-border promise needs a different route (e.g. a specialised cross-border partner, or serving Kenyans abroad first). Update Section 1.2 honestly.

---

## 2. Reality Check — The Rules of the Game

> Read this section before anything else. These rules decide the **order** in which we build. Ignoring them is the fastest way to get shut down, fined or scammed.

### 2.1 Six facts that shape the whole plan

| # | Fact | What it means for us |
|---|---|---|
| 1 | **Testing M-PESA is free; going live is not.** Anyone can get Daraja *sandbox* keys instantly. To take real payments you need your own Paybill or Till (applied for through Safaricom Business by a registered business with a KRA PIN), an M-PESA Org Portal admin, and a Go-Live approval on Daraja. Paying out (B2C) needs a special disbursement-capable account; community guides report that a collection (C2B) shortcode can't also be used for B2C. | We build and demo everything in the sandbox first. We never promise real-money features before the business side is ready. |
| 2 | **Holding other people's money in wallets is regulated.** ⚖️ In Kenya, running wallets or e-money for the public needs authorisation from the Central Bank of Kenya under the National Payment System Act. A licence takes many months and needs significant capital, and a draft *National Payment System Bill (2026)* proposes stricter rules for wallet balances. | Hela Hop does **not** apply for its own licence now. Wallet features run **through a licensed partner** that holds the money (Section 9). |
| 3 | **Lending is regulated.** ⚖️ Digital lending needs a CBK Digital Credit Provider licence. | Credit comes last (Phase 7) and only through a licensed partner. |
| 4 | **Personal data is regulated.** ⚖️ The Data Protection Act 2019 applies. Registration with the Office of the Data Protection Commissioner (ODPC) costs KES 4,000 for micro and small entities (renewal KES 2,000 every 2 years). **[Corrected in v1.1]** The small-business exemption (under KES 5M turnover and fewer than 10 staff) **does not apply to financial services**, which must register regardless of size. Data breaches must be reported within 72 hours. Storing personal data on cloud servers **outside Kenya counts as a cross-border transfer** and needs a lawful basis (safeguards or consent). | We design privacy in from day one and **register with ODPC as soon as the company exists (Week 12), before any real user data in production grows**. Hosting location is chosen with this in mind (Section 7.1). |
| 5 | **A company is needed before any real money.** A private limited company is registered online on eCitizen (Business Registration Service). Government fees are **about KES 10,000–11,000** (confirm on the live eCitizen invoice) and it takes about **3–7 working days**. The **beneficial ownership register (Form BOF1)** can be lodged during registration and **must** be lodged within **30 days** (late filing is a criminal offence with heavy fines); changes must be filed within **14 days**. **Taxes that apply to us (verified Nov 2026, confirm with an accountant ⚖️):** every business must issue invoices through KRA's **eTIMS** (expenses without eTIMS invoices are not tax-deductible); **15% excise duty** applies to fees charged for money-transfer services; and since **1 July 2026 (Finance Act 2026) 16% VAT** applies to fees for digital payment processing, gateway and aggregation services, so **partner fees will likely include VAT** (Section 10.3). | Register the company in **Week 10**, early enough for partner onboarding and ODPC, late enough that we only pay once we have users. |
| 6 | **Partners can change the deal.** Contracts can hide exclusivity, fee changes, fund holds and data clauses. | Lawyer review before signing, plus an architecture that can switch partners (Sections 7.6 and 9). |

### 2.2 The Golden Rule

> 🟢 **Hela Hop never holds user money in its own account.**
> Either the money goes **directly to the user's own M-PESA account** (Phases 1–2, "Hela Hop Lite"), or it sits with a **licensed partner** in a wallet or sub-account belonging to the user (Phase 3 onward).
>
> The only money that ever lands in Hela Hop's own account is **Hela Hop's own revenue** (subscriptions and fees).

### 2.3 What you can do at each level of readiness

| Readiness level | What you can legally do | Examples |
|---|---|---|
| **Nothing yet** (today) | Build, test in sandboxes, talk to users, run a waitlist, demo | Phase 0–1 |
| **Product live, money never touched** | Run Hela Hop Lite with real users; payments go seller-to-seller directly | Phase 1–2 |
| **Company registered** | Collect *your own* revenue (Pro plan) via your own Till or a gateway; sign contracts; register with ODPC; apply for trademark | Weeks 10–14 |
| **Partner contract signed + lawyer sign-off** 🚦 | Real-money wallets, collections and withdrawals **through the partner**, with limits | Phase 4 onward |
| **Cross-border partner signed** 🚦 | International payouts and card payments for tourists | Phase 6 |
| **Digital Credit Provider partner signed** 🚦 | Micro-credit top-ups | Phase 7 |

### 2.4 Things that are fully free right now

- Safaricom Daraja sandbox account and keys
- Partner sandboxes and test modes (e.g. Paystack, IntaSend)
- Git, GitHub, VS Code, Python, FastAPI, PostgreSQL, Docker Desktop (personal use)
- Free hosting and database tiers (check current limits when signing up)
- Talking to users, which is the most valuable work there is

---

## 3. Strategy — From Zero to the Full Vision

### 3.1 The staircase

We climb one step at a time. Each step earns the right to take the next one, by proving demand, building trust and unlocking partners.

| Phase | Name | What we build | Does real money flow through us? | Dates (target) |
|---|---|---|---|---|
| **0** | Foundation | Tools, repo, design, user interviews | No | Weeks 1–2 · 9 Nov – 22 Nov 2026 |
| **1** | Hela Hop Lite: Build | Payment links/QR to the seller's *own* Till/Paybill/Pochi, invoices, "who paid" tracking (saved billers, reminders and sandbox demo follow after Gate G1, D12) | **No.** Payer pays the seller directly. | Weeks 3–8 · 23 Nov 2026 – 3 Jan 2027 |
| **2** | Lite Beta + Pro plan | Real users, feedback, Pro subscription, company registration | Only Hela Hop's own subscription revenue | Weeks 9–14 · 4 Jan – 14 Feb 2027 |
| **3** | Wallet Engine (sandbox) | Ledger, partner integration, collections, withdrawals, KYC, admin, all in test mode; partner contract + lawyer | No (sandbox only) | Weeks 15–20 · 15 Feb – 28 Mar 2027 |
| **4** | Closed Real-Money Pilot | Go live with partner, small limits, 10 → 50 trusted users | **Yes, held by the licensed partner** | Weeks 21–28 · 29 Mar – 23 May 2027 |
| **5** | Public Launch + Bill Pay | Open sign-ups, pay bills from wallet, higher limits, marketing | Yes (partner) | Jun – Aug 2027 |
| **6** | Cross-Border + Tourists | International payouts, USD invoices, card payments for visitors | Yes (cross-border partner) | Sep – Dec 2027 |
| **7** | Hela Hop Score + Micro-Credit | Score v1, top-ups paid directly to billers | Yes (Digital Credit Provider partner) | Jan – Jun 2028 |

### 3.2 How Hela Hop Lite works (Phases 1–2)

Lite solves real problems **without touching money**, so it needs no licence and no partner contract:

1. A seller signs up and adds where they get paid: their **Till**, **Paybill + account number**, **Pochi la Biashara**, or **phone number**.
2. Hela Hop gives them a **payment link and QR code** (`/pay/their-name`) and lets them create **invoices** (`/i/abc123`).
3. The payer opens the link and sees exactly who they're paying, how much, the correct number with **one-tap copy buttons**, and step-by-step instructions. No more mistyped Paybills.
4. The payer pays **in their normal M-PESA menu or app**. The money goes **straight to the seller**.
5. The payer taps **"I've paid"** and enters the M-PESA confirmation code. The seller sees it in the dashboard and confirms; the invoice is marked **Paid** and a **receipt with a QR code** is generated.
6. Separately, any user can save their **billers** (KPLC, water, Wi-Fi, rent, school fees) with the correct numbers and get **reminders** before due dates.

**Optional extras in Lite:**
- **Demo Mode:** a fully working STK Push ("PIN prompt") flow in the **Daraja sandbox**, clearly labelled *"Demo — no real money"*. This is our proof of capability for judges, partners and investors.
- **Connect your own Paybill (stretch, Phase 2+):** sellers who already own a Paybill can connect their own Daraja keys so the payer gets a real PIN prompt and payment is confirmed automatically. The money still goes straight to the seller. This needs extra security work (encrypted secrets) and a lawyer's check, so it's a stretch goal only.

**Honest limits of Lite:** it does not yet serve foreigners without M-PESA, and payment confirmation is semi-manual. That is fine. Lite's job is to win **real users, real data and real feedback** cheaply and legally.

### 3.3 Why this order

1. **Demand before money.** Investors, grant panels and partners all ask: *"Do people use it?"* Lite answers that for almost KES 0.
2. **Legal safety.** Nothing touches user money until a lawyer and a licensed partner are in place (Gate G4).
3. **The code carries forward.** Users, links, invoices, the provider layer and the ledger design all get reused by the wallet phases.
4. **Negotiating power.** A partner offers better terms to a startup with 50 active users than to one with only an idea.
5. **Protecting the idea.** Once you have users and a brand, a partner copying the idea matters far less.

### 3.4 What we are deliberately NOT doing (yet)

- ❌ Applying for our own CBK licence
- ❌ Holding user money in Hela Hop's own Paybill or bank account
- ❌ Lending any money
- ❌ Crypto, stablecoins or blockchain wallets (see Section 16)
- ❌ A native mobile app (a mobile-friendly web app comes first; it works on every phone)
- ❌ Raising investment before we have traction

### 3.5 Stop, pivot or continue rules *(added in v1.1)*

Persistence is good; stubbornness is expensive. At these checkpoints we decide honestly using the numbers, not feelings.

| Checkpoint | If this happens... | Then we... |
|---|---|---|
| **Week 3** (after 20 interviews) | Fewer than 12 of 20 people describe the pain (H1 fails) | **Pivot the target user** before writing more code: try bill-payers or a specific seller niche (e.g. food sellers, salons) and re-interview |
| **Week 14** (Gate G2) | Fewer than 10 weekly active users **or** 0 paying Pro users | **Do not start Phase 3.** Spend 4 weeks on the top user complaint, then re-test. If still failing at Week 18, pivot the product (e.g. bill manager only, or seller invoicing only) |
| **Week 15** | No licensed partner accepts us (R3) | Keep running Lite; re-approach partners with more traction in 3 months; apply to an accelerator for introductions |
| **Week 15** | No partner supports non-Kenyan users (H4 fails) | Rewrite the cross-border promise (Section 1.2); focus on Kenyans first |
| **Week 28** (Gate G5) | Pilot users don't come back (H6 fails) or any unresolved money mismatch | **No public launch.** Fix trust and reliability first |
| **Any time** | Savings fall below 3 months of planned costs | Pause paid items, freelance, keep only free tools running. Never cut security or legal steps to save money |

> A pivot is **not failure**. It means the plan learned something. Record every pivot in the Decision Log (Section 15).

---

## 4. Master Timeline

### 4.1 Assumptions behind the dates

- **20–25 hours per week**: roughly 3 hours on weekday evenings plus 5–8 hours on the weekend.
- Founder works mostly solo, using an AI coding assistant. A helper joining speeds things up (Section 14).
- **Buffer is built in**: Week 7 (Christmas) and Week 8 (New Year) are light weeks, and each phase ends with a catch-up/test week.
- External waits (Safaricom, partners, lawyers, government) are **not in our control**. Those tasks start early so they run in parallel with coding.

> **More time?** At 35–40 hrs/week, Phases 0–3 shrink by about 30%. **Less time?** At 10 hrs/week, double every coding estimate but keep the business track (B) on schedule, because it is mostly waiting time.

### 4.2 The three tracks

| Track | Name | Share of weekly hours |
|---|---|---|
| **A** | 🛠️ Build: code, design, testing | ~65% |
| **B** | 📋 Business and legal: company, partners, lawyer, compliance | ~15% (more in Weeks 10–20) |
| **C** | 📣 Users and funding: interviews, community, beta, grants, pitches | ~20% |

### 4.3 Phase 0, Foundation (Weeks 1–2)

| Week | Dates | 🛠️ A: Build | 📋 B: Business | 📣 C: Users and funding |
|---|---|---|---|---|
| **1** | 9–15 Nov 2026 | Install tools (Appendix 19.1). Clone the repo to `C:\dev\hela-hop`. Folder structure, `README`, `.gitignore`, `.env.example`, `docs/`. Copy this plan into `docs/`. Docker + PostgreSQL running. "Hello world" FastAPI with one passing test. | Check that "Hela Hop" is free: eCitizen name search, domains (`.app`, `.co.ke`, `.com`), social handles. Set up a free password manager. **If you are employed, read your employment contract** for "intellectual property" / "outside work" clauses *before writing code*; ask HR in writing if unclear ⚖️. | List 30 people to interview (sellers, students, freelancers). Write the interview script (Section 11.2). |
| **2** | 16–22 Nov | CI on GitHub Actions (tests + lint on every push). Daraja sandbox account; keys into the password manager. Sandbox STK Push from a script ⭐. ~~Sketch the 8 key screens (paper or free Figma).~~ **[x] Done early (7 Nov 2026):** 8 clickable wireframes in `wireframes/`; show them in the interviews. | Reserve social handles. Buy the domain now if cheap 💰, or wait until Week 9. | **At least 10 interviews.** Write the top 5 pains in users' own words. |

🚦 **End of Week 2: Gate G0** (Section 5).

### 4.4 Phase 1, Hela Hop Lite build (Weeks 3–8)

| Week | Dates | 🛠️ A: Build | 📋 B: Business | 📣 C: Users and funding |
|---|---|---|---|---|
| **3** | 23–29 Nov | Database models + migrations: users, payout methods, payment links. Sign-up/login (email + password). Password reset. | Read the Daraja Go-Live guide and partner docs; note the requirements in Section 9. | 10 more interviews. Start a waitlist form; share it in 3 communities. |
| **4** | 30 Nov – 6 Dec | Seller profile + payout method (Till / Paybill + account / Pochi / phone) with validation. Payment link + QR code. Public payer page `/pay/{name}` with copy buttons and instructions. | First draft of Terms of Use + Privacy Policy in plain language (lawyer reviews later ⚖️). | Show sketches to 5 interviewees and note their reactions. |
| **5** | 7–13 Dec | Invoices: create, share `/i/{code}`, status (unpaid / claimed / paid / cancelled). "I've paid" form with M-PESA code. Seller confirm/reject. Receipt page with QR. | Research grants/accelerators; fill the deadlines calendar (Section 10.5). | Recruit **5 "design partner" sellers** for the January beta. |
| **6** | 14–20 Dec | Dashboard: totals, who paid / who hasn't, CSV export. Email notice to the seller when a payer submits a claim (so confirming is fast). *(Saved billers + reminders moved to Week 10, D12.)* | Separate account for project expenses; start the expenses sheet. | First "building in public" post on X/LinkedIn. |
| **7** 🎄 | 21–27 Dec | *Light week.* Bug fixes; tests for invoices, links and the claim → confirm → receipt flow (random receipt tokens, masked phone numbers). *(Demo Mode moved to Week 14, D12.)* | — | Rest. 😊 |
| **8** | 28 Dec – 3 Jan 2027 | Deploy to free hosting. Mobile-first polish (test on a cheap Android). Error pages, loading states, privacy-friendly analytics. Section 8 "Before beta" checklist. | Final check of the Terms/Privacy draft. | Send beta invites to design partners + waitlist. |

🚦 **End of Week 8: Gate G1** (Section 5).

---

### 4.5 Phase 2, Lite beta + Pro plan (Weeks 9–14)

| Week | Dates | 🛠️ A: Build | 📋 B: Business | 📣 C: Users and funding |
|---|---|---|---|---|
| **9** | 4–10 Jan 2027 | Onboard the first 5–10 beta users. Daily bug-fix loop. Production on a custom domain with HTTPS. | Buy the domain if not done 💰. | **Watch users use it** (in person or on video). Note every confusion. |
| **10** | 11–17 Jan | Fix the top 3 frictions. Add Google sign-in. Onboarding tips. **Saved billers + due-date reminders (email first)**, moved here from Week 6 (D12). | **Register the private limited company on eCitizen** 💰 (~KES 10,000–11,000; ~3–7 working days). **Lodge BOF1 with the application** (legal deadline 30 days). Get the company KRA PIN and **register on eTIMS** straight away. | Grow to 20 users through design-partner referrals. |
| **11** | 18–24 Jan | Pro plan: plan limits, settings, "upgrade" flow (pay to Hela Hop's own Till/Paybill or a gateway checkout). Prices/limits stored in the database, not hard-coded. | Open a company bank account. Apply for a **business Till or gateway merchant account** for *our own* subscription revenue only. | Apply to 1–2 grants/accelerators with the live product. |
| **12** | 25–31 Jan | SMS notifications for invoices and reminders (Africa's Talking sandbox first, then pay-per-SMS 💰). | **ODPC registration** 💰 (KES 4,000, **mandatory** for financial services). Confirm BOF1 is lodged. **Contact 3 wallet partners** with the 8 questions in writing (Section 9.3). | 30 users. Collect 3 testimonials. |
| **13** | 1–7 Feb | Admin page: users, invoices, abuse reports, disable account. Audit log. | **Trademark search + application at KIPI** 💰 (confirm classes and fees on kipi.go.ke). Shortlist 2–3 fintech lawyers (Section 9.5). | First paying Pro users ⭐. |
| **14** | 8–14 Feb | Catch-up week: tests, docs, **backup restore test**. **Demo Mode** (sandbox STK Push page, labelled "Demo — no real money"), moved here from Week 7 (D12). | Compare partner answers in the Section 9.3 table. | Write the **traction one-pager** (Section 12.3). |

🚦 **End of Week 14: Gate G2** (Section 5).

---

### 4.6 Week-by-week: Phase 3 Wallet Engine in sandbox (Weeks 15–20)

| Week | Dates | 🛠️ Track A: Build | 📋 Track B: Business | 📣 Track C: Users and funding |
|---|---|---|---|---|
| **15** | 15–21 Feb 2027 | **Double-entry ledger** (Section 7.5) with integer money. Property tests: balances always sum to zero. | Pick the primary partner + backup (record it in the Decision Log). Request the contract draft. | Keep Lite users happy: weekly update message. |
| **16** | 22–28 Feb | `PaymentProvider` interface + **partner sandbox adapter**. Collections: STK Push from the payment page to the partner, plus webhook handling (signature check, de-duplication). | **Lawyer reviews the partner contract + our Terms/Privacy** ⚖️ 💰 (Section 9.4 clause list). | Ask Lite users: *"Would you use a Hela Hop wallet? What would you pay?"* |
| **17** | 1–7 Mar | User wallet / sub-account creation at the partner. Balance page from the ledger. Status polling + reconciliation job for stuck payments. | Negotiate the contract points the lawyer flags. | Apply to the next grant or accelerator round. |
| **18** | 8–14 Mar | Withdrawals: hold → send → confirm or reverse. Limits and fraud rules (Section 8.4). KYC flow (partner's or our own: ID upload + selfie or ID number check). | Partner onboarding paperwork: company documents, directors' IDs, KRA PIN, bank details. | Pick **10 trusted pilot users** (people you know or vetted Lite users). |
| **19** | 15–21 Mar | Daily reconciliation report: our ledger vs the partner's statement. Admin: view any transaction, manual review queue, freeze account. Alerting (Section 7.9). | **Sign the partner contract** (only after lawyer sign-off ⚖️). | Prepare the pilot onboarding guide + support WhatsApp line. |
| **20** | 22–28 Mar | **Full sandbox test:** 50 scripted scenarios (Appendix 19.4). Fix everything red. Security review (Section 8, "Before real money"). | Partner switches us to **live** keys (store them in the password manager + host secrets only). | Pilot invites sent. |

🚦 **End of Week 20: check Gate G3 *and* Gate G4** (Section 5). **No real money until both pass.**

### 4.7 Week-by-week: Phase 4 Closed real-money pilot (Weeks 21–28)

| Week | Dates | 🛠️ Track A: Build | 📋 Track B: Business | 📣 Track C: Users and funding |
|---|---|---|---|---|
| **21** | 29 Mar – 4 Apr 2027 | Go live behind a **feature flag**, invited users only. Founder makes the first real payment and withdrawal of KES 10 ⭐. | Confirm the partner settlement and fee schedule matches the contract. | 3 pilot users transact. |
| **22** | 5–11 Apr | Monitor daily. Fix issues. Reconcile **every day** by hand + script. | Bookkeeping set up (free spreadsheet or Wave; confirm VAT/tax treatment with an accountant ⚖️). | 10 pilot users. |
| **23–24** | 12–25 Apr | Transaction fee + withdrawal fee live (from DB settings). Receipts by SMS/email. | Monthly KRA obligations check (accountant). | Collect pilot testimonials + numbers. |
| **25–26** | 26 Apr – 9 May | Raise limits slightly if zero incidents. Performance and cost check. | Review partner performance: failures, delays, support response. | Expand to 30–50 users. Pitch competitions/hackathons. |
| **27–28** | 10–23 May | Stabilise. Write the incident runbook (Appendix 19.5). Prepare public launch. | Lawyer check before public launch ⚖️ (Terms update, limits, complaints process). | **Traction deck** + apply to accelerators / angels with real numbers ⭐. |

🚦 **End of Week 28: check Gate G5** (Section 5).

### 4.8 Month-by-month: Phases 5–7 (June 2027 onward)

| Period | Phase | Main goals |
|---|---|---|
| **Jun – Aug 2027** | **5. Public launch + bill pay** | Open sign-ups with KYC tiers. Pay bills/Tills from the wallet via the partner. Scheduled bill payments. Referral programme. Target: 300–500 active users. Consider a part-time helper (Section 14). |
| **Sep – Dec 2027** | **6. Cross-border + tourists** | Sign a cross-border payout partner (e.g. remittance or payout API providers licensed for Kenya; shortlist in Section 9.2). USD invoices, show FX rate before confirming, FX margin live. Card payments for visitors paying Kenyan Tills/Paybills. Re-check licensing with the lawyer ⚖️. Seed funding conversations if traction is strong. |
| **Jan – Mar 2028** | **7a. Hela Hop Score v1** | Score built from ≥ 6 months of bill-payment history; show users their score and how to improve it. Shadow mode only (no lending yet) to check the score predicts behaviour. Sign a **Digital Credit Provider partner** ⚖️. |
| **Apr – Jun 2028** | **7b. Micro-credit pilot** | KES 300–2,000 top-ups paid **directly to billers**, flat fee, clear repayment terms, through the DCP partner. 50 → 200 users. Strict limits; no aggressive collections. |
| **Jul 2028 →** | Scale | Mobile app, more countries (Uganda/Tanzania mobile money), merchant tools, consider own licences only once revenue justifies it. |

### 4.9 Timeline at a glance

```
2026        Nov         Dec         Jan'27      Feb         Mar         Apr         May         Jun-Aug     Sep-Dec     2028
Phase 0     ██
Phase 1        ██████████████
Phase 2                             ████████████
Phase 3                                         ████████████
Phase 4                                                     ███████████████████
Phase 5                                                                             █████████
Phase 6                                                                                         ████████
Phase 7                                                                                                     ██████
Company reg.                        ▲ W10
Partner + lawyer                              ▲W12──────────▲W19 sign
First real money                                                        ▲ W21
```

### 4.10 Best case vs likely case *(added in v1.1)*

The week-by-week dates above are the **best case**. Steps that depend on other people (partners, lawyers, Safaricom, government) often take longer. Plan your money and energy for the **likely case**.

| Milestone | Best case | Likely case | What usually causes the delay |
|---|---|---|---|
| Lite beta starts | 4 Jan 2027 | Late Jan 2027 | Coding takes longer than expected; holidays |
| Company registered + KRA PIN + eTIMS | Mid-Jan 2027 | Feb 2027 | Name rejections, document corrections |
| ODPC certificate | Feb 2027 | Mar 2027 | Processing time |
| Partner chosen | Week 15 (mid-Feb) | Mar–Apr 2027 | Slow replies, compliance reviews of a new startup |
| Lawyer review + contract signed | Week 19 (mid-Mar) | May–Jun 2027 | Negotiating clauses, partner's legal team |
| **First real money (pilot)** | **29 Mar 2027** | **Jun–Jul 2027** | Everything above |
| Public launch | Jun 2027 | Sep–Oct 2027 | Pilot lessons, limits, support readiness |

> **Key point:** delays on Track B do **not** stop Track A or C. While waiting for partners or lawyers, keep improving Lite, growing users and earning Pro revenue. The waiting time is not wasted.

---

## 5. Sequence of Events and Gates

### 5.1 What must happen before what

Some things **cannot** happen in a different order. These dependencies are fixed:

```
Interviews ──► Screen design ──► Lite build ──► Beta users ──► Pro plan revenue
                                                   │
Name check ──► Domain ──────────────────────────────┤
                                                   ▼
                              Company registration (eCitizen)
                                 │        │         │
                                 ▼        ▼         ▼
                            KRA PIN   BOF1 filing  Company bank account
                                 │                  │
                                 ▼                  ▼
            ODPC registration   Business Till / gateway (our own revenue)
                                 │
                                 ▼
          Partner questions ──► Partner chosen ──► Lawyer review ──► Contract signed
                                                                        │
Ledger + provider layer + KYC + limits + reconciliation (sandbox) ──────┤
                                                                        ▼
                                                  🚦 G4: REAL MONEY ALLOWED
                                                                        │
                                                                        ▼
                                      Closed pilot ──► Public launch ──► Cross-border ──► Credit
```

### 5.2 The Gates

A **Gate** is a checklist that must be **100% ticked** before moving to the next phase. If a Gate is not passed, we stay in the current phase and fix what's missing. No exceptions, even if a date slips.

#### 🚦 G0: Foundation done (end of Week 2)
- [ ] Repo cloned to `C:\dev\hela-hop`; CI runs tests on every push and is green
- [ ] Daraja sandbox STK Push works from a script
- [ ] At least 10 user interviews written up
- [ ] Top 5 user pains listed; Lite feature list confirmed or adjusted
- [ ] Name check done (no obvious conflict with "Hela Hop")

#### 🚦 G1: Lite ready for beta (end of Week 8)
- [ ] A seller can sign up, add a payout method, get a link + QR, create an invoice
- [ ] A payer can open a link on a cheap phone and pay without help
- [ ] "I've paid" → seller confirm → receipt works end to end
- [ ] Claim email reaches the seller; receipt links are random tokens and public pages mask phone numbers (D9, D10)
- [ ] Deployed on HTTPS; database backups are automatic **and a restore was tested**
- [ ] "Before beta" security checklist (Section 8) is all ticked
- [ ] Terms of Use + Privacy Policy drafts published on the site
- [ ] At least 5 design-partner sellers ready to start

#### 🚦 G2: Lite proven (end of Week 14)
- [ ] ≥ 30 registered users, ≥ 15 active weekly
- [ ] ≥ 100 invoices / payment links paid through Lite
- [ ] ≥ 3 paying Pro users (or a clear reason why not and a fix)
- [ ] Company registered; KRA PIN; BOF1 filed; **eTIMS** active; company bank account open
- [ ] ODPC registration done (mandatory for financial services)
- [ ] Hypotheses H1–H3 checked against the stop/pivot rules (Section 3.5) and the result recorded in the Decision Log
- [ ] Trademark application filed
- [ ] Answers from ≥ 2 wallet partners received in writing

#### 🚦 G3: Wallet engine ready (end of Week 20)
- [ ] Ledger tests pass: every transaction balances to zero; no floats anywhere
- [ ] All 50 sandbox scenarios (Appendix 19.4) pass, including duplicate webhooks, timeouts, failed withdrawals and reversals
- [ ] Daily reconciliation report matches the partner's sandbox statement
- [ ] Withdrawal limits, holds and fraud rules active
- [ ] KYC flow works; unverified users cannot withdraw
- [ ] Admin can freeze an account and see a full audit trail
- [ ] "Before real money" security checklist (Section 8) is all ticked

#### 🚦 G4: Legal green light for real money ⚖️ (end of Week 20)
- [ ] Partner is **listed on the CBK directory** of authorised payment service providers (check the CBK website on the day of signing)
- [ ] Partner contract **signed after written lawyer review**
- [ ] Lawyer confirms **in writing** that our setup (who holds funds, KYC, limits) does not require Hela Hop to hold its own licence for the pilot
- [ ] Terms of Use + Privacy Policy updated and lawyer-approved
- [ ] Complaints and refund process written down (Appendix 19.5)
- [ ] **Wind-down plan** written and agreed with the partner (Section 9.6): what happens to users' money if Hela Hop or the partner stops
- [ ] Privacy Policy includes **consent to use payment history for a future Hela Hop Score** and covers any data stored outside Kenya ⚖️
- [ ] Live keys stored only in the password manager + hosting secrets

#### 🚦 G5: Ready for public launch (end of Week 28)
- [ ] ≥ 8 weeks of pilot with **zero unreconciled shillings**
- [ ] No unresolved security incident
- [ ] Support process can handle 10× the users (FAQ, templates, response time target)
- [ ] Unit economics known: real cost per transaction vs real fee earned
- [ ] Lawyer pre-launch check done ⚖️

#### 🚦 G6: Cross-border allowed ⚖️ (before Phase 6 go-live)
- [ ] Cross-border partner licensed for the corridors we use; contract lawyer-reviewed
- [ ] FX rate and fees shown to the user **before** they confirm
- [ ] Enhanced KYC / anti-money-laundering checks for international payouts

#### 🚦 G7: Credit allowed ⚖️ (before Phase 7b)
- [ ] Licensed Digital Credit Provider partner signed; lawyer-reviewed
- [ ] Score tested in shadow mode for ≥ 3 months
- [ ] Clear, flat, fully disclosed fees; no hidden charges; fair collections policy
- [ ] Data-sharing with the lender covered by user consent and the Privacy Policy

---

## 6. Phase-by-Phase Detail

Each phase lists its **goal**, **must-have features**, **"done when"** (see the matching Gate), **cost**, **owner** and **top risks**. Week-level tasks are in Section 4.

### Phase 0: Foundation (Weeks 1–2)
- **Goal:** working tools, a clean repo, and real evidence of user pain.
- **Must-haves:** dev environment, repo structure, CI, Daraja sandbox call, 10+ interviews, screen sketches.
- **Done when:** Gate G0. **Cost:** KES 0 (domain optional). **Owner:** Founder.
- **Top risks:** spending all the time on setup and none on users (R10); OneDrive breaking the repo (R14).

### Phase 1: Hela Hop Lite build (Weeks 3–8)
- **Goal:** a usable, mobile-friendly web app that never touches money.
- **Must-have features (MVP):**
  1. Sign-up / login / password reset
  2. Payout methods: Till, Paybill + account number, Pochi la Biashara, phone number (with validation)
  3. Personal payment link + downloadable QR code
  4. Invoices with shareable links and statuses
  5. Payer page: who you're paying, amount, copy buttons, step-by-step M-PESA instructions
  6. "I've paid" claim with M-PESA code → seller confirms → receipt with QR
  7. Dashboard: paid / unpaid, totals, CSV export
  8. ~~Saved billers + due-date reminders (email)~~ **Moved to Week 10, after Gate G1 (D12)**
  9. ~~Demo Mode: sandbox STK Push, clearly labelled~~ **Moved to Week 14, after Gate G1 (D12)**
- **Also must-have (added in v1.1):**
  10. **Swahili + English** on the public payer pages (`/pay`, `/i`), since many payers are more comfortable in Swahili
  11. **Seller disclaimer** on every public page: *"Hela Hop does not verify this seller. Only pay people you trust."* (until KYC exists in Phase 3+)
  12. **Accessibility basics:** large tap targets, readable font sizes, good colour contrast, works on small screens and slow 3G, pages under ~200 KB
- **Nice-to-have (only if ahead of schedule):** dark mode, full Swahili for the dashboard, WhatsApp share button.
- **Done when:** Gate G1. **Cost:** ~KES 0–2,000 (domain). **Owner:** Founder.
- **Top risks:** feature creep (R10); fake "I've paid" claims (handled: the seller always confirms against their own M-PESA SMS).

### Phase 2: Lite beta + Pro plan + company (Weeks 9–14)
- **Goal:** prove people use and pay for it, and make Hela Hop a legal entity.
- **Must-haves:** 30+ users, Pro plan, Google sign-in, SMS notifications, admin page, audit log, company + KRA PIN + BOF1, ODPC, trademark filed, partner questions sent.
- **Pro plan (draft, test with users):** KES 150–300/month for unlimited invoices, branded payment page (logo/colours), custom link name, SMS reminders to customers, monthly report.
- **Done when:** Gate G2. **Cost:** ~KES 20,000–35,000 (company, ODPC, trademark, SMS); see Section 10.1. **Owner:** Founder.
- **Top risks:** low engagement (R1); running out of personal money (R9).

### Phase 3: Wallet engine in sandbox + partner + lawyer (Weeks 15–20)
- **Goal:** a correct, tested money engine, and a signed, lawyer-approved partner.
- **Must-haves:** double-entry ledger, `PaymentProvider` interface + partner adapter, collections, webhooks, wallets/sub-accounts, withdrawals with holds, KYC, limits and fraud rules, daily reconciliation, admin review tools, 50 scenario tests.
- **Done when:** Gates G3 + G4. **Cost:** lawyer review ~KES 20,000–60,000 (estimate; get quotes; ask about startup clinics). **Owner:** Founder + lawyer.
- **Top risks:** bad contract terms (R4); ledger bugs (R6); partner rejects us (R3).

### Phase 4: Closed real-money pilot (Weeks 21–28)
- **Goal:** real money moving safely for 10 → 50 trusted users.
- **Starting limits (adjust with partner/lawyer):** max KES 10,000 per transaction, KES 20,000 per day, KES 50,000 wallet balance; first withdrawal after a 24-hour hold.
- **Must-haves:** feature flag, daily reconciliation, fee engine live, receipts, incident runbook, bookkeeping.
- **Done when:** Gate G5. **Cost:** partner fees (per transaction), SMS, hosting upgrade (~KES 1,000–3,000/month). **Owner:** Founder.
- **Top risks:** fraud (R5); partner downtime (R7); support overload.

### Phase 5: Public launch + bill pay (Jun–Aug 2027)
- **Goal:** open to the public; make Hela Hop part of people's monthly routine.
- **Must-haves:** KYC tiers (low limits for basic, higher for full verification), pay Paybills/Tills from the wallet via the partner, scheduled bills, referral programme, help centre/FAQ, status page.
- **Done when:** 300–500 monthly active users, positive gross margin per transaction. **Owner:** Founder + first helper.

### Phase 6: Cross-border + tourists (Sep–Dec 2027)
- **Goal:** serve the freelancer and tourist users from the original vision.
- **Must-haves:** licensed cross-border payout partner, USD invoices, FX quote shown before confirming, FX margin, card payments for visitors paying Kenyan Tills/Paybills, enhanced AML checks.
- **Done when:** Gate G6 passed and first international payouts complete. **Cost:** lawyer re-check, partner setup.
- **Top risks:** regulation changes (R2); FX losses (only quote rates the partner guarantees).

### Phase 7: Hela Hop Score + micro-credit (Jan–Jun 2028)
- **Goal:** the safety-net feature: small top-ups earned through good behaviour.
- **7a Score v1 (Jan–Mar):** simple, explainable points (on-time bills, regular income, account age, no disputes). Shown to the user with tips. **No AI black box at first.** Run it silently ("shadow mode") and compare predictions with real behaviour.
- **7b Credit pilot (Apr–Jun):** KES 300–2,000 top-ups paid **directly to the biller**, flat disclosed fee, via a licensed Digital Credit Provider partner.
- **Done when:** Gate G7 passed; repayment rate ≥ 95% in the pilot.
- **Top risks:** defaults; reputational risk of looking like a "loan app" (we never send shaming messages, never access contacts, and keep fees flat and clear).

---

## 7. Technical Plan

> For developers. Non-technical readers can skip to Section 8, and the Glossary (Section 18) explains every term.

### 7.1 Technology stack (decided, see D3 in Section 15)

| Layer | Choice | Why |
|---|---|---|
| Language | **Python 3.12** | Founder's existing skill; great for finance and data (score later) |
| Web framework | **FastAPI** | Fast, modern, automatic API docs, easy to test |
| Pages (Phases 1–3) | **Server-rendered HTML** (Jinja2 templates) + **HTMX** for interactivity + a small CSS framework (e.g. Bootstrap or Pico) | One codebase, very fast on cheap phones, no separate frontend to maintain. Can add React/Next.js or a mobile app later on top of the same API. |
| Database | **PostgreSQL 16** | Reliable, transactions are all-or-nothing, which is essential for money |
| Database tools | **SQLAlchemy 2** (models) + **Alembic** (migrations) | Standard and well documented |
| Background jobs | **Arq** or **Celery** + **Redis**, or simple scheduled jobs at first | Reminders, status checks, reconciliation |
| Validation | **Pydantic v2** | Built into FastAPI |
| Auth | Email + password (**argon2** hashing), sessions in secure cookies; Google sign-in via OAuth (Week 10) | Simple and safe |
| Tests | **pytest**, **httpx** test client, **hypothesis** (property tests for the ledger) | Founder already uses pytest |
| Code quality | **ruff** (lint + format), **mypy** (types), **pre-commit** hooks | Catch mistakes before they ship |
| Local environment | **Docker Compose** (Postgres + Redis) and a Python `.venv` | Same setup on any machine |
| CI | **GitHub Actions** | Free for public repos and has a free quota for private ones |
| Hosting | A free/cheap tier (e.g. Render, Railway or Fly.io) + managed Postgres (e.g. Neon or Supabase Postgres). **Data location matters:** these usually host in the US/EU, which counts as a cross-border transfer of personal data under Kenya's Data Protection Act. That's acceptable with safeguards + disclosure in the Privacy Policy, but confirm with the lawyer ⚖️, and consider a Kenyan/African region or local cloud once real money is involved | Check current free-tier limits when choosing (Q4) |
| Errors/monitoring | **Sentry** (free tier) + uptime check (e.g. UptimeRobot, free) | Know about problems before users tell us |
| SMS | **Africa's Talking** (sandbox, then pay-per-SMS) | Kenyan, cheap, good docs |
| Email | A transactional email service with a free tier (e.g. Brevo, Resend) | Password resets, receipts |
| Local webhook testing | **ngrok** or Cloudflare Tunnel (free) | Lets Safaricom/partners reach your laptop |

### 7.2 Architecture

```
            ┌──────────────────────── Users' phones / browsers ─────────────────────────┐
            │  Seller dashboard        Public payer page /pay/x        Admin pages       │
            └───────────────┬──────────────────────┬───────────────────────┬────────────┘
                            │ HTTPS                │                       │
                    ┌───────▼──────────────────────▼───────────────────────▼───────┐
                    │                FastAPI app (Hela Hop)                         │
                    │  auth · links · invoices · billers · wallet · admin · webhooks │
                    │                         │                                      │
                    │     services (business rules) ── ledger (double-entry)         │
                    │                         │                                      │
                    │     providers/ ── PaymentProvider interface                    │
                    │        ├─ DarajaSandboxProvider   (demo mode)                  │
                    │        ├─ PartnerProvider         (e.g. IntaSend/Paystack)     │
                    │        └─ FakeProvider            (tests)                      │
                    └──────┬───────────────────┬──────────────────────┬─────────────┘
                           │                   │                      │
                    PostgreSQL           Redis + workers         External APIs
                    (all data)           (jobs, reminders,       (Daraja, partner,
                                          reconciliation)         SMS, email)
```

### 7.3 Repository structure

```
hela-hop/
├── README.md                 # what it is + how to run it in 10 minutes
├── docs/
│   ├── MASTER-PLAN.md        # this document
│   ├── decisions/            # one short file per big decision (ADR)
│   └── runbooks/             # incident, reconciliation, go-live steps
├── app/
│   ├── main.py               # FastAPI app factory
│   ├── config.py             # settings from environment variables
│   ├── db.py                 # database session
│   ├── models/               # SQLAlchemy models
│   ├── schemas/              # Pydantic request/response models
│   ├── routers/              # auth, links, invoices, billers, wallet, admin, webhooks
│   ├── services/             # business rules (no web code here)
│   ├── ledger/               # double-entry ledger: posting, balances, checks
│   ├── providers/            # PaymentProvider interface + adapters
│   ├── jobs/                 # background jobs: reminders, polling, reconciliation
│   ├── templates/            # Jinja2 HTML
│   └── static/               # CSS, JS, images
├── migrations/               # Alembic
├── tests/                    # unit/, integration/, scenarios/
├── scripts/                  # one-off tools (seed data, sandbox STK test)
├── docker-compose.yml
├── pyproject.toml
├── .env.example              # every setting listed, NO real values
├── .pre-commit-config.yaml
└── .github/workflows/ci.yml
```

---

### 7.4 Data model

**Money rule:** every amount is stored as an **integer in cents** (`amount_minor`, so KES 1.00 = 100) plus a `currency` code (`KES`). **Never floats.** IDs are UUIDs. Every table has `created_at` / `updated_at`.

**Phases 1–2 (Lite)**

| Table | Key fields | Notes |
|---|---|---|
| `users` | email (unique), password_hash, full_name, phone, role (user/admin), plan (free/pro), email_verified, status (active/frozen) | Phone in E.164 (`+2547...`) |
| `payout_methods` | user_id, type (till/paybill/pochi/phone), number, account_ref, label, is_default | Validated formats |
| `payment_links` | user_id, slug (unique), title, fixed_amount_minor (optional), payout_method_id, is_active | Public page `/pay/{slug}` |
| `invoices` | user_id, code (unique, random), customer_name, customer_phone, items (JSON), total_minor, currency, due_date, status (unpaid/claimed/paid/cancelled) | Public page `/i/{code}` |
| `payment_claims` | invoice_id or link_id, payer_name, payer_phone, mpesa_code, amount_minor, status (pending/confirmed/rejected) | `mpesa_code` unique per seller, so a code can't be reused |
| `receipts` | claim_id, number, snapshot, qr_payload | Only after the seller confirms |
| `billers` | user_id, name, type (paybill/till), number, account_ref, typical_amount_minor, due_day, reminder_days_before | e.g. "KPLC Home" |
| `reminders` | biller_id or invoice_id, channel (email/sms), scheduled_for, sent_at, status | Created by jobs |
| `subscriptions` | user_id, plan, period_start, period_end, status, payment_ref | Hela Hop's own revenue |
| `settings_fees` | key, value_json, effective_from | Prices, limits and fees; change without redeploying |
| `audit_log` | actor_id, action, entity, entity_id, before_json, after_json, ip | Append-only |
| `demo_stk_requests` | phone, amount_minor, checkout_request_id, result_code, raw_callback | Sandbox Demo Mode only |

**Phase 3+ (wallets via partner)**

| Table | Key fields | Notes |
|---|---|---|
| `kyc_profiles` | user_id, level (0/1/2), id_type, id_number_hash, verified_at, provider_ref | Store the minimum; encrypt sensitive fields |
| `provider_accounts` | user_id, provider, external_wallet_id, status | The user's wallet **at the partner** |
| `payment_intents` | user_id, direction (in/out), amount_minor, fee_minor, status, idempotency_key (unique), provider, provider_ref | One per payment attempt |
| `provider_events` | provider, event_id (unique), type, signature_ok, payload_json, processed_at | Raw webhooks, de-duplicated |
| `ledger_accounts` | owner (user/platform), type (user_wallet/fees/clearing/payouts_pending), currency | |
| `ledger_transactions` | kind (collection/withdrawal/fee/reversal/adjustment), reference | Groups entries |
| `ledger_entries` | transaction_id, account_id, amount_minor (+/−) | **Entries in one transaction must sum to 0** |
| `withdrawals` | user_id, amount_minor, fee_minor, destination, status (held/sent/succeeded/failed/reversed), provider_ref | |
| `reconciliation_runs` | date, provider, our_total, their_total, difference, status, report_json | Daily |
| `risk_events` | user_id, rule, score, action (allow/hold/block) | Fraud rules |

### 7.5 The ledger: how money is recorded

- **Double-entry:** every movement is at least two entries that **add up to zero**. Example: a KES 1,000 payment with a KES 30 fee gives *clearing −1,000 · user wallet +970 · platform fees +30*.
- **Balances are calculated from entries**, never typed in. There is **no "edit balance" button**, ever (unlike the old prototype; see Section 16).
- **Mistakes are fixed with new entries** (reversal/adjustment with a reason and admin ID), never deletions.
- **Daily reconciliation against the partner must show a difference of 0.** Any difference triggers an alert and pauses payouts until it is explained.

---

### 7.6 The provider layer (how we avoid partner lock-in)

```python
class PaymentProvider(Protocol):
    def create_wallet(self, user) -> ProviderWallet: ...
    def request_payment(self, intent, phone) -> ProviderRef: ...      # e.g. STK Push
    def get_payment_status(self, ref) -> PaymentStatus: ...
    def send_payout(self, withdrawal) -> ProviderRef: ...
    def get_balance(self, wallet) -> int: ...                         # minor units
    def parse_webhook(self, headers, body) -> ProviderEvent: ...      # verifies signature
    def list_transactions(self, day) -> list[ProviderTxn]: ...        # for reconciliation
```

Each partner gets its own adapter (`DarajaSandboxProvider`, `IntaSendProvider`, `PaystackProvider`, `FakeProvider` for tests). **Switching partners means writing a new adapter, not rewriting the app.**

### 7.7 Key flows

1. **Lite payment (Phase 1):** payer opens `/pay/x` → sees seller + number → pays in their M-PESA menu → submits the M-PESA code → seller confirms → receipt issued. No money touches Hela Hop.
2. **Wallet collection (Phase 3+):** payer enters phone → `payment_intent` (pending, with idempotency key) → provider STK Push → **webhook** (signature verified, stored raw, de-duplicated by `event_id`) → ledger posting → user notified. If no webhook arrives in N minutes, a job asks the provider for the status. **The browser is never trusted to say "paid".**
3. **Withdrawal:** request → checks (KYC level, limits, holds, risk rules) → ledger moves funds to `payouts_pending` → provider payout → success: final entry / failure: **reversal** to the wallet → user notified.
4. **Reconciliation (daily):** fetch the partner's transactions → match with ours by reference → report matched / missing / mismatched → alert if not zero.

### 7.8 Environments

| Environment | Purpose | Data | Payment keys |
|---|---|---|---|
| **Local** | Developing | Fake / seed data | Sandbox |
| **Staging** | Testing before release | Fake data | Sandbox |
| **Production** | Real users | Real data | Sandbox until Gate G4, then live |

Separate databases and secrets per environment. Production secrets live only in the host's secret store + the password manager. **Never copy production data to a laptop.**

### 7.9 Quality, monitoring and backups

- **Tests:** every pull request runs the full suite. Ledger code: **100% coverage** + property tests. Overall target ≥ 80%.
- **Review:** even solo, open a pull request and re-read money-related diffs the next day before merging.
- **Monitoring:** Sentry for errors; uptime check every 5 minutes; alerts for failed webhooks, reconciliation differences, failed jobs, spikes in failed payments.
- **Backups:** automatic daily backups kept ≥ 30 days; **test a restore every month**.
- **Logging:** never log passwords, PINs, full ID numbers, card data or API secrets. Mask phone numbers (`+2547****123`).
- **Releases:** small and frequent; reversible migrations; feature flags for anything risky.

---

## 8. Security and Compliance Checklist

### 8.1 From day one (Phase 0+)
- [ ] `.env` files are in `.gitignore`; `.env.example` has names only, no values
- [ ] Secrets in the password manager; **2-factor authentication (2FA)** on GitHub, email, hosting, Daraja, partner and domain accounts
- [ ] Secret scanning on GitHub turned on (free); pre-commit hook to block committed keys
- [ ] Dependencies kept up to date (Dependabot, free)
- [ ] Work is backed up in GitHub (not only on the laptop)

### 8.2 Before beta (Gate G1)
- [ ] Passwords hashed with argon2; minimum length 10; rate-limited login; account lockout after repeated failures
- [ ] Secure, HTTP-only, SameSite cookies; CSRF protection on forms
- [ ] All user input validated (Pydantic) and all output escaped (templates auto-escape): **no XSS**
- [ ] HTTPS only; security headers (HSTS, CSP, X-Frame-Options)
- [ ] Rate limits on public pages (`/pay`, `/i`, claim forms, STK demo) so they can't be used to spam people with PIN prompts or SMS
- [ ] Users can only see their own data (an authorisation test for every route)
- [ ] Privacy Policy explains what we collect, why, how long we keep it, and how to delete it
- [ ] "Delete my account" + "Download my data" requests possible (manual process OK at first)
- [ ] Report-abuse link on every public payment page (stops scammers using Hela Hop links)

### 8.3 Before real money (Gates G3 + G4)
- [ ] Webhook signatures verified; webhooks only processed once (`event_id` unique); raw payloads stored
- [ ] Idempotency keys on every money operation; safe retries
- [ ] Ledger invariants enforced in code **and** checked by a daily job
- [ ] Admin actions need a reason and are written to the audit log; admin account has 2FA
- [ ] Sensitive fields (ID numbers, KYC documents) encrypted; access logged
- [ ] KYC levels enforced: no withdrawals without verification
- [ ] Limits and holds active (8.4)
- [ ] Incident runbook written (Appendix 19.5); breach notification steps known: **ODPC within 72 hours** ⚖️
- [ ] Dependency + basic security scan clean (e.g. `pip-audit`, `bandit`)
- [ ] Optional when funds allow: an external penetration test 💰

### 8.4 Fraud and abuse rules (start strict, relax with data)

| Rule | Starting value (adjust with partner) |
|---|---|
| New account first-withdrawal hold | 24 hours after first incoming payment |
| Hold after any incoming payment before withdrawal | 30 minutes (from the old plan) |
| Withdrawals per user per day | Max 3 (from the old plan) |
| Per-transaction / daily / balance limits (pilot) | KES 10,000 / 20,000 / 50,000 |
| Same phone paying many different accounts quickly | Flag for review |
| Many failed PIN prompts to one number | Block the payer number for 1 hour |
| Payout destination changed recently | 24-hour hold + email/SMS alert to the user (SIM-swap protection) |
| Name mismatch between KYC and payout account | Manual review |

### 8.5 Compliance obligations

| Obligation | When | Status |
|---|---|---|
| **Employment contract check** (if employed): make sure your employer can't claim Hela Hop ⚖️ | Week 1 | [ ] |
| Company registration (eCitizen BRS) + BOF1 (lodge with application; legal deadline 30 days; changes within 14 days) | Week 10 | [ ] |
| Company KRA PIN; income tax obligations; **VAT registration once turnover reaches the threshold** (ask an accountant ⚖️) | Week 10–11 | [ ] |
| **eTIMS** registration: every invoice we issue (incl. Pro subscriptions) goes through eTIMS; ask suppliers for eTIMS invoices so costs are deductible | Week 10–11 | [ ] |
| **Excise duty (15%) on our money-transfer fees** and **VAT (16%) on payment-service fees** (Finance Act 2026): confirm exactly which of our fees are affected and how to file ⚖️ | Before Phase 4 fees go live | [ ] |
| ODPC registration as data controller/processor (**mandatory** for financial services) | Week 12 | [ ] |
| **Cross-border data transfer:** document where data is hosted, the safeguards used, and disclose it in the Privacy Policy ⚖️ | Week 8 + Week 12 | [ ] |
| **Consent for future scoring:** Privacy Policy + sign-up consent explicitly cover using payment/bill history to build a Hela Hop Score later (opt-in, revocable) ⚖️ | Week 4 draft, Week 16 final | [ ] |
| **Credit reference bureau (CRB) rules:** understand consent and reporting duties before any credit (via the DCP partner) ⚖️ | Before Phase 7b | [ ] |
| **Dormant accounts and unclaimed balances:** policy for inactive wallets (notify users, never confiscate; follow the partner's rules and Kenya's unclaimed-assets law) ⚖️ | Before Phase 5 | [ ] |
| **Insurance** (cyber + professional liability) once real money and larger user numbers are involved 💰 | Phase 5 | [ ] |
| Terms of Use + Privacy Policy (drafted Week 4; lawyer-reviewed Week 16) ⚖️ | Weeks 4–16 | [ ] |
| Trademark application at KIPI | Week 13 | [ ] |
| Partner's KYC/AML requirements built in | Phase 3 | [ ] |
| Anti-money-laundering: understand whether Hela Hop has reporting duties under the Proceeds of Crime and Anti-Money Laundering Act, or whether the partner covers it ⚖️ | Before G4 | [ ] |
| Consumer protection: clear fees, complaints process, refund policy ⚖️ | Before G4 | [ ] |
| Annual returns to the company registry; annual KRA returns | Every year | [ ] |
| Re-check CBK rules (draft NPS Bill 2026 and any new regulations) every 3 months ⚖️ | Quarterly | [ ] |

---

## 9. Partners and Contracts

### 9.1 What we need a partner for

| Need | Phase | Partner type |
|---|---|---|
| Hold user funds in wallets/sub-accounts; collect via M-PESA; pay out to M-PESA/bank | 3–5 | Licensed payment service provider (PSP) with a wallet/sub-account product |
| Pay Kenyan bills/Tills from a wallet | 5 | Same PSP (most support Paybill/Till payouts) |
| International payouts, FX, card payments | 6 | Cross-border payout / remittance provider licensed for Kenya |
| Micro-credit | 7 | CBK-licensed Digital Credit Provider |
| SMS | 2+ | Africa's Talking (or similar) |
| Collect *our own* Pro subscription revenue | 2 | Our own business Till, or any gateway merchant account |

### 9.2 Shortlist to contact (Week 12)

| Candidate | Why it's on the list | Things to check |
|---|---|---|
| **IntaSend** | Python SDK, test mode, wallet API, M-PESA collections and payouts | Which wallet product is allowed for an unlicensed startup? Kenyan-company-only? Exact fees. |
| **Paystack (Kenya)** | Strong documentation; collections (M-PESA, cards, bank) + transfers to M-PESA, bank and Paybill | Do they allow "collecting on behalf of others"? Sub-accounts/split payments? |
| **Pesapal** | Long-running Kenyan PSP; collections and payouts | Wallet/sub-account support; API quality |
| **Kopo Kopo** | Merchant-focused M-PESA tools | Fit for marketplace/platform use |
| **SasaPay** | Kenyan PSP with wallet features and low published fees | Wallet-as-a-service terms |
| **Cross-border (Phase 6)** | Shortlist later; consider remittance/payout APIs licensed for Kenya | Corridors, licences, FX quote locking |
| **Digital Credit Provider (Phase 7)** | Shortlist later from the CBK list of licensed DCPs | Revenue share, data rules, collections conduct |

> Before signing with **any** partner, check that it appears on the **CBK directory of authorised payment service providers** (or the DCP list for credit) on the CBK website, on the day of signing.

### 9.3 The eight questions (send in writing, compare answers here)

| # | Question | Partner 1 | Partner 2 | Partner 3 |
|---|---|---|---|---|
| 1 | Does your licence cover a platform that collects money **on behalf of its users**, or only payments to the merchant itself? | | | |
| 2 | Can each of our users have **their own wallet/sub-account held by you**? Who legally owns those funds? | | | |
| 3 | Who does **KYC**: you or us? What are the limits per KYC level? | | | |
| 4 | Payout options (M-PESA, bank, Paybill/Till, international): speed and cost? | | | |
| 5 | Sandbox? **Signed webhooks**? **Idempotency keys**? Settlement reports for reconciliation? | | | |
| 6 | Onboarding requirements, contract length, **reserves/rolling holds**, fees (all of them, **including VAT and excise**), and notice periods? | | | |
| 7 *(v1.1)* | Can you open wallets for users who are **not Kenyan citizens or residents** (passport KYC)? Which countries are excluded? (Tests Hypothesis H4) | | | |
| 8 *(v1.1)* | If **Hela Hop shuts down** or **the contract ends**, what happens to users' balances? Are funds held in a ring-fenced trust account? How do users get their money out? | | | |

### 9.4 Contract clause checklist (give this to the lawyer) ⚖️

| Clause | Red flag | What to ask for |
|---|---|---|
| Exclusivity | "Shall use only [Partner]" | None, or short and in exchange for better fees |
| Termination | They can end it any time at short notice | ≥ 90 days' notice + migration help + data export |
| Fee changes | "May change fees at any time" | 60–90 days' written notice + right to exit without penalty |
| Fund holds / reserves | Open-ended freezes, rolling reserves | Fixed reserve %, fixed settlement times, written dispute process |
| Data ownership | They own or can freely use our customer data | **We own our users and data**; they use it only to provide the service |
| Feedback / ideas | Anything we suggest becomes theirs | Delete or narrow |
| Non-solicitation | Missing | They may not market directly to our users using our platform data |
| IP | Vague | Our code, brand, scoring models and designs remain 100% ours |
| Data export | Missing | Full export of wallets, transactions and user records on request |
| Liability | We carry everything; theirs is capped near zero | Liability both ways, reasonable caps |
| Minimum volumes | Penalties for low volume | Removed for the early stage |
| Change of control | They can transfer the contract if acquired | We can exit |
| Governing law / disputes | Foreign courts only | Kenyan law; mediation/arbitration in Nairobi |

### 9.5 Protecting the idea and the company

1. **Share on a need-to-know basis.** Partners need to know how we'll use their API, not our scoring logic or growth plans.
2. **NDA** before detailed talks (big partners may refuse; then share less).
3. **Register the company and the trademark early** (Weeks 10 and 13).
4. **We write our own code** (founder or contracted developers whose contracts assign IP to Hela Hop). Never let a partner build the product.
5. **Use more than one provider**: primary + backup adapter (Section 7.6).
6. **Own ledger = our record of truth** in any dispute.
7. **Hela Hop is the visible brand**; partners stay behind the scenes.
8. **Finding a lawyer cheaply:** ask accelerators/incubators (many have legal partners), university legal-aid clinics, the Law Society of Kenya referral service, or fintech community groups. Ask for a fixed-fee quote for "contract review + setup opinion".

### 9.6 Wind-down plan: protecting users' money if things stop *(added in v1.1)*

Partners, regulators, investors and users will all ask: *"What happens to my money if Hela Hop disappears?"* Have a written answer **before Gate G4**.

| Scenario | What must happen | Who does it |
|---|---|---|
| **Hela Hop shuts down** | Stop new sign-ups and payments; give users ≥ 30 days' notice; let everyone withdraw; the partner pays out remaining balances directly to users' verified M-PESA/bank accounts; keep records for the legally required period | Founder + partner |
| **Partner ends the contract** | Use the notice period to move users to the backup provider (adapter layer, Section 7.6) **or** pay everyone out; export all data | Founder |
| **Partner fails / loses its licence** | User funds should be in the partner's **ring-fenced trust account** at a licensed bank (ask question 8, Section 9.3), so they are not lost with the partner; follow CBK instructions | Partner + CBK |
| **Founder can't continue (illness, etc.)** | A trusted person (co-founder or named adviser) has sealed access to the password manager emergency kit and this runbook | Founder sets this up in Phase 4 |

Rules: **never** use user balances for Hela Hop's expenses; keep the daily reconciliation running until the last shilling is paid out; communicate early and honestly.

### 9.7 Other payment networks *(added in v1.1)*

- **Airtel Money:** most partners support it as well as M-PESA. Add it once wallets are live (Phase 5) so Airtel users are not excluded. Lite can already show an Airtel Money number as a payout method.
- **USSD (feature phones without internet):** many Kenyans use basic phones. A USSD menu (e.g. via Africa's Talking) for checking balances and paying bills is a **Phase 5+ option**; test demand first.

---

## 10. Money Plan — Costs, Revenue, Funding

> All amounts are **estimates** unless marked *official*. Check current prices before paying. Track every shilling spent in the expenses sheet from Week 6.

### 10.1 Budget by phase

| Item | When | Estimated cost (KES) | Notes |
|---|---|---|---|
| Tools, sandboxes, GitHub, Python, Postgres | Phase 0+ | **0** | Free |
| Domain name | Week 2 or 9 | ~1,500–4,000 / year | `.co.ke` usually cheaper than `.app` |
| Hosting + database (free tiers) | Phases 1–3 | 0 – 1,000 / month | Upgrade only when needed |
| Company registration (eCitizen) | Week 10 | **~10,000–11,000** (government fees; confirm on the eCitizen invoice) | Private limited company; BOF1 included |
| eTIMS registration | Week 10–11 | **0** (free KRA system) | Mandatory for invoicing |
| ODPC registration (micro/small) | Week 12 | **4,000**; renewal 2,000 / 2 yrs (confirm on odpc.go.ke) | **Mandatory** for financial services |
| Trademark (KIPI) | Week 13 | ~5,000–15,000 | Confirm per-class fees on kipi.go.ke |
| SMS | Week 12+ | ~1 per SMS | Pay as you go; cap the monthly spend |
| Lawyer: contract review + setup opinion | Weeks 16–19 | ~20,000–60,000 | Get 2–3 fixed-fee quotes; ask for startup rates/clinics |
| Accountant (light bookkeeping/tax) | Phase 4+ | ~2,000–5,000 / month | Or a free tool + yearly review |
| Hosting upgrade for real money | Phase 4+ | ~1,500–5,000 / month | Paid database with backups |
| Optional: penetration test | Phase 5 | Varies widely | When funded |

| Phase | Total estimate (KES) |
|---|---|
| Phases 0–1 (Weeks 1–8) | **0 – 4,000** |
| Phase 2 (Weeks 9–14) | **~20,000 – 35,000** |
| Phase 3 (Weeks 15–20) | **~25,000 – 65,000** (mostly lawyer) |
| Phase 4 (Weeks 21–28) | **~10,000 – 25,000** + partner fees |
| **Total until real-money pilot** | **≈ KES 55,000 – 130,000 over ~7 months** |

> **If cash is tight:** Phases 0–1 cost nearly nothing. Use Phase 1–2 traction to win a grant, hackathon prize or accelerator **before** the lawyer and partner costs in Phase 3. If no funding arrives by Week 14, **pause at Gate G2**, keep running Lite (which earns Pro revenue), and freelance to fund Phase 3. Do **not** skip the lawyer.

### 10.2 Revenue streams and starting prices (to test)

| Stream | Starting price (hypothesis) | Phase |
|---|---|---|
| Pro plan | KES 150–300 / month | 2 |
| Collection fee | Partner cost + ~1–1.5% | 4 |
| Withdrawal fee | Flat KES 30–50 | 4 |

> *(v1.1)* All fees we charge for moving money may attract **15% excise duty**, and partner fees may carry **16% VAT**. Decide whether prices shown to users **include** these taxes (recommended: show one all-in price) and model them in Section 10.3.
| Bill-pay convenience fee | Flat KES 10–20 | 5 |
| FX margin | 1–2%, shown upfront | 6 |
| Credit service fee share | Agreed with the DCP partner | 7 |

All prices live in the `settings_fees` table so they can change without new code.

### 10.3 Example: margin on one KES 1,000 payment (Phase 4, illustrative)

| | KES |
|---|---|
| Hela Hop fee charged (e.g. 4%) | +40.00 |
| Excise duty on our fee (15% of 40) *(v1.1)* | −6.00 |
| Partner collection fee (e.g. 2.5%) | −25.00 |
| VAT on the partner's fee (16% of 25, Finance Act 2026) *(v1.1)* | −4.00 |
| Payout / withdrawal cost (e.g. ~1%) | −10.00 |
| **Hela Hop margin** | **≈ −5.00 (a LOSS)** |

> **[Corrected in v1.1]** The v1.0 example showed +KES 5 because it ignored taxes. With **excise duty** on our fee and **VAT** on the partner's fee, the same prices **lose money**. Whether VAT is included in a partner's quote, and exactly how excise applies to our fees, must be confirmed with the partner and an accountant ⚖️. Use real quotes in this table before setting prices.

**Lesson:** fees on transactions alone are thin, and after taxes they can be negative. A **flat withdrawal fee**, **Pro subscriptions**, **FX margin** and **partner volume discounts** make the business work.

### 10.4 Break-even example

If monthly costs are ~KES 100,000 (hosting, tools, SMS, accounting, a small founder stipend):
- From transaction margin alone: even at a positive 0.5% margin (which needs higher fees than the example in 10.3, *after* taxes), break-even needs **~KES 20 million / month** of volume, which is hard early.
- With a mix: **300 Pro users × KES 250 = 75,000** + **1,000 withdrawals × KES 30 = 30,000** = **KES 105,000 before taxes**. After 16% VAT on subscriptions (once VAT-registered) and 15% excise on the withdrawal fees, this is **roughly KES 90,000**, so plan for **~350 Pro users** or higher prices to truly break even. *(Updated in v1.1; confirm tax treatment with an accountant ⚖️.)*

### 10.5 Funding sources and when to approach them

| Source | What it is | Approach when | Notes |
|---|---|---|---|
| Own savings / freelancing | Self-funding | Now | Python/backend freelancing funds Phases 2–3 |
| First paying users | Pro plan revenue | Week 13+ | Proves willingness to pay |
| Hackathons / pitch competitions | Cash prizes, exposure | Anytime with the demo | Fintech hackathons in Nairobi; bank/telco innovation challenges |
| Grants (no shares given) | e.g. Tony Elumelu Foundation programme; fintech/financial-inclusion grants | Week 11+ (live product) | Check each call's dates; apply to several |
| Accelerators | Mentoring, partner intros, sometimes investment | Week 11+ and with pilot data (Week 28) | e.g. Antler, Founders Factory Africa, Catalyst Fund, Google for Startups Africa, Safaricom-linked programmes; check current calls |
| Angel investors | Small early investment for shares | After Gate G5 with real traction | Negotiate from strength; use standard simple agreements; get the lawyer to review |
| Seed round | Larger investment | Phase 6+ with growth | Only if needed for cross-border/credit scale |

**Deadlines calendar:** keep a simple table (program, link, deadline, status) in `docs/funding.md` and check it every Sunday.

---

## 11. Getting Users

### 11.1 Who first, and where to find them

| Order | Group | Where |
|---|---|---|
| 1 | Instagram / WhatsApp / TikTok sellers (clothes, food, cosmetics, electronics) | Your contacts, their customers, seller groups, Instagram DMs |
| 2 | Students and young workers (bills, rent, Wi-Fi) | Campus groups, WhatsApp groups, friends |
| 3 | Market-stall and small service businesses (salons, mechanics, tutors) | In person, walking a local market with a phone demo |
| 4 | Freelancers (for the waitlist; served in Phase 4–6) | r/Kenya, X/Twitter tech community, Upwork/Fiverr Kenya groups, LinkedIn |

### 11.2 Interview script (15 minutes; listen more than you talk)

1. Tell me how you get paid by customers today. Walk me through the last time.
2. What goes wrong? (Wrong numbers, unpaid customers, fake confirmation messages, tracking...)
3. How do you keep track of who paid? Show me if you can.
4. Which bills do you pay every month? How? Ever paid the wrong Paybill or been late?
5. What have you tried to fix this? What did it cost?
6. If something fixed this, what would it be worth to you per month?
7. Can I show you a rough idea and come back in a few weeks for you to try it?

**Rules:** don't pitch until question 7; write down their exact words; ask for one referral at the end.

### 11.3 Beta onboarding

- Set up the first 10 users **personally** (call or visit; set up their link together).
- WhatsApp support group + a feedback form linked in the app.
- Weekly "what's new" message; fix at least one thing they asked for every week.
- **Shadow** 3 users per phase: watch them use it and note every hesitation.

### 11.4 Growth ideas (after Gate G2)

- Every receipt and payment page has "Get your own Hela Hop link". Every payer sees it.
- Referral: 1 free Pro month for both sides.
- Building in public on X/LinkedIn (weekly progress + numbers).
- Short TikTok/Reel videos: "Stop mistyping Paybills" / "Know exactly who paid you".
- Partnerships with seller communities, campuses and co-working spaces.

---

## 12. Metrics — The Numbers We Track

### 12.1 Weekly dashboard (fill every Sunday)

| Metric | Meaning |
|---|---|
| **Registered users** | Total sign-ups |
| **Weekly active users (WAU)** | Users who did something meaningful this week |
| **Payments tracked / processed** | Lite: confirmed claims. Wallet: successful collections |
| **Volume (KES)** | Total value of those payments |
| **Retention (week 4)** | % of users still active 4 weeks after signing up |
| **Paying users + revenue (KES)** | Pro subscriptions + fees |
| **Interviews / conversations** | Keeps us close to users |
| **Incidents** | Security, money mismatch, downtime |
| **Reconciliation difference (KES)** | Must always be **0** (Phase 4+) |

### 12.2 Targets per phase

| By the end of | Users | Weekly active | Payments | Revenue | Other |
|---|---|---|---|---|---|
| Phase 0 (Wk 2) | — | — | — | — | 10+ interviews |
| Phase 1 (Wk 8) | 5–10 design partners | — | 20 test payments | — | Claim → confirm → receipt works end to end |
| Phase 2 (Wk 14) | **30+** | **15+** | **100+** | **3+ Pro users** | Company registered |
| Phase 4 (Wk 28) | 50 pilot + 100+ Lite | 40+ | 300+ real | Fees > partner costs | **0 unreconciled KES** |
| Phase 5 (Aug 2027) | 500+ | 200+ | 2,000+ / month | Covers hosting + tools | — |

> The old 30-day targets (50+ transactions, 10–20 users, KES 50,000 volume) are kept as the **Phase 4 pilot "first month" targets**.

### 12.3 Traction one-pager (for grants and investors)

One page with: the problem (one sentence), what Hela Hop does, a screenshot, the numbers from 12.1, 2–3 user quotes, what's next (phases), the team, and the ask (amount + what it pays for).

---

## 13. Risk Register

Likelihood (L) and Impact (I): **H**igh / **M**edium / **L**ow. Review monthly.

| ID | Risk | L | I | How we reduce it | Early warning sign |
|---|---|---|---|---|---|
| R1 | People don't use it / don't pay | M | H | Interviews first; design partners; ship small, measure weekly | WAU flat for 3 weeks |
| R2 | Regulation changes (e.g. NPS Bill 2026, CBK rules) | M | H | Golden Rule (never hold funds); licensed partners; quarterly legal check ⚖️ | New CBK circulars/bills |
| R3 | No partner accepts us | M | H | Talk to 3+ partners; show traction; keep Lite running regardless | No replies after 3 weeks |
| R4 | Bad or hidden contract terms / partner copies the idea | M | H | Lawyer review; clause checklist (9.4); multi-provider adapters; trademark; share less | Pressure to sign fast |
| R5 | Fraud / scams using Hela Hop links | H | H | Limits, holds, KYC, report-abuse button, review queue, block lists | Chargebacks, complaints |
| R6 | Ledger or money bugs | M | H | Integer money, double-entry, 100% tests, daily reconciliation, pause payouts on mismatch | Any non-zero difference |
| R7 | Partner or M-PESA downtime | M | M | Status polling, retries, clear user messages, backup provider | Rising failed payments |
| R8 | Security breach / data leak | L | H | Section 8 checklist; 2FA; least data stored; incident runbook; ODPC within 72 h | Strange logins, alerts |
| R9 | Founder runs out of money | M | H | Near-free Phases 0–1; freelancing; grants; pause at a Gate rather than cut corners | Savings < 3 months of costs |
| R10 | Scope creep / building too much | H | M | Must-have lists per phase; "parked ideas" section; weekly review | Week tasks slipping 2× |
| R11 | Burnout (working solo + 20–25 hrs/week) | M | H | One full rest day per week; light weeks built in; find a helper | Skipping reviews, low energy |
| R12 | Name/trademark conflict | L | M | Name check Week 1; trademark Week 13 | Similar names found |
| R13 | SIM-swap / account takeover of users | M | H | 24-h hold after payout-number change; alerts; 2FA option | Payout changes + withdrawals |
| R14 | OneDrive sync corrupting the repo / `.venv` | M | M | Keep code in `C:\dev\hela-hop` outside OneDrive; GitHub as backup | Git lock errors, weird file conflicts |
| R15 | Losing the laptop / no backups | L | H | Push to GitHub daily; password manager; secrets not only on the laptop | — |
| R16 | Free-tier hosting limits / sudden costs | M | L | Monitor usage; budget alert; easy migration (Docker) | Usage emails from host |
| R17 | Safaricom/partner rejects the Go-Live or changes API | L | M | Partner-first approach; adapter layer; keep docs current | Deprecation notices |
| R18 | Users confuse Hela Hop with a loan app (reputation) | M | M | Credit only in Phase 7; ethical rules; clear messaging | Negative reviews |
| R19 *(v1.1)* | **Safaricom or a big gateway copies the seller tools** | M | H | Serve one niche deeply; move fast; build trust, data and brand; stay ecosystem-friendly | New M-PESA app features |
| R20 *(v1.1)* | **Lite isn't valuable enough** without automatic confirmation (H2 fails) | M | H | Test early; stop/pivot rules (3.5); "connect your own Paybill" stretch goal | Low weekly use in beta |
| R21 *(v1.1)* | **Taxes wipe out the margin** (excise, VAT, eTIMS admin) | H | M | Model taxes in every price (10.3); accountant check before fees go live | Negative margin per transaction |
| R22 *(v1.1)* | **Employer claims ownership** of Hela Hop | L | H | Check the employment contract in Week 1; build on personal time and equipment; get written clarity | IP / outside-work clauses |
| R23 *(v1.1)* | **Data-protection breach of rules** (no ODPC registration, data abroad without basis, no scoring consent) | M | H | ODPC Week 12; consent from day one; hosting choice documented | Partner/ODPC questions |
| R24 *(v1.1)* | **Scammers use Hela Hop links** to look trustworthy | M | M | Seller disclaimer; report-abuse button; fast takedown; KYC before wallets | Abuse reports |

---

## 14. Team and Roles

### 14.1 Now (Phases 0–2): founder solo + helpers on demand

| Role | Who | Responsibilities |
|---|---|---|
| Founder / product / developer | Founder | Everything in Tracks A, B, C; keeps this plan current |
| AI coding assistant | Tool | Code drafts, tests, docs; **founder reviews everything, especially money code** |
| Mentor(s) | Find 1–2 (accelerator, community, ex-fintech engineers) | Monthly 30-minute check-in |
| Lawyer | Contracted (Phase 3) | Contract review, setup opinion, Terms/Privacy |
| Accountant | Contracted (Phase 4) | Bookkeeping, tax |

### 14.2 Who to add next (in order)

1. **Co-founder or part-time business/growth person** (Phase 2–4): user onboarding, partnerships, support. Must believe in the mission. Use a written co-founder agreement with vesting ⚖️.
2. **Part-time developer** (Phase 4–5): especially for frontend/mobile. Contract must assign IP to the company.
3. **Customer support person** (Phase 5).
4. **Compliance/risk adviser** (Phase 6–7).

### 14.3 How a new helper gets productive in one day

1. Read Sections 0, 1, 3 and 18 of this plan (1 hour).
2. Follow Appendix 19.1 to run the app locally (1–2 hours).
3. Pick a card labelled `good-first-task` on the GitHub Projects board.
4. Open a pull request; the founder reviews within 24 hours.
5. Join the weekly review (Sunday).

### 14.4 Working rhythm

| When | What |
|---|---|
| Weekday evenings (~3 h) | Track A coding |
| Saturday (~6–8 h) | Big build tasks + user conversations |
| Sunday (~1 h) | Weekly review (Appendix 19.3); update this plan; plan next week |
| One day per week | **Full rest. Non-negotiable.** |

---

## 15. Decision Log and Open Questions

### 15.1 Decisions made

| ID | Date | Decision | Why |
|---|---|---|---|
| D1 | 6 Nov 2026 | Product name is **Hela Hop** (formerly Kakitu) | Founder's choice |
| D2 | 6 Nov 2026 | Hela Hop never holds user funds in its own account (Golden Rule, 2.2) | Avoid needing its own CBK licence; legal safety |
| D3 | 6 Nov 2026 | Stack: Python + FastAPI + PostgreSQL; server-rendered pages + HTMX first | Founder's skills; speed; works on cheap phones |
| D4 | 6 Nov 2026 | Start with **Hela Hop Lite** (no money handling), then wallets via a licensed partner | Cheapest legal path to traction |
| D5 | 6 Nov 2026 | Replace the old 30-day plan with this plan | Old plan skipped legal steps; see Section 17 |
| D6 | 6 Nov 2026 | Code in `C:\dev\hela-hop`, outside OneDrive; its own GitHub repo | Avoid sync corruption; separate from other projects |
| D7 | 6 Nov 2026 | Working time 20–25 hrs/week | Founder's availability |
| D8 | 7 Nov 2026 | Wireframes (`wireframes/index.html` + `README.md`) are the **visual spec for Lite**; brand colour emerald `#10b981`; mobile-first at 320px; pages under ~200 KB; EN/SW on payer pages | Built ahead of schedule; use them in user interviews |
| D9 | 7 Nov 2026 | A payer's M-PESA code is only a **claim**. A receipt exists only after the **seller confirms** against their own M-PESA SMS. Never label anything "Verified" before that | Anyone can type a fake code; trust and legal safety |
| D10 | 7 Nov 2026 | Public receipt/invoice links use **long random tokens**, never sequential numbers; payer phone numbers are masked on public pages | Prevents guessing other people's receipts (privacy, Data Protection Act) |
| D11 | 7 Nov 2026 | Lite invoices are plain "Invoice", **not** "official invoice" (they are not KRA eTIMS invoices) | Avoid implying tax-invoice status; see Q18 |
| D12 | 7 Nov 2026 | Saved billers/reminders and sandbox Demo Mode move to **after Gate G1**; Google sign-in stays in Week 10 | Phase 1 was too big for 20–25 hrs/week; protect the core seller loop |

### 15.2 Open questions

| ID | Question | Decide by | Who |
|---|---|---|---|
| Q1 | Is "Hela Hop" free as a company name, domain and trademark? | Week 1 | Founder |
| Q2 | Final Lite feature list after interviews | Week 2 (G0) | Founder |
| Q3 | Domain: `helahop.app`, `.co.ke` or `.com`? | Week 2–9 | Founder |
| Q4 | Hosting provider (compare current free tiers) | Week 8 | Founder |
| Q5 | Pro plan price (KES 150 / 200 / 300?) | Week 11 | Founder + users |
| Q6 | ~~Is ODPC registration mandatory for us yet?~~ **Answered in v1.1: yes**, financial services must register regardless of size. Remaining question: register as controller, processor, or both? ⚖️ | Week 12 | Lawyer |
| Q7 | Primary + backup wallet partner | Week 15 | Founder |
| Q8 | Does our setup need any licence of our own? (written opinion) ⚖️ | Week 19 | Lawyer |
| Q9 | Who handles AML reporting: us or the partner? ⚖️ | Week 19 | Lawyer + partner |
| Q10 | Pilot limits and fees | Week 20 | Founder + partner |
| Q11 | Co-founder: yes/no, who, equity split ⚖️ | Before Phase 4 | Founder |
| Q12 | Cross-border partner and corridors | Aug 2027 | Founder |
| Q13 | Digital Credit Provider partner | Dec 2027 | Founder + lawyer |
| Q14 *(v1.1)* | Does the employment contract (if any) affect ownership of Hela Hop? ⚖️ | Week 1 | Founder (+ lawyer if unclear) |
| Q15 *(v1.1)* | Exactly which of our fees attract 15% excise duty and/or 16% VAT? ⚖️ | Before Phase 4 fees | Accountant |
| Q16 *(v1.1)* | Where will production data be hosted, and what safeguards cover the cross-border transfer? ⚖️ | Week 8 | Founder + lawyer |
| Q17 *(v1.1)* | Which partner supports non-Kenyan users (H4)? | Week 15 | Founder |
| Q18 *(v1.2)* | Does a Lite invoice/receipt need to be an eTIMS-compliant document, or is a payment-claim receipt enough? What wording is safe ("Receipt" vs "Proof of payment")? ⚖️ | Before beta (Week 8) | Accountant + lawyer |

---

## 16. Parked Ideas From Earlier Documents

These came from `PROJECT_PROMPT.md`, `README.md` and the HTML prototype ("Kakitu Pay Pro"). **Nothing is thrown away**: each idea is reused, parked for later, or rejected with a reason.

| Idea (old docs) | Decision | When / why |
|---|---|---|
| Integer-cent money maths (1 KES = 100 cents) | ✅ Reused | Core ledger rule (7.4) |
| Append-only audit log | ✅ Reused | `audit_log` + ledger |
| Search, filter, **CSV export** | ✅ Reused | Dashboard (Phase 1) |
| Printable **receipts/vouchers with QR codes** | ✅ Reused | Receipts (Phase 1) |
| XSS sanitisation of names/notes | ✅ Reused | Security (8.2) |
| Duplicate detection | ✅ Reused | Unique M-PESA codes, webhook de-duplication, idempotency keys |
| Phone validation (`+254…`, `07…`, `01…`) | ✅ Reused | Payout methods (Phase 1) |
| Cash-flow charts (inflow vs outflow) | ✅ Reused later | Pro dashboard (Phase 2+) |
| M-PESA B2C tariff bands table | ✅ Reused as data | Fee settings; **re-check current rates**, the old figures may be outdated |
| Dark emerald UI style (`#10b981`) | ✅ Optional | Brand/design inspiration |
| Confetti on success | ✅ Optional | Small delight 🎉 |
| **Batch / bulk payouts** (CSV paste, many recipients) | 🅿️ Parked | Phase 5+: chama dividends, small-business payroll via the partner's bulk API |
| **Chama** (savings group) payouts | 🅿️ Parked | Phase 5+: strong Kenyan use case once wallets are live |
| Address book of verified contacts | 🅿️ Parked | Phase 5 (saved recipients) |
| **PesaLink** interbank transfers | 🅿️ Parked | Phase 5–6, if the partner supports it |
| Live USD/KES FX display | 🅿️ Parked | Phase 6, with **real partner quotes**, not a fixed rate |
| **Stellar / crypto / stablecoin wallets** | 🅿️ Parked (high risk) | Not before 2028; crypto rules in Kenya are still evolving ⚖️ |
| "Treasury manager" / DAO positioning | ❌ Rejected for now | Different customer; distracts from the core user |
| **Editable balance / "liquidity injection"** | ❌ Rejected permanently | Real money systems never let anyone type a balance; balances come only from ledger entries |
| Simulated "blockchain" stages and `0xKT…` hashes | ❌ Rejected | Misleading in a real product |
| LocalStorage as the database | ❌ Rejected | Fine for a demo; real data lives in PostgreSQL |

---

## 17. What Happened to the Old Files

| File | Old location | Now | Notes |
|---|---|---|---|
| `kakitu-product-summary.md` | `stock-price-predictor\Eddy project\` | `Hela-Hop\archive\` | Fully merged into Section 1 |
| `kakitu-30-day-plan.md` | `stock-price-predictor\Eddy project\` | `Hela-Hop\archive\` | **Replaced** by Sections 4–6 |
| `PROJECT_PROMPT.md`, `README.md`, `index.html`, `app.js`, `style.css` | `stock-price-predictor\Eddy project\` | **Unchanged** | The "Kakitu Pay Pro" prototype; ideas listed in Section 16. Optionally copy into `C:\dev\hela-hop\prototype\` for reference. |

### 17.1 Why the 30-day plan was replaced, and what was kept

| Old plan said | Problem | New plan |
|---|---|---|
| Node.js + Express + Supabase | Founder works in Python | Python + FastAPI + PostgreSQL (D3) |
| Day 7: first payment record in the DB | ✅ Good | Kept: sandbox STK Push in Week 2, Demo Mode in Week 14 (moved from Week 7, D12) ⭐ |
| Day 15: 1.5% platform fee table | ✅ Good | Kept: fee settings table |
| Days 17–18: B2C payouts from "our Paybill" | Holding user money = licence issue; B2C needs approval | Payouts **via licensed partner** after Gate G4 |
| Day 19: international payouts | Needs a cross-border partner + legal check | Phase 6 |
| Day 20: integer-only ledger test | ✅ Good | Kept and expanded (7.5) |
| Day 21: max 3 withdrawals/day, 30-min hold | ✅ Good | Kept (8.4) |
| Day 22: SMS via Africa's Talking | ✅ Good | Kept: Week 12 |
| Days 23–27: production + real money | No company, contract or lawyer yet | Real money only after Gates G3 + G4 (Week 21) |
| Days 28–30: landing page + accelerator application | ✅ Good | Kept: waitlist Week 3; applications from Week 11 |
| 3 daily numbers (transactions, users, volume) | ✅ Good | Kept in Section 12 |
| "Build the smallest thing that proves the biggest assumption" | ✅ Great rule | **Our motto** (19.6) |

---

## 18. Glossary

| Term | Plain meaning |
|---|---|
| **AML** | Anti-Money Laundering: rules and checks to stop criminals moving dirty money |
| **API** | A way for two computer systems to talk to each other |
| **B2C** | Business-to-Customer: an M-PESA payment *from* a business *to* a person (used for payouts/withdrawals) |
| **BOF1** | Beneficial Ownership form filed with the company registry, saying who really owns/controls the company |
| **BRS / eCitizen** | Business Registration Service, the government portal where companies are registered online |
| **C2B** | Customer-to-Business: a person paying a business (Paybill/Till) |
| **CBK** | Central Bank of Kenya, which regulates payments, e-money and digital lending |
| **CI** | Continuous Integration: tests run automatically every time code is pushed |
| **Daraja** | Safaricom's developer platform/API for M-PESA |
| **DCP** | Digital Credit Provider, a company licensed by CBK to give digital loans |
| **Double-entry ledger** | A record where every money movement is written as matching plus and minus entries that sum to zero, so errors show up |
| **E.164** | International phone number format, e.g. `+254712345678` |
| **Feature flag** | A switch that turns a feature on for some users only |
| **FX** | Foreign exchange: converting one currency to another |
| **Gate** | A checklist that must be fully ticked before moving to the next phase |
| **Go-Live** | Safaricom's approval to move from sandbox to real money |
| **HTMX** | A small library that makes web pages interactive without a big JavaScript framework |
| **Idempotency key** | A unique ID attached to a payment request so that sending it twice never charges twice |
| **KIPI** | Kenya Industrial Property Institute, where trademarks are registered |
| **KRA PIN** | Kenya Revenue Authority tax number |
| **KYC** | Know Your Customer: verifying a user's identity (ID, selfie, etc.) |
| **Minor units** | Money stored in the smallest unit (cents); KES 12.50 is stored as `1250` |
| **MVP** | Minimum Viable Product: the smallest version that is useful to real users |
| **ODPC** | Office of the Data Protection Commissioner, Kenya's data privacy regulator |
| **Paybill / Till** | Safaricom business numbers for receiving M-PESA payments (Paybill uses an account number; Till doesn't) |
| **Pochi la Biashara** | An M-PESA feature letting individuals/small sellers receive business payments on their phone number |
| **PSP** | Payment Service Provider, a company licensed to process payments/hold e-money |
| **Reconciliation** | Comparing our records with the partner's records to make sure every shilling matches |
| **Sandbox** | A test environment with fake money |
| **Shortcode** | The number of a Paybill or Till |
| **SIM swap** | Fraud where a criminal takes over someone's phone number |
| **STK Push** | The M-PESA PIN prompt that pops up on the payer's phone |
| **Webhook / callback** | A message a partner's system sends to ours when something happens (e.g. "payment succeeded") |

---

## 19. Appendix — Checklists and Templates

### 19.1 Day-one setup (Week 1)

**Install (all free):**
- [ ] Git for Windows; GitHub account with 2FA
- [ ] Python 3.12 (python.org; tick "Add to PATH")
- [ ] VS Code + Python extension
- [ ] Docker Desktop (runs PostgreSQL and Redis)
- [ ] A password manager (e.g. Bitwarden)
- [ ] ngrok or Cloudflare Tunnel (for testing webhooks)

**Set up the repo (PowerShell):**
```powershell
New-Item -ItemType Directory -Force -Path C:\dev
cd C:\dev
git clone https://github.com/<your-account>/<hela-hop-repo>.git hela-hop
cd hela-hop
python -m venv .venv
.\.venv\Scripts\Activate.ps1
# Next: the AI assistant creates the folder structure from Section 7.3,
# pyproject.toml, docker-compose.yml, .env.example and the first test.
```

- [ ] Copy this plan to `C:\dev\hela-hop\docs\MASTER-PLAN.md` and commit it
- [ ] Create the GitHub Projects board with columns: *Backlog · This week · Doing · Review · Done*
- [ ] Create accounts: Daraja (developer.safaricom.co.ke), Sentry, Africa's Talking (sandbox)

### 19.2 Definition of Done (for every task)
- [ ] Works on a phone-sized screen
- [ ] Has tests (money code: full coverage)
- [ ] CI is green
- [ ] No secrets in code; inputs validated
- [ ] Docs/plan updated if behaviour or decisions changed

### 19.3 Weekly review template (every Sunday, ~1 hour)

```markdown
## Week N review: <dates>
**Planned this week:** ...
**Done:** ...
**Not done + why:** ...
**Numbers (Section 12.1):** users __ | WAU __ | payments __ | volume KES __ | revenue KES __ | interviews __
**What users said (quotes):** ...
**Risks changed? (Section 13):** ...
**Decisions made (add to Section 15):** ...
**Next week's top 3:** 1) ... 2) ... 3) ...
**Energy level (1–5):** __
```

### 19.4 Sandbox test scenarios (must pass for Gate G3)

Write each as an automated test where possible. Groups:
1. **Collections (15):** success; wrong PIN; user cancels; timeout; insufficient funds; duplicate webhook; webhook before/after timeout; invalid signature; amount mismatch; unknown reference; payer number invalid; very small/large amounts; concurrent payments to one user; provider down.
2. **Withdrawals (15):** success; failure + reversal; timeout then late success; duplicate request (idempotency); over limit; under hold; unverified KYC; changed payout number (hold); concurrent withdrawals racing the balance; provider down; partial outage; fee calculation; frozen account; daily count limit; reversal of a reversal attempt blocked.
3. **Ledger (10):** every transaction sums to zero; balance = sum of entries; no negative wallet balance; fee account totals; reversal correctness; rounding never happens (integers only); property-based random sequences; audit log written; adjustments need reason + admin; history immutable.
4. **Reconciliation (5):** perfect match; missing on our side; missing on theirs; amount mismatch; alert + payout pause triggers.
5. **Security (5):** user A can't see user B; rate limits on `/pay`; CSRF blocked; XSS escaped; admin requires 2FA.

### 19.5 Incident runbook (short version)

1. **Detect:** alert, user report or reconciliation mismatch.
2. **Contain:** if money or data is at risk → **pause payouts** (feature flag) and/or put the site in maintenance mode.
3. **Assess:** what happened, how many users, how much money, is personal data involved?
4. **Notify:** partner (as the contract requires); affected users (plain language); **ODPC within 72 hours if personal data was breached** ⚖️; lawyer.
5. **Fix:** correct with ledger reversal/adjustment entries (never edits); patch the cause.
6. **Learn:** write a short post-mortem in `docs/runbooks/`; add a test so it can't happen again.

**Complaints and refunds (Phase 4+):** acknowledge within 24 hours; resolve or escalate within 5 working days; keep a complaints log; every refund is a ledger entry with a reason.

### 19.6 Motto and principles

> *"Build the smallest thing that proves the biggest assumption."*

1. Users first: talk to them every week.
2. Never hold user money ourselves (Golden Rule).
3. Never skip a Gate.
4. Integers for money. Ledger for truth. Reconcile daily.
5. Lawyer before signature. Partner before real money.
6. Rest one day a week; this is a marathon.

### 19.7 Useful links (check that they are still current)

| What | Where |
|---|---|
| Safaricom Daraja developer portal | developer.safaricom.co.ke |
| Company registration (eCitizen BRS) | brs.go.ke / ecitizen.go.ke |
| KRA iTax | itax.kra.go.ke |
| Data Protection Commissioner | odpc.go.ke |
| Trademarks (KIPI) | kipi.go.ke |
| Central Bank of Kenya: payment providers and DCP directories | centralbank.go.ke |
| Africa's Talking (SMS) | africastalking.com |
| FastAPI docs | fastapi.tiangolo.com |

---

*End of the Hela Hop Master Plan v1.2. Update the version and Change History (0.5) whenever you change it.*

