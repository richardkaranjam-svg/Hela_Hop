import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { PayoutMethodRecord } from "@/types/database";

import { NewInvoiceForm } from "./NewInvoiceForm";

export default async function NewInvoicePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch available payout methods for the seller
  const { data: methods } = await supabase
    .from("payout_methods")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false });

  const payoutMethods = (methods as PayoutMethodRecord[]) || [];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <h1 className="text-xl font-black tracking-tight text-slate-900">
            Create Invoice
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Send an itemized bill with 1-tap M-PESA payment instructions.
          </p>
        </div>

        <NewInvoiceForm payoutMethods={payoutMethods} />
      </div>
    </div>
  );
}
