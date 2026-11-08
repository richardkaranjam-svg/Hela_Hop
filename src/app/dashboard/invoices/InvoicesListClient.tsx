"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

import { useToast } from "@/components/ui/Toast";
import type { InvoiceItem, InvoiceStatus } from "@/types/database";

import { deleteInvoiceAction, updateInvoiceStatusAction } from "./actions";

export interface InvoiceListItem {
  id: string;
  code: string;
  customer_name: string;
  customer_phone: string;
  items: InvoiceItem[];
  total_minor: number;
  currency: string;
  due_date: string | null;
  status: InvoiceStatus;
  created_at: string;
  payout_methods?: {
    type: string;
    number: string;
    account_ref: string | null;
    label: string | null;
  } | null;
}

interface InvoicesListClientProps {
  initialInvoices: InvoiceListItem[];
  appUrl: string;
  sellerName: string;
}

export function InvoicesListClient({
  initialInvoices,
  appUrl,
  sellerName,
}: InvoicesListClientProps) {
  const { success, error } = useToast();
  const [invoices, setInvoices] = useState<InvoiceListItem[]>(initialInvoices);
  const [activeTab, setActiveTab] = useState<"all" | InvoiceStatus>("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredInvoices =
    activeTab === "all"
      ? invoices
      : invoices.filter((inv) => inv.status === activeTab);

  const handleCopyLink = async (code: string) => {
    const fullUrl = `${appUrl}/i/${code}`;
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
      setCopiedCode(code);
      success("Invoice link copied to clipboard!");
      setTimeout(() => setCopiedCode(null), 2500);
    } catch {
      error("Failed to copy link.");
    }
  };

  const handleDelete = (id: string, code: string) => {
    if (!window.confirm(`Delete invoice #${code}?`)) return;
    startTransition(async () => {
      const res = await deleteInvoiceAction(id);
      if (res.success) {
        success(res.message || "Invoice deleted.");
        setInvoices((prev) => prev.filter((i) => i.id !== id));
      } else {
        error(res.message || "Failed to delete invoice.");
      }
    });
  };

  const handleStatusChange = (id: string, newStatus: InvoiceStatus) => {
    startTransition(async () => {
      const res = await updateInvoiceStatusAction(id, newStatus);
      if (res.success) {
        success(res.message || "Invoice updated.");
        setInvoices((prev) =>
          prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
        );
      } else {
        error(res.message || "Failed to update status.");
      }
    });
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case "unpaid":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
            UNPAID
          </span>
        );
      case "claimed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-blue-300 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-800">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500"></span>
            CLAIMED
          </span>
        );
      case "paid":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            PAID
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
            CANCELLED
          </span>
        );
    }
  };

  const getWhatsAppShareUrl = (inv: InvoiceListItem) => {
    const formattedAmount = `KES ${(inv.total_minor / 100).toLocaleString()}`;
    const invoiceUrl = `${appUrl}/i/${inv.code}`;
    const cleanPhone = inv.customer_phone.replace(/[^0-9]/g, "");
    const waNumber = cleanPhone.startsWith("0")
      ? `254${cleanPhone.slice(1)}`
      : cleanPhone;

    const message = encodeURIComponent(
      `Jambo ${inv.customer_name}, here is your invoice for ${formattedAmount} from ${sellerName}:\n${invoiceUrl}`
    );

    return `https://wa.me/${waNumber}?text=${message}`;
  };

  return (
    <div className="space-y-6">
      {/* Header bar with CTA */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Invoices
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Create, track, and share M-PESA invoices with your customers.
          </p>
        </div>

        <Link
          href="/dashboard/invoices/new"
          className="flex min-h-[44px] items-center justify-center gap-2 self-start rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-95 sm:self-auto"
        >
          <span>+ Create Invoice</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 pb-2">
        {(["all", "unpaid", "claimed", "paid", "cancelled"] as const).map(
          (tab) => {
            const count =
              tab === "all"
                ? invoices.length
                : invoices.filter((i) => i.status === tab).length;
            const isSel = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-xl px-3.5 text-xs font-bold capitalize transition-all ${
                  isSel
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`py-0.2 rounded-full px-1.5 text-[10px] ${
                    isSel
                      ? "bg-slate-800 text-slate-300"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          }
        )}
      </div>

      {/* Invoices List */}
      {filteredInvoices.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-12 text-center">
          <span className="mb-3 block text-4xl" aria-hidden="true">
            🧾
          </span>
          <h2 className="text-base font-bold text-slate-900">
            {activeTab === "all"
              ? "No Invoices Created Yet"
              : `No ${activeTab} invoices`}
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
            Create an invoice with itemized breakdown and share it directly via
            WhatsApp to get paid.
          </p>
          <div className="mt-5">
            <Link
              href="/dashboard/invoices/new"
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-emerald-700"
            >
              Create Invoice &rarr;
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredInvoices.map((inv) => {
            const formattedTotal = `KES ${(inv.total_minor / 100).toLocaleString()}`;
            const itemsCount = inv.items?.length || 0;
            const firstItemDesc = inv.items?.[0]?.description || "General Item";

            return (
              <div
                key={inv.id}
                className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all hover:border-slate-300 md:flex-row md:items-center"
              >
                {/* Left Info */}
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-xs font-black text-slate-700">
                      #{inv.code}
                    </span>
                    {getStatusBadge(inv.status)}
                    {inv.due_date && (
                      <span className="text-[11px] font-medium text-slate-500">
                        Due: {inv.due_date}
                      </span>
                    )}
                  </div>

                  {/* Customer details */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="truncate text-base font-bold text-slate-900">
                      {inv.customer_name}
                    </span>
                    <span className="font-mono text-xs text-slate-500">
                      ({inv.customer_phone})
                    </span>
                  </div>

                  {/* Items summary */}
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="max-w-xs truncate font-semibold text-slate-700">
                      {firstItemDesc}
                      {itemsCount > 1 ? ` +${itemsCount - 1} more` : ""}
                    </span>
                    <span>&bull;</span>
                    <span className="font-mono text-sm font-black text-emerald-700">
                      {formattedTotal}
                    </span>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 md:border-t-0 md:pt-0">
                  {/* WhatsApp Share Button (Requirement 4) */}
                  <a
                    href={getWhatsAppShareUrl(inv)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-[44px] items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 text-xs font-bold text-emerald-800 transition-colors hover:bg-emerald-100"
                    title="Share invoice directly to customer on WhatsApp"
                  >
                    <span>💬</span>
                    <span>WhatsApp</span>
                  </a>

                  {/* Copy Link Button */}
                  <button
                    type="button"
                    onClick={() => handleCopyLink(inv.code)}
                    className={`flex min-h-[44px] items-center gap-1.5 rounded-xl border px-3.5 text-xs font-bold transition-all ${
                      copiedCode === inv.code
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span>{copiedCode === inv.code ? "✓" : "📋"}</span>
                    <span>
                      {copiedCode === inv.code ? "Copied" : "Copy Link"}
                    </span>
                  </button>

                  {/* Open Public Page */}
                  <Link
                    href={`/i/${inv.code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
                    title="View public invoice"
                  >
                    <span>👁️</span>
                    <span>View</span>
                  </Link>

                  {/* Quick Status toggle dropdown or action */}
                  {inv.status === "unpaid" && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(inv.id, "cancelled")}
                      disabled={isPending}
                      className="min-h-[44px] rounded-xl px-2.5 text-xs font-semibold text-slate-500 transition-colors hover:text-red-600"
                      title="Cancel invoice"
                    >
                      Cancel
                    </button>
                  )}

                  {inv.status === "claimed" && (
                    <Link
                      href="/dashboard/claims"
                      className="flex min-h-[44px] items-center justify-center rounded-xl bg-emerald-600 px-3 text-xs font-bold text-white transition-colors hover:bg-emerald-700"
                      title="Check your M-PESA SMS, then confirm the claim"
                    >
                      Review claim
                    </Link>
                  )}

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => handleDelete(inv.id, inv.code)}
                    disabled={isPending}
                    className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-xs font-bold text-red-600 transition-colors hover:bg-red-50"
                    title="Delete invoice"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
