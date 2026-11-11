import type { Metadata } from "next";

import { generateQrDataUrl } from "@/lib/qr";

import OverviewClient, { type OverviewTab } from "./OverviewClient";

export const metadata: Metadata = {
  title: "App Overview (No Account Needed) | Hela Hop",
  description:
    "Interactive walkthrough of Hela Hop M-PESA payment links, seller claim confirmation, invoices, and receipts using sample data.",
};

const VALID_TABS = new Set<OverviewTab>([
  "pay",
  "dashboard",
  "invoice",
  "receipt",
]);

function parseInitialTab(raw: string | undefined): OverviewTab {
  if (raw && VALID_TABS.has(raw as OverviewTab)) {
    return raw as OverviewTab;
  }
  return "pay";
}

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const resolvedParams = await searchParams;
  const initialTab = parseInitialTab(resolvedParams.tab);

  const appOrigin =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") ||
    "https://hela-hop.vercel.app";
  const samplePayUrl = `${appOrigin}/pay/mama-shiro-thrift`;
  const qrDataUrl = await generateQrDataUrl(samplePayUrl);

  return (
    <OverviewClient
      initialTab={initialTab}
      qrDataUrl={qrDataUrl}
      samplePayUrl={samplePayUrl}
    />
  );
}
