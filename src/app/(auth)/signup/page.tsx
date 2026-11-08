"use client";

import { useActionState, useState } from "react";
import Link from "next/link";

import { signupAction, type AuthActionResult } from "../actions";

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState<
    AuthActionResult | null,
    FormData
  >(signupAction, null);

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [clientErrors, setClientErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validateEmail = (val: string) => {
    if (!val.trim()) return "Email address is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val.trim()))
      return "Please enter a valid email address";
    return undefined;
  };

  const validatePassword = (val: string) => {
    if (!val) return "Password is required";
    if (val.length < 8) return "Password must be at least 8 characters long";
    return undefined;
  };

  const handleEmailBlur = () => {
    const err = validateEmail(email);
    setClientErrors((prev) => ({ ...prev, email: err }));
  };

  const handlePasswordBlur = () => {
    const err = validatePassword(password);
    setClientErrors((prev) => ({ ...prev, password: err }));
  };

  const emailError = state?.errors?.email || clientErrors.email;
  const passwordError = state?.errors?.password || clientErrors.password;

  if (state?.success) {
    return (
      <div className="py-2 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <svg
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Check your email to confirm.
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          We&apos;ve sent a confirmation link to{" "}
          <strong className="font-semibold text-slate-900">{email}</strong>.
          Please click the link in that email to activate your account and start
          receiving payments.
        </p>
        <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5">
          <Link
            href="/login"
            className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
          >
            Go to Log In
          </Link>
          <p className="text-xs text-slate-500">
            Didn&apos;t receive it? Check your spam folder or try signing up
            again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Create Seller Account
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          One simple step to get your M-PESA payment link.
        </p>
      </div>

      {state?.errors?.general && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700"
        >
          <svg
            className="mt-0.5 h-5 w-5 shrink-0 text-red-500"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clipRule="evenodd"
            />
          </svg>
          <span className="leading-snug">{state.errors.general}</span>
        </div>
      )}

      <form action={formAction} className="space-y-4" noValidate>
        {/* Email Field */}
        <div>
          <label
            htmlFor="signup-email"
            className="mb-1 block text-xs font-bold text-slate-700"
          >
            Email Address
          </label>
          <input
            id="signup-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (clientErrors.email) {
                setClientErrors((prev) => ({
                  ...prev,
                  email: validateEmail(e.target.value),
                }));
              }
            }}
            onBlur={handleEmailBlur}
            placeholder="e.g. shiro.thrift@gmail.com"
            aria-invalid={Boolean(emailError)}
            aria-describedby={emailError ? "signup-email-error" : undefined}
            className={`min-h-[48px] w-full rounded-xl border bg-white px-3.5 py-2.5 text-base text-slate-900 transition-colors outline-none placeholder:text-slate-400 ${
              emailError
                ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                : "border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            }`}
          />
          {emailError && (
            <p
              id="signup-email-error"
              className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600"
            >
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
              {emailError}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label
              htmlFor="signup-password"
              className="block text-xs font-bold text-slate-700"
            >
              Password
            </label>
            <span className="text-[11px] text-slate-400">Min 8 characters</span>
          </div>
          <div className="relative">
            <input
              id="signup-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (clientErrors.password) {
                  setClientErrors((prev) => ({
                    ...prev,
                    password: validatePassword(e.target.value),
                  }));
                }
              }}
              onBlur={handlePasswordBlur}
              placeholder="••••••••••••"
              aria-invalid={Boolean(passwordError)}
              aria-describedby={
                passwordError ? "signup-password-error" : undefined
              }
              className={`min-h-[48px] w-full rounded-xl border bg-white px-3.5 py-2.5 pr-14 text-base text-slate-900 transition-colors outline-none placeholder:text-slate-400 ${
                passwordError
                  ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  : "border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute top-1/2 right-1 flex min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center text-xs font-bold text-slate-500 transition-colors hover:text-slate-800 focus:outline-none"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {passwordError && (
            <p
              id="signup-password-error"
              className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600"
            >
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
              {passwordError}
            </p>
          )}
        </div>

        {/* Disclaimer / Trust Note */}
        <div className="py-1">
          <p className="text-[11.5px] leading-snug text-slate-500">
            By signing up, you agree to Hela Hop&apos;s seller guidelines. Funds
            settle directly to your own Till, Paybill or Pochi.
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
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
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Create Account & Setup Link</span>
              <span aria-hidden="true">&rarr;</span>
            </>
          )}
        </button>
      </form>

      {/* Switch to Login */}
      <div className="mt-6 border-t border-slate-100 pt-5 text-center text-xs text-slate-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-bold text-emerald-600 underline underline-offset-2 hover:text-emerald-700"
        >
          Log In
        </Link>
      </div>
    </div>
  );
}
