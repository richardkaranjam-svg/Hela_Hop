import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPublicReceipt } from "@/lib/public-data";
import { generateQrDataUrl } from "@/lib/qr";

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
  const receipt = await getPublicReceipt(token);

  if (!receipt) {
    return {
      title: "Receipt Not Found | Hela Hop",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `Receipt ${receipt.receipt_number} | Hela Hop`,
    description: "Payment receipt confirmed by the seller.",
    robots: { index: false, follow: false },
  };
}

export default async function PublicReceiptPage({ params }: PageProps) {
  const { token } = await params;

  const receipt = await getPublicReceipt(token);
  if (!receipt) {
    notFound();
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const receiptUrl = `${appUrl}/r/${receipt.public_token}`;

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
    amountMinor: receipt.amount_minor,
    mpesaCode: receipt.mpesa_code,
    payerName: receipt.payer_name,
    payerPhoneMasked: receipt.payer_phone_masked,
    sellerName: receipt.seller_name,
    payoutType: receipt.payout?.type ?? null,
    payoutNumber: receipt.payout?.number ?? null,
    payoutAccountRef: receipt.payout?.account_ref ?? null,
    reference: receipt.reference,
    qrDataUrl,
    receiptUrl,
  };

  return <PublicReceiptClient receipt={receiptDetails} />;
}
