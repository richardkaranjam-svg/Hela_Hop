"use client";

import { Suspense, useActionState, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { loginAction, type AuthActionResult } from "../actions";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get("redirectedFrom") || "/dashboard";
  const urlError = searchParams.get("error");

  const [state, formAction, isPending] = useActionState<
    AuthActionResult | null,
    FormData
  >(loginAction, null);

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
  const generalError = state?.errors?.general || urlError;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Welcome Back
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Log in to manage your payment links and confirm claims.
        </p>
      </div>

      {generalError && (
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
          <span className="leading-snug">{generalError}</span>
        </div>
      )}

      <form action={formAction} className="space-y-4" noValidate>
        <input type="hidden" name="redirectedFrom" value={redirectedFrom} />

        {/* Email Field */}
        <div>
          <label
            htmlFor="login-email"
            className="mb-1 block text-xs font-bold text-slate-700"
          >
            Email Address
          </label>
          <input
            id="login-email"
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
            aria-describedby={emailError ? "login-email-error" : undefined}
            className={`min-h-[48px] w-full rounded-xl border bg-white px-3.5 py-2.5 text-base text-slate-900 transition-colors outline-none placeholder:text-slate-400 ${
              emailError
                ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                : "border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            }`}
          />
          {emailError && (
            <p
              id="login-email-error"
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
              htmlFor="login-password"
              className="block text-xs font-bold text-slate-700"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="inline-flex min-h-[44px] items-center text-xs font-semibold text-emerald-600 transition-colors hover:text-emerald-700"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
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
                passwordError ? "login-password-error" : undefined
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
              id="login-password-error"
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="mt-2 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
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
              <span>Logging In...</span>
            </>
          ) : (
            <>
              <span>Log In to Dashboard</span>
              <span aria-hidden="true">&rarr;</span>
            </>
          )}
        </button>
      </form>

      {/* Switch to Signup */}
      <div className="mt-6 border-t border-slate-100 pt-5 text-center text-xs text-slate-500">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="inline-flex min-h-[44px] items-center font-bold text-emerald-600 underline underline-offset-2 hover:text-emerald-700"
        >
          Create Seller Account
        </Link>
      </div>

      {/* No-account Interactive Overview */}
      <div className="mt-1 text-center">
        <Link
          href="/overview"
          className="inline-flex min-h-[44px] items-center justify-center rounded-lg px-3 text-xs font-bold text-slate-600 underline underline-offset-2 hover:text-slate-900"
        >
          Just looking around? Try App Overview (No account needed)
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="py-8 text-center text-sm text-slate-400">
          Loading login form...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
