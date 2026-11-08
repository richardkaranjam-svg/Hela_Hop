"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { signOutAction } from "@/app/(auth)/actions";

interface DashboardNavProps {
  userEmail: string;
}

export function DashboardHeader({ userEmail }: DashboardNavProps) {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Overview", icon: "📊" },
    { href: "/dashboard/invoices", label: "Invoices", icon: "🧾" },
    { href: "/dashboard/links", label: "Payment Links", icon: "🔗" },
    { href: "/dashboard/payout-methods", label: "Payout Methods", icon: "💳" },
    { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-lg font-extrabold text-white shadow-sm shadow-emerald-600/30">
              H
            </span>
            <div className="flex flex-col">
              <span className="text-base leading-tight font-black tracking-tight text-slate-900">
                Hela Hop
              </span>
              <span className="text-[10px] font-bold tracking-wider text-emerald-600 uppercase">
                Seller Hub
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden items-center gap-1 lg:flex">
            {links.map((link) => {
              const isActive =
                link.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex min-h-[44px] items-center gap-1.5 rounded-lg px-3 text-xs font-bold transition-colors ${
                    isActive
                      ? "bg-emerald-50 font-extrabold text-emerald-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span aria-hidden="true">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right action / user profile */}
        <div className="flex items-center gap-3">
          <div className="hidden flex-col text-right sm:flex">
            <span className="max-w-[180px] truncate text-xs font-semibold text-slate-700">
              {userEmail}
            </span>
            <span className="text-[10px] text-slate-400">Seller Account</span>
          </div>

          <form action={signOutAction}>
            <button
              type="submit"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
              title="Sign out of your account"
            >
              <span>Log Out</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Home", icon: "📊" },
    { href: "/dashboard/invoices", label: "Invoices", icon: "🧾" },
    { href: "/dashboard/links", label: "Links", icon: "🔗" },
    { href: "/dashboard/payout-methods", label: "Payouts", icon: "💳" },
    { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed right-0 bottom-0 left-0 z-40 border-t border-slate-200 bg-white px-1 py-1 shadow-lg lg:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-5">
        {links.map((link) => {
          const isActive =
            link.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex min-h-[50px] flex-col items-center justify-center gap-0.5 rounded-xl transition-colors ${
                isActive
                  ? "font-bold text-emerald-600"
                  : "font-medium text-slate-500 hover:text-slate-900"
              }`}
            >
              <span className="text-base leading-none" aria-hidden="true">
                {link.icon}
              </span>
              <span className="truncate text-[10px] leading-tight">
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
