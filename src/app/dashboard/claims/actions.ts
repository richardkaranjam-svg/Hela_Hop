"use server";

import { revalidatePath } from "next/cache";

import { generateReceiptNumber, generateReceiptToken } from "@/lib/formatters";
import { createClient } from "@/lib/supabase/server";

export type SubmitClaimResult = {
  success: boolean;
  message?: string;
  errors?: {
    payer_name?: string;
    payer_phone?: string;
    mpesa_code?: string;
    amount?: string;
    general?: string;
  };
};

/**
 * Public action: Submit an "I've Paid" claim from /pay/[slug] or /i/[code].
 */
export async function submitPaymentClaimAction(data: {
  sellerId: string;
  invoiceId?: string | null;
  paymentLinkId?: string | null;
  payerName: string;
  payerPhone: string;
  mpesaCode: string;
  amountMinor: number;
}): Promise<SubmitClaimResult> {
  const supabase = await createClient();

  const payerName = data.payerName.trim();
  const payerPhone = data.payerPhone.trim();
  const mpesaCode = data.mpesaCode.trim().toUpperCase();
  const amountMinor = Math.round(Number(data.amountMinor));

  const errors: SubmitClaimResult["errors"] = {};

  if (!payerName) {
    errors.payer_name = "Your name is required.";
  }

  if (!payerPhone) {
    errors.payer_phone = "Your phone number is required.";
  }

  if (!/^[A-Z0-9]{10}$/.test(mpesaCode)) {
    errors.mpesa_code =
      "Please enter a valid 10-character M-PESA confirmation code (e.g. SDF489K1L2).";
  }

  if (isNaN(amountMinor) || amountMinor <= 0) {
    errors.amount = "Invalid payment amount.";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  // Check unique mpesa_code per seller constraint
  const { data: existingClaim } = await supabase
    .from("payment_claims")
    .select("id")
    .eq("seller_id", data.sellerId)
    .eq("mpesa_code", mpesaCode)
    .maybeSingle();

  if (existingClaim) {
    return {
      success: false,
      errors: {
        mpesa_code:
          "This M-PESA confirmation code has already been submitted to this seller.",
      },
    };
  }

  // Insert claim
  const { error: insertError } = await supabase.from("payment_claims").insert({
    seller_id: data.sellerId,
    invoice_id: data.invoiceId || null,
    payment_link_id: data.paymentLinkId || null,
    payer_name: payerName,
    payer_phone: payerPhone,
    mpesa_code: mpesaCode,
    amount_minor: amountMinor,
    status: "pending",
  });

  if (insertError) {
    console.error("Failed to submit claim:", insertError);
    return {
      success: false,
      errors: {
        general:
          insertError.message || "Failed to submit claim. Please try again.",
      },
    };
  }

  // If attached to an invoice, update invoice status to 'claimed'
  if (data.invoiceId) {
    await supabase
      .from("invoices")
      .update({
        status: "claimed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.invoiceId);

    revalidatePath("/dashboard/invoices");
  }

  revalidatePath("/dashboard/claims");
  revalidatePath("/dashboard");
  return {
    success: true,
    message: "Claim sent. Waiting for the seller to confirm.",
  };
}

/**
 * Seller action: Confirm a pending payment claim and issue a receipt.
 */
export async function confirmPaymentClaimAction(
  claimId: string
): Promise<{ success: boolean; receiptToken?: string; message?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Authentication required." };
  }

  // 1. Fetch claim to verify ownership
  const { data: claim, error: claimError } = await supabase
    .from("payment_claims")
    .select("id, seller_id, invoice_id, amount_minor")
    .eq("id", claimId)
    .eq("seller_id", user.id)
    .single();

  if (claimError || !claim) {
    return { success: false, message: "Claim not found or unauthorized." };
  }

  // 2. Update claim to 'confirmed'
  const { error: updateError } = await supabase
    .from("payment_claims")
    .update({
      status: "confirmed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", claim.id);

  if (updateError) {
    return { success: false, message: updateError.message };
  }

  // 3. If tied to an invoice, set invoice to 'paid'
  if (claim.invoice_id) {
    await supabase
      .from("invoices")
      .update({
        status: "paid",
        updated_at: new Date().toISOString(),
      })
      .eq("id", claim.invoice_id);

    revalidatePath("/dashboard/invoices");
  }

  // 4. Create receipt with random unguessable public_token
  const receiptNumber = generateReceiptNumber();
  const publicToken = generateReceiptToken();

  const { error: receiptError } = await supabase.from("receipts").insert({
    claim_id: claim.id,
    seller_id: user.id,
    receipt_number: receiptNumber,
    public_token: publicToken,
  });

  if (receiptError) {
    console.error("Error creating receipt record:", receiptError);
  }

  revalidatePath("/dashboard/claims");
  revalidatePath("/dashboard");
  return {
    success: true,
    receiptToken: publicToken,
    message: "Payment confirmed! Receipt generated.",
  };
}

/**
 * Seller action: Reject a pending claim (returns invoice to unpaid).
 */
export async function rejectPaymentClaimAction(
  claimId: string,
  reason?: string
): Promise<{ success: boolean; message?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Authentication required." };
  }

  // 1. Fetch claim
  const { data: claim, error: claimError } = await supabase
    .from("payment_claims")
    .select("id, invoice_id")
    .eq("id", claimId)
    .eq("seller_id", user.id)
    .single();

  if (claimError || !claim) {
    return { success: false, message: "Claim not found or unauthorized." };
  }

  // 2. Update claim to 'rejected'
  const { error: updateError } = await supabase
    .from("payment_claims")
    .update({
      status: "rejected",
      reject_reason: reason || "Code could not be verified in seller's SMS.",
      updated_at: new Date().toISOString(),
    })
    .eq("id", claim.id);

  if (updateError) {
    return { success: false, message: updateError.message };
  }

  // 3. Return attached invoice to 'unpaid'
  if (claim.invoice_id) {
    await supabase
      .from("invoices")
      .update({
        status: "unpaid",
        updated_at: new Date().toISOString(),
      })
      .eq("id", claim.invoice_id);

    revalidatePath("/dashboard/invoices");
  }

  revalidatePath("/dashboard/claims");
  revalidatePath("/dashboard");
  return {
    success: true,
    message: "Claim marked as rejected.",
  };
}
