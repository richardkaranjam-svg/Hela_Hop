"use client";

import { useState } from "react";
import Link from "next/link";

import { useToast } from "@/components/ui/Toast";

export interface DashboardStats {
  monthTotalMinor: number;
  allTimeTotalMinor: number;
  pendingClaimsCount: number;
  unpaidInvoicesCount: number;
  monthOrdersCount: number;
  unpaidInvoicesTotalMinor: number;
}

export interface DayData {
  dayName: string;
  dateStr: string;
  amountMinor: number;
  count: number;
}

export interface ActivityItem {
  id: string;
  type: "claim" | "invoice";
  title: string;
  subtitle: string;
  amountMinor: number;
  status:
    | "confirmed"
    | "pending"
    | "rejected"
    | "unpaid"
    | "claimed"
    | "paid"
    | "cancelled";
  createdAt: string;
  href: string;
  code?: string;
}

interface DashboardClientProps {
  stats: DashboardStats;
  weeklyData: DayData[];
  recentActivity: ActivityItem[];
  sellerName: string;
  sellerSlug: string;
  payoutBadge?: {
    type: string;
    number: string;
    label?: string | null;
  } | null;
}

export function DashboardClient({
  stats,
  weeklyData,
  recentActivity,
  sellerName,
  sellerSlug,
  payoutBadge,
}: DashboardClientProps) {
  const { success } = useToast();
  const [filter, setFilter] = useState<"all" | "paid" | "unpaid">("all");
  const [copiedLink, setCopiedLink] = useState(false);

  const publicLinkUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/pay/${sellerSlug}`
      : `https://helahop.co.ke/pay/${sellerSlug}`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(publicLinkUrl);
      } else {
        const input = document.createElement("input");
        input.value = publicLinkUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      setCopiedLink(true);
      success("Payment link copied to clipboard!");
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      success(`Link: ${publicLinkUrl}`);
    }
  };

  // Find max amount in weeklyData for relative bar heights
  const maxWeeklyAmount = Math.max(
    ...weeklyData.map((d) => d.amountMinor),
    10000 // min fallback
  );

  // Filter activities
  const filteredActivity = recentActivity.filter((item) => {
    if (filter === "paid") {
      return item.status === "confirmed" || item.status === "paid";
    }
    if (filter === "unpaid") {
      return (
        item.status === "pending" ||
        item.status === "claimed" ||
        item.status === "unpaid"
      );
    }
    return true;
  });

  const monthName = new Date().toLocaleString("en-KE", {
    month: "short",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Top Welcome / Merchant Card (Matches Screen 3) */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:p-6">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-base font-black text-emerald-800 shadow-xs">
            {sellerName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-slate-900 sm:text-xl">
                {sellerName}
              </h1>
              {payoutBadge ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  <span className="uppercase">{payoutBadge.type}:</span>{" "}
                  {payoutBadge.number}
                </span>
              ) : (
                <Link
                  href="/dashboard/payout-methods"
                  className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 hover:bg-amber-100"
                >
                  ⚠️ Add Payout Method
                </Link>
              )}
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Seller Dashboard & Lipa na M-PESA Management
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/settings"
            className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 active:scale-98"
            title="Account Settings"
          >
            <span>⚙️ Settings</span>
          </Link>
        </div>
      </div>

      {/* Hero Stats Card (Wireframe Screen 3 Dark Gradient) */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 p-6 text-white shadow-md sm:p-7">
        <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
          <span className="tracking-wider uppercase">
            THIS MONTH&apos;S TOTAL
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1 font-mono text-[11px] font-semibold text-emerald-200 backdrop-blur-xs">
            {monthName}
          </span>
        </div>

        <div className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
          KES {(stats.monthTotalMinor / 100).toLocaleString()}
        </div>

        {/* Sub-breakdown: Confirmed vs Pending / Unpaid */}
        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-4 sm:grid-cols-4 sm:gap-6">
          <div>
            <span className="block text-[11px] text-slate-400">
              Paid ({stats.monthOrdersCount} claims)
            </span>
            <span className="mt-0.5 block text-sm font-black text-emerald-400">
              KES {(stats.monthTotalMinor / 100).toLocaleString()}
            </span>
          </div>

          <div>
            <span className="block text-[11px] text-slate-400">
              Pending Claims ({stats.pendingClaimsCount})
            </span>
            <Link
              href="/dashboard/claims"
              className="mt-0.5 block text-sm font-black text-amber-400 hover:underline"
            >
              {stats.pendingClaimsCount} to review &rarr;
            </Link>
          </div>

          <div>
            <span className="block text-[11px] text-slate-400">
              Unpaid Invoices ({stats.unpaidInvoicesCount})
            </span>
            <span className="mt-0.5 block text-sm font-black text-amber-300">
              KES {(stats.unpaidInvoicesTotalMinor / 100).toLocaleString()}
            </span>
          </div>

          <div>
            <span className="block text-[11px] text-slate-400">
              Total All-Time
            </span>
            <span className="mt-0.5 block text-sm font-black text-slate-200">
              KES {(stats.allTimeTotalMinor / 100).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Bar (Requirement 3) */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <Link
          href="/dashboard/invoices/new"
          className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 text-xs font-bold text-white shadow-xs transition-colors hover:bg-emerald-700 active:scale-98"
        >
          <span>➕ Create Invoice</span>
        </Link>

        <Link
          href="/dashboard/links/new"
          className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 text-xs font-bold text-slate-800 shadow-xs transition-colors hover:bg-slate-50 active:scale-98"
        >
          <span>🔗 Create Link</span>
        </Link>

        <Link
          href="/dashboard/claims"
          className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 text-xs font-bold text-slate-800 shadow-xs transition-colors hover:bg-slate-50 active:scale-98"
        >
          <span>
            📩 View All Claims{" "}
            {stats.pendingClaimsCount > 0 && `(${stats.pendingClaimsCount})`}
          </span>
        </Link>
      </div>

      {/* Shareable Link Banner with Copy Button */}
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center">
        <div className="min-w-0">
          <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            YOUR PUBLIC PAYMENT LINK
          </div>
          <div className="mt-0.5 truncate font-mono text-sm font-bold text-slate-900">
            {publicLinkUrl}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex min-h-[44px] items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-xs font-bold text-emerald-800 transition-colors hover:bg-emerald-100 active:scale-98"
          >
            {copiedLink ? "✓ Copied!" : "Copy Link"}
          </button>
          <Link
            href={`/pay/${sellerSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 active:scale-98"
          >
            Visit &rarr;
          </Link>
        </div>
      </div>

      {/* Weekly Payments HTML/CSS Bar Chart (Requirement 4) */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-slate-900">
              Payments This Week
            </h2>
            <p className="text-xs text-slate-400">
              Confirmed Lipa na M-PESA daily volume
            </p>
          </div>
          <span className="font-mono text-xs font-bold text-emerald-600">
            Past 7 Days
          </span>
        </div>

        <div className="grid h-44 grid-cols-7 items-end gap-2 border-b border-slate-100 pt-6 pb-2 sm:gap-4">
          {weeklyData.map((d, idx) => {
            const heightPercent =
              maxWeeklyAmount > 0
                ? Math.max(
                    Math.round((d.amountMinor / maxWeeklyAmount) * 100),
                    8
                  )
                : 8;

            const isToday = idx === weeklyData.length - 1;

            return (
              <div
                key={d.dateStr}
                className="group flex h-full flex-col items-center justify-end"
              >
                {/* Tooltip on hover */}
                <span className="mb-1 font-mono text-[10px] font-bold text-slate-700 opacity-0 transition-opacity group-hover:opacity-100">
                  KES {(d.amountMinor / 100).toLocaleString()}
                </span>
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full max-w-[36px] rounded-t-lg transition-all ${
                    d.amountMinor > 0
                      ? isToday
                        ? "bg-emerald-600 group-hover:bg-emerald-700"
                        : "bg-emerald-500/80 group-hover:bg-emerald-600"
                      : "bg-slate-100"
                  }`}
                />
                <span
                  className={`mt-2 text-[10px] font-bold ${
                    isToday ? "text-emerald-700" : "text-slate-500"
                  }`}
                >
                  {d.dayName}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Feed (Requirement 2 & 5) */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-black text-slate-900">
              Recent Payments & Claims
            </h2>
            <p className="text-xs text-slate-500">
              Live activity stream of claims and invoices
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/api/export/payments"
              download
              className="flex min-h-[40px] items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 active:scale-98"
            >
              <span>⬇️</span>
              <span>CSV Export</span>
            </a>
          </div>
        </div>

        {/* Filter Tabs (Min 44px tap target) */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`min-h-[44px] flex-1 rounded-xl px-3 text-xs font-bold transition-colors ${
              filter === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            All ({recentActivity.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("paid")}
            className={`min-h-[44px] flex-1 rounded-xl px-3 text-xs font-bold transition-colors ${
              filter === "paid"
                ? "bg-slate-900 text-white shadow-xs"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            Paid (
            {
              recentActivity.filter(
                (i) => i.status === "confirmed" || i.status === "paid"
              ).length
            }
            )
          </button>
          <button
            type="button"
            onClick={() => setFilter("unpaid")}
            className={`min-h-[44px] flex-1 rounded-xl px-3 text-xs font-bold transition-colors ${
              filter === "unpaid"
                ? "bg-slate-900 text-white shadow-xs"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            Unpaid / Pending (
            {
              recentActivity.filter(
                (i) =>
                  i.status === "pending" ||
                  i.status === "claimed" ||
                  i.status === "unpaid"
              ).length
            }
            )
          </button>
        </div>

        {/* List of items */}
        {filteredActivity.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
            <span className="text-3xl">📭</span>
            <p className="mt-2 text-sm font-bold text-slate-700">
              No recent activity in this tab
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Incoming payments from your payment link or invoices will appear
              here.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredActivity.map((item) => {
              const formattedDate = new Date(item.createdAt).toLocaleString(
                "en-KE",
                {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }
              );

              const formattedAmount = `KES ${(item.amountMinor / 100).toLocaleString()}`;

              const isPaid =
                item.status === "confirmed" || item.status === "paid";
              const isClaimedOrPending =
                item.status === "pending" || item.status === "claimed";

              return (
                <Link
                  key={`${item.type}-${item.id}`}
                  href={item.href}
                  className="flex min-h-[64px] flex-col justify-between gap-2 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition-all hover:border-slate-300 hover:shadow-sm sm:flex-row sm:items-center"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-900">
                        {item.title}
                      </span>
                      {item.code && (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-700">
                          {item.code}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {item.subtitle} •{" "}
                      <span className="text-slate-400">{formattedDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <span className="font-mono text-sm font-black text-slate-900">
                      {formattedAmount}
                    </span>

                    {isPaid ? (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold tracking-wider text-emerald-700 uppercase">
                        PAID
                      </span>
                    ) : isClaimedOrPending ? (
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-extrabold tracking-wider text-amber-800 uppercase">
                        {item.status === "pending"
                          ? "PENDING REVIEW"
                          : "CLAIMED"}
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold tracking-wider text-slate-600 uppercase">
                        {item.status}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
