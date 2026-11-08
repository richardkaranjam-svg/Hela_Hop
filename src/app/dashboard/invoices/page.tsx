import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { InvoicesListClient, type InvoiceListItem } from "./InvoicesListClient";

export default async function InvoicesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Fetch user profile for seller business name
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, username")
    .eq("id", user.id)
    .single();

  const sellerName =
    profile?.full_name || profile?.username || "Hela Hop Seller";

  // 2. Fetch invoices with payout method information
  const { data: invoices, error } = await supabase
    .from("invoices")
    .select(
      `
      id,
      code,
      customer_name,
      customer_phone,
      items,
      total_minor,
      currency,
      due_date,
      status,
      created_at,
      payout_methods:payout_method_id (
        type,
        number,
        account_ref,
        label
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching invoices:", error);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <InvoicesListClient
      initialInvoices={(invoices as unknown as InvoiceListItem[]) || []}
      appUrl={appUrl}
      sellerName={sellerName}
    />
  );
}
