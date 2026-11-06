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

## License

Private — All rights reserved.
