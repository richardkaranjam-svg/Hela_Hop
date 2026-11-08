"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useToast } from "@/components/ui/Toast";
import type { PayoutMethodRecord } from "@/types/database";

import { createInvoiceAction, type InvoiceActionResult } from "../actions";

interface NewInvoiceFormProps {
  payoutMethods: PayoutMethodRecord[];
}

interface FormItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
}

export function NewInvoiceForm({ payoutMethods }: NewInvoiceFormProps) {
  const router = useRouter();
  const { success, error } = useToast();

  const [state, formAction, isPending] = useActionState<
    InvoiceActionResult | null,
    FormData
  >(createInvoiceAction, null);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [dueDate, setDueDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [selectedPayoutId, setSelectedPayoutId] = useState(
    payoutMethods.find((m) => m.is_default)?.id || payoutMethods[0]?.id || ""
  );

  // Line items list
  const [items, setItems] = useState<FormItem[]>([
    {
      id: "item-1",
      description: "",
      quantity: 1,
      unit_price: 0,
    },
  ]);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        description: "",
        quantity: 1,
        unit_price: 0,
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleItemChange = (
    id: string,
    field: "description" | "quantity" | "unit_price",
    value: string | number
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  // Calculate live total
  const totalAmount = items.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unit_price || 0),
    0
  );

  // Format payload items with minor units (cents)
  const itemsPayload = JSON.stringify(
    items.map((item) => ({
      description: item.description,
      quantity: Number(item.quantity) || 1,
      unit_price_minor: Math.round((Number(item.unit_price) || 0) * 100),
    }))
  );

  useEffect(() => {
    if (state?.success && state.message) {
      success(state.message);
      router.push("/dashboard/invoices");
    } else if (state?.errors?.general) {
      error(state.errors.general);
    }
  }, [state, success, router, error]);

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <input type="hidden" name="items_json" value={itemsPayload} />

      {/* Customer Details Box */}
      <div className="space-y-3.5 rounded-xl border border-slate-200/90 bg-slate-50 p-4">
        <h2 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-800 uppercase">
          <span>👤</span> Customer Details
        </h2>

        <div>
          <label
            htmlFor="cust-name"
            className="mb-1 block text-xs font-bold text-slate-700"
          >
            Customer Name
          </label>
          <input
            id="cust-name"
            name="customer_name"
            type="text"
            required
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="e.g. Kevin Ochieng"
            className={`min-h-[48px] w-full rounded-xl border bg-white px-3.5 py-2.5 text-base text-slate-900 transition-colors outline-none placeholder:text-slate-400 ${
              state?.errors?.customer_name
                ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                : "border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            }`}
          />
          {state?.errors?.customer_name && (
            <p className="mt-1 text-xs font-medium text-red-600">
              {state.errors.customer_name}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="cust-phone"
            className="mb-1 block text-xs font-bold text-slate-700"
          >
            WhatsApp / M-PESA Phone Number
          </label>
          <input
            id="cust-phone"
            name="customer_phone"
            type="tel"
            inputMode="tel"
            required
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="07XX XXX XXX or +2547..."
            className={`min-h-[48px] w-full rounded-xl border bg-white px-3.5 py-2.5 text-base text-slate-900 transition-colors outline-none placeholder:text-slate-400 ${
              state?.errors?.customer_phone
                ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                : "border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            }`}
          />
          {state?.errors?.customer_phone && (
            <p className="mt-1 text-xs font-medium text-red-600">
              {state.errors.customer_phone}
            </p>
          )}
          <p className="mt-1 text-[11px] text-slate-400">
            Used for WhatsApp 1-click sharing. Number is masked on the public
            link.
          </p>
        </div>
      </div>

      {/* Line Items Box */}
      <div className="space-y-3.5 rounded-xl border border-slate-200/90 bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-800 uppercase">
            <span>📦</span> Line Items
          </h2>
          <button
            type="button"
            onClick={handleAddItem}
            className="flex min-h-[36px] items-center px-2 text-xs font-bold text-emerald-600 hover:text-emerald-700"
          >
            + Add Item Row
          </button>
        </div>

        {state?.errors?.items && (
          <p className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs font-medium text-red-600">
            {state.errors.items}
          </p>
        )}

        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="space-y-2.5 rounded-xl border border-slate-200 bg-white p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-400">
                  Item #{index + 1}
                </span>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="min-h-[32px] px-1 text-xs font-bold text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>

              {/* Description */}
              <input
                type="text"
                required
                value={item.description}
                onChange={(e) =>
                  handleItemChange(item.id, "description", e.target.value)
                }
                placeholder="Item description (e.g. Vintage Denim Jacket)"
                className="min-h-[44px] w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />

              {/* Quantity & Unit Price */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-0.5 block text-[10px] font-bold text-slate-500">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(
                        item.id,
                        "quantity",
                        Math.max(1, parseInt(e.target.value) || 1)
                      )
                    }
                    className="min-h-[44px] w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-0.5 block text-[10px] font-bold text-slate-500">
                    Unit Price (KES)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={item.unit_price || ""}
                    onChange={(e) =>
                      handleItemChange(
                        item.id,
                        "unit_price",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder="0"
                    className="min-h-[44px] w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Running Grand Total */}
        <div className="flex items-center justify-between border-t border-slate-200 pt-3">
          <span className="text-sm font-bold text-slate-700">
            Total Amount (KES):
          </span>
          <span className="font-mono text-xl font-black text-emerald-700">
            KES {totalAmount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Due Date & Payout Method Box */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Due Date */}
        <div>
          <label
            htmlFor="invoice-due"
            className="mb-1 block text-xs font-bold text-slate-700"
          >
            Due Date
          </label>
          <input
            id="invoice-due"
            name="due_date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="min-h-[48px] w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* Payout Method */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label
              htmlFor="invoice-payout"
              className="block text-xs font-bold text-slate-700"
            >
              Receive Payment To
            </label>
            <Link
              href="/dashboard/payout-methods"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
            >
              + Add
            </Link>
          </div>

          <select
            id="invoice-payout"
            name="payout_method_id"
            value={selectedPayoutId}
            onChange={(e) => setSelectedPayoutId(e.target.value)}
            className="min-h-[48px] w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
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
              <span>Generating Invoice...</span>
            </>
          ) : (
            <span>Generate &amp; View Invoice &rarr;</span>
          )}
        </button>

        <Link
          href="/dashboard/invoices"
          className="flex min-h-[48px] w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 sm:w-auto"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
