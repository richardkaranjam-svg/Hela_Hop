import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch seller profile & payout methods
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: payoutMethods } = await supabase
    .from("payout_methods")
    .select("*")
    .eq("user_id", user.id);

  const defaultMethod = payoutMethods?.find((m) => m.is_default);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"></span>
              Seller Account Active
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Jambo, {profile?.full_name || profile?.username || user.email}!
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Configure your M-PESA receiving method and seller profile below.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/payout-methods"
              className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-emerald-700"
            >
              <span>+ Add Payout Method</span>
            </Link>
          </div>
        </div>

        {/* Quick Status Cards */}
        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-4">
            <span className="block text-xs font-bold tracking-wider text-slate-500 uppercase">
              Payment Link
            </span>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="truncate font-mono text-sm font-bold text-slate-900">
                helahop.app/pay/{profile?.username || "..."}
              </span>
            </div>
            <Link
              href="/dashboard/settings"
              className="mt-2 inline-block text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Edit link slug &rarr;
            </Link>
          </div>

          <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-4">
            <span className="block text-xs font-bold tracking-wider text-slate-500 uppercase">
              Default Payout
            </span>
            {defaultMethod ? (
              <div className="mt-1">
                <span className="block truncate text-sm font-bold text-slate-900">
                  {defaultMethod.label || defaultMethod.number}
                </span>
                <span className="font-mono text-xs text-slate-500 uppercase">
                  {defaultMethod.type}: {defaultMethod.number}
                </span>
              </div>
            ) : (
              <div className="mt-1">
                <span className="block text-xs font-semibold text-amber-700">
                  ⚠️ No payout method set
                </span>
                <Link
                  href="/dashboard/payout-methods"
                  className="mt-1 inline-block text-xs font-bold text-emerald-600 hover:text-emerald-700"
                >
                  Set up now &rarr;
                </Link>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-4">
            <span className="block text-xs font-bold tracking-wider text-slate-500 uppercase">
              Connected Phone
            </span>
            <div className="mt-1 font-mono text-sm font-bold text-slate-900">
              {profile?.phone || "Not configured"}
            </div>
            <Link
              href="/dashboard/settings"
              className="mt-2 inline-block text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              {profile?.phone ? "Update phone" : "Add phone"} &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation shortcuts */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/payout-methods"
          className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-emerald-500"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-lg font-bold text-emerald-700">
              💳
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 transition-colors group-hover:text-emerald-600">
                Manage Payout Methods
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Add Till, Paybill, Pochi la Biashara, or Send Money numbers.
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/settings"
          className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-emerald-500"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-lg font-bold text-blue-700">
              ⚙️
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 transition-colors group-hover:text-blue-600">
                Seller Profile &amp; Link Slug
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Update full name, phone number, and custom payment link slug.
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
