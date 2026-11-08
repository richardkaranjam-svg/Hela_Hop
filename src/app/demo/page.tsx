"use client";

import { useState } from "react";

interface StkPushSuccessResponse {
  MerchantRequestID?: string;
  CheckoutRequestID?: string;
  ResponseCode?: string;
  ResponseDescription?: string;
  CustomerMessage?: string;
  [key: string]: unknown;
}

interface StkPushErrorResponse {
  error?: string;
  details?: Record<string, string[]>;
  message?: string;
  [key: string]: unknown;
}

export default function DemoPage() {
  const [phone, setPhone] = useState("254708374149");
  const [amount, setAmount] = useState("10");
  const [accountRef, setAccountRef] = useState("HelaHopDemo");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<
    StkPushSuccessResponse | StkPushErrorResponse | null
  >(null);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResponse(null);
    setIsSuccess(null);
    setCopied(false);

    try {
      const res = await fetch("/api/mpesa/stk-push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: phone.trim(),
          amount: Number(amount),
          accountRef: accountRef.trim() || "HelaHopDemo",
        }),
      });

      const data = await res.json();
      setResponse(data);
      setIsSuccess(res.ok && data?.ResponseCode === "0");
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Network request failed";
      setResponse({ error: errorMsg });
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!response) return;
    navigator.clipboard.writeText(JSON.stringify(response, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const presetAmounts = [1, 10, 50, 100, 500];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Banner */}
      <div className="border-b border-amber-200 bg-amber-500/10 px-4 py-2.5 text-center text-xs font-semibold tracking-wider text-amber-900 uppercase sm:text-sm">
        ⚠️ SANDBOX — NO REAL MONEY
      </div>

      <main className="mx-auto max-w-xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            Daraja M-PESA Simulator
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Lipa Na M-PESA STK Push
          </h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            Test real-time STK Push prompts against the Safaricom Daraja
            Sandbox.
          </p>
        </div>

        {/* Form Card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50/75 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-800">
                Payment Details
              </h2>
              <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                Sandbox Mode
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-6">
            {/* Phone Number Input */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-slate-700"
                >
                  Phone Number
                </label>
                <button
                  type="button"
                  onClick={() => setPhone("254708374149")}
                  className="text-xs text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  Fill test number
                </button>
              </div>
              <div className="mt-1.5">
                <input
                  id="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="2547XXXXXXXX"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-base text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Must be 12 digits starting with <strong>2547</strong> (e.g.
                254708374149).
              </p>
            </div>

            {/* Amount Input */}
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-slate-700"
              >
                Amount (KES)
              </label>
              <div className="mt-1.5">
                <input
                  id="amount"
                  type="number"
                  min="1"
                  max="150000"
                  step="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="10"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-base text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-xs text-slate-500">Presets:</span>
                {presetAmounts.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset.toString())}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                      amount === preset.toString()
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    KES {preset}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Range: 1 to 150,000 KES.
              </p>
            </div>

            {/* Account Reference (Optional) */}
            <div>
              <label
                htmlFor="accountRef"
                className="block text-sm font-medium text-slate-700"
              >
                Account Reference{" "}
                <span className="text-xs text-slate-400">(Optional)</span>
              </label>
              <div className="mt-1.5">
                <input
                  id="accountRef"
                  type="text"
                  maxLength={12}
                  value={accountRef}
                  onChange={(e) => setAccountRef(e.target.value)}
                  placeholder="HelaHopDemo"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-base text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <svg
                    className="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
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
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Initiating STK Push...
                </>
              ) : (
                "Send STK Push"
              )}
            </button>
          </form>
        </div>

        {/* API Response Display */}
        {response && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div
              className={`flex items-center justify-between border-b px-6 py-4 ${
                isSuccess
                  ? "border-emerald-200 bg-emerald-50/70 text-emerald-900"
                  : "border-rose-200 bg-rose-50/70 text-rose-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${
                    isSuccess ? "bg-emerald-600" : "bg-rose-600"
                  }`}
                >
                  {isSuccess ? "✓" : "!"}
                </span>
                <h3 className="text-sm font-semibold">
                  {isSuccess
                    ? "STK Push Initiated Successfully"
                    : "STK Push Request Failed"}
                </h3>
              </div>
              <button
                type="button"
                onClick={copyToClipboard}
                className="text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                {copied ? "Copied!" : "Copy JSON"}
              </button>
            </div>

            <div className="space-y-4 p-6">
              {/* Highlight Cards if success */}
              {isSuccess && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-medium text-slate-500">
                      Response Code
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-emerald-700">
                      {(response as StkPushSuccessResponse).ResponseCode ?? "0"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-medium text-slate-500">
                      Checkout Request ID
                    </p>
                    <p className="mt-0.5 truncate font-mono text-xs text-slate-800">
                      {(response as StkPushSuccessResponse).CheckoutRequestID ??
                        "—"}
                    </p>
                  </div>
                  <div className="col-span-full rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-medium text-slate-500">
                      Customer Message
                    </p>
                    <p className="mt-0.5 text-sm text-slate-800">
                      {(response as StkPushSuccessResponse).CustomerMessage ??
                        (response as StkPushSuccessResponse)
                          .ResponseDescription ??
                        "Request accepted for processing."}
                    </p>
                  </div>
                </div>
              )}

              {/* Error message if failed */}
              {!isSuccess && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
                  <p className="font-semibold">
                    {(response as StkPushErrorResponse).error ||
                      "Failed to process STK Push"}
                  </p>
                  {(response as StkPushErrorResponse).details && (
                    <ul className="mt-2 list-inside list-disc text-xs text-rose-700">
                      {Object.entries(
                        (response as StkPushErrorResponse).details ?? {}
                      ).map(([field, errs]) => (
                        <li key={field}>
                          <strong>{field}:</strong> {errs.join(", ")}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Full Raw JSON */}
              <div>
                <div className="mb-1 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  Raw API Response
                </div>
                <pre className="max-h-64 overflow-x-auto rounded-lg bg-slate-900 p-4 font-mono text-xs text-emerald-400">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Information Callout */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5 text-xs text-slate-600 shadow-sm">
          <h4 className="font-semibold text-slate-800">About Sandbox Mode:</h4>
          <ul className="mt-2 list-inside list-disc space-y-1.5">
            <li>
              No real funds are deducted or moved. This interacts with the
              Safaricom Daraja Sandbox.
            </li>
            <li>
              The Daraja test shortcode is{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 font-mono">
                174379
              </code>
              .
            </li>
            <li>
              Webhook callbacks are dispatched by Daraja to{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 font-mono">
                /api/webhooks/mpesa
              </code>{" "}
              and logged to the server console.
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
