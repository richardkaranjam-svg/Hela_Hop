"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { normalizeKenyanPhoneSync } from "@/lib/mpesa/phone";
import { createClient } from "@/lib/supabase/server";
import { firstErrors, uuidSchema } from "@/lib/validation";
import type { PayoutMethodType } from "@/types/database";

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

/** Shape returned by the add/set_default/delete_payout_method RPCs. */
type PayoutRpcResult = {
  ok: boolean;
  error?: "not_authenticated" | "not_found";
};

/** Friendly text for a failed payout RPC. Never shows raw database errors. */
function payoutErrorMessage(result: PayoutRpcResult | null): string {
  if (result?.error === "not_found") return "Payout method not found.";
  if (result?.error === "not_authenticated") return "Authentication required.";
  return "Something went wrong. Please try again.";
}

const payoutMethodSchema = z
  .object({
    type: z.enum(["till", "paybill", "pochi", "phone"], {
      errorMap: () => ({
        message: "Please select a valid payout method type.",
      }),
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

    if (d.type === "till" || d.type === "paybill") {
      number = number.replace(/[\s-]/g, "");
      if (!/^\d{5,7}$/.test(number)) {
        ctx.addIssue({
          code: "custom",
          path: ["number"],
          message:
            d.type === "till"
              ? "Till number must be between 5 and 7 digits."
              : "Paybill business number must be between 5 and 7 digits.",
        });
      }
      if (d.type === "paybill" && !accountRef) {
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
          message: `${d.type === "pochi" ? "Pochi" : "Send Money"} phone number must be a valid Kenyan mobile line (e.g. 07XXXXXXXX or +2547XXXXXXXX).`,
        });
      } else {
        number = phone;
      }
    }

    return {
      type: d.type as PayoutMethodType,
      number,
      // Only Paybill uses an account reference.
      accountRef: d.type === "paybill" ? accountRef : null,
      label: d.label,
      isDefault: d.is_default,
    };
  });

const DEFAULT_LABEL_PREFIX: Record<PayoutMethodType, string> = {
  till: "Till",
  paybill: "Paybill",
  pochi: "Pochi",
  phone: "Phone",
};

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

  const { type, number, accountRef, isDefault } = parsed.data;
  const label =
    parsed.data.label ||
    `${DEFAULT_LABEL_PREFIX[type]}: ${number}${accountRef ? ` (${accountRef})` : ""}`;

  // One transaction: clears the old default (if needed) and inserts the new
  // method. The first method a seller adds always becomes the default.
  const { data, error } = await supabase.rpc("add_payout_method", {
    p_type: type,
    p_number: number,
    p_account_ref: accountRef ?? "",
    p_label: label,
    p_make_default: isDefault,
  });

  const result = data as PayoutRpcResult | null;
  if (error || !result?.ok) {
    console.error("add_payout_method failed:", error ?? result?.error);
    return {
      success: false,
      errors: {
        general: "Could not save the payout method. Please try again.",
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
  const parsedId = uuidSchema.safeParse(methodId);
  if (!parsedId.success) {
    return { success: false, message: "Payout method not found." };
  }

  // The RPC checks the logged-in user itself (auth.uid()).
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("set_default_payout_method", {
    p_method_id: parsedId.data,
  });

  const result = data as PayoutRpcResult | null;
  if (error || !result?.ok) {
    console.error("set_default_payout_method failed:", error ?? result?.error);
    return { success: false, message: payoutErrorMessage(result) };
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
  const parsedId = uuidSchema.safeParse(methodId);
  if (!parsedId.success) {
    return { success: false, message: "Payout method not found." };
  }

  // One transaction: deletes, and if it was the default, promotes the oldest
  // remaining method so the seller is never left without a default.
  // The RPC checks the logged-in user itself (auth.uid()).
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("delete_payout_method", {
    p_method_id: parsedId.data,
  });

  const result = data as PayoutRpcResult | null;
  if (error || !result?.ok) {
    console.error("delete_payout_method failed:", error ?? result?.error);
    return { success: false, message: payoutErrorMessage(result) };
  }

  revalidatePath("/dashboard/payout-methods");
  revalidatePath("/dashboard");
  return { success: true, message: "Payout method removed." };
}
