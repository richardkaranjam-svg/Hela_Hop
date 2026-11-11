import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { generateQrDataUrl } from "@/lib/qr";
import { createClient } from "@/lib/supabase/server";

import { ShareLinkActions } from "./ShareLinkActions";

export const metadata: Metadata = {
  title: "Link created | Hela Hop",
};

interface PageProps {
  searchParams: Promise<{ slug?: string }>;
}

/**
 * Shown right after a seller creates a payment link: clear confirmation,
 * the link itself, ways to share it, and how many links they now have.
 * Reached by a server redirect from createPaymentLinkAction.
 */
export default async function LinkCreatedPage({ searchParams }: PageProps) {
  const { slug } = await searchParams;
  if (!slug || !/^[a-z0-9-]{3,80}$/.test(slug)) {
    redirect("/dashboard/links");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Only the owner's own link (RLS also enforces this).
  const { data: link } = await supabase
    .from("payment_links")
    .select("slug, title, amount_minor, created_at")
    .eq("slug", slug)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!link) {
    redirect("/dashboard/links");
  }

  const [{ count: total }, { count: active }] = await Promise.all([
    supabase
      .from("payment_links")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("payment_links")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_active", true),
  ]);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const fullUrl = `${appUrl}/pay/${link.slug}`;
  const displayUrl = fullUrl.replace(/^https?:\/\//, "");

  let qrDataUrl = "";
  try {
    qrDataUrl = await generateQrDataUrl(fullUrl);
  } catch (err) {
    console.error("QR generation failed:", err);
  }

  const amountText =
    link.amount_minor == null
      ? "Customer enters the amount"
      : `KES ${(link.amount_minor / 100).toLocaleString("en-KE")}`;

  const totalLinks = total ?? 1;
  const activeLinks = active ?? 1;
  const isFirst = totalLinks === 1;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* 1. Clear confirmation */}
      <section className="rounded-2xl border border-emerald-200 bg-white p-6 text-center shadow-sm sm:p-8">
        <div
          aria-hidden="true"
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl font-black text-emerald-700"
        >
          ✓
        </div>
        <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-900">
          {isFirst ? "Your first payment link is ready!" : "Payment link created!"}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Share it with customers so they can pay you on M-PESA.
        </p>

        {/* The link */}
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
          <p className="text-[11px] font-bold tracking-wide text-slate-500 uppercase">
            {link.title}
          </p>
          <p className="mt-0.5 text-sm font-semibold text-slate-700">
            {amountText}
          </p>
          <p className="mt-2 font-mono text-sm font-bold break-all text-emerald-800">
            {displayUrl}
          </p>
        </div>

        <div className="mt-4">
          <ShareLinkActions fullUrl={fullUrl} title={link.title} />
        </div>

        {qrDataUrl && (
          <div className="mt-6 flex flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrDataUrl}
              alt={`QR code for ${link.title}`}
              width={180}
              height={180}
              className="h-[180px] w-[180px] rounded-xl border border-slate-200"
            />
            <p className="mt-2 text-xs text-slate-500">
              Customers can scan this to open your payment page.
            </p>
            <a
              href={`/api/qr?text=${encodeURIComponent(fullUrl)}&download=true&filename=helahop-${link.slug}`}
              download
              className="mt-1 inline-flex min-h-[44px] items-center px-3 text-xs font-bold text-emerald-700 underline underline-offset-2"
            >
              Download QR code
            </a>
          </div>
        )}
      </section>

      {/* 2. How many links */}
      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
          <p className="text-3xl font-black text-slate-900">{totalLinks}</p>
          <p className="mt-0.5 text-xs font-semibold text-slate-500">
            {totalLinks === 1 ? "payment link" : "payment links"} in total
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
          <p className="text-3xl font-black text-emerald-700">{activeLinks}</p>
          <p className="mt-0.5 text-xs font-semibold text-slate-500">
            active (customers can pay)
          </p>
        </div>
      </section>

      {/* 3. What next */}
      <section className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <Link
          href="/dashboard/links/new"
          className="flex min-h-[48px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          + Create another link
        </Link>
        <Link
          href="/dashboard/links"
          className="flex min-h-[48px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          View all my links &rarr;
        </Link>
      </section>
    </div>
  );
}
