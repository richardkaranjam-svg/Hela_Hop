import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { PaymentLinksClient, type PaymentLinkItem } from "./PaymentLinksClient";

export default async function PaymentLinksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch payment links with their payout method details
  const { data: links, error } = await supabase
    .from("payment_links")
    .select(
      `
      id,
      slug,
      title,
      currency,
      amount_minor,
      is_active,
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
    console.error("Error fetching payment links:", error);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <PaymentLinksClient
      initialLinks={(links as unknown as PaymentLinkItem[]) || []}
      appUrl={appUrl}
    />
  );
}
