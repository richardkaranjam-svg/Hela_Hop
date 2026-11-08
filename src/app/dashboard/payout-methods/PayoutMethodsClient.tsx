"use client";

import { useActionState, useEffect, useState, useTransition } from "react";

import { useToast } from "@/components/ui/Toast";
import type { PayoutMethodRecord, PayoutMethodType } from "@/types/database";

import {
  createPayoutMethodAction,
  deletePayoutMethodAction,
  setDefaultPayoutMethodAction,
  type PayoutMethodActionResult,
} from "../actions";

interface PayoutMethodsClientProps {
  initialMethods: PayoutMethodRecord[];
}

export function PayoutMethodsClient({
  initialMethods,
}: PayoutMethodsClientProps) {
  const { success, error } = useToast();
  const [methods, setMethods] = useState<PayoutMethodRecord[]>(initialMethods);
  const [selectedType, setSelectedType] = useState<PayoutMethodType>("till");
  const [number, setNumber] = useState("");
  const [accountRef, setAccountRef] = useState("");
  const [label, setLabel] = useState("");
  const [isDefault, setIsDefault] = useState(methods.length === 0);
  const [clientErrors, setClientErrors] = useState<{
    number?: string;
    account_ref?: string;
  }>({});

  const [state, formAction, isPending] = useActionState<
    PayoutMethodActionResult | null,
    FormData
  >(createPayoutMethodAction, null);

  const [isDeleting, startDeleteTransition] = useTransition();
  const [isSettingDefault, startSetDefaultTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Sync initialMethods when revalidated
  useEffect(() => {
    setMethods(initialMethods);
    if (initialMethods.length === 0) {
      setIsDefault(true);
    }
  }, [initialMethods]);

  // Toast feedback on create action
  useEffect(() => {
    if (state?.success && state.message) {
      success(state.message);
      // Reset form
      setNumber("");
      setAccountRef("");
      setLabel("");
      setClientErrors({});
    } else if (state?.errors?.general) {
      error(state.errors.general);
    }
  }, [state, success, error]);

  const validateNumber = (val: string, type: PayoutMethodType) => {
    const clean = val.trim().replace(/[\s\-]/g, "");
    if (!clean) return "Number is required.";
    if (type === "till" || type === "paybill") {
      if (!/^\d{5,7}$/.test(clean)) {
        return `${type === "till" ? "Till" : "Paybill"} number must be 5 to 7 digits.`;
      }
    } else {
      // Pochi or Phone
      let phoneClean = clean;
      if (phoneClean.startsWith("0")) {
        phoneClean = "+254" + phoneClean.slice(1);
      } else if (phoneClean.startsWith("254")) {
        phoneClean = "+" + phoneClean;
      } else if (!phoneClean.startsWith("+254") && phoneClean.length === 9) {
        phoneClean = "+254" + phoneClean;
      }
      if (!/^\+254(7\d{8}|1\d{8})$/.test(phoneClean)) {
        return "Must be a valid Kenyan mobile number (+2547... or 07...).";
      }
    }
    return undefined;
  };

  const validateAccountRef = (val: string, type: PayoutMethodType) => {
    if (type === "paybill" && !val.trim()) {
      return "Account reference is required for Paybill.";
    }
    return undefined;
  };

  const handleSetDefault = (id: string) => {
    startSetDefaultTransition(async () => {
      const res = await setDefaultPayoutMethodAction(id);
      if (res.success) {
        success(res.message || "Default payout method updated.");
        setMethods((prev) =>
          prev.map((m) => ({ ...m, is_default: m.id === id }))
        );
      } else {
        error(res.message || "Failed to update default method.");
      }
    });
  };

  const handleDelete = (id: string, methodLabel: string) => {
    if (!window.confirm(`Are you sure you want to delete ${methodLabel}?`)) {
      return;
    }
    setDeletingId(id);
    startDeleteTransition(async () => {
      const res = await deletePayoutMethodAction(id);
      if (res.success) {
        success(res.message || "Payout method removed.");
        setMethods((prev) => prev.filter((m) => m.id !== id));
      } else {
        error(res.message || "Failed to delete payout method.");
      }
      setDeletingId(null);
    });
  };

  const numberError = state?.errors?.number || clientErrors.number;
  const accountRefError =
    state?.errors?.account_ref || clientErrors.account_ref;

  const typeConfig: Record<
    PayoutMethodType,
    {
      icon: string;
      title: string;
      hint: string;
      numLabel: string;
      placeholder: string;
    }
  > = {
    till: {
      icon: "🏪",
      title: "Buy Goods Till",
      hint: "5 to 7 digits Safaricom Till number",
      numLabel: "Till Number",
      placeholder: "e.g. 5492103",
    },
    paybill: {
      icon: "🏢",
      title: "Paybill Number",
      hint: "5 to 7 digits business shortcode with account reference",
      numLabel: "Paybill Business Number",
      placeholder: "e.g. 247247",
    },
    pochi: {
      icon: "👛",
      title: "Pochi la Biashara",
      hint: "Safaricom line registered for Pochi la Biashara",
      numLabel: "Pochi Phone Number",
      placeholder: "07XX XXX XXX or +2547...",
    },
    phone: {
      icon: "📱",
      title: "Send Money Phone",
      hint: "Personal M-PESA line for direct send money transfers",
      numLabel: "M-PESA Mobile Number",
      placeholder: "07XX XXX XXX or +2547...",
    },
  };

  return (
    <div className="space-y-8">
      {/* Existing Payout Methods List */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-900">
              Active Payout Methods
            </h2>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Where customer funds are directed when they make an M-PESA
              payment.
            </p>
          </div>
          <span className="self-start rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500 sm:self-auto">
            {methods.length} {methods.length === 1 ? "Method" : "Methods"}
          </span>
        </div>

        {methods.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
            <span className="mb-2 block text-3xl" aria-hidden="true">
              💳
            </span>
            <h3 className="text-sm font-bold text-slate-800">
              No Payout Methods Yet
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
              Add your Till, Paybill, Pochi, or Phone number below so customers
              can pay you directly on M-PESA.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {methods.map((method) => {
              const cfg = typeConfig[method.type] || typeConfig.till;
              return (
                <div
                  key={method.id}
                  className={`flex flex-col justify-between rounded-xl border p-4 transition-all ${
                    method.is_default
                      ? "border-emerald-500 bg-emerald-50/40 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div>
                    {/* Header: Icon, Type Badge & Default Badge */}
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl" aria-hidden="true">
                          {cfg.icon}
                        </span>
                        <span className="text-[11px] font-extrabold tracking-wide text-slate-600 uppercase">
                          {cfg.title}
                        </span>
                      </div>
                      {method.is_default ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          <span>✓</span> DEFAULT
                        </span>
                      ) : null}
                    </div>

                    {/* Method details */}
                    <div className="mt-2">
                      <div className="font-mono text-base font-black tracking-tight text-slate-900">
                        {method.number}
                        {method.account_ref && (
                          <span className="ml-2 font-sans text-xs font-semibold text-slate-500">
                            (Acc: {method.account_ref})
                          </span>
                        )}
                      </div>
                      {method.label && (
                        <p className="mt-0.5 text-xs font-medium text-slate-500">
                          {method.label}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                    {!method.is_default ? (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(method.id)}
                        disabled={isSettingDefault}
                        className="flex min-h-[44px] items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-emerald-700 transition-all hover:bg-emerald-100/60 active:scale-95"
                      >
                        Set as Default
                      </button>
                    ) : (
                      <span className="text-xs font-medium text-slate-400">
                        Primary receiver
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(method.id, method.label || method.number)
                      }
                      disabled={isDeleting && deletingId === method.id}
                      className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-red-600 transition-all hover:bg-red-50 active:scale-95 disabled:opacity-50"
                      aria-label={`Delete ${method.label || method.number}`}
                    >
                      {isDeleting && deletingId === method.id ? (
                        <span>Deleting...</span>
                      ) : (
                        <span>Delete</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Payout Method Form */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <h2 className="text-xl font-black tracking-tight text-slate-900">
            Add Payout Method
          </h2>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Where do you want customers to pay? Choose your existing M-PESA
            receiving method.
          </p>
        </div>

        {/* 4-Way Method Selector Grid (Large tap targets min 44px) */}
        <div className="mb-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {(["till", "paybill", "pochi", "phone"] as PayoutMethodType[]).map(
            (t) => {
              const isSel = selectedType === t;
              const cfg = typeConfig[t];
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setSelectedType(t);
                    setClientErrors({});
                  }}
                  className={`flex min-h-[60px] flex-col items-center justify-center gap-1 rounded-xl border p-3 text-center transition-all ${
                    isSel
                      ? "border-emerald-600 bg-emerald-50 font-extrabold text-emerald-950 shadow-sm ring-2 ring-emerald-500/20"
                      : "border-slate-200 bg-white font-bold text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <span className="text-xl" aria-hidden="true">
                    {cfg.icon}
                  </span>
                  <span className="text-xs leading-snug">{cfg.title}</span>
                </button>
              );
            }
          )}
        </div>

        {/* Dynamic Form */}
        <form action={formAction} className="space-y-4" noValidate>
          <input type="hidden" name="type" value={selectedType} />

          {/* Number Field */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label
                htmlFor="method-number"
                className="block text-xs font-bold text-slate-700"
              >
                {typeConfig[selectedType].numLabel}
              </label>
              <span className="text-[11px] text-slate-400">
                {typeConfig[selectedType].hint}
              </span>
            </div>
            <input
              id="method-number"
              name="number"
              type={
                selectedType === "till" || selectedType === "paybill"
                  ? "tel"
                  : "tel"
              }
              inputMode={
                selectedType === "till" || selectedType === "paybill"
                  ? "numeric"
                  : "tel"
              }
              required
              value={number}
              onChange={(e) => {
                setNumber(e.target.value);
                if (clientErrors.number) {
                  setClientErrors((prev) => ({
                    ...prev,
                    number: validateNumber(e.target.value, selectedType),
                  }));
                }
              }}
              onBlur={() => {
                const err = validateNumber(number, selectedType);
                setClientErrors((prev) => ({ ...prev, number: err }));
              }}
              placeholder={typeConfig[selectedType].placeholder}
              aria-invalid={Boolean(numberError)}
              className={`min-h-[48px] w-full rounded-xl border bg-white px-3.5 py-2.5 text-base text-slate-900 transition-colors outline-none placeholder:text-slate-400 ${
                numberError
                  ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  : "border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              }`}
            />
            {numberError && (
              <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
                <svg
                  className="h-3.5 w-3.5 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
                {numberError}
              </p>
            )}
          </div>

          {/* Paybill Account Reference (Visible only for Paybill) */}
          {selectedType === "paybill" && (
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label
                  htmlFor="method-account-ref"
                  className="block text-xs font-bold text-slate-700"
                >
                  Account Number / Reference Prompt
                </label>
                <span className="text-[11px] text-slate-400">
                  Required for Paybill
                </span>
              </div>
              <input
                id="method-account-ref"
                name="account_ref"
                type="text"
                required
                value={accountRef}
                onChange={(e) => {
                  setAccountRef(e.target.value);
                  if (clientErrors.account_ref) {
                    setClientErrors((prev) => ({
                      ...prev,
                      account_ref: validateAccountRef(
                        e.target.value,
                        selectedType
                      ),
                    }));
                  }
                }}
                onBlur={() => {
                  const err = validateAccountRef(accountRef, selectedType);
                  setClientErrors((prev) => ({ ...prev, account_ref: err }));
                }}
                placeholder="e.g. SHIRO-ORDERS or YOUR-STORE"
                aria-invalid={Boolean(accountRefError)}
                className={`min-h-[48px] w-full rounded-xl border bg-white px-3.5 py-2.5 text-base text-slate-900 transition-colors outline-none placeholder:text-slate-400 ${
                  accountRefError
                    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                    : "border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                }`}
              />
              {accountRefError && (
                <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
                  <svg
                    className="h-3.5 w-3.5 shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {accountRefError}
                </p>
              )}
            </div>
          )}

          {/* Friendly Label (Optional) */}
          <div>
            <label
              htmlFor="method-label"
              className="mb-1 block text-xs font-bold text-slate-700"
            >
              Friendly Label / Store Name (Optional)
            </label>
            <input
              id="method-label"
              name="label"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Main Shop Till or Downtown Branch"
              className="min-h-[48px] w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 transition-colors outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Only you and your payers will see this label on checkout.
            </p>
          </div>

          {/* Set as default checkbox (Min 44px tap target) */}
          <div className="py-2">
            <label className="flex min-h-[44px] cursor-pointer items-center gap-3 select-none">
              <input
                type="checkbox"
                name="is_default"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="h-5 w-5 rounded border-slate-300 text-emerald-600 accent-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs font-bold text-slate-700">
                Set as my default payout method
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
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
                <span>Saving Payout Method...</span>
              </>
            ) : (
              <span>Save Payout Method</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
