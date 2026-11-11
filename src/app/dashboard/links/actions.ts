"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

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
        errorMap: () => ({ message: "Please choose a fixed or flexible amount." }),
      })
    ),
    amount: z.string().trim().max(20, "Please enter a valid amount greater than 0."),
    payout_method_id: z
      .string()
      .trim()
      .refine(
        (v) => v === "" || z.string().uuid().safeParse(v).success,
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

const uuidSchema = z.string().uuid();
const languageSchema = z.enum(["en", "sw"]);

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

  const { title, amountMinor, customSlug: rawCustomSlug } = parsed.data;
  const errors: PaymentLinkActionResult["errors"] = {};

  // Payout method validation (must belong to this seller)
  let payoutMethodId: string | null = parsed.data.payoutMethodId;
  if (payoutMethodId) {
    const { data: userMethod } = await supabase
      .from("payout_methods")
      .select("id")
      .eq("id", payoutMethodId)
      .eq("user_id", user.id)
      .single();

    if (!userMethod) {
      errors.payout_method_id = "Please select a valid payout method you own.";
    }
  } else {
    // Default to seller's default payout method if available
    const { data: defaultMethod } = await supabase
      .from("payout_methods")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_default", true)
      .maybeSingle();

    if (defaultMethod) {
      payoutMethodId = defaultMethod.id;
    }
  }

  // Slug generation & validation
  let baseSlug = slugify(username);
  if (rawCustomSlug.trim()) {
    baseSlug = slugify(rawCustomSlug);
  } else {
    // Check if base slug (just the username) is already used
    const { data: existingUserSlug } = await supabase
      .from("payment_links")
      .select("id")
      .eq("slug", baseSlug)
      .maybeSingle();

    if (existingUserSlug) {
      // Append title slug
      const titleSlugPart = slugify(title).slice(0, 30);
      baseSlug = `${baseSlug}-${titleSlugPart}`.replace(/-+$/, "");
    }
  }

  // Enforce slug format constraint: ^[a-z0-9\-]{3,80}$
  let candidateSlug = baseSlug.slice(0, 75);
  if (candidateSlug.length < 3) {
    candidateSlug = `${candidateSlug}-${Math.random().toString(36).substring(2, 6)}`;
  }

  // Ensure unique slug
  let finalSlug = candidateSlug;
  let attempts = 0;
  while (attempts < 5) {
    const { data: conflict } = await supabase
      .from("payment_links")
      .select("id")
      .eq("slug", finalSlug)
      .maybeSingle();

    if (!conflict) break;

    const randomSuffix = Math.random().toString(36).substring(2, 6);
    finalSlug = `${candidateSlug.slice(0, 70)}-${randomSuffix}`;
    attempts++;
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  // Insert payment link
  const { error: insertError } = await supabase.from("payment_links").insert({
    user_id: user.id,
    slug: finalSlug,
    title,
    currency: "KES",
    amount_minor: amountMinor,
    payout_method_id: payoutMethodId,
    is_active: true,
  });

  if (insertError) {
    console.error("Failed to insert payment link:", insertError);
    return {
      success: false,
      errors: {
        general: insertError.message || "Failed to create payment link.",
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
    return { success: false, message: error.message };
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
    .update({
      is_active: !parsedStatus.data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsedId.data)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/dashboard/links");
  return {
    success: true,
    message: currentStatus
      ? "Payment link deactivated."
      : "Payment link activated.",
  };
}

/**
 * Action to switch language on public pages.
 */
export async function setLanguageAction(lang: "en" | "sw") {
  // The TypeScript type is not checked at runtime: anyone can call this.
  const parsed = languageSchema.safeParse(lang);
  if (!parsed.success) return;

  const cookieStore = await cookies();
  cookieStore.set("hela_lang", parsed.data, {
    path: "/",
    maxAge: 31536000,
    sameSite: "lax",
  });
}
