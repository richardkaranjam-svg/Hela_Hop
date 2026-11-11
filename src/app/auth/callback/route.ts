import { NextResponse, type NextRequest } from "next/server";

import {
  getVercelTrustedHosts,
  parseAllowedOtpType,
  resolveSafeAppOrigin,
} from "@/lib/app-origin";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const otpType = parseAllowedOtpType(requestUrl.searchParams.get("type"));

  const defaultNext = otpType === "recovery" ? "/reset-password" : "/dashboard";
  // Only same-site paths: blocks "//evil.com" and "@evil.com" style redirects.
  const next = safeRedirectPath(
    requestUrl.searchParams.get("next"),
    defaultNext
  );

  const safeOrigin = resolveSafeAppOrigin({
    requestOrigin: requestUrl.origin,
    forwardedHost: request.headers.get("x-forwarded-host"),
    configuredAppUrl: process.env.NEXT_PUBLIC_APP_URL,
    vercelHosts: getVercelTrustedHosts(),
  });

  // Cross-device email links (confirm signup / password reset) use token_hash + type
  // so clicking the email on another device does not fail with missing PKCE cookie.
  if (tokenHash && otpType) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type: otpType,
      token_hash: tokenHash,
    });
    if (!error) {
      return NextResponse.redirect(`${safeOrigin}${next}`);
    }
  }

  let pkceMismatch = false;
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${safeOrigin}${next}`);
    }
    pkceMismatch = error.message.toLowerCase().includes("code verifier");
  }

  const errorMessage = pkceMismatch
    ? "Please open the email link in the browser you signed up with, or log in directly."
    : "Invalid or expired authentication link";

  return NextResponse.redirect(
    `${safeOrigin}/login?error=${encodeURIComponent(errorMessage)}`
  );
}
