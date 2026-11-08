/**
 * Returns `input` only when it is a same-site relative path (e.g. "/dashboard/claims").
 * Anything that could leave the site ("//evil.com", "/\evil.com", "https://...",
 * "@evil.com") falls back to `fallback`. Use for every user-supplied redirect target.
 */
export function safeRedirectPath(
  input: string | null | undefined,
  fallback = "/dashboard"
): string {
  if (!input) return fallback;
  if (!input.startsWith("/")) return fallback;
  if (input.startsWith("//") || input.startsWith("/\\")) return fallback;
  if (/[\\\r\n\t\0]/.test(input)) return fallback;
  return input;
}
