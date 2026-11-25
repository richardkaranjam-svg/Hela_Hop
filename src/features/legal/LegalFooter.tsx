import Link from "next/link";

import { translations, type Language } from "@/lib/i18n";

/**
 * Privacy + Terms links (Task 1.9B). No hooks or server-only imports, so it
 * works inside both server and client components.
 */
export function LegalFooter({
  lang = "en",
  className = "",
}: {
  lang?: Language;
  className?: string;
}) {
  const t = translations[lang] || translations.en;
  const linkClass =
    "inline-flex min-h-[44px] items-center px-3 font-semibold text-slate-500 underline underline-offset-2 hover:text-emerald-700";

  return (
    <nav
      aria-label="Legal"
      className={`flex flex-wrap items-center justify-center text-[11px] ${className}`}
    >
      <Link href="/privacy" className={linkClass}>
        {t.privacy}
      </Link>
      <span aria-hidden="true" className="text-slate-300">
        &bull;
      </span>
      <Link href="/terms" className={linkClass}>
        {t.terms}
      </Link>
    </nav>
  );
}
