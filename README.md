# Hela Hop 🚀

> **Receive M-PESA from Anyone, Anywhere. No Kenyan Bank Required.**

Hela Hop is a payment bridge built on top of Safaricom's M-PESA network, powered by the Daraja API and IntaSend.

## Tech Stack

| Layer      | Technology                           |
| ---------- | ------------------------------------ |
| Framework  | Next.js 15 (App Router + TypeScript) |
| Styling    | Tailwind CSS v4                      |
| Auth & DB  | Supabase (`@supabase/ssr`)           |
| M-PESA     | Safaricom Daraja API (STK Push)      |
| Card / FX  | IntaSend                             |
| Deployment | Vercel                               |

## Project Structure

```
src/
├── app/                  # Next.js App Router pages & API routes
├── components/           # Shared UI components
├── lib/
│   ├── supabase/         # server.ts + client.ts
│   ├── mpesa/            # daraja.ts (STK Push, OAuth)
│   └── intasend/         # intasend.ts (checkout, payouts)
├── types/                # Shared TypeScript types
└── middleware.ts         # Supabase session refresh
```

## Getting Started

1. **Clone the repo**

   ```bash
   git clone https://github.com/YOUR_USERNAME/hela-hop.git
   cd hela-hop
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env.local
   # Fill in your Supabase, Daraja, and IntaSend credentials
   ```

4. **Run the dev server**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Environment Variables

See [`.env.example`](.env.example) for all required variables.

| Variable                        | Description                             |
| ------------------------------- | --------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Your Supabase project URL               |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key                |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase service role key (server-only) |
| `DARAJA_CONSUMER_KEY`           | Safaricom Daraja consumer key           |
| `DARAJA_CONSUMER_SECRET`        | Safaricom Daraja consumer secret        |
| `DARAJA_SHORTCODE`              | M-PESA business shortcode               |
| `DARAJA_PASSKEY`                | Daraja Lipa Na M-PESA passkey           |
| `INTASEND_PUBLISHABLE_KEY`      | IntaSend publishable key                |
| `INTASEND_SECRET_KEY`           | IntaSend secret key                     |

## Testing

### Unit Tests

Run Vitest unit tests for core utilities:

```bash
npm test
```

### Database Integration Tests (Claims & RLS Flow)

To verify RLS security policies, phone masking, payment claims submission, and seller confirmation:

1. Open your project in the [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to the **SQL Editor** in the left sidebar.
3. Open [`supabase/tests/claims_flow.sql`](supabase/tests/claims_flow.sql) and paste its contents into a new query tab.
4. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`).
5. Confirm all checks pass in the Messages tab (`All claims_flow integration test checks PASSED!`).

The test runs entirely inside a single transaction and finishes with `ROLLBACK`, leaving zero test data in your database.

### Security Hardening Test (Task 1.9)

After running migrations `20261111000001_rate_limits.sql` and `20261111000002_lock_profile_columns.sql`, run [`supabase/tests/security_hardening.sql`](supabase/tests/security_hardening.sql) the same way. It checks the profile column lock-down and the shared rate limiter, and should print `All security_hardening checks PASSED!`. It also ends with `ROLLBACK`.

### Report Abuse Test (Task 1.9B)

After running migration `20261112000001_abuse_reports.sql`, run [`supabase/tests/abuse_reports.sql`](supabase/tests/abuse_reports.sql) the same way. It checks that visitors can report a payment link or invoice only through `submit_abuse_report`, that nobody can read or edit `abuse_reports` from the browser, and that one page cannot be flooded with more than 20 reports a day. It should print `All abuse_reports checks PASSED!` and ends with `ROLLBACK`.

Reports appear in Supabase Dashboard -> Table Editor -> `abuse_reports` (status `open`). There is no in-app admin screen for them until Task 2.5.

### Admin pages

`/admin/*` needs a logged-in user whose email is in `ADMIN_EMAILS` (comma-separated, server-side env var). Everyone else gets a 404.

## License

Private — All rights reserved.
