"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { resolvePayoutMethodId } from "@/features/payouts/resolve";
import { createClient } from "@/lib/supabase/server";
import { uuidSchema } from "@/lib/validation";

const createLinkSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Link title or item name is required.")
      .max(200, "Title cannot exceed 200 characters."),
    amount_type: z.preprocess(
      (v) => (v === "" || v == null ? "flexible" : v),
      z.enum(["fixed", "flexible"], {
        errorMap: () => ({
          message: "Please choose a fixed or flexible amount.",
        }),
      })
    ),
    amount: z
      .string()
      .trim()
      .max(20, "Please enter a valid amount greater than 0."),
    payout_method_id: z
      .string()
      .trim()
      .refine(
        (v) => v === "" || uuidSchema.safeParse(v).success,
        "Please select a valid payout method you own."
      )
      .transform((v) => v || null),
    custom_slug: z.string().trim().max(100, "Link name is too long."),
  })
  .transform((d, ctx) => {
    let amountMinor: number | null = null;
    if (d.amount_type === "fixed") {
      const parsedAmount = Number(d.amount);
      if (!d.amount || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        ctx.addIssue({
          code: "custom",
          path: ["amount"],
          message: "Please enter a valid amount greater than 0.",
        });
      } else if (parsedAmount > 150000) {
        ctx.addIssue({
          code: "custom",
          path: ["amount"],
          message: "M-PESA transaction limit is KES 150,000.",
        });
      } else {
        amountMinor = Math.round(parsedAmount * 100);
      }
    }
    return {
      title: d.title,
      amountMinor,
      payoutMethodId: d.payout_method_id,
      customSlug: d.custom_slug,
    };
  });

export type PaymentLinkActionResult = {
  success: boolean;
  slug?: string;
  message?: string;
  errors?: {
    title?: string;
    amount?: string;
    payout_method_id?: string;
    slug?: string;
    general?: string;
  };
};

/** Postgres unique_violation */
const UNIQUE_VIOLATION = "23505";

const randomSuffix = () => Math.random().toString(36).substring(2, 6);

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Server action to generate and save a new payment link.
 */
export async function createPaymentLinkAction(
  _prevState: PaymentLinkActionResult | null,
  formData: FormData
): Promise<PaymentLinkActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      errors: { general: "You must be signed in to create a payment link." },
    };
  }

  // 1. Fetch user profile for username
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  const username = profile?.username || user.email?.split("@")[0] || "seller";

  // Validate on the server with zod (Task 1.9).
  const parsed = createLinkSchema.safeParse({
    title: formData.get("title") ?? "",
    amount_type: formData.get("amount_type") ?? "",
    amount: formData.get("amount") ?? "",
    payout_method_id: formData.get("payout_method_id") ?? "",
    custom_slug: formData.get("custom_slug") ?? "",
  });

  if (!parsed.success) {
    const errors: NonNullable<PaymentLinkActionResult["errors"]> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? "");
      if (field === "title" || field === "payout_method_id") {
        errors[field] ??= issue.message;
      } else if (field === "amount" || field === "amount_type") {
        errors.amount ??= issue.message;
      } else if (field === "custom_slug") {
        errors.slug ??= issue.message;
      } else {
        errors.general ??= "Please check the link details and try again.";
      }
    }
    return { success: false, errors };
  }

  const { title, amountMinor, customSlug } = parsed.data;

  const payout = await resolvePayoutMethodId(
    supabase,
    user.id,
    parsed.data.payoutMethodId
  );
  if (!payout.ok) {
    return {
      success: false,
      errors: {
        payout_method_id: "Please select a valid payout method you own.",
      },
    };
  }

  // Slugs to try, best first: the custom name (or username, then
  // username-title), then random suffixes. Slugs must match ^[a-z0-9-]{3,80}$.
  // We try the INSERT and retry on a clash rather than checking first: the
  // database hides other sellers' inactive links, so a pre-check can't see them.
  const base = slugify(customSlug || username).slice(0, 75);
  const preferred = customSlug
    ? [base]
    : [base, `${base}-${slugify(title).slice(0, 30)}`.replace(/-+$/, "")];
  const candidates = preferred.filter((slug) => slug.length >= 3);
  while (candidates.length < 6) {
    candidates.push(`${base.slice(0, 70)}-${randomSuffix()}`);
  }

  let finalSlug: string | null = null;
  for (const slug of candidates) {
    const { error: insertError } = await supabase.from("payment_links").insert({
      user_id: user.id,
      slug,
      title,
      currency: "KES",
      amount_minor: amountMinor,
      payout_method_id: payout.id,
      is_active: true,
    });
    if (!insertError) {
      finalSlug = slug;
      break;
    }
    if (insertError.code !== UNIQUE_VIOLATION) {
      console.error("Failed to insert payment link:", insertError);
      break;
    }
  }

  if (!finalSlug) {
    return {
      success: false,
      errors: {
        general: "Could not create the payment link. Please try again.",
      },
    };
  }

  revalidatePath("/dashboard/links");
  revalidatePath("/dashboard");
  // Send the seller to a clear "link created" page. Done on the server so it
  // works even if a toast is missed or client JS is slow on a cheap phone.
  // (redirect() throws, so it must stay outside any try/catch.)
  redirect(`/dashboard/links/created?slug=${encodeURIComponent(finalSlug)}`);
}

/**
 * Server action to delete a payment link.
 */
export async function deletePaymentLinkAction(
  linkId: string
): Promise<{ success: boolean; message?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Authentication required." };
  }

  const parsedId = uuidSchema.safeParse(linkId);
  if (!parsedId.success) {
    return { success: false, message: "Payment link not found." };
  }

  const { error } = await supabase
    .from("payment_links")
    .delete()
    .eq("id", parsedId.data)
    .eq("user_id", user.id);

  if (error) {
    console.error("Failed to delete payment link:", error);
    return { success: false, message: "Could not delete this payment link." };
  }

  revalidatePath("/dashboard/links");
  revalidatePath("/dashboard");
  return { success: true, message: "Payment link deleted." };
}

/**
 * Server action to toggle payment link active status.
 */
export async function togglePaymentLinkStatusAction(
  linkId: string,
  currentStatus: boolean
): Promise<{ success: boolean; message?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Authentication required." };
  }

  const parsedId = uuidSchema.safeParse(linkId);
  const parsedStatus = z.boolean().safeParse(currentStatus);
  if (!parsedId.success || !parsedStatus.success) {
    return { success: false, message: "Payment link not found." };
  }

  const { error } = await supabase
    .from("payment_links")
    .update({ is_active: !parsedStatus.data })
    .eq("id", parsedId.data)
    .eq("user_id", user.id);

  if (error) {
    console.error("Failed to update payment link:", error);
    return { success: false, message: "Could not update this payment link." };
  }

  revalidatePath("/dashboard/links");
  return {
    success: true,
    message: currentStatus
      ? "Payment link deactivated."
      : "Payment link activated.",
  };
}
