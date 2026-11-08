import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import type { Language } from "@/lib/i18n";
import { getPublicInvoice, PENDING_PAYOUT } from "@/lib/public-data";

import { PublicInvoiceClient } from "./PublicInvoiceClient";

interface InvoicePageProps {
  params: Promise<{
    code: string;
  }>;
}

// The invoice page is reached by a private random link. Keep it out of search
// engines and keep the customer's name out of link previews (D10).
export async function generateMetadata({ params }: InvoicePageProps) {
  const { code } = await params;
  const inv = await getPublicInvoice(code);

  if (!inv) {
    return {
      title: "Invoice Not Found | Hela Hop",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `Invoice from ${inv.seller_name} | Hela Hop`,
    description: "Pay this invoice via M-PESA.",
    robots: { index: false, follow: false },
  };
}

export default async function PublicInvoicePage({ params }: InvoicePageProps) {
  const { code } = await params;
  const cookieStore = await cookies();
  const rawLang = cookieStore.get("hela_lang")?.value;
  const lang: Language = rawLang === "sw" ? "sw" : "en";

  const inv = await getPublicInvoice(code);
  if (!inv) {
    notFound();
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const fullUrl = `${appUrl}/i/${inv.code}`;

  return (
    <PublicInvoiceClient
      initialLang={lang}
      code={inv.code}
      sellerName={inv.seller_name}
      customerName={inv.customer_name}
      customerPhoneMasked={inv.customer_phone_masked}
      items={inv.items || []}
      totalMinor={inv.total_minor}
      currency={inv.currency || "KES"}
      dueDate={inv.due_date}
      status={inv.status}
      payoutMethod={inv.payout ?? PENDING_PAYOUT}
      fullUrl={fullUrl}
    />
  );
}
