import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { generateQrDataUrl } from "@/lib/qr";
import { createClient } from "@/lib/supabase/server";

import {
  PublicReceiptClient,
  type ReceiptDetails,
} from "./PublicReceiptClient";

interface PageProps {
  params: Promise<{
    token: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { token } = await params;
  const supabase = await createClient();

  const { data: receipt } = await supabase
    .from("receipts")
    .select("receipt_number")
    .eq("public_token", token)
    .maybeSingle();

  if (!receipt) {
    return {
      title: "Receipt Not Found | Hela Hop",
    };
  }

  return {
    title: `Receipt ${receipt.receipt_number} | Hela Hop`,
    description: "Verified payment receipt confirmed by seller.",
  };
}

export default async function PublicReceiptPage({ params }: PageProps) {
  const { token } = await params;
  const supabase = await createClient();

  // 1. Fetch receipt
  const { data: receipt } = await supabase
    .from("receipts")
    .select("id, receipt_number, public_token, created_at, seller_id, claim_id")
    .eq("public_token", token)
    .maybeSingle();

  if (!receipt) {
    notFound();
  }

  // 2. Fetch claim details
  const { data: claim } = await supabase
    .from("payment_claims")
    .select(
      "id, payer_name, payer_phone, mpesa_code, amount_minor, created_at, invoice_id, payment_link_id"
    )
    .eq("id", receipt.claim_id)
    .single();

  if (!claim) {
    notFound();
  }

  // 3. Fetch seller profile
  const { data: seller } = await supabase
    .from("profiles")
    .select("id, business_name, full_name, slug")
    .eq("id", receipt.seller_id)
    .single();

  const sellerName =
    seller?.business_name || seller?.full_name || "Hela Hop Seller";

  // 4. Fetch associated context (invoice or payment link) and payout method
  let payoutType: string | null = null;
  let payoutNumber: string | null = null;
  let payoutAccountRef: string | null = null;
  let contextTitle: string | null = null;
  let invoiceCode: string | null = null;

  if (claim.invoice_id) {
    const { data: inv } = await supabase
      .from("invoices")
      .select(
        `
        code,
        payout_methods (
          type,
          number,
          account_ref
        )
      `
      )
      .eq("id", claim.invoice_id)
      .maybeSingle();

    if (inv) {
      invoiceCode = inv.code;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pm: any = Array.isArray(inv.payout_methods)
        ? inv.payout_methods[0]
        : inv.payout_methods;
      if (pm) {
        payoutType = pm.type;
        payoutNumber = pm.number;
        payoutAccountRef = pm.account_ref;
      }
    }
  } else if (claim.payment_link_id) {
    const { data: pl } = await supabase
      .from("payment_links")
      .select(
        `
        title,
        payout_methods (
          type,
          number,
          account_ref
        )
      `
      )
      .eq("id", claim.payment_link_id)
      .maybeSingle();

    if (pl) {
      contextTitle = pl.title;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pm: any = Array.isArray(pl.payout_methods)
        ? pl.payout_methods[0]
        : pl.payout_methods;
      if (pm) {
        payoutType = pm.type;
        payoutNumber = pm.number;
        payoutAccountRef = pm.account_ref;
      }
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://helahop.co.ke";
  const receiptUrl = `${appUrl}/r/${receipt.public_token}`;

  // 5. Generate QR Code
  let qrDataUrl = "";
  try {
    qrDataUrl = await generateQrDataUrl(receiptUrl);
  } catch (err) {
    console.error("Failed to generate QR for receipt:", err);
  }

  const receiptDetails: ReceiptDetails = {
    receiptNumber: receipt.receipt_number,
    publicToken: receipt.public_token,
    createdAt: receipt.created_at,
    amountMinor: claim.amount_minor,
    mpesaCode: claim.mpesa_code,
    payerName: claim.payer_name,
    payerPhone: claim.payer_phone,
    sellerName,
    sellerSlug: seller?.slug || null,
    payoutType,
    payoutNumber,
    payoutAccountRef,
    contextTitle,
    invoiceCode,
    qrDataUrl,
    receiptUrl,
  };

  return <PublicReceiptClient receipt={receiptDetails} />;
}
