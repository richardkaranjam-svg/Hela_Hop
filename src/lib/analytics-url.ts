/**
 * Page-view URL cleaning for Vercel Analytics (Task 1.9B: "no personal data").
 *
 * Invoice codes and receipt tokens ARE the password to those pages (D10), and
 * payment-link slugs often contain a seller's name. Query strings can carry
 * auth codes (/auth/callback?code=...). So before a page view leaves the
 * browser we:
 *   - replace /pay/<slug>, /i/<code>, /r/<token> with a placeholder,
 *   - replace any UUID path segment with [id],
 *   - drop the query string and #hash entirely.
 *
 * Pure function, no browser APIs beyond URL, so it is easy to unit test.
 */

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const PRIVATE_SEGMENTS: Record<string, string> = {
  pay: "[slug]",
  i: "[code]",
  r: "[token]",
};

export function redactAnalyticsUrl(rawUrl: string): string | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    // Not a URL we understand: send nothing rather than something private.
    return null;
  }

  const parts = url.pathname.split("/");
  // parts[0] is "" because the path starts with "/".
  const first = parts[1];
  if (first && first in PRIVATE_SEGMENTS && parts.length > 2 && parts[2]) {
    parts[2] = PRIVATE_SEGMENTS[first];
  }
  const cleaned = parts
    .map((p) => (UUID_RE.test(p) ? "[id]" : p))
    .join("/");

  return `${url.origin}${cleaned}`;
}
