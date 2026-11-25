"use server";

import { z } from "zod";

import { isAdminEmail } from "@/lib/security/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { InterviewRecord } from "@/types/database";

/**
 * Server actions for the internal interview tracker (/admin/interviews).
 *
 * The interviews table has RLS on and no policies (migration
 * 20261118000001_interviews), so the only way in is the service-role client
 * used here, and only after the ADMIN_EMAILS check below. The layout and
 * middleware also block non-admins; this repeats the check because server
 * actions can be called directly.
 */

export type InterviewActionResult<T = undefined> =
  { ok: true; data: T } | { ok: false; error: string };

async function requireAdmin(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) return null;
  return user.id;
}

const optionalText = (max: number) =>
  z
    .string()
    .max(max)
    .optional()
    .nullable()
    .transform((v) => {
      const t = (v ?? "").trim();
      return t.length > 0 ? t : null;
    });

const interviewSchema = z.object({
  interview_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  person_name: z.string().trim().min(1).max(120),
  segment: z.enum(["seller", "supplier", "student", "freelancer"]),
  business_type: optionalText(120),
  pain_unprompted: z.boolean(),
  pain_points: z
    .array(z.string().max(300))
    .max(3)
    .transform((list) => list.map((p) => p.trim()).filter((p) => p.length > 0)),
  exact_quote: optionalText(1000),
  current_tool: z
    .enum([
      "notebook",
      "excel",
      "whatsapp",
      "memory",
      "accounting_software",
      "other",
      "none",
    ])
    .nullable(),
  monthly_orders: z.number().int().min(0).max(1_000_000).nullable(),
  credit_customers: z.boolean().nullable(),
  asked_for_etims: z.boolean().nullable(),
  price_reaction: z
    .enum(["founding_yes", "would_pay", "too_expensive", "free_only", "unsure"])
    .nullable(),
  would_try: z.enum(["yes", "maybe", "no"]),
  referral: optionalText(200),
  notes: optionalText(2000),
});

export type InterviewInput = z.input<typeof interviewSchema>;

export async function listInterviews(): Promise<InterviewRecord[]> {
  if (!(await requireAdmin())) return [];
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("interviews")
    .select("*")
    .order("interview_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1000);
  if (error) {
    console.error("listInterviews failed:", error);
    return [];
  }
  return (data ?? []) as InterviewRecord[];
}

export async function createInterviewAction(
  input: InterviewInput
): Promise<InterviewActionResult<InterviewRecord>> {
  const userId = await requireAdmin();
  if (!userId) return { ok: false, error: "Not allowed." };

  const parsed = interviewSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Some fields are missing or too long. Check the form.",
    };
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("interviews")
    .insert({ ...parsed.data, created_by: userId })
    .select("*")
    .single();
  if (error || !data) {
    console.error("createInterviewAction failed:", error);
    return {
      ok: false,
      error: "Could not save. Is migration 20261118000001_interviews run?",
    };
  }
  return { ok: true, data: data as InterviewRecord };
}

export async function deleteInterviewAction(
  id: string
): Promise<InterviewActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Not allowed." };
  if (!z.string().uuid().safeParse(id).success) {
    return { ok: false, error: "Unknown interview." };
  }
  const admin = createAdminClient();
  const { error } = await admin.from("interviews").delete().eq("id", id);
  if (error) {
    console.error("deleteInterviewAction failed:", error);
    return { ok: false, error: "Could not delete." };
  }
  return { ok: true, data: undefined };
}

/**
 * One-time move of interviews saved by the old tracker in this browser's
 * localStorage (key hela_hop_interviews_v1). Old records only had name, type,
 * pain points, would-try, referral and notes; the new fields stay empty.
 */
const legacySchema = z
  .array(
    z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      personName: z.string().trim().min(1).max(120),
      type: z.enum(["seller", "student", "freelancer"]),
      painPoints: z.array(z.string().max(300)).max(3).default([]),
      wouldTry: z.enum(["yes", "maybe", "no"]),
      referralName: z.string().max(200).optional().default(""),
      notes: z.string().max(2000).optional(),
    })
  )
  .max(500);

export async function importLegacyInterviewsAction(
  records: unknown
): Promise<InterviewActionResult<InterviewRecord[]>> {
  const userId = await requireAdmin();
  if (!userId) return { ok: false, error: "Not allowed." };

  const parsed = legacySchema.safeParse(records);
  if (!parsed.success) {
    return {
      ok: false,
      error: "The saved interviews on this browser could not be read.",
    };
  }
  if (parsed.data.length === 0) return { ok: true, data: [] };

  const rows = parsed.data.map((r) => ({
    interview_date: r.date,
    person_name: r.personName,
    segment: r.type,
    pain_points: r.painPoints
      .map((p) => p.trim())
      .filter((p) => p.length > 0 && p !== "No specific pain recorded"),
    would_try: r.wouldTry,
    referral: r.referralName.trim() || null,
    notes: r.notes?.trim() || null,
    created_by: userId,
  }));

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("interviews")
    .insert(rows)
    .select("*");
  if (error) {
    console.error("importLegacyInterviewsAction failed:", error);
    return {
      ok: false,
      error: "Could not move them. Nothing was changed on this browser.",
    };
  }
  return { ok: true, data: (data ?? []) as InterviewRecord[] };
}
