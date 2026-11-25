import { NextResponse } from "next/server";

import { escapeCsvCell } from "@/lib/format/csv";
import { createClient } from "@/lib/supabase/server";

/** YYYY-MM-DD in Kenyan time (a 01:30 EAT payment belongs to that day). */
const nairobiDate = (d: Date) =>
  d.toLocaleDateString("en-CA", { timeZone: "Africa/Nairobi" });

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Fetch confirmed claims with receipts, invoices, and payment links
  const { data: claims, error } = await supabase
    .from("payment_claims")
    .select(
      `
      id,
      payer_name,
      payer_phone,
      mpesa_code,
      amount_minor,
      created_at,
      receipts (
        receipt_number
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
    .eq("status", "confirmed")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching export claims:", error);
    return new NextResponse("Failed to export data", { status: 500 });
  }

  // Build CSV content
  const headers = [
    "Date",
    "Payer Name",
    "Payer Phone",
    "Amount (KES)",
    "M-PESA Code",
    "Reference",
    "Receipt Number",
  ];

  const rows = (claims || []).map((c) => {
    const date = nairobiDate(new Date(c.created_at));
    const amount = (c.amount_minor / 100).toFixed(2);
    const r = Array.isArray(c.receipts) ? c.receipts[0] : c.receipts;
    const receiptNum = r?.receipt_number || "N/A";
    const inv = Array.isArray(c.invoices) ? c.invoices[0] : c.invoices;
    const pl = Array.isArray(c.payment_links)
      ? c.payment_links[0]
      : c.payment_links;

    const reference = inv
      ? `Invoice #${inv.code}`
      : pl
        ? `Link: ${pl.title}`
        : "Direct Payment";

    return [
      escapeCsvCell(date),
      escapeCsvCell(c.payer_name),
      escapeCsvCell(c.payer_phone),
      escapeCsvCell(amount),
      escapeCsvCell(c.mpesa_code),
      escapeCsvCell(reference),
      escapeCsvCell(receiptNum),
    ].join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\r\n");
  const today = nairobiDate(new Date());

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="helahop-payments-${today}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
