"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useToast } from "@/components/ui/Toast";
import type { PayoutMethodRecord } from "@/types/database";

import {
  createPaymentLinkAction,
  type PaymentLinkActionResult,
} from "../actions";

interface NewLinkFormProps {
  username: string;
  payoutMethods: PayoutMethodRecord[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function NewLinkForm({ username, payoutMethods }: NewLinkFormProps) {
  const router = useRouter();
  const { success, error } = useToast();

  const [state, formAction, isPending] = useActionState<
    PaymentLinkActionResult | null,
    FormData
  >(createPaymentLinkAction, null);

  const [title, setTitle] = useState("");
  const [amountType, setAmountType] = useState<"flexible" | "fixed">(
    "flexible"
  );
  const [amount, setAmount] = useState("");
  const [selectedPayoutId, setSelectedPayoutId] = useState(
    payoutMethods.find((m) => m.is_default)?.id || payoutMethods[0]?.id || ""
  );
  const [customSlug, setCustomSlug] = useState("");
  const [isEditingSlug, setIsEditingSlug] = useState(false);

  // Auto-generate slug from username + title
  useEffect(() => {
    if (!isEditingSlug) {
      const titleSlug = slugify(title).slice(0, 30);
      const generated = titleSlug ? `${username}-${titleSlug}` : username;
      setCustomSlug(generated);
    }
  }, [title, username, isEditingSlug]);

  useEffect(() => {
    if (state?.success && state.message) {
      success(state.message);
      router.push("/dashboard/links");
    } else if (state?.errors?.general) {
      error(state.errors.general);
    }
  }, [state, success, router, error]);

  const quickAmounts = [500, 1000, 2000, 5000];

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {/* Title / Purpose */}
      <div>
        <label
          htmlFor="link-title"
          className="mb-1 block text-xs font-bold text-slate-700"
        >
          Payment Link Title / Business Name
        </label>
        <input
          id="link-title"
          name="title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Handmade Leather Tote Bag or Mama Shiro Thrift"
          className={`min-h-[48px] w-full rounded-xl border bg-white px-3.5 py-2.5 text-base text-slate-900 transition-colors outline-none placeholder:text-slate-400 ${
            state?.errors?.title
              ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              : "border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          }`}
        />
        {state?.errors?.title && (
          <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
            <span>✕</span> {state.errors.title}
          </p>
        )}
        <p className="mt-1 text-[11px] text-slate-400">
          Customers will see this title at the top of your payment page.
        </p>
      </div>

      {/* Amount Mode Selector */}
      <div>
        <label className="mb-2 block text-xs font-bold text-slate-700">
          Payment Amount (KES)
        </label>
        <div className="mb-3 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              setAmountType("flexible");
              setAmount("");
            }}
            className={`flex min-h-[48px] items-center justify-center gap-2 rounded-xl border px-4 text-xs font-bold transition-all ${
              amountType === "flexible"
                ? "border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }`}
          >
            <span>✨</span>
            <span>Flexible / Any Amount</span>
          </button>

          <button
            type="button"
            onClick={() => setAmountType("fixed")}
            className={`flex min-h-[48px] items-center justify-center gap-2 rounded-xl border px-4 text-xs font-bold transition-all ${
              amountType === "fixed"
                ? "border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }`}
          >
            <span>🏷️</span>
            <span>Fixed Price (KES)</span>
          </button>
        </div>
        <input type="hidden" name="amount_type" value={amountType} />

        {/* Fixed Amount Input */}
        {amountType === "fixed" && (
          <div className="animate-in fade-in space-y-2 duration-150">
            <div className="relative">
              <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-xs font-bold text-slate-500">
                KES
              </span>
              <input
                id="link-amount"
                name="amount"
                type="number"
                min="1"
                max="150000"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 2500"
                className={`min-h-[48px] w-full rounded-xl border bg-white py-2.5 pr-4 pl-14 text-base font-bold text-slate-900 transition-colors outline-none placeholder:text-slate-400 ${
                  state?.errors?.amount
                    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                    : "border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                }`}
              />
            </div>

            {/* Quick Amount Suggestion Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="mr-1 text-[11px] text-slate-400">
                Quick pick:
              </span>
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(String(q))}
                  className="min-h-[44px] rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                >
                  KES {q.toLocaleString()}
                </button>
              ))}
            </div>

            {state?.errors?.amount && (
              <p className="text-xs font-medium text-red-600">
                {state.errors.amount}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Payout Destination Selection */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label
            htmlFor="link-payout"
            className="block text-xs font-bold text-slate-700"
          >
            Receive Payments To
          </label>
          <Link
            href="/dashboard/payout-methods"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
          >
            + Add New Method
          </Link>
        </div>

        {payoutMethods.length === 0 ? (
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-800">
            <span>⚠️</span>
            <div>
              <p className="font-semibold">No payout methods configured.</p>
              <p className="mt-0.5 text-amber-700">
                You need at least one Till, Paybill, Pochi, or Phone number to
                receive customer payments.
              </p>
              <Link
                href="/dashboard/payout-methods"
                className="mt-2 inline-block font-bold underline"
              >
                Add payout method now &rarr;
              </Link>
            </div>
          </div>
        ) : (
          <select
            id="link-payout"
            name="payout_method_id"
            value={selectedPayoutId}
            onChange={(e) => setSelectedPayoutId(e.target.value)}
            className="min-h-[48px] w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          >
            {payoutMethods.map((m) => (
              <option key={m.id} value={m.id}>
                {m.type.toUpperCase()}: {m.number}
                {m.account_ref ? ` (Acc: ${m.account_ref})` : ""}
                {m.label ? ` • ${m.label}` : ""}
                {m.is_default ? " [DEFAULT]" : ""}
              </option>
            ))}
          </select>
        )}
        {state?.errors?.payout_method_id && (
          <p className="mt-1.5 text-xs font-medium text-red-600">
            {state.errors.payout_method_id}
          </p>
        )}
      </div>

      {/* Slug / Public URL Box */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label
            htmlFor="link-slug"
            className="block text-xs font-bold text-slate-700"
          >
            Payment Link URL Slug
          </label>
          <button
            type="button"
            onClick={() => setIsEditingSlug(!isEditingSlug)}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
          >
            {isEditingSlug ? "Auto-generate" : "Customize slug"}
          </button>
        </div>

        <div className="relative">
          <input
            id="link-slug"
            name="custom_slug"
            type="text"
            readOnly={!isEditingSlug}
            value={customSlug}
            onChange={(e) =>
              setCustomSlug(slugify(e.target.value).slice(0, 75))
            }
            className={`min-h-[48px] w-full rounded-xl border px-3.5 py-2.5 font-mono text-sm transition-colors outline-none ${
              isEditingSlug
                ? "border-emerald-500 bg-white text-slate-900 ring-2 ring-emerald-500/20"
                : "cursor-default border-slate-200 bg-slate-100 text-slate-600"
            }`}
          />
        </div>

        {/* Live URL Preview */}
        <div className="mt-2 flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50 p-3 text-xs text-slate-600">
          <span>🔗 Preview:</span>
          <span className="truncate font-mono font-bold text-slate-900">
            helahop.app/pay/{customSlug || username}
          </span>
        </div>
      </div>

      {/* Submit / Cancel Buttons */}
      <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row">
        <button
          type="submit"
          disabled={isPending || payoutMethods.length === 0}
          className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {isPending ? (
            <>
              <svg
                className="mr-2 -ml-1 h-4 w-4 animate-spin text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Creating Link...</span>
            </>
          ) : (
            <span>Create Payment Link &rarr;</span>
          )}
        </button>

        <Link
          href="/dashboard/links"
          className="flex min-h-[48px] w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 sm:w-auto"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
