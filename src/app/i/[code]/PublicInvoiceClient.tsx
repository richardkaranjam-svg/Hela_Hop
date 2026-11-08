"use client";

import { useState } from "react";
import Link from "next/link";

import { submitInvoiceClaimAction } from "@/app/dashboard/invoices/actions";
import { setLanguageAction } from "@/app/dashboard/links/actions";
import { maskPhoneNumber } from "@/lib/formatters";
import { translations, type Language } from "@/lib/i18n";
import type { InvoiceItem, InvoiceStatus } from "@/types/database";

interface PublicInvoiceClientProps {
  initialLang: Language;
  code: string;
  sellerName: string;
  sellerUsername: string;
  customerName: string;
  customerPhone: string;
  items: InvoiceItem[];
  totalMinor: number;
  currency: string;
  dueDate: string | null;
  status: InvoiceStatus;
  payoutMethod: {
    type: "till" | "paybill" | "pochi" | "phone";
    number: string;
    account_ref: string | null;
    label: string | null;
  };
  fullUrl: string;
}

export function PublicInvoiceClient({
  initialLang,
  code,
  sellerName,
  customerName,
  customerPhone,
  items,
  totalMinor,
  currency,
  dueDate,
  status: initialStatus,
  payoutMethod,
  fullUrl,
}: PublicInvoiceClientProps) {
  const [lang, setLang] = useState<Language>(initialLang);
  const [status, setStatus] = useState<InvoiceStatus>(initialStatus);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [mpesaCode, setMpesaCode] = useState("");
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  const t = translations[lang] || translations.en;

  const handleLangToggle = async (newLang: Language) => {
    setLang(newLang);
    try {
      document.cookie = `hela_lang=${newLang}; path=/; max-age=31536000; SameSite=Lax`;
      await setLanguageAction(newLang);
    } catch {
      // client-side cookie is set
    }
  };

  const handleCopy = async (text: string, identifier: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        const input = document.createElement("input");
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      setCopiedType(identifier);
      setTimeout(() => setCopiedType(null), 2500);
    } catch {
      alert(`Number: ${text}`);
    }
  };

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = mpesaCode.trim().toUpperCase();
    if (!/^[A-Z0-9]{10}$/.test(cleanCode)) {
      setClaimError("Please enter a valid 10-character M-PESA code.");
      return;
    }
    setClaimError(null);
    setIsSubmittingClaim(true);

    const res = await submitInvoiceClaimAction(code, cleanCode);
    setIsSubmittingClaim(false);

    if (res.success) {
      setStatus("claimed");
      setIsClaimModalOpen(false);
    } else {
      setClaimError(res.message || "Failed to submit claim.");
    }
  };

  const formattedTotal = `${currency} ${(totalMinor / 100).toLocaleString()}`;
  const maskedPhone = maskPhoneNumber(customerPhone);

  const payoutHeader =
    payoutMethod.type === "till"
      ? t.tillHeader
      : payoutMethod.type === "paybill"
        ? t.paybillHeader
        : payoutMethod.type === "pochi"
          ? t.pochiHeader
          : t.phoneHeader;

  const steps = t.steps[payoutMethod.type] || t.steps.till;

  // WhatsApp sharing link
  const waShareUrl = `https://wa.me/?text=${encodeURIComponent(
    `Jambo ${customerName}, here is your invoice #${code} for ${formattedTotal} from ${sellerName}: ${fullUrl}`
  )}`;

  return (
    <div className="flex min-h-screen flex-col justify-between bg-slate-50 text-slate-900">
      {/* Top Bar with Brand & Bilingual Toggle */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg p-1 focus:outline-none"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-base font-extrabold text-white shadow-sm">
              H
            </span>
            <span className="text-base font-black tracking-tight text-slate-900">
              Hela Hop
            </span>
          </Link>

          {/* Bilingual Toggle Pill */}
          <div className="inline-flex rounded-full border border-slate-200 bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => handleLangToggle("en")}
              className={`min-h-[36px] min-w-[38px] rounded-full px-2.5 text-xs font-bold transition-all ${
                lang === "en"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => handleLangToggle("sw")}
              className={`min-h-[36px] min-w-[38px] rounded-full px-2.5 text-xs font-bold transition-all ${
                lang === "sw"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              SW
            </button>
          </div>
        </div>
      </header>

      {/* Main Invoice Card Container */}
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 py-5">
        {/* Invoice Header Card */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          {/* PAID Stamp Overlay (if paid) */}
          {status === "paid" && (
            <div className="absolute top-4 right-4 rotate-[-6deg] rounded-lg border-2 border-emerald-600 bg-emerald-50/80 px-2.5 py-1 text-xs font-black tracking-wider text-emerald-700 uppercase shadow-xs">
              ✓ {t.paidStamp}
            </div>
          )}

          <div className="mb-2 flex items-start justify-between gap-2">
            <div>
              <span className="block text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
                {t.invoiceTag}
              </span>
              <h1 className="font-mono text-lg font-black tracking-tight text-slate-900">
                #{code}
              </h1>
            </div>

            {/* Status Pill (if not paid) */}
            {status === "unpaid" && (
              <span className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-[10px] font-extrabold text-amber-800 uppercase">
                {dueDate ? `${t.dueOn} ${dueDate}` : t.dueToday}
              </span>
            )}

            {status === "claimed" && (
              <span className="rounded-full border border-blue-300 bg-blue-50 px-2.5 py-1 text-[10px] font-extrabold text-blue-800 uppercase">
                CLAIMED
              </span>
            )}

            {status === "cancelled" && (
              <span className="rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold text-slate-600 uppercase">
                CANCELLED
              </span>
            )}
          </div>

          {/* Seller & Customer Info */}
          <div className="mt-2 space-y-1 text-xs">
            <p className="text-slate-600">
              <span className="font-medium text-slate-400">
                {t.invoiceFrom}:
              </span>{" "}
              <strong className="text-slate-900">{sellerName}</strong>
            </p>
            <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50 p-2.5 text-xs">
              <span className="font-medium text-slate-500">{t.billedTo}:</span>
              <strong className="text-slate-900">
                {customerName} ({maskedPhone})
              </strong>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="mt-4 border-t border-slate-100 pt-3">
            <div className="grid grid-cols-12 border-b border-slate-100 pb-1.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              <span className="col-span-7">{t.itemDescription}</span>
              <span className="col-span-2 text-center">{t.itemQty}</span>
              <span className="col-span-3 text-right">{t.itemTotal}</span>
            </div>

            <div className="divide-y divide-slate-100 py-1 text-xs">
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 items-center py-2">
                  <span className="col-span-7 truncate pr-2 font-medium text-slate-800">
                    {item.description}
                  </span>
                  <span className="col-span-2 text-center font-mono text-slate-500">
                    {item.quantity}
                  </span>
                  <span className="col-span-3 text-right font-mono font-bold text-slate-900">
                    {(
                      (item.quantity * item.unit_price_minor) /
                      100
                    ).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Grand Total */}
            <div className="mt-1 flex items-center justify-between border-t-2 border-slate-200 pt-3">
              <span className="text-sm font-black tracking-tight text-slate-900 uppercase">
                {t.grandTotal}
              </span>
              <span className="font-mono text-2xl font-black text-emerald-700">
                {formattedTotal}
              </span>
            </div>
          </div>
        </div>

        {/* Claim Notice Banner (if claimed) */}
        {status === "claimed" && (
          <div className="space-y-1 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-xs leading-relaxed text-blue-900">
            <div className="flex items-center gap-1.5 font-bold text-blue-950">
              <span className="h-2 w-2 animate-pulse rounded-full bg-blue-600"></span>
              <span>{t.claimedStatus}</span>
            </div>
            <p className="text-blue-800/90">{t.claimNotice}</p>
          </div>
        )}

        {/* Mandatory Seller Disclaimer (D9 & D11) */}
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/90 p-3 text-xs leading-snug text-amber-900">
          <span className="shrink-0 text-base" aria-hidden="true">
            ⚠️
          </span>
          <p className="font-medium">{t.sellerDisclaimer}</p>
        </div>

        {/* BIG M-PESA NUMBER BOX WITH 1-TAP COPY */}
        {status !== "paid" && (
          <div className="rounded-2xl bg-slate-900 p-5 text-center text-white shadow-md">
            <span className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">
              {payoutHeader}
            </span>

            {/* Monospace Number */}
            <div className="my-2 font-mono text-3xl font-black tracking-widest text-emerald-400 select-all sm:text-4xl">
              {payoutMethod.number}
            </div>

            {payoutMethod.label && (
              <p className="mb-3 text-xs font-medium text-slate-300">
                {t.storeName}:{" "}
                <strong className="text-white">{payoutMethod.label}</strong>
              </p>
            )}

            {/* Copy Button */}
            <button
              type="button"
              onClick={() => handleCopy(payoutMethod.number, "main")}
              className={`flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl text-sm font-black transition-all active:scale-[0.99] ${
                copiedType === "main"
                  ? "bg-emerald-500 text-slate-950"
                  : "bg-emerald-600 text-white hover:bg-emerald-500"
              }`}
            >
              <span>{copiedType === "main" ? "✅" : "📋"}</span>
              <span>
                {copiedType === "main"
                  ? t.copied
                  : `${t.copyNumber} (${payoutMethod.number})`}
              </span>
            </button>

            {/* Paybill Account Ref Copy Button */}
            {payoutMethod.type === "paybill" && payoutMethod.account_ref && (
              <div className="mt-4 border-t border-slate-800 pt-3">
                <div className="mb-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  {t.accountNumber}
                </div>
                <div className="mb-2 font-mono text-xl font-bold text-white">
                  {payoutMethod.account_ref}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(payoutMethod.account_ref!, "account")
                  }
                  className={`flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl text-xs font-bold transition-all ${
                    copiedType === "account"
                      ? "bg-emerald-500 text-slate-950"
                      : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                  }`}
                >
                  <span>{copiedType === "account" ? "✅" : "📋"}</span>
                  <span>
                    {copiedType === "account"
                      ? t.copied
                      : `${t.copyAccount}: ${payoutMethod.account_ref}`}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step-by-Step Payment Instructions */}
        {status !== "paid" && (
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold text-slate-900">
              <span aria-hidden="true">📱</span>
              <span>{t.howToPay}</span>
            </div>

            <ol className="list-decimal space-y-2 pl-5 text-xs leading-relaxed text-slate-600">
              <li>{steps[0]}</li>
              <li>{steps[1]}</li>
              <li>
                {steps[2]}
                <strong className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono font-bold text-slate-900">
                  {payoutMethod.number}
                </strong>
              </li>
              {payoutMethod.type === "paybill" && payoutMethod.account_ref && (
                <li>
                  {steps[3]}
                  <strong className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono font-bold text-slate-900">
                    {payoutMethod.account_ref}
                  </strong>
                </li>
              )}
              <li>
                {payoutMethod.type === "paybill" ? steps[4] : steps[3]}
                <strong className="font-bold text-slate-900">
                  {formattedTotal}
                </strong>
              </li>
              <li>{payoutMethod.type === "paybill" ? steps[5] : steps[4]}</li>
            </ol>
          </div>
        )}

        {/* Action: I've Paid — Enter Code (if unpaid) */}
        {status === "unpaid" && (
          <button
            type="button"
            onClick={() => setIsClaimModalOpen(true)}
            className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-black text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.99]"
          >
            <span>✅</span>
            <span>{t.ivePaidBtn}</span>
          </button>
        )}

        {/* Share buttons (Requirement 4: Share via WhatsApp & Copy Link) */}
        <div className="grid grid-cols-2 gap-2.5">
          <a
            href={waShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[46px] items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-xs font-bold text-emerald-800 transition-colors hover:bg-emerald-100"
          >
            <span>💬</span>
            <span>{t.shareWhatsApp}</span>
          </a>

          <button
            type="button"
            onClick={() => handleCopy(fullUrl, "link")}
            className="flex min-h-[46px] items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <span>{copiedType === "link" ? "✓" : "📋"}</span>
            <span>{copiedType === "link" ? t.copied : t.copyInvoiceLink}</span>
          </button>
        </div>

        {/* Footer CTA */}
        <div className="mt-2 mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-center">
          <p className="text-xs font-bold text-emerald-950">{t.footerCta}</p>
          <p className="mt-0.5 text-[11px] text-emerald-700">{t.footerSub}</p>
          <Link
            href="/signup"
            className="mt-3 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-emerald-600 px-5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-emerald-700"
          >
            Create My Free Link &rarr;
          </Link>
        </div>
      </main>

      {/* Claim Form Modal */}
      {isClaimModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
        >
          <div className="animate-in fade-in zoom-in-95 w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-xl duration-150">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Submit Payment Confirmation
              </h3>
              <button
                type="button"
                onClick={() => setIsClaimModalOpen(false)}
                className="flex min-h-[36px] min-w-[36px] items-center justify-center text-lg text-slate-400 hover:text-slate-700"
              >
                &times;
              </button>
            </div>

            <p className="mb-4 text-xs leading-relaxed text-slate-500">
              {t.claimNotice}
            </p>

            <form onSubmit={handleClaimSubmit} className="space-y-3.5">
              <div>
                <label
                  htmlFor="claim-code"
                  className="mb-1 block text-xs font-bold text-slate-700"
                >
                  M-PESA Confirmation Code
                </label>
                <input
                  id="claim-code"
                  type="text"
                  maxLength={10}
                  required
                  placeholder="e.g. SDF489K1L2"
                  value={mpesaCode}
                  onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
                  className="min-h-[48px] w-full rounded-xl border border-slate-300 px-3.5 py-2 font-mono text-base font-bold uppercase outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
                {claimError && (
                  <p className="mt-1 text-xs font-medium text-red-600">
                    {claimError}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingClaim}
                  className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-xs font-bold text-white transition-all hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-60"
                >
                  {isSubmittingClaim ? (
                    <span>Submitting Claim...</span>
                  ) : (
                    <span>Send Payment Claim &rarr;</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsClaimModalOpen(false)}
                  className="min-h-[44px] w-full rounded-xl border border-slate-200 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
