/**
 * CSRF check for API routes that change data (Task 1.9).
 * Server actions already check Origin in Next.js; plain route handlers do not.
 *
 * Returns true only when the request's Origin header exactly matches the
 * origin of NEXT_PUBLIC_APP_URL. A missing Origin is rejected: browsers always
 * send it on POST, so only non-browser clients lack it.
 */
export function isSameOrigin(
  originHeader: string | null,
  appUrl: string | undefined
): boolean {
  if (!originHeader || !appUrl) return false;
  try {
    return new URL(originHeader).origin === new URL(appUrl).origin;
  } catch {
    return false;
  }
}
