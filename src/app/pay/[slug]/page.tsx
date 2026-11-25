import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { PublicPayClient } from "@/features/links/PublicPayClient";
import { getAppUrl } from "@/lib/app-url";
import type { Language } from "@/lib/i18n";
import { getPublicPaymentLink } from "@/lib/public-data";
import { generateQrDataUrl } from "@/lib/qr";

interface PayPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PayPageProps) {
  const { slug } = await params;
  const link = await getPublicPaymentLink(slug);

  if (!link) {
    return {
      title: "Payment Link Not Found | Hela Hop",
    };
  }

  return {
    title: `Pay ${link.title} | Hela Hop`,
    description: `Pay ${link.title} via M-PESA Till, Paybill, or Pochi directly.`,
  };
}

export default async function PublicPayPage({ params }: PayPageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const rawLang = cookieStore.get("hela_lang")?.value;
  const lang: Language = rawLang === "sw" ? "sw" : "en";

  const link = await getPublicPaymentLink(slug);
  if (!link) {
    notFound();
  }

  const appUrl = getAppUrl();
  const fullUrl = `${appUrl}/pay/${link.slug}`;
  const qrDataUrl = await generateQrDataUrl(fullUrl);

  return (
    <PublicPayClient
      initialLang={lang}
      slug={link.slug}
      paymentLinkId={link.id}
      sellerName={link.seller_name}
      sellerUsername={link.seller_username}
      title={link.title}
      amountMinor={link.amount_minor}
      currency={link.currency || "KES"}
      payoutMethod={link.payout}
      qrDataUrl={qrDataUrl}
      fullUrl={fullUrl}
    />
  );
}
