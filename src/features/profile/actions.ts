"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { normalizeKenyanPhoneSync } from "@/lib/mpesa/phone";
import { createClient } from "@/lib/supabase/server";
import { firstErrors } from "@/lib/validation";

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

  if (!parsed.success) {
    return {
      success: false,
      errors: firstErrors(parsed.error, [
        "full_name",
        "phone",
        "username",
      ] as const),
    };
  }

  // A taken username is caught by the UNIQUE constraint below (23505). We can't
  // check first: RLS only lets a seller read their own profile row.
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
    // 23505 = unique_violation: the username belongs to another seller.
    return {
      success: false,
      errors:
        updateError.code === "23505"
          ? {
              username:
                "This username is already taken. Please choose another.",
            }
          : { general: "Could not update your profile. Please try again." },
    };
  }

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  return {
    success: true,
    message: "Profile updated successfully!",
  };
}
