import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import type { Language } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";
import type { InvoiceItem, InvoiceStatus } from "@/types/database";

import { PublicInvoiceClient } from "./PublicInvoiceClient";

interface InvoicePageProps {
  params: Promise<{
    code: string;
  }>;
}

export async function generateMetadata({ params }: InvoicePageProps) {
  const { code } = await params;
  const supabase = await createClient();

  const { data: inv } = await supabase
    .from("invoices")
    .select("code, customer_name, total_minor")
    .eq("code", code)
    .maybeSingle();

  if (!inv) {
    return {
      title: "Invoice Not Found | Hela Hop",
    };
  }

  const amountStr = `KES ${(inv.total_minor / 100).toLocaleString()}`;
  return {
    title: `Invoice #${inv.code} (${amountStr}) | Hela Hop`,
    description: `Pay invoice for ${inv.customer_name} via M-PESA.`,
  };
}

export default async function PublicInvoicePage({ params }: InvoicePageProps) {
  const { code } = await params;
  const cookieStore = await cookies();
  const rawLang = cookieStore.get("hela_lang")?.value;
  const lang: Language = rawLang === "sw" ? "sw" : "en";

  const supabase = await createClient();

  // 1. Fetch invoice
  const { data: inv, error: invError } = await supabase
    .from("invoices")
    .select(
      `
      id,
      code,
      user_id,
      customer_name,
      customer_phone,
      items,
      total_minor,
      currency,
      due_date,
      status,
      payout_method_id
    `
    )
    .eq("code", code)
    .maybeSingle();

  if (invError || !inv) {
    notFound();
  }

  // 2. Fetch seller profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, username")
    .eq("id", inv.user_id)
    .single();

  const sellerName =
    profile?.full_name || profile?.username || "Hela Hop Seller";
  const sellerUsername = profile?.username || "seller";

  // 3. Fetch payout method
  let payoutMethodData = null;
  if (inv.payout_method_id) {
    const { data: method } = await supabase
      .from("payout_methods")
      .select("type, number, account_ref, label")
      .eq("id", inv.payout_method_id)
      .maybeSingle();
    payoutMethodData = method;
  }

  if (!payoutMethodData) {
    const { data: defaultMethod } = await supabase
      .from("payout_methods")
      .select("type, number, account_ref, label")
      .eq("user_id", inv.user_id)
      .eq("is_default", true)
      .maybeSingle();
    payoutMethodData = defaultMethod;
  }

  if (!payoutMethodData) {
    const { data: anyMethod } = await supabase
      .from("payout_methods")
      .select("type, number, account_ref, label")
      .eq("user_id", inv.user_id)
      .limit(1)
      .maybeSingle();
    payoutMethodData = anyMethod;
  }

  const payoutMethod = payoutMethodData || {
    type: "till" as const,
    number: "Pending Setup",
    account_ref: null,
    label: "Seller payout method pending",
  };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const fullUrl = `${appUrl}/i/${inv.code}`;

  const items = (inv.items as unknown as InvoiceItem[]) || [];

  return (
    <PublicInvoiceClient
      initialLang={lang}
      code={inv.code}
      sellerName={sellerName}
      sellerUsername={sellerUsername}
      customerName={inv.customer_name}
      customerPhone={inv.customer_phone}
      items={items}
      totalMinor={inv.total_minor}
      currency={inv.currency || "KES"}
      dueDate={inv.due_date}
      status={inv.status as InvoiceStatus}
      payoutMethod={payoutMethod}
      fullUrl={fullUrl}
    />
  );
}
