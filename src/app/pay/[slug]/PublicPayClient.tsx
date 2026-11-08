"use client";

import { useState } from "react";
import Link from "next/link";

import { submitClaimAction } from "@/app/dashboard/claims/actions";
import { setLanguageAction } from "@/app/dashboard/links/actions";
import { translations, type Language } from "@/lib/i18n";

interface PublicPayClientProps {
  initialLang: Language;
  slug: string;
  paymentLinkId: string;
  sellerName: string;
  sellerUsername: string;
  title: string;
  amountMinor: number | null;
  currency: string;
  payoutMethod: {
    type: "till" | "paybill" | "pochi" | "phone";
    number: string;
    account_ref: string | null;
    label: string | null;
  };
  qrDataUrl: string;
  fullUrl: string;
}

export function PublicPayClient({
  initialLang,
  slug,
  paymentLinkId,
  sellerName,
  sellerUsername,
  title,
  amountMinor,
  currency,
  payoutMethod,
  qrDataUrl,
  fullUrl,
}: PublicPayClientProps) {
  const [lang, setLang] = useState<Language>(initialLang);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimSubmitted, setClaimSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Claim Form state
  const [mpesaCode, setMpesaCode] = useState("");
  const [payerName, setPayerName] = useState("");
  const [payerPhone, setPayerPhone] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [claimError, setClaimError] = useState<string | null>(null);

  const t = translations[lang] || translations.en;

  const handleLangToggle = async (newLang: Language) => {
    setLang(newLang);
    try {
      document.cookie = `hela_lang=${newLang}; path=/; max-age=31536000; SameSite=Lax`;
      await setLanguageAction(newLang);
    } catch {
      // client-side cookie set is sufficient
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
      setClaimError(
        "Please enter a valid 10-character M-PESA code (e.g. SDF489K1L2)."
      );
      return;
    }

    let effectiveAmountMinor = amountMinor;
    if (effectiveAmountMinor === null) {
      const parsed = parseFloat(customAmount);
      if (isNaN(parsed) || parsed <= 0) {
        setClaimError("Please enter the amount you paid.");
        return;
      }
      effectiveAmountMinor = Math.round(parsed * 100);
    }

    setClaimError(null);
    setIsSubmitting(true);
    try {
      const res = await submitClaimAction({
        paymentLinkId,
        payerName,
        payerPhone,
        mpesaCode: cleanCode,
        amountMinor: effectiveAmountMinor,
      });

      if (res.success) {
        setClaimSubmitted(true);
      } else {
        setClaimError(
          res.errors?.mpesa_code ||
            res.errors?.amount ||
            res.errors?.payer_name ||
            res.errors?.payer_phone ||
            res.errors?.general ||
            res.message ||
            "Failed to submit claim."
        );
      }
    } catch {
      setClaimError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedAmount =
    amountMinor !== null
      ? `${currency} ${(amountMinor / 100).toLocaleString()}`
      : t.flexibleAmount;

  const payoutTypeBadge =
    payoutMethod.type === "till"
      ? "M-PESA TILL"
      : payoutMethod.type === "paybill"
        ? "PAYBILL"
        : payoutMethod.type === "pochi"
          ? "POCHI LA BIASHARA"
          : "SEND MONEY";

  const payoutHeader =
    payoutMethod.type === "till"
      ? t.tillHeader
      : payoutMethod.type === "paybill"
        ? t.paybillHeader
        : payoutMethod.type === "pochi"
          ? t.pochiHeader
          : t.phoneHeader;

  // Instructions builder
  const steps = t.steps[payoutMethod.type] || t.steps.till;

  return (
    <div className="flex min-h-screen flex-col justify-between bg-slate-50 text-slate-900">
      {/* Top Bar with Bilingual Toggle (Min 44px tap area) */}
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

          {/* Bilingual Toggle Pill (EN / SW) */}
          <div className="inline-flex rounded-full border border-slate-200 bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => handleLangToggle("en")}
              aria-label="Switch to English"
              className={`min-h-[44px] min-w-[44px] rounded-full px-2.5 text-xs font-bold transition-all ${
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
              aria-label="Badilisha kwa Kiswahili"
              className={`min-h-[44px] min-w-[44px] rounded-full px-2.5 text-xs font-bold transition-all ${
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

      {/* Main Public Payment Container */}
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 py-5">
        {/* Seller Info Header */}
        <div className="pt-2 text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full border-2 border-emerald-300 bg-emerald-100 text-2xl font-black text-emerald-800 shadow-xs">
            {sellerName ? sellerName.charAt(0).toUpperCase() : "S"}
          </div>
          <h1 className="text-xl leading-snug font-black tracking-tight text-slate-900">
            {sellerName}
          </h1>
          <p className="mt-0.5 text-xs font-medium text-slate-500">
            @{sellerUsername} &bull; Nairobi, Kenya
          </p>
        </div>

        {/* Mandatory Seller Disclaimer (Master Plan D9 & D11: Never call seller 'verified') */}
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/90 p-3 text-xs leading-snug text-amber-900">
          <span className="shrink-0 text-base select-none" aria-hidden="true">
            ⚠️
          </span>
          <p className="font-medium">{t.sellerDisclaimer}</p>
        </div>

        {/* Order / Item & Amount Card */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
              {t.forItem}
            </span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700">
              {payoutTypeBadge}
            </span>
          </div>

          <h2 className="text-base leading-snug font-bold text-slate-900">
            {title}
          </h2>

          <div className="mt-2 text-2xl font-black tracking-tight text-emerald-700">
            {formattedAmount}
          </div>
        </div>

        {/* BIG M-PESA NUMBER BOX WITH 1-TAP COPY */}
        <div className="rounded-2xl bg-slate-900 p-5 text-center text-white shadow-md">
          <span className="text-[10.5px] font-extrabold tracking-widest text-slate-400 uppercase">
            {payoutHeader}
          </span>

          {/* Huge Monospace Number */}
          <div className="my-2 font-mono text-3xl font-black tracking-widest text-emerald-400 select-all sm:text-4xl">
            {payoutMethod.number}
          </div>

          {payoutMethod.label && (
            <p className="mb-3 text-xs font-medium text-slate-300">
              {t.storeName}:{" "}
              <strong className="text-white">{payoutMethod.label}</strong>
            </p>
          )}

          {/* 1-Tap Copy Number Button (Min 52px high) */}
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

          {/* Paybill Account Reference Copy Button (if applicable) */}
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
                onClick={() => handleCopy(payoutMethod.account_ref!, "account")}
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

        {/* Step-by-Step Payment Instructions */}
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
                {formattedAmount}
              </strong>
            </li>
            <li>{payoutMethod.type === "paybill" ? steps[5] : steps[4]}</li>
          </ol>
        </div>

        {/* "I've Paid — Enter Code" Action Button (Min 50px high) */}
        <button
          type="button"
          onClick={() => setIsClaimModalOpen(true)}
          className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-black text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.99]"
        >
          <span aria-hidden="true">✅</span>
          <span>{t.ivePaidBtn}</span>
        </button>

        {/* QR Code Section (Downloadable QR Code, Requirement 4) */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 text-center shadow-xs">
          <div className="mb-2 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700">
            <span>📷</span>
            <span>{t.qrCodeTitle}</span>
          </div>

          <div className="my-2 inline-block rounded-xl border border-slate-200 bg-slate-50 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrDataUrl}
              alt={`QR Code for ${title}`}
              className="mx-auto h-36 w-36"
            />
          </div>

          <div className="mt-2">
            <a
              href={`/api/qr?text=${encodeURIComponent(
                fullUrl
              )}&download=true&filename=helahop-${slug}`}
              download
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100"
            >
              <span>💾</span>
              <span>{t.downloadQr}</span>
            </a>
          </div>
        </div>

        {/* Footer Brand CTA (Requirement 3: "Get your own Hela Hop link" CTA) */}
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

      {/* Claim Form Modal (Task 1.5 prep / Claim Flow) */}
      {isClaimModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
        >
          <div className="animate-in fade-in zoom-in-95 w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-xl duration-150">
            {claimSubmitted ? (
              <div className="py-4 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-xl font-bold text-emerald-600">
                  ✓
                </div>
                <div className="mb-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black tracking-wider text-amber-800 uppercase">
                  CLAIM SENT
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {t.claimSent}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Your code{" "}
                  <strong className="font-mono">
                    {mpesaCode.toUpperCase()}
                  </strong>{" "}
                  has been submitted. The seller will check their M-PESA SMS to
                  confirm your payment.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsClaimModalOpen(false);
                    setClaimSubmitted(false);
                    setMpesaCode("");
                  }}
                  className="mt-6 min-h-[46px] w-full rounded-xl bg-emerald-600 text-xs font-bold text-white transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">
                    Submit Payment Claim
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsClaimModalOpen(false)}
                    aria-label="Close"
                    className="flex min-h-[44px] min-w-[44px] items-center justify-center text-lg text-slate-400 hover:text-slate-700"
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
                      onChange={(e) =>
                        setMpesaCode(e.target.value.toUpperCase())
                      }
                      className="min-h-[48px] w-full rounded-xl border border-slate-300 px-3.5 py-2 font-mono text-base font-bold uppercase outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                    {claimError && (
                      <p className="mt-1 text-xs font-medium text-red-600">
                        {claimError}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="payer-name"
                      className="mb-1 block text-xs font-bold text-slate-700"
                    >
                      Your Name
                    </label>
                    <input
                      id="payer-name"
                      type="text"
                      required
                      placeholder="e.g. Kevin Ochieng"
                      value={payerName}
                      onChange={(e) => setPayerName(e.target.value)}
                      className="min-h-[48px] w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="payer-phone"
                      className="mb-1 block text-xs font-bold text-slate-700"
                    >
                      Your M-PESA Phone Number
                    </label>
                    <input
                      id="payer-phone"
                      type="tel"
                      required
                      placeholder="07XX XXX XXX"
                      value={payerPhone}
                      onChange={(e) => setPayerPhone(e.target.value)}
                      className="min-h-[48px] w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  {amountMinor === null && (
                    <div>
                      <label
                        htmlFor="claim-amount"
                        className="mb-1 block text-xs font-bold text-slate-700"
                      >
                        Amount Paid (KES)
                      </label>
                      <input
                        id="claim-amount"
                        type="number"
                        min="1"
                        step="any"
                        required
                        placeholder="e.g. 1500"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className="min-h-[48px] w-full rounded-xl border border-slate-300 px-3.5 py-2 font-mono text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="min-h-[48px] w-full rounded-xl bg-emerald-600 text-xs font-bold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {isSubmitting
                        ? "Sending Claim..."
                        : "Send Payment Claim \u2192"}
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
            )}
          </div>
        </div>
      )}
    </div>
  );
}
