"use server";

import { revalidatePath } from "next/cache";

import { generateSecureInvoiceCode } from "@/lib/formatters";
import { createClient } from "@/lib/supabase/server";
import type { InvoiceItem, InvoiceStatus } from "@/types/database";

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

  const rawCustomerName = (formData.get("customer_name") as string) || "";
  const rawCustomerPhone = (formData.get("customer_phone") as string) || "";
  const rawItemsJson = (formData.get("items_json") as string) || "[]";
  const rawDueDate = (formData.get("due_date") as string) || "";
  const rawPayoutMethodId = (formData.get("payout_method_id") as string) || "";

  const errors: InvoiceActionResult["errors"] = {};

  // 1. Validate Customer Name
  const customerName = rawCustomerName.trim();
  if (!customerName) {
    errors.customer_name = "Customer name is required.";
  } else if (customerName.length > 100) {
    errors.customer_name = "Customer name cannot exceed 100 characters.";
  }

  // 2. Validate Customer Phone
  const customerPhone = rawCustomerPhone.trim();
  if (!customerPhone) {
    errors.customer_phone = "Customer phone number is required.";
  }

  // 3. Parse & Validate Items
  let items: InvoiceItem[] = [];
  try {
    items = JSON.parse(rawItemsJson);
  } catch {
    errors.items = "Invalid items list format.";
  }

  if (!Array.isArray(items) || items.length === 0) {
    errors.items = "Please add at least one item to the invoice.";
  } else {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.description?.trim()) {
        errors.items = `Item #${i + 1} is missing a description.`;
        break;
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.items = `Item #${i + 1} must have a quantity of at least 1.`;
        break;
      }
      if (item.unit_price_minor < 0) {
        errors.items = `Item #${i + 1} cannot have a negative price.`;
        break;
      }
    }
  }

  // 4. Calculate total_minor
  let totalMinor = 0;
  if (!errors.items && items.length > 0) {
    totalMinor = items.reduce(
      (sum, item) => sum + Math.round(item.quantity * item.unit_price_minor),
      0
    );
  }

  // 5. Due date validation
  let dueDate: string | null = null;
  if (rawDueDate.trim()) {
    dueDate = rawDueDate.trim();
  }

  // 6. Payout method validation
  let payoutMethodId: string | null = rawPayoutMethodId.trim() || null;
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

  const { error } = await supabase
    .from("invoices")
    .delete()
    .eq("id", invoiceId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/dashboard/invoices");
  revalidatePath("/dashboard");
  return { success: true, message: "Invoice deleted." };
}

/**
 * Server action to update an invoice's status (e.g. mark cancelled or paid).
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

  const { error } = await supabase
    .from("invoices")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", invoiceId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/dashboard/invoices");
  return { success: true, message: `Invoice marked as ${status}.` };
}

/**
 * Public server action for a customer to submit their M-PESA claim on /i/[code].
 */
export async function submitInvoiceClaimAction(
  code: string,
  mpesaCode: string
): Promise<{ success: boolean; message?: string }> {
  const cleanCode = mpesaCode.trim().toUpperCase();
  if (!/^[A-Z0-9]{10}$/.test(cleanCode)) {
    return {
      success: false,
      message: "Please enter a valid 10-character M-PESA confirmation code.",
    };
  }

  const supabase = await createClient();

  // Find invoice
  const { data: inv, error: invError } = await supabase
    .from("invoices")
    .select("id, user_id, customer_name, customer_phone, total_minor, status")
    .eq("code", code)
    .single();

  if (invError || !inv) {
    return { success: false, message: "Invoice not found." };
  }

  if (inv.status === "paid") {
    return { success: false, message: "This invoice has already been paid." };
  }

  // Check unique mpesa_code constraint per seller
  const { data: existingClaim } = await supabase
    .from("payment_claims")
    .select("id")
    .eq("seller_id", inv.user_id)
    .eq("mpesa_code", cleanCode)
    .maybeSingle();

  if (existingClaim) {
    return {
      success: false,
      message: "This M-PESA code has already been submitted to this seller.",
    };
  }

  // Insert payment claim
  const { error: claimError } = await supabase.from("payment_claims").insert({
    seller_id: inv.user_id,
    invoice_id: inv.id,
    payer_name: inv.customer_name,
    payer_phone: inv.customer_phone,
    mpesa_code: cleanCode,
    amount_minor: inv.total_minor,
    status: "pending",
  });

  if (claimError) {
    console.error("Failed to insert invoice payment claim:", claimError);
    return {
      success: false,
      message: claimError.message || "Failed to submit claim.",
    };
  }

  // Update invoice status to 'claimed'
  await supabase
    .from("invoices")
    .update({
      status: "claimed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", inv.id);

  revalidatePath(`/i/${code}`);
  revalidatePath("/dashboard/invoices");
  revalidatePath("/dashboard/claims");
  revalidatePath("/dashboard");
  return {
    success: true,
    message: "Claim sent. Waiting for the seller to confirm.",
  };
}
