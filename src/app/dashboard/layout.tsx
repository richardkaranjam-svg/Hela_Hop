import { redirect } from "next/navigation";

import {
  DashboardHeader,
  MobileBottomNav,
} from "@/components/dashboard/DashboardNav";
import { ToastProvider } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
        <DashboardHeader userEmail={user.email ?? "Seller"} />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-24 sm:px-6 sm:py-8 md:pb-12">
          {children}
        </main>
        <MobileBottomNav />
      </div>
    </ToastProvider>
  );
}
