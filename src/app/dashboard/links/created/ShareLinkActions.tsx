"use client";

import { useState } from "react";

/** Copy / WhatsApp / open buttons for the "link created" page. */
export function ShareLinkActions({
  fullUrl,
  title,
}: {
  fullUrl: string;
  title: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(fullUrl);
    } catch {
      // Older phones: fall back to a temporary text box.
      const el = document.createElement("textarea");
      el.value = fullUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      el.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const waText = `Pay for "${title}" via M-PESA here: ${fullUrl}`;

  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
      <button
        type="button"
        onClick={copy}
        className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white hover:bg-emerald-700"
      >
        <span aria-hidden="true">{copied ? "✓" : "📋"}</span>
        <span aria-live="polite">{copied ? "Link copied!" : "Copy link"}</span>
      </button>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(waText)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-emerald-600 bg-white px-4 text-sm font-bold text-emerald-700 hover:bg-emerald-50"
      >
        <span aria-hidden="true">💬</span>
        <span>Share on WhatsApp</span>
      </a>
      <a
        href={fullUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50"
      >
        <span aria-hidden="true">👀</span>
        <span>See what customers see</span>
      </a>
    </div>
  );
}
