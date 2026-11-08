import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import {
  DashboardClient,
  type ActivityItem,
  type DashboardStats,
  type DayData,
} from "./DashboardClient";

export const metadata: Metadata = {
  title: "Seller Dashboard | Hela Hop",
  description: "Monitor M-PESA payments, claims, and invoices in real-time.",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Fetch Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, username")
    .eq("id", user.id)
    .single();

  const sellerName =
    profile?.full_name ||
    profile?.username ||
    user.email?.split("@")[0] ||
    "Seller";

  // The seller's real shareable link: their newest ACTIVE payment link.
  // (The slug can carry a suffix or be custom, so it is not always the username.)
  const { data: latestLink } = await supabase
    .from("payment_links")
    .select("slug")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const publicLinkSlug: string | null = latestLink?.slug ?? null;

  // 2. Fetch Payout Methods
  const { data: payoutMethods } = await supabase
    .from("payout_methods")
    .select("type, number, account_ref, label, is_default")
    .eq("user_id", user.id);

  const defaultMethod =
    payoutMethods?.find((m) => m.is_default) || payoutMethods?.[0] || null;

  // 3. Claims Metrics (Confirmed, Month, All-time, Pending)
  // Kenya is UTC+3 all year (no daylight saving), so "today" and "this month"
  // are worked out on a +3h shifted clock. A payment confirmed at 01:00 Nairobi
  // time must count for that Nairobi day, not the previous UTC day.
  const NAIROBI_OFFSET_MS = 3 * 60 * 60 * 1000;
  const nairobiNow = new Date(Date.now() + NAIROBI_OFFSET_MS);
  const startOfMonth = new Date(
    Date.UTC(nairobiNow.getUTCFullYear(), nairobiNow.getUTCMonth(), 1) -
      NAIROBI_OFFSET_MS
  ).toISOString();
  const toNairobiDateStr = (iso: string) =>
    new Date(new Date(iso).getTime() + NAIROBI_OFFSET_MS)
      .toISOString()
      .split("T")[0];

  // A claim only changes when the seller confirms or rejects it, so for a
  // confirmed claim `updated_at` is the moment the seller confirmed it.
  const { data: allClaims } = await supabase
    .from("payment_claims")
    .select(
      `
      id,
      payer_name,
      mpesa_code,
      amount_minor,
      status,
      created_at,
      updated_at,
      receipts (
        public_token
      ),
      invoices (
        code
      ),
      payment_links (
        title
      )
    `
    )
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  const claimsList = allClaims || [];

  const confirmedClaims = claimsList.filter((c) => c.status === "confirmed");
  const pendingClaims = claimsList.filter((c) => c.status === "pending");

  const monthConfirmedClaims = confirmedClaims.filter(
    (c) => c.updated_at >= startOfMonth
  );

  const monthTotalMinor = monthConfirmedClaims.reduce(
    (sum, c) => sum + (c.amount_minor || 0),
    0
  );

  const allTimeTotalMinor = confirmedClaims.reduce(
    (sum, c) => sum + (c.amount_minor || 0),
    0
  );

  // 4. Invoices Metrics
  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, customer_name, code, total_minor, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const invoicesList = invoices || [];
  const unpaidInvoices = invoicesList.filter(
    (inv) => inv.status === "unpaid" || inv.status === "claimed"
  );

  const unpaidInvoicesTotalMinor = unpaidInvoices.reduce(
    (sum, inv) => sum + (inv.total_minor || 0),
    0
  );

  const stats: DashboardStats = {
    monthTotalMinor,
    allTimeTotalMinor,
    pendingClaimsCount: pendingClaims.length,
    unpaidInvoicesCount: unpaidInvoices.length,
    monthOrdersCount: monthConfirmedClaims.length,
    unpaidInvoicesTotalMinor,
  };

  // 5. Build 7-day Weekly Payments Data (HTML/CSS Bar Chart)
  const weeklyData: DayData[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(nairobiNow.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = day.toISOString().split("T")[0];
    const dayName = day.toLocaleDateString("en-KE", {
      weekday: "short",
      timeZone: "UTC", // `day` is already shifted to Nairobi time
    });

    // Confirmed claims whose confirmation fell on this Nairobi day
    const dayClaims = confirmedClaims.filter(
      (c) => toNairobiDateStr(c.updated_at) === dateStr
    );

    const amountMinor = dayClaims.reduce(
      (sum, c) => sum + (c.amount_minor || 0),
      0
    );

    weeklyData.push({
      dayName,
      dateStr,
      amountMinor,
      count: dayClaims.length,
    });
  }

  // 6. Build Unified Activity Stream (Top 10 claims and invoices)
  const claimActivities: ActivityItem[] = claimsList.map((c) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r: any = Array.isArray(c.receipts) ? c.receipts[0] : c.receipts;
    const publicToken = r?.public_token;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pl: any = Array.isArray(c.payment_links)
      ? c.payment_links[0]
      : c.payment_links;

    const href =
      c.status === "confirmed" && publicToken
        ? `/r/${publicToken}`
        : "/dashboard/claims";

    return {
      id: c.id,
      type: "claim",
      title: c.payer_name,
      subtitle: pl?.title ? `Link: ${pl.title}` : `Claim ${c.mpesa_code}`,
      amountMinor: c.amount_minor,
      status: c.status,
      createdAt: c.created_at,
      href,
      code: c.mpesa_code,
    };
  });

  const invoiceActivities: ActivityItem[] = invoicesList.map((inv) => ({
    id: inv.id,
    type: "invoice",
    title: inv.customer_name,
    subtitle: `Invoice #${inv.code}`,
    amountMinor: inv.total_minor,
    status: inv.status,
    createdAt: inv.created_at,
    href: `/i/${inv.code}`,
    code: inv.code,
  }));

  const recentActivity = [...claimActivities, ...invoiceActivities]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 10);

  return (
    <DashboardClient
      stats={stats}
      weeklyData={weeklyData}
      recentActivity={recentActivity}
      sellerName={sellerName}
      publicLinkSlug={publicLinkSlug}
      payoutBadge={
        defaultMethod
          ? {
              type: defaultMethod.type,
              number: defaultMethod.number,
              label: defaultMethod.label,
            }
          : null
      }
    />
  );
}
