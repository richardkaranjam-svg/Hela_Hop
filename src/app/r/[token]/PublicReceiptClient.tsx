"use client";

import { useState } from "react";
import Link from "next/link";

import { maskPhoneNumber } from "@/lib/formatters";

export interface ReceiptDetails {
  receiptNumber: string;
  publicToken: string;
  createdAt: string;
  amountMinor: number;
  mpesaCode: string;
  payerName: string;
  payerPhone: string;
  sellerName: string;
  sellerSlug?: string | null;
  payoutType?: string | null;
  payoutNumber?: string | null;
  payoutAccountRef?: string | null;
  contextTitle?: string | null;
  invoiceCode?: string | null;
  qrDataUrl: string;
  receiptUrl: string;
}

interface PublicReceiptClientProps {
  receipt: ReceiptDetails;
}

export function PublicReceiptClient({ receipt }: PublicReceiptClientProps) {
  const [copied, setCopied] = useState(false);

  const formattedAmount = `KES ${(receipt.amountMinor / 100).toLocaleString()}`;
  const maskedPhone = maskPhoneNumber(receipt.payerPhone);
  const formattedDate = new Date(receipt.createdAt).toLocaleString("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(receipt.receiptUrl);
      } else {
        const input = document.createElement("input");
        input.value = receipt.receiptUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // WhatsApp share message
  const shareText = encodeURIComponent(
    `🧾 *Hela Hop Payment Receipt*\n` +
      `Receipt: ${receipt.receiptNumber}\n` +
      `Amount: ${formattedAmount}\n` +
      `M-PESA Code: ${receipt.mpesaCode}\n` +
      `Paid to: ${receipt.sellerName}\n` +
      `Status: Confirmed by Seller\n\n` +
      `View receipt: ${receipt.receiptUrl}`
  );
  const whatsappUrl = `https://wa.me/?text=${shareText}`;

  return (
    <div className="flex min-h-screen flex-col justify-between bg-slate-50 text-slate-900">
      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          header,
          footer,
          .no-print {
            display: none !important;
          }
          .receipt-card {
            border: 1px solid #e2e8f0 !important;
            box-shadow: none !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}</style>

      {/* Top Header */}
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

          <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-700">
            Receipt
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-md px-4 py-6">
        {/* Receipt Container */}
        <div className="receipt-card overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
          {/* Status Header Banner */}
          <div className="border-b border-emerald-100 bg-gradient-to-b from-emerald-500 to-emerald-600 p-6 text-center text-white">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl font-black text-emerald-600 shadow-md">
              ✓
            </div>
            <div className="inline-block rounded-full bg-emerald-700/60 px-3 py-0.5 text-[10px] font-black tracking-widest uppercase">
              PAYMENT CONFIRMED
            </div>
            <h1 className="mt-1 text-2xl font-black tracking-tight">
              {formattedAmount}
            </h1>
            <p className="mt-1 text-xs text-emerald-100">
              Confirmed by seller:{" "}
              <strong className="text-white">{receipt.sellerName}</strong>
            </p>
          </div>

          {/* Details Body */}
          <div className="space-y-4 p-5 sm:p-6">
            {/* Receipt & M-PESA Code Pill */}
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div>
                <span className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Receipt No.
                </span>
                <span className="font-mono text-xs font-bold text-slate-800">
                  {receipt.receiptNumber}
                </span>
              </div>
              <div className="text-right">
                <span className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  M-PESA Code
                </span>
                <span className="font-mono text-xs font-black text-emerald-700">
                  {receipt.mpesaCode}
                </span>
              </div>
            </div>

            {/* Line-item Details Table */}
            <div className="space-y-2.5 divide-y divide-slate-100 text-xs">
              <div className="flex justify-between pt-2">
                <span className="text-slate-500">Paid To</span>
                <span className="font-bold text-slate-900">
                  {receipt.sellerName}
                </span>
              </div>

              <div className="flex justify-between pt-2">
                <span className="text-slate-500">Paid By</span>
                <span className="font-semibold text-slate-900">
                  {receipt.payerName}{" "}
                  <span className="font-mono text-slate-400">
                    ({maskedPhone})
                  </span>
                </span>
              </div>

              <div className="flex justify-between pt-2">
                <span className="text-slate-500">Date & Time</span>
                <span className="font-medium text-slate-700">
                  {formattedDate}
                </span>
              </div>

              {receipt.payoutType && receipt.payoutNumber && (
                <div className="flex justify-between pt-2">
                  <span className="text-slate-500">Channel</span>
                  <span className="font-semibold text-slate-800 uppercase">
                    {receipt.payoutType}: {receipt.payoutNumber}
                    {receipt.payoutAccountRef &&
                      ` (${receipt.payoutAccountRef})`}
                  </span>
                </div>
              )}

              {(receipt.contextTitle || receipt.invoiceCode) && (
                <div className="flex justify-between pt-2">
                  <span className="text-slate-500">Reference</span>
                  <span className="font-semibold text-slate-800">
                    {receipt.invoiceCode
                      ? `Invoice #${receipt.invoiceCode}`
                      : receipt.contextTitle}
                  </span>
                </div>
              )}
            </div>

            {/* Verification Notice (Rule D9 / D11 Plain Language) */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-center">
              <p className="text-[11px] leading-relaxed text-slate-600">
                This receipt confirms that the seller verified receipt of funds
                in their M-PESA SMS balance.
              </p>
            </div>

            {/* QR Code Verification Section */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 p-4 text-center">
              <div className="relative mb-2 h-32 w-32 overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={receipt.qrDataUrl}
                  alt={`QR verification for receipt ${receipt.receiptNumber}`}
                  className="h-full w-full object-contain"
                />
              </div>
              <p className="text-[11px] font-bold text-slate-700">
                Scan to verify online
              </p>
              <p className="mt-0.5 font-mono text-[10px] text-slate-400">
                helahop.co.ke/r/{receipt.publicToken}
              </p>
            </div>

            {/* Action Buttons (Screen 8) */}
            <div className="no-print space-y-2 pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-xs transition-colors hover:bg-emerald-700 active:scale-98"
              >
                <span>💬</span>
                <span>Share on WhatsApp</span>
              </a>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 active:scale-98"
                >
                  <span>🖨️</span>
                  <span>Print Receipt</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 active:scale-98"
                >
                  <span>🔗</span>
                  <span>{copied ? "Link Copied!" : "Copy Link"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Viral Seller CTA Footer (Wireframe Screen 8) */}
        <div className="no-print mt-6 mb-4 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 text-center">
          <p className="text-xs font-bold text-emerald-950">
            Accept M-PESA payments easily without setup fees
          </p>
          <p className="mt-1 text-[11px] text-emerald-700">
            Get your own payment link & invoices in less than 2 minutes.
          </p>
          <Link
            href="/signup"
            className="mt-3 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-emerald-600 px-5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-emerald-700 active:scale-98"
          >
            Create My Free Hela Hop Link &rarr;
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-slate-200 bg-white py-4 text-center">
        <p className="text-[11px] text-slate-400">
          Powered by{" "}
          <Link
            href="/"
            className="font-semibold text-slate-600 hover:text-emerald-600"
          >
            Hela Hop
          </Link>{" "}
          — Kenya&apos;s Independent Lipa na M-PESA Hub
        </p>
      </footer>
    </div>
  );
}
