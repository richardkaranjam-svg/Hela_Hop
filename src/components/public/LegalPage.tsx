import Link from "next/link";

import { LegalFooter } from "@/components/public/LegalFooter";

/**
 * Shared shell for /privacy and /terms (Task 1.9B).
 * Plain server component: no client JS, so the pages stay tiny.
 */
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-4">
          <Link
            href="/"
            className="flex min-h-[44px] items-center gap-2.5 rounded-xl"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-lg font-black text-white">
              H
            </span>
            <span className="text-lg font-black tracking-tight">Hela Hop</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <p
          role="note"
          className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm font-bold text-amber-900"
        >
          DRAFT, to be reviewed by a lawyer. This text is a placeholder and is
          not yet legally binding.
        </p>

        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
          {title}
        </h1>
        <p className="mt-1 text-xs text-slate-500">Last updated: {updated}</p>

        <div className="legal-prose mt-6 space-y-6 text-sm leading-relaxed text-slate-700 [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-slate-900 [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1">
          {children}
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} Hela Hop &bull; Nairobi, Kenya</p>
        <LegalFooter className="mt-1" />
      </footer>
    </div>
  );
}
