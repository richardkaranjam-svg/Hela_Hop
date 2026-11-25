import type { createClient } from "@/lib/supabase/server";

type ServerSupabase = Awaited<ReturnType<typeof createClient>>;

/**
 * Pick the payout method for a new payment link or invoice. SERVER ONLY.
 *
 * - A requested id must belong to the seller, otherwise `ok: false`.
 * - No requested id: use the seller's default (or null if they have none).
 */
export async function resolvePayoutMethodId(
  supabase: ServerSupabase,
  userId: string,
  requestedId: string | null
): Promise<{ ok: true; id: string | null } | { ok: false }> {
  const query = supabase
    .from("payout_methods")
    .select("id")
    .eq("user_id", userId);

  const { data, error } = requestedId
    ? await query.eq("id", requestedId).maybeSingle()
    : await query.eq("is_default", true).maybeSingle();

  if (error) throw error;
  if (requestedId && !data) return { ok: false };
  return { ok: true, id: data?.id ?? null };
}
