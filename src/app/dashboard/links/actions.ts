"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";

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

  const rawTitle = (formData.get("title") as string) || "";
  const rawAmountType = (formData.get("amount_type") as string) || "flexible";
  const rawAmount = (formData.get("amount") as string) || "";
  const rawPayoutMethodId = (formData.get("payout_method_id") as string) || "";
  const rawCustomSlug = (formData.get("custom_slug") as string) || "";

  const errors: PaymentLinkActionResult["errors"] = {};

  // Title validation
  const title = rawTitle.trim();
  if (!title) {
    errors.title = "Link title or item name is required.";
  } else if (title.length > 200) {
    errors.title = "Title cannot exceed 200 characters.";
  }

  // Amount validation (in KES)
  let amountMinor: number | null = null;
  if (rawAmountType === "fixed") {
    const parsedAmount = parseFloat(rawAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      errors.amount = "Please enter a valid amount greater than 0.";
    } else if (parsedAmount > 150000) {
      errors.amount = "M-PESA transaction limit is KES 150,000.";
    } else {
      amountMinor = Math.round(parsedAmount * 100);
    }
  }

  // Payout method validation
  let payoutMethodId: string | null = rawPayoutMethodId.trim() || null;
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
  return {
    success: true,
    slug: finalSlug,
    message: "Payment link created successfully!",
  };
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

  const { error } = await supabase
    .from("payment_links")
    .delete()
    .eq("id", linkId)
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

  const { error } = await supabase
    .from("payment_links")
    .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
    .eq("id", linkId)
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
  const cookieStore = await cookies();
  cookieStore.set("hela_lang", lang, {
    path: "/",
    maxAge: 31536000,
    sameSite: "lax",
  });
}
