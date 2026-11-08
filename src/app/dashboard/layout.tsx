import { redirect } from "next/navigation";

import {
  DesktopSidebar,
  MobileBottomNav,
  MobileTopBar,
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

  const userEmail = user.email ?? "Seller";

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-slate-50 text-slate-900">
        {/* Desktop Sidebar (Requirement: Desktop Sidebar Nav) */}
        <DesktopSidebar userEmail={userEmail} />

        {/* Content Container */}
        <div className="flex min-w-0 flex-1 flex-col">
          <MobileTopBar userEmail={userEmail} />

          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-24 sm:px-6 sm:py-8 lg:pb-12">
            {children}
          </main>

          {/* Mobile Bottom Tab Bar (Requirement: Bottom tab bar on mobile) */}
          <MobileBottomNav />
        </div>
      </div>
    </ToastProvider>
  );
}
