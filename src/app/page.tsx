import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-slate-50 text-slate-900">
      {/* Top Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
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
              className="flex min-h-[40px] items-center rounded-xl px-4 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="flex min-h-[40px] items-center rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white shadow-xs transition-colors hover:bg-emerald-700"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          Kenya&apos;s Independent Lipa na M-PESA Hub
        </div>

        <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
          Receive M-PESA from <br className="hidden sm:inline" />
          <span className="text-emerald-600">Anyone, Anywhere.</span>
        </h1>

        <p className="mt-4 max-w-xl text-base text-slate-600 sm:text-lg">
          Shareable payment links, professional invoices, and instant M-PESA
          receipts for micro-merchants and freelancers. No paybill setup fees.
        </p>

        {/* Primary CTA Buttons */}
        <div className="mt-8 flex w-full max-w-sm flex-col justify-center gap-3 sm:max-w-none sm:flex-row">
          <Link
            href="/dashboard"
            className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-98"
          >
            <span>Open Seller Dashboard</span>
            <span>&rarr;</span>
          </Link>

          <Link
            href="/signup"
            className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 text-sm font-bold text-slate-700 shadow-xs transition-all hover:bg-slate-50 active:scale-98"
          >
            Create Free Account
          </Link>
        </div>

        {/* Quick Portal Navigation Cards */}
        <div className="mt-14 grid w-full grid-cols-1 gap-4 text-left sm:grid-cols-3">
          <Link
            href="/dashboard"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-sm"
          >
            <span className="text-2xl">📊</span>
            <h3 className="mt-2 text-sm font-black text-slate-900">
              Seller Dashboard
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Monitor payments, view incoming claims, track unpaid invoices, and
              export CSV.
            </p>
          </Link>

          <Link
            href="/dashboard/links"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-sm"
          >
            <span className="text-2xl">🔗</span>
            <h3 className="mt-2 text-sm font-black text-slate-900">
              Payment Links
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Customizable URLs with QR codes, 1-tap M-PESA copy, and
              Swahili/English toggle.
            </p>
          </Link>

          <Link
            href="/dashboard/claims"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-sm"
          >
            <span className="text-2xl">📩</span>
            <h3 className="mt-2 text-sm font-black text-slate-900">
              Claims & Receipts
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Review buyer M-PESA SMS codes and issue cryptographically secure
              public receipts.
            </p>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <p>
          Hela Hop Fintech &copy; {new Date().getFullYear()}. Built for Kenya.
        </p>
      </footer>
    </div>
  );
}
