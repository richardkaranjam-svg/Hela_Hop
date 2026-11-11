"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { generateSecureInvoiceCode } from "@/lib/formatters";
import { normalizeKenyanPhoneSync } from "@/lib/phone";
import { createClient } from "@/lib/supabase/server";
import type { InvoiceItem, InvoiceStatus } from "@/types/database";

const MAX_ITEMS = 50;
// invoices.total_minor is a Postgres INTEGER.
const MAX_TOTAL_MINOR = 2_147_483_647;

const invoiceItemSchema = z.object({
  description: z.string().trim().min(1).max(200),
  quantity: z.number().int().min(1).max(10_000),
  unit_price_minor: z.number().int().min(0).max(15_000_000),
});

/**
 * Items arrive as JSON from a hidden field. Each item is checked separately so
 * the seller sees which line is wrong. Unknown keys are dropped (zod strips
 * them), so nothing extra is stored in the items column.
 */
const itemsSchema = z
  .string()
  .transform((raw, ctx) => {
    let value: unknown;
    try {
      value = JSON.parse(raw);
    } catch {
      ctx.addIssue({ code: "custom", message: "Invalid items list format." });
      return z.NEVER;
    }
    if (!Array.isArray(value) || value.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Please add at least one item to the invoice.",
      });
      return z.NEVER;
    }
    if (value.length > MAX_ITEMS) {
      ctx.addIssue({
        code: "custom",
        message: `An invoice can have at most ${MAX_ITEMS} items.`,
      });
      return z.NEVER;
    }

    const items: InvoiceItem[] = [];
    for (let i = 0; i < value.length; i++) {
      const res = invoiceItemSchema.safeParse(value[i]);
      if (!res.success) {
        const field = res.error.issues[0]?.path[0];
        const message =
          field === "description"
            ? `Item #${i + 1} is missing a description (200 characters at most).`
            : field === "quantity"
              ? `Item #${i + 1} must have a whole-number quantity from 1 to 10,000.`
              : `Item #${i + 1} must have a price from KES 0 to 150,000.`;
        ctx.addIssue({ code: "custom", message });
        return z.NEVER;
      }
      items.push(res.data);
    }
    return items;
  });

const createInvoiceSchema = z.object({
  customer_name: z
    .string()
    .trim()
    .min(1, "Customer name is required.")
    .max(100, "Customer name cannot exceed 100 characters."),
  customer_phone: z
    .string()
    .trim()
    .min(1, "Customer phone number is required.")
    .max(50, "Enter a valid Kenyan number (e.g. 0712 345 678).")
    .transform((value, ctx) => {
      const normalized = normalizeKenyanPhoneSync(value);
      if (!normalized) {
        ctx.addIssue({
          code: "custom",
          message: "Enter a valid Kenyan number (e.g. 0712 345 678).",
        });
        return z.NEVER;
      }
      return normalized;
    }),
  items: itemsSchema,
  due_date: z
    .string()
    .trim()
    .refine(
      (v) =>
        v === "" ||
        (/^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v))),
      "Please choose a valid due date."
    )
    .transform((v) => v || null),
  payout_method_id: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || z.string().uuid().safeParse(v).success,
      "Please choose a valid payout method you own."
    )
    .transform((v) => v || null),
});

const uuidSchema = z.string().uuid();
const invoiceStatusSchema = z.enum(["unpaid", "claimed", "paid", "cancelled"]);

export type InvoiceActionResult = {
  success: boolean;
  code?: string;
  message?: string;
  errors?: {
    customer_name?: string;
    customer_phone?: string;
    items?: string;
    due_date?: string;
    payout_method_id?: string;
    general?: string;
  };
};

/**
 * Server action to create and save a new invoice.
 */
export async function createInvoiceAction(
  _prevState: InvoiceActionResult | null,
  formData: FormData
): Promise<InvoiceActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      errors: { general: "You must be signed in to create an invoice." },
    };
  }

  // 1-5. Validate everything on the server with zod (Task 1.9).
  const parsed = createInvoiceSchema.safeParse({
    customer_name: formData.get("customer_name") ?? "",
    customer_phone: formData.get("customer_phone") ?? "",
    items: formData.get("items_json") ?? "[]",
    due_date: formData.get("due_date") ?? "",
    payout_method_id: formData.get("payout_method_id") ?? "",
  });

  if (!parsed.success) {
    const errors: NonNullable<InvoiceActionResult["errors"]> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? "");
      if (
        field === "customer_name" ||
        field === "customer_phone" ||
        field === "items" ||
        field === "due_date" ||
        field === "payout_method_id"
      ) {
        errors[field] ??= issue.message;
      } else {
        errors.general ??= "Please check the invoice details and try again.";
      }
    }
    return { success: false, errors };
  }

  const {
    customer_name: customerName,
    customer_phone: customerPhone,
    items,
    due_date: dueDate,
  } = parsed.data;

  const errors: InvoiceActionResult["errors"] = {};

  const totalMinor = items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price_minor,
    0
  );
  if (totalMinor > MAX_TOTAL_MINOR) {
    errors.items = "The invoice total is too large.";
  }

  // 6. Payout method validation (must belong to this seller)
  let payoutMethodId: string | null = parsed.data.payout_method_id;
  if (payoutMethodId) {
    const { data: userMethod } = await supabase
      .from("payout_methods")
      .select("id")
      .eq("id", payoutMethodId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!userMethod) {
      errors.payout_method_id = "Please choose a valid payout method you own.";
    }
  } else {
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

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  // Generate random unguessable code (min 10 chars)
  const code = generateSecureInvoiceCode();

  // Insert into public.invoices
  const { error: insertError } = await supabase.from("invoices").insert({
    user_id: user.id,
    code,
    customer_name: customerName,
    customer_phone: customerPhone,
    items,
    total_minor: totalMinor,
    currency: "KES",
    due_date: dueDate,
    status: "unpaid",
    payout_method_id: payoutMethodId,
  });

  if (insertError) {
    console.error("Failed to insert invoice:", insertError);
    return {
      success: false,
      errors: {
        general: insertError.message || "Failed to create invoice.",
      },
    };
  }

  revalidatePath("/dashboard/invoices");
  revalidatePath("/dashboard");
  return {
    success: true,
    code,
    message: "Invoice generated successfully!",
  };
}

/**
 * Server action to delete an invoice.
 */
export async function deleteInvoiceAction(
  invoiceId: string
): Promise<{ success: boolean; message?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Authentication required." };
  }

  const parsedId = uuidSchema.safeParse(invoiceId);
  if (!parsedId.success) {
    return { success: false, message: "Invoice not found." };
  }

  const { error } = await supabase
    .from("invoices")
    .delete()
    .eq("id", parsedId.data)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/dashboard/invoices");
  revalidatePath("/dashboard");
  return { success: true, message: "Invoice deleted." };
}

/**
 * Server action to update an invoice's status.
 * A seller can only CANCEL an unpaid invoice here. "Paid" is only ever set by
 * confirming a claim (D9: no receipt/paid status without the seller confirming).
 */
export async function updateInvoiceStatusAction(
  invoiceId: string,
  status: InvoiceStatus
): Promise<{ success: boolean; message?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Authentication required." };
  }

  const parsedId = uuidSchema.safeParse(invoiceId);
  const parsedStatus = invoiceStatusSchema.safeParse(status);
  if (!parsedId.success || !parsedStatus.success) {
    return { success: false, message: "Invoice not found." };
  }

  if (parsedStatus.data !== "cancelled") {
    return {
      success: false,
      message: "Invoices become paid when you confirm a payment claim.",
    };
  }

  const { data: updated, error } = await supabase
    .from("invoices")
    .update({ status: "cancelled" })
    .eq("id", parsedId.data)
    .eq("user_id", user.id)
    .eq("status", "unpaid")
    .select("id");

  if (error) {
    console.error("Failed to cancel invoice:", error);
    return { success: false, message: "Could not cancel this invoice." };
  }
  if (!updated || updated.length === 0) {
    return {
      success: false,
      message: "Only unpaid invoices can be cancelled.",
    };
  }

  revalidatePath("/dashboard/invoices");
  revalidatePath("/dashboard");
  return { success: true, message: "Invoice cancelled." };
}
