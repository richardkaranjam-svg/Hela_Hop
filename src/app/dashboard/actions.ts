"use server";

import { revalidatePath } from "next/cache";

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

/**
 * Normalizes user input into E.164 Kenyan phone format (+2547XXXXXXXX or +2541XXXXXXXX).
 * Returns null if format does not represent a valid Kenyan mobile line.
 */
export async function normalizeKenyanPhone(
  input: string
): Promise<string | null> {
  if (!input) return null;
  let cleaned = input.trim().replace(/[\s\-()]/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "+254" + cleaned.slice(1);
  } else if (cleaned.startsWith("254")) {
    cleaned = "+" + cleaned;
  } else if (
    !cleaned.startsWith("+254") &&
    cleaned.length === 9 &&
    (cleaned.startsWith("7") || cleaned.startsWith("1"))
  ) {
    cleaned = "+254" + cleaned;
  }
  const kenyanRegex = /^\+254(7\d{8}|1\d{8})$/;
  return kenyanRegex.test(cleaned) ? cleaned : null;
}

const usernameRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * Server Action: Update seller profile settings.
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

  const rawFullName = (formData.get("full_name") as string) || "";
  const rawPhone = (formData.get("phone") as string) || "";
  const rawUsername = (formData.get("username") as string) || "";

  const errors: ProfileActionResult["errors"] = {};

  // 1. Full name validation
  const fullName = rawFullName.trim();
  if (fullName.length > 100) {
    errors.full_name = "Full name cannot exceed 100 characters.";
  }

  // 2. Phone validation (E.164 +2547... / +2541...)
  let normalizedPhone: string | null = null;
  if (rawPhone.trim()) {
    normalizedPhone = await normalizeKenyanPhone(rawPhone);
    if (!normalizedPhone) {
      errors.phone =
        "Enter a valid Kenyan number (e.g. +254712345678 or 0712345678).";
    }
  }

  // 3. Username validation
  const username = rawUsername.trim().toLowerCase();
  if (!username) {
    errors.username = "Username is required for your payment link slug.";
  } else if (username.length < 3 || username.length > 40) {
    errors.username = "Username must be between 3 and 40 characters.";
  } else if (!usernameRegex.test(username)) {
    errors.username =
      "Username can only contain lowercase letters, numbers, and single hyphens.";
  } else {
    // Check uniqueness across other users
    const { data: existingUser, error: checkError } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .neq("id", user.id)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking username uniqueness:", checkError);
    } else if (existingUser) {
      errors.username =
        "This username is already taken. Please choose another.";
    }
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  // Perform update in profiles table
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      full_name: fullName || null,
      phone: normalizedPhone,
      username,
      updated_at: new Date().toISOString(),
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

  const rawType = (formData.get("type") as string) || "";
  const rawNumber = (formData.get("number") as string) || "";
  const rawAccountRef = (formData.get("account_ref") as string) || "";
  const rawLabel = (formData.get("label") as string) || "";
  const rawIsDefault =
    formData.get("is_default") === "true" ||
    formData.get("is_default") === "on";

  const allowedTypes: PayoutMethodType[] = [
    "till",
    "paybill",
    "pochi",
    "phone",
  ];
  if (!allowedTypes.includes(rawType as PayoutMethodType)) {
    return {
      success: false,
      errors: { type: "Please select a valid payout method type." },
    };
  }
  const type = rawType as PayoutMethodType;
  const errors: PayoutMethodActionResult["errors"] = {};

  let formattedNumber = rawNumber.trim();
  const formattedAccountRef: string | null = rawAccountRef.trim() || null;

  // Validate according to payout method type
  if (type === "till") {
    formattedNumber = formattedNumber.replace(/[\s\-]/g, "");
    if (!/^\d{5,7}$/.test(formattedNumber)) {
      errors.number = "Till number must be between 5 and 7 digits.";
    }
  } else if (type === "paybill") {
    formattedNumber = formattedNumber.replace(/[\s\-]/g, "");
    if (!/^\d{5,7}$/.test(formattedNumber)) {
      errors.number = "Paybill business number must be between 5 and 7 digits.";
    }
    if (!formattedAccountRef) {
      errors.account_ref =
        "Account reference is required for Paybill (e.g. Order ID, Customer Name).";
    }
  } else if (type === "pochi") {
    const validPhone = await normalizeKenyanPhone(formattedNumber);
    if (!validPhone) {
      errors.number =
        "Pochi phone number must be a valid Kenyan mobile line (e.g. 07XXXXXXXX or +2547XXXXXXXX).";
    } else {
      formattedNumber = validPhone;
    }
  } else if (type === "phone") {
    const validPhone = await normalizeKenyanPhone(formattedNumber);
    if (!validPhone) {
      errors.number =
        "Send Money phone number must be a valid Kenyan mobile line (e.g. 07XXXXXXXX or +2547XXXXXXXX).";
    } else {
      formattedNumber = validPhone;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

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
  const shouldBeDefault = !hasExisting || rawIsDefault;

  // If this will be default and user already has methods, reset existing defaults
  if (shouldBeDefault && hasExisting) {
    await supabase
      .from("payout_methods")
      .update({ is_default: false })
      .eq("user_id", user.id);
  }

  // Label fallback if empty
  const label =
    rawLabel.trim() ||
    (type === "till"
      ? `Till: ${formattedNumber}`
      : type === "paybill"
        ? `Paybill: ${formattedNumber} (${formattedAccountRef})`
        : type === "pochi"
          ? `Pochi: ${formattedNumber}`
          : `Phone: ${formattedNumber}`);

  const { error: insertError } = await supabase.from("payout_methods").insert({
    user_id: user.id,
    type,
    number: formattedNumber,
    account_ref: formattedAccountRef,
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

  // Set all to false
  await supabase
    .from("payout_methods")
    .update({ is_default: false })
    .eq("user_id", user.id);

  // Set selected to true
  const { error } = await supabase
    .from("payout_methods")
    .update({ is_default: true, updated_at: new Date().toISOString() })
    .eq("id", methodId)
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

  // Check if target method was default
  const { data: targetMethod } = await supabase
    .from("payout_methods")
    .select("is_default")
    .eq("id", methodId)
    .eq("user_id", user.id)
    .single();

  const { error: deleteError } = await supabase
    .from("payout_methods")
    .delete()
    .eq("id", methodId)
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
