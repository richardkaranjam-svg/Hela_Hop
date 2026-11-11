import { createClient } from "@/lib/supabase/server";

/**
 * Shared rate limiting (Task 1.9). SERVER ONLY.
 *
 * Counts live in Postgres (public.rate_limits via hit_rate_limit), so every
 * Vercel server copy shares them. An in-memory Map would not.
 */

/** Limits used across the app, in one place so they are easy to tune. */
export const RATE_LIMITS = {
  /** "I've paid" claims: 5 per 10 minutes per IP + payment link/invoice. */
  claim: { windowSeconds: 600, max: 5 },
  /** Sandbox STK push demo: 5 per minute per IP. */
  stkPush: { windowSeconds: 60, max: 5 },
  /** Report-abuse form (Task 1.9B): 5 per 10 minutes per IP + target. */
  reportAbuse: { windowSeconds: 600, max: 5 },
} as const;

export { getClientIp } from "@/lib/client-ip";

/**
 * Record one hit for `key` and return true if the caller is still allowed.
 *
 * Fails OPEN: if the database call errors (e.g. the migration has not been run
 * yet) we log it and allow the request, so payers are never blocked by an
 * outage of the limiter itself.
 */
export async function hitRateLimit(
  key: string,
  limit: { windowSeconds: number; max: number }
): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("hit_rate_limit", {
      p_key: key.slice(0, 200),
      p_window_seconds: limit.windowSeconds,
      p_max: limit.max,
    });
    if (error) {
      console.error("hit_rate_limit failed (allowing request):", error);
      return true;
    }
    return data !== false;
  } catch (err) {
    console.error("hit_rate_limit threw (allowing request):", err);
    return true;
  }
}
