import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  // If already authenticated, redirect to /dashboard
  // Exclude /reset-password so users can complete their password reset callback
  if (user && !pathname.startsWith("/reset-password")) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Hela Hop Logo & Brand Name */}
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="group inline-flex items-center gap-2.5 rounded-xl p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-xl font-extrabold text-white shadow-md shadow-emerald-600/30 transition-colors group-hover:bg-emerald-700">
              H
            </span>
            <span className="text-2xl font-black tracking-tight text-slate-900 transition-colors group-hover:text-emerald-600">
              Hela Hop
            </span>
          </Link>
          <div className="mt-1 flex items-center justify-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
            <p className="text-xs font-semibold tracking-wide text-slate-500">
              Direct to M-PESA &bull; Built for Kenyan Hustlers
            </p>
          </div>
        </div>

        {/* Centered Auth Card */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
          {children}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-400">
          <p>
            &copy; {new Date().getFullYear()} Hela Hop &bull; Nairobi, Kenya
          </p>
        </div>
      </div>
    </div>
  );
}
