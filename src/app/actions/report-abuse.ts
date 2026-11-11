"use server";

import { headers } from "next/headers";
import { z } from "zod";

import { getClientIp, hitRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";

/**
 * Error codes the client turns into English/Swahili text (lib/i18n.ts,
 * report.errors). Codes, not sentences, so the page language is respected.
 */
export type ReportAbuseError =
  | "invalid_reason"
  | "invalid_name"
  | "rate_limited"
  | "not_found"
  | "general";

export type ReportAbuseResult =
  | { ok: true }
  | { ok: false; field: "reason" | "name" | "general"; error: ReportAbuseError };

const reportSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("link"),
    // Same shape as the payment_links.slug CHECK constraint.
    target: z.string().regex(/^[a-z0-9-]{3,80}$/),
    name: z.string().max(500).optional(),
    reason: z.string().max(5000),
  }),
  z.object({
    type: z.literal("invoice"),
    // Same shape as invoice codes accepted by submitClaimAction.
    target: z.string().regex(/^[A-Za-z0-9_-]{10,64}$/),
    name: z.string().max(500).optional(),
    reason: z.string().max(5000),
  }),
]);

type RpcResponse = {
  ok: boolean;
  field?: "name" | "reason" | "general";
  error?: string;
};

/**
 * Public action: "Report this page" on /pay/[slug] and /i/[code] (Task 1.9B).
 * The database function looks the target up from the slug/code itself; the
 * browser never sends an id.
 */
export async function reportAbuseAction(input: {
  type: "link" | "invoice";
  target: string;
  name?: string;
  reason: string;
}): Promise<ReportAbuseResult> {
  // 1. Validate on the server.
  const parsed = reportSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, field: "general", error: "general" };
  }
  const name = (parsed.data.name ?? "").trim();
  const reason = parsed.data.reason.trim();
  if (name.length > 100) {
    return { ok: false, field: "name", error: "invalid_name" };
  }
  if (reason.length < 10 || reason.length > 500) {
    return { ok: false, field: "reason", error: "invalid_reason" };
  }

  // 2. Shared rate limit: 5 reports per 10 minutes per IP + target.
  const ip = getClientIp(await headers());
  const allowed = await hitRateLimit(
    `report:${ip}:${parsed.data.type}:${parsed.data.target}`,
    RATE_LIMITS.reportAbuse
  );
  if (!allowed) {
    return { ok: false, field: "general", error: "rate_limited" };
  }

  // 3. Store it through the SECURITY DEFINER function.
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("submit_abuse_report", {
    p_slug_or_code: parsed.data.target,
    p_type: parsed.data.type,
    p_name: name || null,
    p_reason: reason,
  });
  if (error) {
    console.error("submit_abuse_report failed:", error);
    return { ok: false, field: "general", error: "general" };
  }

  const res = data as unknown as RpcResponse | null;
  if (!res?.ok) {
    const code = res?.error;
    if (code === "invalid_reason") {
      return { ok: false, field: "reason", error: "invalid_reason" };
    }
    if (code === "invalid_name") {
      return { ok: false, field: "name", error: "invalid_name" };
    }
    if (code === "not_found") {
      return { ok: false, field: "general", error: "not_found" };
    }
    return { ok: false, field: "general", error: "general" };
  }

  return { ok: true };
}
