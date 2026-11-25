import type { EmailOtpType } from "@supabase/supabase-js";

/**
 * Email OTP types accepted by `/auth/callback` for token-hash verification.
 * Kept as a strict allowlist rather than trusting arbitrary query values.
 */
export const ALLOWED_OTP_TYPES = new Set<EmailOtpType>([
  "signup",
  "email",
  "recovery",
  "email_change",
]);

const SAFE_HOST_PATTERN = /^[a-zA-Z0-9.-]+(?::\d{1,5})?$/;
const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1"]);

function parseHttpUrl(raw: string | null | undefined): URL | null {
  if (!raw) return null;
  try {
    const parsed = new URL(raw.trim());
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function buildTrustedHosts({
  configuredOrigin,
  vercelHosts = [],
}: {
  configuredOrigin: URL | null;
  vercelHosts?: Array<string | null | undefined>;
}): Set<string> {
  const hosts = new Set<string>();
  if (configuredOrigin) {
    hosts.add(configuredOrigin.host.toLowerCase());
  }
  for (const host of vercelHosts) {
    const trimmed = host?.trim().toLowerCase();
    if (trimmed && SAFE_HOST_PATTERN.test(trimmed)) {
      hosts.add(trimmed);
    }
  }
  return hosts;
}

function isLocalOrigin(url: URL): boolean {
  return (
    url.protocol === "http:" && LOCAL_HOSTNAMES.has(url.hostname.toLowerCase())
  );
}

/**
 * Validates and narrows the `type` query parameter on `/auth/callback`.
 */
export function parseAllowedOtpType(
  rawType: string | null | undefined
): EmailOtpType | null {
  if (!rawType) return null;
  const candidate = rawType.trim() as EmailOtpType;
  return ALLOWED_OTP_TYPES.has(candidate) ? candidate : null;
}

/**
 * Resolves a safe redirect origin for auth server actions without blindly
 * trusting an arbitrary `Origin` request header.
 */
export function resolveActionOrigin({
  headerOrigin,
  configuredAppUrl,
  vercelHosts,
  allowLocalhost = process.env.NODE_ENV !== "production",
}: {
  headerOrigin?: string | null;
  configuredAppUrl?: string | null;
  vercelHosts?: Array<string | null | undefined>;
  allowLocalhost?: boolean;
}): string {
  const configured = parseHttpUrl(configuredAppUrl);
  const trustedHosts = buildTrustedHosts({
    configuredOrigin: configured,
    vercelHosts,
  });

  const parsedHeader = parseHttpUrl(headerOrigin);
  if (parsedHeader) {
    const headerHost = parsedHeader.host.toLowerCase();
    const isTrustedHost = trustedHosts.has(headerHost);
    const isAllowedLocal = allowLocalhost && isLocalOrigin(parsedHeader);
    if (
      (isTrustedHost &&
        (parsedHeader.protocol === "https:" || isLocalOrigin(parsedHeader))) ||
      isAllowedLocal
    ) {
      return parsedHeader.origin;
    }
  }

  if (configured) {
    return configured.origin;
  }

  return "http://localhost:3000";
}

/**
 * Resolves a safe redirect origin inside `/auth/callback`, blocking untrusted
 * `x-forwarded-host` injection while preserving Vercel preview/production URLs.
 */
export function resolveSafeAppOrigin({
  requestOrigin,
  forwardedHost,
  configuredAppUrl,
  vercelHosts,
  isDev = process.env.NODE_ENV === "development",
}: {
  requestOrigin: string;
  forwardedHost?: string | null;
  configuredAppUrl?: string | null;
  vercelHosts?: Array<string | null | undefined>;
  isDev?: boolean;
}): string {
  const parsedRequest = parseHttpUrl(requestOrigin);
  const configured = parseHttpUrl(configuredAppUrl);
  const trustedHosts = buildTrustedHosts({
    configuredOrigin: configured,
    vercelHosts,
  });

  if (isDev) {
    if (parsedRequest && isLocalOrigin(parsedRequest)) {
      return parsedRequest.origin;
    }
    if (configured) {
      return configured.origin;
    }
    return "http://localhost:3000";
  }

  const normalizedForwarded = forwardedHost
    ?.split(",")[0]
    ?.trim()
    .toLowerCase();
  if (
    normalizedForwarded &&
    SAFE_HOST_PATTERN.test(normalizedForwarded) &&
    trustedHosts.has(normalizedForwarded)
  ) {
    return `https://${normalizedForwarded}`;
  }

  if (parsedRequest) {
    if (
      trustedHosts.size === 0 ||
      trustedHosts.has(parsedRequest.host.toLowerCase()) ||
      isLocalOrigin(parsedRequest)
    ) {
      return parsedRequest.origin;
    }
  }

  if (configured) {
    return configured.origin;
  }

  return parsedRequest?.origin ?? "http://localhost:3000";
}

/**
 * Reads Vercel's runtime deployment host variables for origin validation.
 */
export function getVercelTrustedHosts(): string[] {
  return [
    process.env.VERCEL_URL,
    process.env.VERCEL_BRANCH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  ].filter((value): value is string => Boolean(value));
}
