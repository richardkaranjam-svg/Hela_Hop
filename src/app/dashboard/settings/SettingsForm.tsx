"use client";

import { useActionState, useEffect, useState } from "react";

import { useToast } from "@/components/ui/Toast";

import { updateProfileAction, type ProfileActionResult } from "../actions";

interface SettingsFormProps {
  initialProfile: {
    email: string;
    username: string;
    full_name: string | null;
    phone: string | null;
  };
}

export function SettingsForm({ initialProfile }: SettingsFormProps) {
  const { success, error } = useToast();
  const [state, formAction, isPending] = useActionState<
    ProfileActionResult | null,
    FormData
  >(updateProfileAction, null);

  const [fullName, setFullName] = useState(initialProfile.full_name || "");
  const [phone, setPhone] = useState(initialProfile.phone || "");
  const [username, setUsername] = useState(initialProfile.username || "");
  const [clientErrors, setClientErrors] = useState<{
    phone?: string;
    username?: string;
  }>({});

  useEffect(() => {
    if (state?.success && state.message) {
      success(state.message);
    } else if (state?.errors?.general) {
      error(state.errors.general);
    }
  }, [state, success, error]);

  const validatePhone = (val: string) => {
    if (!val.trim()) return undefined; // Optional until needed
    let cleaned = val.trim().replace(/[\s\-()]/g, "");
    if (cleaned.startsWith("0")) {
      cleaned = "+254" + cleaned.slice(1);
    } else if (cleaned.startsWith("254")) {
      cleaned = "+" + cleaned;
    } else if (
      !cleaned.startsWith("+254") &&
      cleaned.length === 9 &&
      (cleaned.startsWith("7") || cleaned.startsWith("1"))
    ) {
      cleaned = "+254" + cleaned;
    }
    const kenyanRegex = /^\+254(7\d{8}|1\d{8})$/;
    if (!kenyanRegex.test(cleaned)) {
      return "Enter a valid Kenyan number (e.g. +254712345678 or 0712345678)";
    }
    return undefined;
  };

  const validateUsername = (val: string) => {
    const trimmed = val.trim().toLowerCase();
    if (!trimmed) return "Username is required for your payment link slug.";
    if (trimmed.length < 3 || trimmed.length > 40) {
      return "Username must be between 3 and 40 characters.";
    }
    const usernameRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    if (!usernameRegex.test(trimmed)) {
      return "Only lowercase letters, numbers, and single hyphens allowed.";
    }
    return undefined;
  };

  const phoneError = state?.errors?.phone || clientErrors.phone;
  const usernameError = state?.errors?.username || clientErrors.username;

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {/* Account Email (Read-only) */}
      <div>
        <label
          htmlFor="settings-email"
          className="mb-1 block text-xs font-bold text-slate-700"
        >
          Account Email
        </label>
        <input
          id="settings-email"
          type="email"
          readOnly
          disabled
          value={initialProfile.email}
          className="min-h-[48px] w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-base text-slate-500 outline-none"
        />
        <p className="mt-1 text-[11px] text-slate-400">
          Email is linked to your Supabase Auth account.
        </p>
      </div>

      {/* Full Name */}
      <div>
        <label
          htmlFor="settings-fullname"
          className="mb-1 block text-xs font-bold text-slate-700"
        >
          Full Name / Business Name
        </label>
        <input
          id="settings-fullname"
          name="full_name"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="e.g. Mama Shiro Thrift"
          className="min-h-[48px] w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 transition-colors outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        />
        {state?.errors?.full_name && (
          <p className="mt-1.5 text-xs font-medium text-red-600">
            {state.errors.full_name}
          </p>
        )}
        <p className="mt-1 text-[11px] text-slate-400">
          Displayed to customers when they open your payment link or invoice.
        </p>
      </div>

      {/* Phone Number */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label
            htmlFor="settings-phone"
            className="block text-xs font-bold text-slate-700"
          >
            M-PESA Phone Number
          </label>
          <span className="text-[11px] text-slate-400">E.164 (+2547...)</span>
        </div>
        <input
          id="settings-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            if (clientErrors.phone) {
              setClientErrors((prev) => ({
                ...prev,
                phone: validatePhone(e.target.value),
              }));
            }
          }}
          onBlur={() => {
            const err = validatePhone(phone);
            setClientErrors((prev) => ({ ...prev, phone: err }));
          }}
          placeholder="e.g. +254712345678 or 0712345678"
          aria-invalid={Boolean(phoneError)}
          className={`min-h-[48px] w-full rounded-xl border bg-white px-3.5 py-2.5 text-base text-slate-900 transition-colors outline-none placeholder:text-slate-400 ${
            phoneError
              ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              : "border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          }`}
        />
        {phoneError && (
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
            {phoneError}
          </p>
        )}
        <p className="mt-1 text-[11px] text-slate-400">
          Used for seller payment alerts and Pochi / Send Money fallback.
        </p>
      </div>

      {/* Username / Link Slug */}
      <div>
        <label
          htmlFor="settings-username"
          className="mb-1 block text-xs font-bold text-slate-700"
        >
          Payment Link Username (Slug)
        </label>
        <div className="relative">
          <input
            id="settings-username"
            name="username"
            type="text"
            required
            value={username}
            onChange={(e) => {
              const val = e.target.value
                .toLowerCase()
                .replace(/[^a-z0-9-]/g, "");
              setUsername(val);
              if (clientErrors.username) {
                setClientErrors((prev) => ({
                  ...prev,
                  username: validateUsername(val),
                }));
              }
            }}
            onBlur={() => {
              const err = validateUsername(username);
              setClientErrors((prev) => ({ ...prev, username: err }));
            }}
            placeholder="e.g. mama-shiro"
            aria-invalid={Boolean(usernameError)}
            className={`min-h-[48px] w-full rounded-xl border bg-white px-3.5 py-2.5 text-base text-slate-900 transition-colors outline-none placeholder:text-slate-400 ${
              usernameError
                ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                : "border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            }`}
          />
        </div>
        {usernameError && (
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
            {usernameError}
          </p>
        )}

        {/* Live Link Preview Box */}
        <div className="mt-2 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-slate-500">
            <span>🔗 Your link:</span>
            <span className="font-mono font-bold text-slate-900">
              helahop.app/pay/{username || "username"}
            </span>
          </div>
          <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
            Preview
          </span>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
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
              <span>Saving Changes...</span>
            </>
          ) : (
            <span>Save Profile</span>
          )}
        </button>
      </div>
    </form>
  );
}
