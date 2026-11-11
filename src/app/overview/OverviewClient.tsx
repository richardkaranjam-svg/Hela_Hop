"use client";

import { useState } from "react";
import Link from "next/link";

import { LegalFooter } from "@/components/public/LegalFooter";
import { translations, type Language } from "@/lib/i18n";

export type OverviewTab = "pay" | "dashboard" | "invoice" | "receipt";

type SampleClaimStatus = "pending" | "confirmed" | "rejected";

type SampleClaim = {
  id: string;
  source: "Payment Link" | "Invoice INV-1042";
  payerName: string;
  maskedPhone: string;
  mpesaCode: string;
  amountKes: number;
  createdAtLabel: string;
  status: SampleClaimStatus;
  receiptToken?: string;
};

type SampleReceipt = {
  token: string;
  payerName: string;
  maskedPhone: string;
  mpesaCode: string;
  amountKes: number;
  confirmedAtLabel: string;
  itemLabel: string;
};

const INITIAL_CLAIMS: SampleClaim[] = [
  {
    id: "clm-sample-1",
    source: "Payment Link",
    payerName: "Brian O.",
    maskedPhone: "0724 *** 914",
    mpesaCode: "TJK84RM1QX",
    amountKes: 1800,
    createdAtLabel: "Just now",
    status: "pending",
  },
  {
    id: "clm-sample-2",
    source: "Payment Link",
    payerName: "Samuel K.",
    maskedPhone: "0712 *** 678",
    mpesaCode: "TJK71AB9CD",
    amountKes: 1250,
    createdAtLabel: "Today, 10:15 AM",
    status: "confirmed",
    receiptToken: "rcpt-sample-8f3k9m",
  },
];

const INITIAL_RECEIPT: SampleReceipt = {
  token: "rcpt-sample-8f3k9m",
  payerName: "Samuel K.",
  maskedPhone: "0712 *** 678",
  mpesaCode: "TJK71AB9CD",
  amountKes: 1250,
  confirmedAtLabel: "Today, 10:18 AM",
  itemLabel: "Thrift Tote + Cardigan",
};

function maskPhoneInput(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 7) {
    return "07XX *** XXX";
  }
  const normalized =
    digits.startsWith("254") && digits.length >= 12
      ? `0${digits.slice(3)}`
      : digits;
  return `${normalized.slice(0, 4)} *** ${normalized.slice(-3)}`;
}

function formatKes(amount: number): string {
  return `KES ${amount.toLocaleString("en-KE")}`;
}

export default function OverviewClient({
  initialTab,
  qrDataUrl,
  samplePayUrl,
}: {
  initialTab: OverviewTab;
  qrDataUrl: string;
  samplePayUrl: string;
}) {
  const [activeTab, setActiveTab] = useState<OverviewTab>(initialTab);
  const [lang, setLang] = useState<Language>("en");
  const [copiedTill, setCopiedTill] = useState(false);
  const [claims, setClaims] = useState<SampleClaim[]>(INITIAL_CLAIMS);
  const [latestReceipt, setLatestReceipt] =
    useState<SampleReceipt>(INITIAL_RECEIPT);
  const [invoiceStatus, setInvoiceStatus] = useState<
    "unpaid" | "claimed" | "paid"
  >("unpaid");

  // Buyer Payment Link interactive claim form state
  const [payerName, setPayerName] = useState("Amina W.");
  const [payerPhone, setPayerPhone] = useState("0712 000 001");
  const [mpesaCode, setMpesaCode] = useState("TJK92PL4MN");
  const [payFormFeedback, setPayFormFeedback] = useState<string | null>(null);
  const [dashboardNotice, setDashboardNotice] = useState<string | null>(null);

  const t = translations[lang];

  const confirmedTotal = claims
    .filter((c) => c.status === "confirmed")
    .reduce((sum, c) => sum + c.amountKes, 0);
  const pendingCount = claims.filter((c) => c.status === "pending").length;

  async function handleCopyTill() {
    try {
      await navigator.clipboard.writeText("5492103");
    } catch {
      // Clipboard API may be restricted in non-HTTPS or sandboxed frames
    }
    setCopiedTill(true);
    setTimeout(() => setCopiedTill(false), 2000);
  }

  function handleBuyerSubmitClaim(e: React.FormEvent) {
    e.preventDefault();
    const cleanedCode = mpesaCode.trim().toUpperCase();
    if (cleanedCode.length < 6) {
      setPayFormFeedback(
        "Enter at least 6 characters for the sample M-PESA code (e.g. TJK92PL4MN)."
      );
      return;
    }

    const newClaim: SampleClaim = {
      id: `clm-demo-${Date.now()}`,
      source: "Payment Link",
      payerName: payerName.trim() || "Walk-in Buyer",
      maskedPhone: maskPhoneInput(payerPhone),
      mpesaCode: cleanedCode,
      amountKes: 1800,
      createdAtLabel: "Just now (sample)",
      status: "pending",
    };

    setClaims((prev) => [newClaim, ...prev]);
    setPayFormFeedback(t.claimSent);
  }

  function handleInvoiceSubmitClaim() {
    if (invoiceStatus !== "unpaid") return;

    const invClaim: SampleClaim = {
      id: "clm-invoice-1042",
      source: "Invoice INV-1042",
      payerName: "Grace M.",
      maskedPhone: "0722 *** 341",
      mpesaCode: "TJK95INV42",
      amountKes: 3200,
      createdAtLabel: "Just now (sample)",
      status: "pending",
    };

    setClaims((prev) => [invClaim, ...prev]);
    setInvoiceStatus("claimed");
    setDashboardNotice(
      "Invoice INV-1042 claim added to Seller Dashboard as pending."
    );
  }

  function handleSellerDecision(
    claimId: string,
    decision: "confirmed" | "rejected"
  ) {
    const target = claims.find((c) => c.id === claimId);
    if (!target || target.status !== "pending") return;

    const token = `rcpt-sample-${claimId.slice(-6)}`;
    setClaims((prev) =>
      prev.map((claim) =>
        claim.id === claimId
          ? {
              ...claim,
              status: decision,
              receiptToken: decision === "confirmed" ? token : undefined,
            }
          : claim
      )
    );

    if (target.source === "Invoice INV-1042") {
      setInvoiceStatus(decision === "confirmed" ? "paid" : "unpaid");
    }

    if (decision === "confirmed") {
      setLatestReceipt({
        token,
        payerName: target.payerName,
        maskedPhone: target.maskedPhone,
        mpesaCode: target.mpesaCode,
        amountKes: target.amountKes,
        confirmedAtLabel: "Just now (seller confirmed)",
        itemLabel:
          target.source === "Invoice INV-1042"
            ? "2x Denim Jackets (INV-1042)"
            : "MTG Thrift Bundle",
      });
      setDashboardNotice(
        `Claim ${target.mpesaCode} confirmed by seller! Sample receipt issued.`
      );
    } else {
      setDashboardNotice(`Claim ${target.mpesaCode} marked rejected.`);
    }
  }

  function handleResetSample() {
    setClaims(INITIAL_CLAIMS);
    setLatestReceipt(INITIAL_RECEIPT);
    setInvoiceStatus("unpaid");
    setPayFormFeedback(null);
    setDashboardNotice(null);
    setPayerName("Amina W.");
    setPayerPhone("0712 000 001");
    setMpesaCode("TJK92PL4MN");
  }

  const tabs: Array<{ id: OverviewTab; label: string }> = [
    { id: "pay", label: "1. Payment Link" },
    { id: "dashboard", label: `2. Seller View (${pendingCount})` },
    { id: "invoice", label: "3. Invoice" },
    { id: "receipt", label: "4. Receipt" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Preview Notice Bar */}
      <header className="border-b border-emerald-200 bg-emerald-950 text-white">
        <div className="mx-auto flex max-w-4xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-emerald-200 uppercase">
                No-Account Sandbox
              </span>
              <span className="text-xs font-semibold text-emerald-100">
                Sample data only &bull; No real money or database writes
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Test the full buyer-to-seller workflow right here before creating
              any account.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleResetSample}
              className="inline-flex min-h-[44px] items-center rounded-lg border border-emerald-700 px-3 text-xs font-semibold text-emerald-100 hover:bg-emerald-900"
            >
              Reset Sample
            </button>
            <Link
              href="/"
              className="inline-flex min-h-[44px] items-center rounded-lg border border-slate-600 px-3 text-xs font-semibold text-white hover:bg-slate-800"
            >
              Home
            </Link>
            <Link
              href="/signup"
              className="inline-flex min-h-[44px] items-center rounded-lg bg-emerald-500 px-3.5 text-xs font-bold text-slate-950 hover:bg-emerald-400"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-3 py-6 sm:px-6 sm:py-8">
        {/* Step Switcher Tabs */}
        <nav
          aria-label="App overview screens"
          className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-xs sm:grid-cols-4"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-[44px] rounded-xl px-3 py-2 text-xs font-bold transition-colors sm:text-sm ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Tab 1: Buyer Payment Link */}
        {activeTab === "pay" && (
          <section className="mt-6 grid gap-6 md:grid-cols-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-6 md:col-span-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[11px] font-bold tracking-wide text-emerald-700 uppercase">
                    Buyer Public Page (/pay/mama-shiro-thrift)
                  </span>
                  <h1 className="mt-0.5 text-xl font-black text-slate-900">
                    Mama Shiro Thrift
                  </h1>
                  <p className="text-xs text-slate-500">
                    {t.forItem}: MTG Thrift Bundle
                  </p>
                </div>

                {/* Language Toggle */}
                <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                  <button
                    type="button"
                    onClick={() => setLang("en")}
                    className={`min-h-[36px] rounded-lg px-3 text-xs font-bold ${
                      lang === "en"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500"
                    }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setLang("sw")}
                    className={`min-h-[36px] rounded-lg px-3 text-xs font-bold ${
                      lang === "sw"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500"
                    }`}
                  >
                    SW
                  </button>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-center">
                <p className="text-[11px] font-bold tracking-wider text-emerald-800 uppercase">
                  {t.tillHeader}
                </p>
                <p className="mt-1 font-mono text-3xl font-black tracking-wider text-slate-900">
                  5492103
                </p>
                <p className="mt-1 text-sm font-bold text-emerald-700">
                  {formatKes(1800)}
                </p>

                <button
                  type="button"
                  onClick={handleCopyTill}
                  className="mt-3 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-emerald-600 px-5 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  {copiedTill ? t.copied : t.copyNumber}
                </button>
              </div>

              <div className="mt-4">
                <h2 className="text-xs font-black tracking-wide text-slate-700 uppercase">
                  {t.howToPay}
                </h2>
                <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-xs text-slate-600">
                  <li>{t.steps.till[0]}</li>
                  <li>{t.steps.till[1]}</li>
                  <li>
                    {t.steps.till[2]}
                    <span className="font-mono font-bold">5492103</span>
                  </li>
                  <li>
                    {t.steps.till[3]}
                    <span className="font-bold">KES 1,800</span>
                  </li>
                  <li>{t.steps.till[4]}</li>
                </ol>
              </div>

              <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                {t.sellerDisclaimer}
              </p>
            </div>

            {/* Interactive Claim Form + QR */}
            <div className="space-y-4 md:col-span-2">
              <form
                onSubmit={handleBuyerSubmitClaim}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5"
              >
                <h2 className="text-sm font-black text-slate-900">
                  Try Submitting a Sample Claim
                </h2>
                <p className="mt-1 text-xs text-slate-500">{t.claimNotice}</p>

                <div className="mt-3 space-y-3">
                  <div>
                    <label
                      htmlFor="demo-code"
                      className="mb-1 block text-xs font-bold text-slate-700"
                    >
                      M-PESA Reference Code
                    </label>
                    <input
                      id="demo-code"
                      type="text"
                      value={mpesaCode}
                      onChange={(e) => setMpesaCode(e.target.value)}
                      className="min-h-[44px] w-full rounded-xl border border-slate-300 px-3 font-mono text-sm uppercase"
                      maxLength={16}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="demo-name"
                      className="mb-1 block text-xs font-bold text-slate-700"
                    >
                      Buyer Name (Sample)
                    </label>
                    <input
                      id="demo-name"
                      type="text"
                      value={payerName}
                      onChange={(e) => setPayerName(e.target.value)}
                      className="min-h-[44px] w-full rounded-xl border border-slate-300 px-3 text-sm"
                      maxLength={40}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="demo-phone"
                      className="mb-1 block text-xs font-bold text-slate-700"
                    >
                      Phone (auto-masked publicly)
                    </label>
                    <input
                      id="demo-phone"
                      type="tel"
                      value={payerPhone}
                      onChange={(e) => setPayerPhone(e.target.value)}
                      className="min-h-[44px] w-full rounded-xl border border-slate-300 px-3 text-sm"
                      maxLength={20}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-4 flex min-h-[44px] w-full items-center justify-center rounded-xl bg-slate-900 px-4 text-xs font-bold text-white hover:bg-slate-800"
                >
                  {t.ivePaidBtn}
                </button>

                {payFormFeedback && (
                  <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
                    <p className="font-semibold">{payFormFeedback}</p>
                    <button
                      type="button"
                      onClick={() => setActiveTab("dashboard")}
                      className="mt-2 inline-flex min-h-[36px] items-center font-bold text-emerald-700 underline underline-offset-2"
                    >
                      Now confirm it in Seller View &rarr;
                    </button>
                  </div>
                )}
              </form>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-xs">
                <p className="text-xs font-bold text-slate-700">
                  {t.qrCodeTitle}
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrDataUrl}
                  alt="Sample Hela Hop QR code for Mama Shiro Thrift"
                  width={132}
                  height={132}
                  className="mx-auto mt-2 rounded-lg border border-slate-100"
                />
                <p className="mt-2 font-mono text-[11px] break-all text-slate-400">
                  {samplePayUrl}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Tab 2: Seller Dashboard */}
        {activeTab === "dashboard" && (
          <section className="mt-6 space-y-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <p className="text-xs font-bold text-slate-500">
                  Confirmed Today (Sample)
                </p>
                <p className="mt-1 text-2xl font-black text-emerald-700">
                  {formatKes(confirmedTotal)}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <p className="text-xs font-bold text-slate-500">
                  Pending Buyer Claims
                </p>
                <p className="mt-1 text-2xl font-black text-amber-600">
                  {pendingCount}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <p className="text-xs font-bold text-slate-500">
                  Invoice INV-1042 Status
                </p>
                <p className="mt-1 text-lg font-black text-slate-900 capitalize">
                  {invoiceStatus === "claimed" ? "Claim Sent" : invoiceStatus}
                </p>
              </div>
            </div>

            {dashboardNotice && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
                <span className="font-semibold">{dashboardNotice}</span>
                <button
                  type="button"
                  onClick={() => setActiveTab("receipt")}
                  className="min-h-[36px] font-bold text-emerald-700 underline underline-offset-2"
                >
                  Open Issued Receipt &rarr;
                </button>
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-black text-slate-900">
                    Seller Claim Queue
                  </h2>
                  <p className="text-xs text-slate-500">
                    A buyer&apos;s M-PESA code starts as an unconfirmed{" "}
                    <strong>Claim</strong>. Confirm after matching the M-PESA
                    SMS on your phone.
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {claims.map((claim) => (
                  <div
                    key={claim.id}
                    className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-black text-slate-900">
                          {claim.mpesaCode}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            claim.status === "confirmed"
                              ? "bg-emerald-100 text-emerald-800"
                              : claim.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {claim.status === "confirmed"
                            ? "Confirmed by Seller"
                            : claim.status === "rejected"
                              ? "Rejected"
                              : "Pending Claim"}
                        </span>
                        <span className="text-xs text-slate-400">
                          {claim.source}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        {claim.payerName} ({claim.maskedPhone}) &bull;{" "}
                        <span className="font-bold text-slate-900">
                          {formatKes(claim.amountKes)}
                        </span>{" "}
                        &bull; {claim.createdAtLabel}
                      </p>
                    </div>

                    {claim.status === "pending" ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleSellerDecision(claim.id, "confirmed")
                          }
                          className="min-h-[44px] rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white hover:bg-emerald-700"
                        >
                          Confirm Claim
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleSellerDecision(claim.id, "rejected")
                          }
                          className="min-h-[44px] rounded-xl border border-slate-300 bg-white px-4 text-xs font-bold text-slate-700 hover:bg-slate-50"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      claim.status === "confirmed" && (
                        <button
                          type="button"
                          onClick={() => setActiveTab("receipt")}
                          className="min-h-[44px] rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-xs font-bold text-emerald-800 hover:bg-emerald-100"
                        >
                          View Receipt
                        </button>
                      )
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Tab 3: Sample Invoice */}
        {activeTab === "invoice" && (
          <section className="mx-auto mt-6 max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold tracking-wider text-slate-700 uppercase">
                  Invoice
                </span>
                <h2 className="mt-1 text-xl font-black text-slate-900">
                  INV-1042
                </h2>
                <p className="text-xs text-slate-500">
                  From: Mama Shiro Thrift (Till 5492103)
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  invoiceStatus === "paid"
                    ? "bg-emerald-100 text-emerald-800"
                    : invoiceStatus === "claimed"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-slate-100 text-slate-700"
                }`}
              >
                {invoiceStatus === "paid"
                  ? "Paid (Seller Confirmed)"
                  : invoiceStatus === "claimed"
                    ? "Claim Sent"
                    : "Unpaid"}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap justify-between gap-2 text-xs text-slate-600">
              <span>
                Billed to: <strong>Grace M. (0722 *** 341)</strong>
              </span>
              <span>Due: Today</span>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 p-4 text-xs">
              <div className="flex justify-between font-bold text-slate-700">
                <span>2x Denim Jackets</span>
                <span>{formatKes(3200)}</span>
              </div>
              <div className="mt-3 flex justify-between border-t border-slate-100 pt-3 text-sm font-black text-slate-900">
                <span>Total Amount</span>
                <span>{formatKes(3200)}</span>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              {invoiceStatus === "unpaid" ? (
                <button
                  type="button"
                  onClick={handleInvoiceSubmitClaim}
                  className="min-h-[44px] flex-1 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  Simulate Buyer Payment Claim (TJK95INV42)
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveTab("dashboard")}
                  className="min-h-[44px] flex-1 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white hover:bg-slate-800"
                >
                  Review Claim in Seller View &rarr;
                </button>
              )}
            </div>
          </section>
        )}

        {/* Tab 4: Sample Seller-Confirmed Receipt */}
        {activeTab === "receipt" && (
          <section className="mx-auto mt-6 max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-7">
            <div className="border-b border-dashed border-slate-200 pb-4 text-center">
              <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-800">
                Seller-Confirmed Payment Receipt
              </span>
              <h2 className="mt-2 text-2xl font-black text-slate-900">
                {formatKes(latestReceipt.amountKes)}
              </h2>
              <p className="text-xs text-slate-500">
                Confirmed by Mama Shiro Thrift
              </p>
            </div>

            <dl className="mt-4 space-y-2.5 text-xs">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Order / Item</dt>
                <dd className="text-right font-semibold text-slate-900">
                  {latestReceipt.itemLabel}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Payer</dt>
                <dd className="text-right font-semibold text-slate-900">
                  {latestReceipt.payerName} ({latestReceipt.maskedPhone})
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">M-PESA Code</dt>
                <dd className="text-right font-mono font-bold text-slate-900">
                  {latestReceipt.mpesaCode}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Receipt Token</dt>
                <dd className="text-right font-mono text-slate-700">
                  {latestReceipt.token}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Confirmed At</dt>
                <dd className="text-right text-slate-700">
                  {latestReceipt.confirmedAtLabel}
                </dd>
              </div>
            </dl>

            <p className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-center text-[11px] text-slate-600">
              Payer phone numbers are always masked publicly (e.g.{" "}
              <span className="font-mono">0712 *** 678</span>), and receipt URLs
              use random non-sequential tokens.
            </p>
          </section>
        )}

        {/* Bottom CTA */}
        <section className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center sm:p-6">
          <h2 className="text-base font-black text-slate-900">
            Ready to test with your own shop details?
          </h2>
          <p className="mx-auto mt-1 max-w-lg text-xs text-slate-600">
            Accounts are free during the Phase 1 beta. Your payment link takes
            less than 60 seconds to set up.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex min-h-[44px] items-center rounded-xl bg-emerald-600 px-5 text-xs font-bold text-white hover:bg-emerald-700"
            >
              Create Free Seller Account
            </Link>
            <Link
              href="/login"
              className="inline-flex min-h-[44px] items-center rounded-xl border border-slate-300 bg-white px-5 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Seller Log In
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-500">
        <LegalFooter />
      </footer>
    </div>
  );
}
