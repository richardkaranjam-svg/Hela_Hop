"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { normalizeKenyanPhoneSync } from "@/lib/phone";
import { createClient } from "@/lib/supabase/server";
import type { PayoutMethodType } from "@/types/database";

export type ProfileActionResult = {
  success: boolean;
  message?: string;
  errors?: {
    full_name?: string;
    phone?: string;
    username?: string;
    general?: string;
  };
};

export type PayoutMethodActionResult = {
  success: boolean;
  message?: string;
  errors?: {
    type?: string;
    number?: string;
    account_ref?: string;
    label?: string;
    general?: string;
  };
};

/** First error message per field, from a zod error. */
function firstErrors<K extends string>(
  error: z.ZodError,
  fields: readonly K[]
): Partial<Record<K | "general", string>> {
  const out: Partial<Record<K | "general", string>> = {};
  for (const issue of error.issues) {
    const path = String(issue.path[0] ?? "");
    const key = (fields as readonly string[]).includes(path)
      ? (path as K)
      : "general";
    out[key] ??= issue.message;
  }
  return out;
}

const uuidSchema = z.string().uuid();

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

const usernameRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const USERNAME_LENGTH_MESSAGE = "Username must be between 3 and 40 characters.";

const profileSchema = z.object({
  full_name: z
    .string()
    .trim()
    .max(100, "Full name cannot exceed 100 characters."),
  // Optional: empty means "no phone". Otherwise must be a Kenyan mobile.
  phone: z
    .string()
    .trim()
    .max(50, "Enter a valid Kenyan number (e.g. +254712345678 or 0712345678).")
    .transform((value, ctx) => {
      if (!value) return null;
      const normalized = normalizeKenyanPhoneSync(value);
      if (!normalized) {
        ctx.addIssue({
          code: "custom",
          message:
            "Enter a valid Kenyan number (e.g. +254712345678 or 0712345678).",
        });
        return z.NEVER;
      }
      return normalized;
    }),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Username is required for your payment link slug.")
    .min(3, USERNAME_LENGTH_MESSAGE)
    .max(40, USERNAME_LENGTH_MESSAGE)
    .regex(
      usernameRegex,
      "Username can only contain lowercase letters, numbers, and single hyphens."
    ),
});

/**
 * Server Action: Update seller profile settings.
 * Only full_name, phone and username can change (Task 1.9: the database also
 * enforces this with column-level grants).
 */
export async function updateProfileAction(
  _prevState: ProfileActionResult | null,
  formData: FormData
): Promise<ProfileActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      errors: { general: "You must be logged in to update your profile." },
    };
  }

  const parsed = profileSchema.safeParse({
    full_name: formData.get("full_name") ?? "",
    phone: formData.get("phone") ?? "",
    username: formData.get("username") ?? "",
  });

  const errors: ProfileActionResult["errors"] = parsed.success
    ? {}
    : firstErrors(parsed.error, ["full_name", "phone", "username"] as const);

  // Username uniqueness (only once the format is valid).
  if (parsed.success) {
    const { data: existingUser, error: checkError } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", parsed.data.username)
      .neq("id", user.id)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking username uniqueness:", checkError);
    } else if (existingUser) {
      errors.username = "This username is already taken. Please choose another.";
    }
  }

  if (!parsed.success || Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  // updated_at is set by the profiles_updated_at trigger.
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.full_name || null,
      phone: parsed.data.phone,
      username: parsed.data.username,
    })
    .eq("id", user.id);

  if (updateError) {
    console.error("Failed to update profile:", updateError);
    return {
      success: false,
      errors: { general: updateError.message || "Failed to update profile." },
    };
  }

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  return {
    success: true,
    message: "Profile updated successfully!",
  };
}

// ---------------------------------------------------------------------------
// Payout methods
// ---------------------------------------------------------------------------

const payoutMethodSchema = z
  .object({
    type: z.enum(["till", "paybill", "pochi", "phone"], {
      errorMap: () => ({ message: "Please select a valid payout method type." }),
    }),
    number: z.string().trim().max(50, "Number is too long."),
    account_ref: z
      .string()
      .trim()
      .max(100, "Account reference cannot exceed 100 characters."),
    label: z.string().trim().max(100, "Nickname cannot exceed 100 characters."),
    is_default: z.boolean(),
  })
  .transform((d, ctx) => {
    let number = d.number;
    const accountRef = d.account_ref || null;

    if (d.type === "till") {
      number = number.replace(/[\s-]/g, "");
      if (!/^\d{5,7}$/.test(number)) {
        ctx.addIssue({
          code: "custom",
          path: ["number"],
          message: "Till number must be between 5 and 7 digits.",
        });
      }
    } else if (d.type === "paybill") {
      number = number.replace(/[\s-]/g, "");
      if (!/^\d{5,7}$/.test(number)) {
        ctx.addIssue({
          code: "custom",
          path: ["number"],
          message: "Paybill business number must be between 5 and 7 digits.",
        });
      }
      if (!accountRef) {
        ctx.addIssue({
          code: "custom",
          path: ["account_ref"],
          message:
            "Account reference is required for Paybill (e.g. Order ID, Customer Name).",
        });
      }
    } else {
      const phone = normalizeKenyanPhoneSync(number);
      if (!phone) {
        ctx.addIssue({
          code: "custom",
          path: ["number"],
          message:
            d.type === "pochi"
              ? "Pochi phone number must be a valid Kenyan mobile line (e.g. 07XXXXXXXX or +2547XXXXXXXX)."
              : "Send Money phone number must be a valid Kenyan mobile line (e.g. 07XXXXXXXX or +2547XXXXXXXX).",
        });
      } else {
        number = phone;
      }
    }

    return {
      type: d.type as PayoutMethodType,
      number,
      accountRef,
      label: d.label,
      isDefault: d.is_default,
    };
  });

/**
 * Server Action: Create a new payout method for the seller.
 */
export async function createPayoutMethodAction(
  _prevState: PayoutMethodActionResult | null,
  formData: FormData
): Promise<PayoutMethodActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      errors: { general: "You must be logged in to add a payout method." },
    };
  }

  const rawIsDefault = formData.get("is_default");
  const parsed = payoutMethodSchema.safeParse({
    type: formData.get("type") ?? "",
    number: formData.get("number") ?? "",
    account_ref: formData.get("account_ref") ?? "",
    label: formData.get("label") ?? "",
    is_default: rawIsDefault === "true" || rawIsDefault === "on",
  });

  if (!parsed.success) {
    const errors = firstErrors(parsed.error, [
      "type",
      "number",
      "account_ref",
      "label",
    ] as const);
    // An invalid type makes the other messages meaningless: show only that.
    return {
      success: false,
      errors: errors.type ? { type: errors.type } : errors,
    };
  }

  const { type, number: formattedNumber, accountRef, isDefault } = parsed.data;

  // Count existing payout methods for this user
  const { data: existingMethods, error: countError } = await supabase
    .from("payout_methods")
    .select("id, is_default")
    .eq("user_id", user.id);

  if (countError) {
    console.error("Error reading existing payout methods:", countError);
  }

  const hasExisting = (existingMethods?.length || 0) > 0;
  // If user has no existing payout methods, force this one to be default
  const shouldBeDefault = !hasExisting || isDefault;

  // If this will be default and user already has methods, reset existing defaults
  if (shouldBeDefault && hasExisting) {
    await supabase
      .from("payout_methods")
      .update({ is_default: false })
      .eq("user_id", user.id);
  }

  // Label fallback if empty
  const label =
    parsed.data.label ||
    (type === "till"
      ? `Till: ${formattedNumber}`
      : type === "paybill"
        ? `Paybill: ${formattedNumber} (${accountRef})`
        : type === "pochi"
          ? `Pochi: ${formattedNumber}`
          : `Phone: ${formattedNumber}`);

  const { error: insertError } = await supabase.from("payout_methods").insert({
    user_id: user.id,
    type,
    number: formattedNumber,
    account_ref: accountRef,
    label,
    is_default: shouldBeDefault,
  });

  if (insertError) {
    console.error("Failed to insert payout method:", insertError);
    return {
      success: false,
      errors: {
        general: insertError.message || "Failed to save payout method.",
      },
    };
  }

  revalidatePath("/dashboard/payout-methods");
  revalidatePath("/dashboard");
  return {
    success: true,
    message: "Payout method added successfully!",
  };
}

/**
 * Server Action: Set a payout method as default.
 */
export async function setDefaultPayoutMethodAction(
  methodId: string
): Promise<{ success: boolean; message?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Authentication required." };
  }

  const parsedId = uuidSchema.safeParse(methodId);
  if (!parsedId.success) {
    return { success: false, message: "Payout method not found." };
  }

  // Set all to false
  await supabase
    .from("payout_methods")
    .update({ is_default: false })
    .eq("user_id", user.id);

  // Set selected to true
  const { error } = await supabase
    .from("payout_methods")
    .update({ is_default: true, updated_at: new Date().toISOString() })
    .eq("id", parsedId.data)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/dashboard/payout-methods");
  revalidatePath("/dashboard");
  return { success: true, message: "Default payout method updated." };
}

/**
 * Server Action: Delete a payout method.
 */
export async function deletePayoutMethodAction(
  methodId: string
): Promise<{ success: boolean; message?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Authentication required." };
  }

  const parsedId = uuidSchema.safeParse(methodId);
  if (!parsedId.success) {
    return { success: false, message: "Payout method not found." };
  }

  // Check if target method was default
  const { data: targetMethod } = await supabase
    .from("payout_methods")
    .select("is_default")
    .eq("id", parsedId.data)
    .eq("user_id", user.id)
    .single();

  const { error: deleteError } = await supabase
    .from("payout_methods")
    .delete()
    .eq("id", parsedId.data)
    .eq("user_id", user.id);

  if (deleteError) {
    return { success: false, message: deleteError.message };
  }

  // If the deleted one was default, pick another method to be default
  if (targetMethod?.is_default) {
    const { data: remaining } = await supabase
      .from("payout_methods")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1);

    if (remaining && remaining.length > 0) {
      await supabase
        .from("payout_methods")
        .update({ is_default: true })
        .eq("id", remaining[0].id)
        .eq("user_id", user.id);
    }
  }

  revalidatePath("/dashboard/payout-methods");
  revalidatePath("/dashboard");
  return { success: true, message: "Payout method removed." };
}
