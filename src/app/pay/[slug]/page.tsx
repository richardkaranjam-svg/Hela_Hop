import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import type { Language } from "@/lib/i18n";
import { generateQrDataUrl } from "@/lib/qr";
import { createClient } from "@/lib/supabase/server";

import { PublicPayClient } from "./PublicPayClient";

interface PayPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PayPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: link } = await supabase
    .from("payment_links")
    .select("title")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

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

  const supabase = await createClient();

  // 1. Fetch payment link
  const { data: link, error: linkError } = await supabase
    .from("payment_links")
    .select(
      `
      id,
      slug,
      user_id,
      title,
      currency,
      amount_minor,
      is_active,
      payout_method_id
    `
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (linkError || !link) {
    notFound();
  }

  // 2. Fetch merchant profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, username")
    .eq("id", link.user_id)
    .single();

  const sellerName =
    profile?.full_name || profile?.username || "Hela Hop Seller";
  const sellerUsername = profile?.username || "seller";

  // 3. Fetch payout method (either explicitly specified on the link, or user's default)
  let payoutMethodData = null;

  if (link.payout_method_id) {
    const { data: method } = await supabase
      .from("payout_methods")
      .select("type, number, account_ref, label")
      .eq("id", link.payout_method_id)
      .maybeSingle();

    payoutMethodData = method;
  }

  if (!payoutMethodData) {
    // Fallback to seller's default payout method
    const { data: defaultMethod } = await supabase
      .from("payout_methods")
      .select("type, number, account_ref, label")
      .eq("user_id", link.user_id)
      .eq("is_default", true)
      .maybeSingle();

    payoutMethodData = defaultMethod;
  }

  // Final fallback to any payout method if none default
  if (!payoutMethodData) {
    const { data: anyMethod } = await supabase
      .from("payout_methods")
      .select("type, number, account_ref, label")
      .eq("user_id", link.user_id)
      .limit(1)
      .maybeSingle();

    payoutMethodData = anyMethod;
  }

  // If seller hasn't set any payout method yet, display fallback
  const payoutMethod = payoutMethodData || {
    type: "till" as const,
    number: "Pending Setup",
    account_ref: null,
    label: "Seller is configuring their payout destination",
  };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const fullUrl = `${appUrl}/pay/${link.slug}`;

  // 4. Generate QR code data URL server-side (Requirement 4)
  const qrDataUrl = await generateQrDataUrl(fullUrl);

  return (
    <PublicPayClient
      initialLang={lang}
      slug={link.slug}
      sellerName={sellerName}
      sellerUsername={sellerUsername}
      title={link.title}
      amountMinor={link.amount_minor}
      currency={link.currency || "KES"}
      payoutMethod={payoutMethod}
      qrDataUrl={qrDataUrl}
      fullUrl={fullUrl}
    />
  );
}
