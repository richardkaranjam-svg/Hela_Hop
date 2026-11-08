"use server";

import { revalidatePath } from "next/cache";

import { notifySellerOfClaim } from "@/lib/email";
import { normalizeKenyanPhoneSync } from "@/lib/phone";
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

type RpcClaimResponse = {
  ok: boolean;
  claim_id?: string;
  field?: "mpesa_code" | "payer_name" | "payer_phone" | "amount" | "general";
  error?: string;
};

const CLAIM_ERROR_MESSAGES: Record<string, string> = {
  invalid_code:
    "Please enter the 10-character M-PESA code from your SMS (e.g. SDF489K1L2).",
  duplicate_code:
    "This M-PESA code has already been sent to this seller. Please check the code.",
  invalid_name: "Please enter your name.",
  invalid_phone: "Please enter a valid phone number.",
  invalid_amount: "Please enter a valid amount (KES 1 to 150,000).",
  already_paid: "This invoice has already been paid.",
  already_claimed:
    "A payment claim for this invoice is already waiting for the seller.",
  cancelled: "This invoice was cancelled by the seller.",
  not_found: "This payment page is no longer available.",
  invalid_target: "Something went wrong. Please reload the page.",
};

/**
 * Public action: send an "I've Paid" claim from /pay/[slug] or /i/[code].
 * Pass EITHER paymentLinkId OR invoiceCode. The seller is looked up in the
 * database function, never taken from the browser (D9: a claim is not a receipt).
 */
export async function submitClaimAction(data: {
  paymentLinkId?: string | null;
  invoiceCode?: string | null;
  payerName?: string;
  payerPhone?: string;
  mpesaCode: string;
  amountMinor?: number | null;
}): Promise<SubmitClaimResult> {
  const mpesaCode = (data.mpesaCode || "").trim().toUpperCase();
  const payerName = (data.payerName || "").trim().slice(0, 100);
  const rawPhone = (data.payerPhone || "").trim();
  const isInvoice = Boolean(data.invoiceCode);

  const errors: NonNullable<SubmitClaimResult["errors"]> = {};

  if (!/^[A-Z0-9]{10}$/.test(mpesaCode)) {
    errors.mpesa_code = CLAIM_ERROR_MESSAGES.invalid_code;
  }

  // For invoices, name and phone come from the invoice itself.
  let payerPhone = "";
  if (!isInvoice) {
    if (!payerName) {
      errors.payer_name = CLAIM_ERROR_MESSAGES.invalid_name;
    }
    const normalized = normalizeKenyanPhoneSync(rawPhone);
    if (!normalized) {
      errors.payer_phone = "Enter a valid Kenyan number (e.g. 0712 345 678).";
    } else {
      payerPhone = normalized;
    }
  }

  const amountMinor =
    data.amountMinor == null ? null : Math.round(Number(data.amountMinor));
  if (
    !isInvoice &&
    amountMinor !== null &&
    (!Number.isFinite(amountMinor) ||
      amountMinor <= 0 ||
      amountMinor > 15_000_000)
  ) {
    errors.amount = CLAIM_ERROR_MESSAGES.invalid_amount;
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  const supabase = await createClient();
  const { data: raw, error } = await supabase.rpc("submit_payment_claim", {
    p_payment_link_id: isInvoice ? null : (data.paymentLinkId ?? null),
    p_invoice_code: isInvoice ? (data.invoiceCode ?? null) : null,
    p_payer_name: payerName,
    p_payer_phone: payerPhone,
    p_mpesa_code: mpesaCode,
    p_amount_minor: amountMinor,
  });

  if (error) {
    console.error("submit_payment_claim failed:", error);
    return {
      success: false,
      errors: { general: "Could not send your claim. Please try again." },
    };
  }

  const res = raw as unknown as RpcClaimResponse;
  if (!res?.ok) {
    const message =
      CLAIM_ERROR_MESSAGES[res?.error ?? ""] ??
      "Could not send your claim. Please try again.";
    const field = res?.field ?? "general";
    return { success: false, errors: { [field]: message } };
  }

  // Tell the seller (Task 1.5). Never blocks or fails the payer's claim.
  if (res.claim_id) {
    await notifySellerOfClaim(res.claim_id);
  }

  if (isInvoice) {
    revalidatePath(`/i/${data.invoiceCode}`);
    revalidatePath("/dashboard/invoices");
  }
  revalidatePath("/dashboard/claims");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: "Claim sent. Waiting for the seller to confirm.",
  };
}

type RpcSellerResponse = {
  ok: boolean;
  error?: string;
  receipt_token?: string;
  receipt_number?: string;
};

const SELLER_ERROR_MESSAGES: Record<string, string> = {
  not_authenticated: "Please log in again.",
  not_found: "Claim not found.",
  not_pending: "This claim was already handled. Refresh the page.",
};

/**
 * Seller action: confirm a PENDING claim after checking their own M-PESA SMS.
 * Claim, invoice and receipt are updated together in one database transaction.
 */
export async function confirmPaymentClaimAction(claimId: string): Promise<{
  success: boolean;
  message?: string;
  receiptToken?: string;
  receiptNumber?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: "Authentication required." };
  }

  const { data: raw, error } = await supabase.rpc("confirm_payment_claim", {
    p_claim_id: claimId,
  });
  if (error) {
    console.error("confirm_payment_claim failed:", error);
    return { success: false, message: "Could not confirm. Please try again." };
  }

  const res = raw as unknown as RpcSellerResponse;
  if (!res?.ok) {
    return {
      success: false,
      message:
        SELLER_ERROR_MESSAGES[res?.error ?? ""] ??
        "Could not confirm. Please try again.",
    };
  }

  revalidatePath("/dashboard/claims");
  revalidatePath("/dashboard/invoices");
  revalidatePath("/dashboard");
  return {
    success: true,
    receiptToken: res.receipt_token,
    receiptNumber: res.receipt_number,
    message: "Payment confirmed. Receipt created.",
  };
}

/**
 * Seller action: reject a PENDING claim (an attached invoice returns to unpaid).
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

  const { data: raw, error } = await supabase.rpc("reject_payment_claim", {
    p_claim_id: claimId,
    p_reason: reason ?? "",
  });
  if (error) {
    console.error("reject_payment_claim failed:", error);
    return { success: false, message: "Could not reject. Please try again." };
  }

  const res = raw as unknown as RpcSellerResponse;
  if (!res?.ok) {
    return {
      success: false,
      message:
        SELLER_ERROR_MESSAGES[res?.error ?? ""] ??
        "Could not reject. Please try again.",
    };
  }

  revalidatePath("/dashboard/claims");
  revalidatePath("/dashboard/invoices");
  revalidatePath("/dashboard");
  return { success: true, message: "Claim rejected." };
}
