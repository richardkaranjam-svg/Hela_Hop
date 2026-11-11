/**
 * Loading skeletons (Task 1.9B). Pure markup, no client JS.
 * `aria-busy` + a screen-reader label so the wait is announced.
 */

function SrLoading() {
  return <span className="sr-only">Loading…</span>;
}

/** Dashboard list pages: /dashboard/links, /invoices, /claims. */
export function ListPageSkeleton() {
  return (
    <div aria-busy="true" className="animate-pulse space-y-4">
      <SrLoading />
      <div className="flex items-center justify-between gap-3">
        <div className="h-8 w-40 rounded-xl bg-slate-200/80" />
        <div className="h-11 w-28 rounded-xl bg-slate-200/70" />
      </div>
      <div className="h-11 rounded-xl bg-slate-200/50" />
      <div className="space-y-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 rounded-2xl bg-slate-200/60" />
        ))}
      </div>
    </div>
  );
}

/*
 * No skeleton for the public pages (/pay, /i, /r) on purpose: a loading.tsx
 * there makes Next.js stream a 200 before the page can call notFound(), so a
 * wrong or deleted link would answer "200 OK" instead of 404 (checked
 * 10 Nov 2026 with next start). Those pages do one fast database call.
 */
