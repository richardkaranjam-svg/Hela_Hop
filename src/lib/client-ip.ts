/**
 * The visitor's IP from x-forwarded-for (first entry is the client; Vercel sets
 * this header itself). Falls back to x-real-ip, then "unknown".
 * Kept in its own file (no Supabase imports) so it is easy to unit test.
 */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  const ip = first || headers.get("x-real-ip")?.trim() || "unknown";
  // Keep keys short and predictable even if a header is junk.
  return ip.slice(0, 64);
}
