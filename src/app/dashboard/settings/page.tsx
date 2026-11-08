import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, username, full_name, phone")
    .eq("id", user.id)
    .single();

  const initialProfile = {
    email: profile?.email || user.email || "",
    username: profile?.username || "",
    full_name: profile?.full_name || null,
    phone: profile?.phone || null,
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <h1 className="text-xl font-black tracking-tight text-slate-900">
            Seller Profile &amp; Link Settings
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Update your business name, contact phone, and public payment link
            slug.
          </p>
        </div>

        <SettingsForm initialProfile={initialProfile} />
      </div>
    </div>
  );
}
