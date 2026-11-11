import Link from "next/link";

import { LegalFooter } from "@/components/public/LegalFooter";

export const metadata = {
  title: "Page not found | Hela Hop",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-10 text-center text-slate-900">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-2xl font-black text-white">
        H
      </span>
      <h1 className="mt-5 text-2xl font-black tracking-tight">
        We can&apos;t find this page
      </h1>
      <p className="mt-2 max-w-sm text-sm text-slate-600">
        The link may be wrong, or the seller may have removed this payment link
        or invoice. Please check the link with the person who sent it.
      </p>
      <p className="mt-1 max-w-sm text-sm text-slate-600">
        Hatuwezi kupata ukurasa huu. Tafadhali hakikisha linki na aliyekutumia.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-emerald-600 px-6 text-sm font-bold text-white hover:bg-emerald-700"
      >
        Go to Hela Hop home
      </Link>
      <LegalFooter className="mt-8" />
    </div>
  );
}
