import Link from "next/link";

import { LegalFooter } from "@/components/public/LegalFooter";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-slate-50 text-slate-900">
      {/* Top Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex min-h-[44px] items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-lg font-black text-white shadow-sm shadow-emerald-600/30">
              H
            </span>
            <span className="text-lg font-black tracking-tight text-slate-900">
              Hela Hop
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="flex min-h-[44px] items-center rounded-xl px-4 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="flex min-h-[44px] items-center rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white shadow-xs transition-colors hover:bg-emerald-700"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-12 text-center sm:px-6 sm:py-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          Built for Kenyan Sellers &bull; Phase 1 Beta
        </div>

        <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">
          Get your M-PESA payment link <br className="hidden sm:inline" />
          <span className="text-emerald-600">in 60 seconds.</span>
        </h1>

        <p className="mt-4 max-w-xl text-base text-slate-600 sm:text-lg">
          Share one clean payment page or invoice instead of typing Till or
          Paybill numbers in WhatsApp chats. Buyers pay directly to your own
          M-PESA number and submit their code for you to confirm.
        </p>

        <p className="mt-2 text-xs font-medium text-slate-500">
          Works with your existing Till, Paybill, Pochi, or phone &bull; Hela
          Hop never holds your money
        </p>

        {/* Primary CTA Buttons */}
        <div className="mt-8 flex w-full max-w-sm flex-col justify-center gap-3 sm:max-w-none sm:flex-row">
          <Link
            href="/overview"
            className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-98"
          >
            <span>Explore App Overview (No Account)</span>
            <span>&rarr;</span>
          </Link>

          <Link
            href="/signup"
            className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 text-sm font-bold text-slate-700 shadow-xs transition-all hover:bg-slate-50 active:scale-98"
          >
            Create Free Seller Account
          </Link>
        </div>

        <div className="mt-3">
          <Link
            href="/login"
            className="inline-flex min-h-[44px] items-center px-3 text-xs font-semibold text-slate-600 underline underline-offset-2 hover:text-slate-900"
          >
            Already have a seller account? Log in
          </Link>
        </div>

        {/* Interactive Walkthrough Cards (No login required) */}
        <div className="mt-12 grid w-full grid-cols-1 gap-4 text-left sm:grid-cols-3">
          <Link
            href="/overview?tab=pay"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-emerald-300 hover:shadow-sm"
          >
            <span className="text-2xl">🔗</span>
            <h3 className="mt-2 text-sm font-black text-slate-900">
              1. Shareable Payment Link
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              One link with QR code, 1-tap M-PESA number copy, and
              Swahili/English toggle so buyers stop mistyping numbers.
            </p>
          </Link>

          <Link
            href="/overview?tab=dashboard"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-emerald-300 hover:shadow-sm"
          >
            <span className="text-2xl">📋</span>
            <h3 className="mt-2 text-sm font-black text-slate-900">
              2. Track Claims vs Paid
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Buyers enter their M-PESA SMS code as a claim. You match the SMS
              on your phone and confirm in one tap.
            </p>
          </Link>

          <Link
            href="/overview?tab=invoice"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-emerald-300 hover:shadow-sm"
          >
            <span className="text-2xl">🧾</span>
            <h3 className="mt-2 text-sm font-black text-slate-900">
              3. Invoices &amp; Receipts
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Send itemized invoices and issue seller-confirmed digital receipts
              with masked buyer phone numbers.
            </p>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <p>
          Hela Hop Fintech &copy; {new Date().getFullYear()}. Built for Kenya.
        </p>
        <LegalFooter className="mt-1" />
      </footer>
    </div>
  );
}
