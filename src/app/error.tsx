"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Branded error screen (Task 1.9B). Shown when a page throws. Next.js hides
 * the real error message in production; we only show the digest so support
 * can find the server log.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-10 text-center text-slate-900">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-2xl font-black text-white">
        H
      </span>
      <h1 className="mt-5 text-2xl font-black tracking-tight">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-sm text-sm text-slate-600">
        This was our fault, not yours. Please try again. Hela Hop never holds
        money, so any M-PESA payment you already made went straight to the
        seller.
      </p>
      <p className="mt-1 max-w-sm text-sm text-slate-600">
        Kuna hitilafu. Tafadhali jaribu tena.
      </p>

      <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
        <button
          type="button"
          onClick={() => reset()}
          className="min-h-[44px] rounded-xl bg-emerald-600 px-6 text-sm font-bold text-white hover:bg-emerald-700"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          Go to Hela Hop home
        </Link>
      </div>

      {error.digest && (
        <p className="mt-6 text-[11px] text-slate-400">
          Error reference: {error.digest}
        </p>
      )}
    </div>
  );
}
