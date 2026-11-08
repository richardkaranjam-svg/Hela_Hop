import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { ClaimsClient, type ClaimItem } from "./ClaimsClient";

export const metadata: Metadata = {
  title: "Payment Claims | Hela Hop",
  description: "Review and confirm buyer M-PESA payment claims.",
};

export default async function ClaimsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch claims with attached invoice, payment link, and receipt info
  const { data: rawClaims, error } = await supabase
    .from("payment_claims")
    .select(
      `
      id,
      seller_id,
      invoice_id,
      payment_link_id,
      payer_name,
      payer_phone,
      mpesa_code,
      amount_minor,
      status,
      reject_reason,
      created_at,
      receipts (
        public_token,
        receipt_number
      ),
      invoices (
        code
      ),
      payment_links (
        title,
        slug
      )
    `
    )
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching claims:", error);
  }

  // Normalize joined data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initialClaims: ClaimItem[] = (rawClaims || []).map((c: any) => {
    const receipt = Array.isArray(c.receipts)
      ? c.receipts[0] || null
      : c.receipts || null;
    const invoice = Array.isArray(c.invoices)
      ? c.invoices[0] || null
      : c.invoices || null;
    const link = Array.isArray(c.payment_links)
      ? c.payment_links[0] || null
      : c.payment_links || null;

    return {
      id: c.id,
      seller_id: c.seller_id,
      invoice_id: c.invoice_id,
      payment_link_id: c.payment_link_id,
      payer_name: c.payer_name,
      payer_phone: c.payer_phone,
      mpesa_code: c.mpesa_code,
      amount_minor: c.amount_minor,
      status: c.status,
      reject_reason: c.reject_reason,
      created_at: c.created_at,
      receipt: receipt
        ? {
            public_token: receipt.public_token,
            receipt_number: receipt.receipt_number,
          }
        : null,
      invoices: invoice ? { code: invoice.code } : null,
      payment_links: link ? { title: link.title, slug: link.slug } : null,
    };
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://helahop.co.ke";

  return <ClaimsClient initialClaims={initialClaims} appUrl={appUrl} />;
}
