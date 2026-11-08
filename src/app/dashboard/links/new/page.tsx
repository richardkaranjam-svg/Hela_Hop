import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { PayoutMethodRecord } from "@/types/database";

import { NewLinkForm } from "./NewLinkForm";

export default async function NewPaymentLinkPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Fetch user profile for username
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  const username = profile?.username || user.email?.split("@")[0] || "seller";

  // 2. Fetch available payout methods
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
            Create Payment Link
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Generate a shareable link that lets your customers pay via M-PESA in
            one tap.
          </p>
        </div>

        <NewLinkForm username={username} payoutMethods={payoutMethods} />
      </div>
    </div>
  );
}
