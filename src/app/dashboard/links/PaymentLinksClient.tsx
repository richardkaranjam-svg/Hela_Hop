"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

import { useToast } from "@/components/ui/Toast";

import {
  deletePaymentLinkAction,
  togglePaymentLinkStatusAction,
} from "./actions";

export interface PaymentLinkItem {
  id: string;
  slug: string;
  title: string;
  currency: string;
  amount_minor: number | null;
  is_active: boolean;
  created_at: string;
  payout_methods?: {
    type: string;
    number: string;
    account_ref: string | null;
    label: string | null;
  } | null;
}

interface PaymentLinksClientProps {
  initialLinks: PaymentLinkItem[];
  appUrl: string;
}

export function PaymentLinksClient({
  initialLinks,
  appUrl,
}: PaymentLinksClientProps) {
  const { success, error } = useToast();
  const [links, setLinks] = useState<PaymentLinkItem[]>(initialLinks);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [qrModalLink, setQrModalLink] = useState<PaymentLinkItem | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCopyUrl = async (id: string, slug: string) => {
    const fullUrl = `${appUrl}/pay/${slug}`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(fullUrl);
      } else {
        const input = document.createElement("input");
        input.value = fullUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      setCopiedId(id);
      success("Payment link copied to clipboard!");
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      error("Failed to copy link. Please copy manually.");
    }
  };

  const handleDelete = (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }
    startTransition(async () => {
      const res = await deletePaymentLinkAction(id);
      if (res.success) {
        success(res.message || "Payment link deleted.");
        setLinks((prev) => prev.filter((l) => l.id !== id));
      } else {
        error(res.message || "Failed to delete link.");
      }
    });
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      const res = await togglePaymentLinkStatusAction(id, currentStatus);
      if (res.success) {
        success(res.message || "Link status updated.");
        setLinks((prev) =>
          prev.map((l) =>
            l.id === id ? { ...l, is_active: !currentStatus } : l
          )
        );
      } else {
        error(res.message || "Failed to update link status.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Bar with Create Action */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            My Payment Links
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Share these links on WhatsApp, Instagram, or SMS to receive M-PESA.
          </p>
        </div>

        <Link
          href="/dashboard/links/new"
          className="flex min-h-[44px] items-center justify-center gap-2 self-start rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-95 sm:self-auto"
        >
          <span>+ Create New Link</span>
        </Link>
      </div>

      {/* Links List */}
      {links.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-12 text-center">
          <span className="mb-3 block text-4xl" aria-hidden="true">
            🔗
          </span>
          <h2 className="text-base font-bold text-slate-900">
            No Payment Links Yet
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
            Create your first branded M-PESA payment link in 60 seconds and
            start sharing it with your customers.
          </p>
          <div className="mt-5">
            <Link
              href="/dashboard/links/new"
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-emerald-700"
            >
              Create My First Link &rarr;
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {links.map((link) => {
            const fullUrl = `${appUrl}/pay/${link.slug}`;
            const amountText =
              link.amount_minor !== null
                ? `KES ${(link.amount_minor / 100).toLocaleString()}`
                : "Customer enters amount";

            return (
              <div
                key={link.id}
                className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all hover:border-slate-300 md:flex-row md:items-center"
              >
                {/* Left Info */}
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-base font-bold text-slate-900">
                      {link.title}
                    </span>
                    {link.is_active ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        ACTIVE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                        PAUSED
                      </span>
                    )}
                  </div>

                  {/* Slug / Public URL */}
                  <div className="flex items-center gap-2 truncate font-mono text-xs text-slate-500">
                    <span>🔗</span>
                    <span className="truncate font-semibold text-slate-700">
                      {fullUrl}
                    </span>
                  </div>

                  {/* Details: Amount & Payout Method */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-slate-500">
                    <span className="font-bold text-emerald-600">
                      {amountText}
                    </span>
                    {link.payout_methods && (
                      <span className="flex items-center gap-1 text-slate-600">
                        <span>💳</span>
                        <span className="font-semibold uppercase">
                          {link.payout_methods.type}:{" "}
                          {link.payout_methods.number}
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons (Min 44px tap targets) */}
                <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 md:border-t-0 md:pt-0">
                  {/* Copy Link Button */}
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(link.id, link.slug)}
                    className={`flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border px-3.5 text-xs font-bold transition-all ${
                      copiedId === link.id
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span>{copiedId === link.id ? "✓" : "📋"}</span>
                    <span>{copiedId === link.id ? "Copied" : "Copy Link"}</span>
                  </button>

                  {/* View Public Page */}
                  <Link
                    href={`/pay/${link.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
                    title="Open public payment page in new tab"
                  >
                    <span>👁️</span>
                    <span>Open</span>
                  </Link>

                  {/* QR Code Button */}
                  <button
                    type="button"
                    onClick={() => setQrModalLink(link)}
                    className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
                    title="View & Download QR Code"
                  >
                    <span>📱</span>
                    <span>QR</span>
                  </button>

                  {/* Pause / Resume Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(link.id, link.is_active)}
                    disabled={isPending}
                    className="min-h-[44px] rounded-xl px-2.5 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-800"
                    title={link.is_active ? "Pause link" : "Activate link"}
                  >
                    {link.is_active ? "Pause" : "Resume"}
                  </button>

                  {/* Delete Link */}
                  <button
                    type="button"
                    onClick={() => handleDelete(link.id, link.title)}
                    disabled={isPending}
                    className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-xs font-bold text-red-600 transition-colors hover:bg-red-50"
                    title="Delete payment link"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Code Modal */}
      {qrModalLink && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
        >
          <div className="animate-in fade-in zoom-in-95 w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-xl duration-150">
            <h3 className="truncate text-base font-bold text-slate-900">
              {qrModalLink.title}
            </h3>
            <p className="mt-0.5 truncate font-mono text-xs text-slate-500">
              helahop.app/pay/{qrModalLink.slug}
            </p>

            {/* QR Image */}
            <div className="my-5 inline-block rounded-xl border border-slate-200 bg-slate-50 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/qr?text=${encodeURIComponent(
                  `${appUrl}/pay/${qrModalLink.slug}`
                )}`}
                alt={`QR code for ${qrModalLink.title}`}
                className="mx-auto h-48 w-48"
              />
            </div>

            <p className="mb-5 text-[11px] text-slate-500">
              Customers can scan this code with their camera to open your
              payment page.
            </p>

            <div className="flex flex-col gap-2">
              <a
                href={`/api/qr?text=${encodeURIComponent(
                  `${appUrl}/pay/${qrModalLink.slug}`
                )}&download=true&filename=helahop-${qrModalLink.slug}`}
                download
                className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-sm transition-colors hover:bg-emerald-700"
              >
                <span>💾</span>
                <span>Download QR Code Image</span>
              </a>

              <button
                type="button"
                onClick={() => setQrModalLink(null)}
                className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
