"use client";

import { useId, useState } from "react";

import { reportAbuseAction } from "@/app/actions/report-abuse";
import { translations, type Language } from "@/lib/i18n";

interface ReportAbuseProps {
  lang: Language;
  type: "link" | "invoice";
  /** Payment link slug or invoice code (never an id). */
  target: string;
}

/**
 * Small "Report this page" link that expands into a form (Task 1.9B).
 * Used at the bottom of /pay/[slug] and /i/[code].
 */
export function ReportAbuse({ lang, type, target }: ReportAbuseProps) {
  const t = (translations[lang] || translations.en).report;
  const formId = useId();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [reason, setReason] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<{
    field: "reason" | "name" | "general";
    message: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = reason.trim();
    if (trimmed.length < 10 || trimmed.length > 500) {
      setError({ field: "reason", message: t.errors.invalid_reason });
      return;
    }

    setSending(true);
    try {
      const res = await reportAbuseAction({ type, target, name, reason });
      if (res.ok) {
        setDone(true);
      } else {
        setError({ field: res.field, message: t.errors[res.error] });
      }
    } catch {
      setError({ field: "general", message: t.errors.general });
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <p
        role="status"
        className="mx-auto mb-6 max-w-sm rounded-xl border border-slate-200 bg-white p-3 text-center text-xs text-slate-600"
      >
        {t.thanks}
      </p>
    );
  }

  if (!open) {
    return (
      <div className="mb-4 text-center">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded="false"
          aria-controls={formId}
          className="inline-flex min-h-[44px] items-center px-3 text-[11px] font-semibold text-slate-500 underline underline-offset-2 hover:text-red-600"
        >
          {t.link}
        </button>
      </div>
    );
  }

  return (
    <form
      id={formId}
      onSubmit={handleSubmit}
      noValidate
      className="mx-auto mb-6 w-full max-w-sm space-y-3 rounded-2xl border border-slate-200 bg-white p-4 text-left"
    >
      <h2 className="text-sm font-bold text-slate-900">{t.title}</h2>
      <p className="text-xs leading-snug text-slate-600">{t.intro}</p>

      <div>
        <label
          htmlFor={`${formId}-name`}
          className="block text-xs font-semibold text-slate-700"
        >
          {t.nameLabel}
        </label>
        <input
          id={`${formId}-name`}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          autoComplete="name"
          aria-invalid={error?.field === "name"}
          className="mt-1 block min-h-[44px] w-full rounded-xl border border-slate-300 px-3 text-base text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none"
        />
        {error?.field === "name" && (
          <p className="mt-1 text-xs text-red-600">{error.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor={`${formId}-reason`}
          className="block text-xs font-semibold text-slate-700"
        >
          {t.reasonLabel}
        </label>
        <textarea
          id={`${formId}-reason`}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={500}
          rows={4}
          required
          aria-invalid={error?.field === "reason"}
          aria-describedby={`${formId}-hint`}
          className="mt-1 block w-full rounded-xl border border-slate-300 p-3 text-base text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none"
        />
        <p id={`${formId}-hint`} className="mt-1 text-[11px] text-slate-500">
          {t.reasonHint} ({reason.trim().length}/500)
        </p>
        {error?.field === "reason" && (
          <p className="mt-1 text-xs text-red-600">{error.message}</p>
        )}
      </div>

      {error?.field === "general" && (
        <p role="alert" className="text-xs text-red-600">
          {error.message}
        </p>
      )}

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          className="min-h-[44px] rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50"
        >
          {t.cancel}
        </button>
        <button
          type="submit"
          disabled={sending}
          className="min-h-[44px] rounded-xl bg-red-600 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60"
        >
          {sending ? t.sending : t.submit}
        </button>
      </div>
    </form>
  );
}
