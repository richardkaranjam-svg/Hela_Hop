"use client";

import { useActionState, useState } from "react";
import Link from "next/link";

import { resetPasswordAction, type AuthActionResult } from "../actions";

export default function ResetPasswordPage() {
  const [state, formAction, isPending] = useActionState<
    AuthActionResult | null,
    FormData
  >(resetPasswordAction, null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [clientErrors, setClientErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  const validatePassword = (val: string) => {
    if (!val) return "New password is required";
    if (val.length < 8) return "Password must be at least 8 characters long";
    return undefined;
  };

  const validateConfirmPassword = (val: string, pwdVal: string) => {
    if (!val) return "Please confirm your password";
    if (val !== pwdVal) return "Passwords do not match";
    return undefined;
  };

  const handlePasswordBlur = () => {
    const err = validatePassword(password);
    setClientErrors((prev) => ({ ...prev, password: err }));
  };

  const handleConfirmPasswordBlur = () => {
    const err = validateConfirmPassword(confirmPassword, password);
    setClientErrors((prev) => ({ ...prev, confirmPassword: err }));
  };

  const passwordError = state?.errors?.password || clientErrors.password;
  const confirmPasswordError =
    state?.errors?.confirmPassword || clientErrors.confirmPassword;

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
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Password updated!
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Your password has been reset successfully. You can now access your
          seller dashboard or log in with your new credentials.
        </p>
        <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5">
          <Link
            href="/dashboard"
            className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
          >
            Go to Seller Dashboard
          </Link>
          <Link
            href="/login"
            className="text-xs font-semibold text-slate-500 transition-colors hover:text-slate-800"
          >
            Or return to Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Set New Password
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Choose a new, secure password for your Hela Hop account.
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
        {/* New Password Field */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label
              htmlFor="reset-password"
              className="block text-xs font-bold text-slate-700"
            >
              New Password
            </label>
            <span className="text-[11px] text-slate-400">Min 8 characters</span>
          </div>
          <div className="relative">
            <input
              id="reset-password"
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
                if (confirmPassword && clientErrors.confirmPassword) {
                  setClientErrors((prev) => ({
                    ...prev,
                    confirmPassword: validateConfirmPassword(
                      confirmPassword,
                      e.target.value
                    ),
                  }));
                }
              }}
              onBlur={handlePasswordBlur}
              placeholder="••••••••••••"
              aria-invalid={Boolean(passwordError)}
              aria-describedby={
                passwordError ? "reset-password-error" : undefined
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
              id="reset-password-error"
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

        {/* Confirm Password Field */}
        <div>
          <label
            htmlFor="reset-confirm-password"
            className="mb-1 block text-xs font-bold text-slate-700"
          >
            Confirm New Password
          </label>
          <div className="relative">
            <input
              id="reset-confirm-password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (clientErrors.confirmPassword) {
                  setClientErrors((prev) => ({
                    ...prev,
                    confirmPassword: validateConfirmPassword(
                      e.target.value,
                      password
                    ),
                  }));
                }
              }}
              onBlur={handleConfirmPasswordBlur}
              placeholder="••••••••••••"
              aria-invalid={Boolean(confirmPasswordError)}
              aria-describedby={
                confirmPasswordError ? "reset-confirm-error" : undefined
              }
              className={`min-h-[48px] w-full rounded-xl border bg-white px-3.5 py-2.5 pr-14 text-base text-slate-900 transition-colors outline-none placeholder:text-slate-400 ${
                confirmPasswordError
                  ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  : "border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
              className="absolute top-1/2 right-1 flex min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center text-xs font-bold text-slate-500 transition-colors hover:text-slate-800 focus:outline-none"
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>
          {confirmPasswordError && (
            <p
              id="reset-confirm-error"
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
              {confirmPasswordError}
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
              <span>Updating Password...</span>
            </>
          ) : (
            <>
              <span>Update Password</span>
              <span aria-hidden="true">&rarr;</span>
            </>
          )}
        </button>
      </form>

      {/* Return to login */}
      <div className="mt-6 border-t border-slate-100 pt-5 text-center text-xs text-slate-500">
        Remember your password?{" "}
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
