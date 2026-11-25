import { redirect } from "next/navigation";

import { PaymentLinksClient } from "@/features/links/PaymentLinksClient";
import { getAppUrl } from "@/lib/app-url";
import { createClient } from "@/lib/supabase/server";

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

  if (error) throw error;

  const appUrl = getAppUrl();

  return <PaymentLinksClient initialLinks={links ?? []} appUrl={appUrl} />;
}
