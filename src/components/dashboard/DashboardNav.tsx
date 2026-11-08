"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { signOutAction } from "@/app/(auth)/actions";

interface DashboardNavProps {
  userEmail: string;
}

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/dashboard/links", label: "Links", icon: "🔗" },
  { href: "/dashboard/invoices", label: "Invoices", icon: "🧾" },
  { href: "/dashboard/claims", label: "Claims", icon: "📩" },
  // Billers/reminders (Task 1.7) move to Week 10 (D12). Link added back then.
  { href: "/dashboard/payout-methods", label: "Payouts", icon: "💳" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
];

export function DesktopSidebar({ userEmail }: DashboardNavProps) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between border-r border-slate-200 bg-white p-5 lg:flex">
      <div>
        {/* Brand */}
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-lg font-extrabold text-white shadow-sm shadow-emerald-600/30">
            H
          </span>
          <div className="flex flex-col">
            <span className="text-base font-black tracking-tight text-slate-900">
              Hela Hop
            </span>
            <span className="text-[10px] font-bold tracking-wider text-emerald-600 uppercase">
              Seller Hub
            </span>
          </div>
        </Link>

        {/* Sidebar Nav */}
        <nav className="mt-8 space-y-1.5">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex min-h-[44px] items-center gap-3 rounded-xl px-3.5 text-xs font-bold transition-all ${
                  isActive
                    ? "bg-emerald-50 text-emerald-800 shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span className="text-base" aria-hidden="true">
                  {link.icon}
                </span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer / Sign Out */}
      <div className="border-t border-slate-100 pt-4">
        <div className="mb-3">
          <span className="block truncate text-xs font-bold text-slate-800">
            {userEmail}
          </span>
          <span className="text-[10px] text-slate-400">Seller Account</span>
        </div>

        <form action={signOutAction}>
          <button
            type="submit"
            className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 active:scale-98"
          >
            <span>Log Out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}

export function MobileTopBar({ userEmail }: DashboardNavProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white lg:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-lg p-1 focus:outline-none"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-base font-extrabold text-white shadow-sm">
            H
          </span>
          <span className="text-base font-black tracking-tight text-slate-900">
            Hela Hop
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="max-w-[120px] truncate text-[11px] font-semibold text-slate-600">
            {userEmail.split("@")[0]}
          </span>
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex min-h-[44px] items-center justify-center rounded-lg border border-slate-200 px-3 text-[11px] font-bold text-slate-600 hover:bg-slate-50"
            >
              Log Out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();

  const mobileLinks = [
    { href: "/dashboard", label: "Home", icon: "📊" },
    { href: "/dashboard/links", label: "Links", icon: "🔗" },
    { href: "/dashboard/invoices", label: "Invoices", icon: "🧾" },
    { href: "/dashboard/claims", label: "Claims", icon: "📩" },
    { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed right-0 bottom-0 left-0 z-40 border-t border-slate-200 bg-white px-1 py-1 shadow-lg lg:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-5">
        {mobileLinks.map((link) => {
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
