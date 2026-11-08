import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { PayoutMethodRecord } from "@/types/database";

import { PayoutMethodsClient } from "./PayoutMethodsClient";

export default async function PayoutMethodsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: methods, error } = await supabase
    .from("payout_methods")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading payout methods:", error);
  }

  const initialMethods = (methods as PayoutMethodRecord[]) || [];

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          Payout Methods
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage how and where you receive customer payments via M-PESA.
        </p>
      </div>

      <PayoutMethodsClient initialMethods={initialMethods} />
    </div>
  );
}
