"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

import { useToast } from "@/components/ui/Toast";
import type { ClaimStatus } from "@/types/database";

import { confirmPaymentClaimAction, rejectPaymentClaimAction } from "./actions";

export interface ClaimItem {
  id: string;
  seller_id: string;
  invoice_id: string | null;
  payment_link_id: string | null;
  payer_name: string;
  payer_phone: string;
  mpesa_code: string;
  amount_minor: number;
  status: ClaimStatus;
  reject_reason: string | null;
  created_at: string;
  receipt?: {
    public_token: string;
    receipt_number: string;
  } | null;
  invoices?: {
    code: string;
  } | null;
  payment_links?: {
    title: string;
    slug: string;
  } | null;
}

interface ClaimsClientProps {
  initialClaims: ClaimItem[];
  appUrl: string;
}

export function ClaimsClient({ initialClaims }: ClaimsClientProps) {
  const { success, error } = useToast();
  const [claims, setClaims] = useState<ClaimItem[]>(initialClaims);
  const [activeTab, setActiveTab] = useState<
    "pending" | "confirmed" | "rejected" | "all"
  >("pending");
  const [actionId, setActionId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredClaims =
    activeTab === "all" ? claims : claims.filter((c) => c.status === activeTab);

  const handleConfirm = (claim: ClaimItem) => {
    setActionId(claim.id);
    startTransition(async () => {
      const res = await confirmPaymentClaimAction(claim.id);
      if (res.success) {
        success(res.message || "Payment confirmed. Receipt created.");
        setClaims((prev) =>
          prev.map((c) =>
            c.id === claim.id
              ? {
                  ...c,
                  status: "confirmed",
                  receipt: res.receiptToken
                    ? {
                        public_token: res.receiptToken,
                        receipt_number: res.receiptNumber ?? "Receipt",
                      }
                    : c.receipt,
                }
              : c
          )
        );
      } else {
        error(res.message || "Failed to confirm payment.");
      }
      setActionId(null);
    });
  };

  const handleReject = (claim: ClaimItem) => {
    const reason = window.prompt(
      "Reason for rejection (e.g. Code does not match M-PESA SMS):",
      "Code not found in M-PESA SMS"
    );
    if (reason === null) return; // user cancelled

    setActionId(claim.id);
    startTransition(async () => {
      const res = await rejectPaymentClaimAction(claim.id, reason);
      if (res.success) {
        success(res.message || "Claim rejected.");
        setClaims((prev) =>
          prev.map((c) =>
            c.id === claim.id
              ? { ...c, status: "rejected", reject_reason: reason }
              : c
          )
        );
      } else {
        error(res.message || "Failed to reject claim.");
      }
      setActionId(null);
    });
  };

  const getStatusBadge = (status: ClaimStatus) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500"></span>
            WAITING FOR YOU
          </span>
        );
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            CONFIRMED
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-red-300 bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-800">
            REJECTED
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          Payment Claims
        </h1>
        <p className="mt-1 text-xs text-slate-500 sm:text-sm">
          Review customer M-PESA codes against your own M-PESA SMS before
          confirming.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 pb-2">
        {(["pending", "confirmed", "rejected", "all"] as const).map((tab) => {
          const count =
            tab === "all"
              ? claims.length
              : claims.filter((c) => c.status === tab).length;
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
        })}
      </div>

      {/* Claims List */}
      {filteredClaims.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-12 text-center">
          <span className="mb-3 block text-4xl" aria-hidden="true">
            📨
          </span>
          <h2 className="text-base font-bold text-slate-900">
            {activeTab === "pending"
              ? "No Pending Claims"
              : `No ${activeTab} claims`}
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
            When customers submit their M-PESA confirmation code after paying,
            their claim will appear here for you to check against your M-PESA
            SMS.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredClaims.map((claim) => {
            const formattedAmount = `KES ${(claim.amount_minor / 100).toLocaleString()}`;
            const dateStr = new Date(claim.created_at).toLocaleString("en-KE", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={claim.id}
                className={`space-y-3.5 rounded-2xl border bg-white p-5 shadow-sm transition-all ${
                  claim.status === "pending"
                    ? "border-amber-300/80 bg-amber-50/20"
                    : "border-slate-200/90"
                }`}
              >
                {/* Header: Status & Amount */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(claim.status)}
                    <span className="font-mono text-xs text-slate-400">
                      {dateStr}
                    </span>
                  </div>

                  <span className="font-mono text-xl font-black text-slate-900">
                    {formattedAmount}
                  </span>
                </div>

                {/* Code & Payer Details */}
                <div className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50 p-3.5 sm:flex-row sm:items-center">
                  <div>
                    <span className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                      Submitted M-PESA Code
                    </span>
                    <span className="font-mono text-2xl font-black tracking-wider text-slate-900">
                      {claim.mpesa_code}
                    </span>
                  </div>

                  <div className="text-xs sm:text-right">
                    <span className="text-slate-500">Customer:</span>{" "}
                    <strong className="text-slate-900">
                      {claim.payer_name}
                    </strong>
                    <div className="font-mono text-slate-500">
                      {claim.payer_phone}
                    </div>
                  </div>
                </div>

                {/* Source Reference: Invoice or Payment Link */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  {claim.invoices && (
                    <span className="rounded border bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                      Invoice: #{claim.invoices.code}
                    </span>
                  )}
                  {claim.payment_links && (
                    <span className="rounded border bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                      Link: {claim.payment_links.title}
                    </span>
                  )}
                  {claim.reject_reason && (
                    <span className="font-medium text-red-600">
                      Reason: {claim.reject_reason}
                    </span>
                  )}
                </div>

                {/* Mandatory Seller SMS Hint */}
                {claim.status === "pending" && (
                  <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
                    <span aria-hidden="true" className="shrink-0 text-sm">
                      💡
                    </span>
                    <p>
                      <strong>Before you confirm:</strong> look for this code in
                      your own M-PESA SMS on your phone:{" "}
                      <strong className="font-mono">{claim.mpesa_code}</strong>{" "}
                      for <strong>{formattedAmount}</strong> before confirming.
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2">
                  {claim.status === "pending" ? (
                    <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                      <button
                        type="button"
                        onClick={() => handleConfirm(claim)}
                        disabled={isPending && actionId === claim.id}
                        className="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-6 text-xs font-bold text-white shadow-xs transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50 sm:flex-none"
                      >
                        {isPending && actionId === claim.id ? (
                          <span>Confirming...</span>
                        ) : (
                          <>
                            <span>✓</span>
                            <span>Confirm {formattedAmount}</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReject(claim)}
                        disabled={isPending && actionId === claim.id}
                        className="flex min-h-[44px] items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 transition-all hover:bg-red-50 hover:text-red-600 active:scale-95 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  ) : claim.status === "confirmed" && claim.receipt ? (
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/r/${claim.receipt.public_token}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex min-h-[44px] items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-4 text-xs font-bold text-emerald-800 transition-colors hover:bg-emerald-100"
                      >
                        <span>🧾</span>
                        <span>View Public Receipt &rarr;</span>
                      </Link>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">
                      Claim processed
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
