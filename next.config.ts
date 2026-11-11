import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Content Security Policy (Task 1.9).
 * - 'unsafe-inline' scripts/styles: needed by Next.js App Router and Tailwind
 *   until we add nonces.
 * - 'unsafe-eval' ONLY in development: Next.js dev mode (React Refresh) needs
 *   it. Production builds do not.
 * - img-src data: is used for the QR codes on /pay and /r pages.
 * - Vercel Analytics (Task 1.9B) is same-origin in production
 *   (/_vercel/insights/*). In development it loads a debug script from
 *   va.vercel-scripts.com, so that host is allowed in dev only.
 */
const csp = [
  "default-src 'self'",
  "img-src 'self' data:",
  "connect-src 'self' https://*.supabase.co",
  "frame-ancestors 'none'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval' https://va.vercel-scripts.com" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  { key: "Content-Security-Policy", value: csp },
];

const nextConfig: NextConfig = {
  // Do not advertise the framework.
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
