"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { notifySellerOfClaim } from "@/lib/email";
import { normalizeKenyanPhoneSync } from "@/lib/phone";
import { getClientIp, hitRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
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
  rate_limited:
    "Too many attempts. Please wait a few minutes and try again.",
};

/** Shape check: exactly one target, and only the types we expect. */
const claimTargetSchema = z
  .object({
    paymentLinkId: z.string().uuid().nullish(),
    invoiceCode: z
      .string()
      .min(10)
      .max(64)
      .regex(/^[A-Za-z0-9_-]+$/)
      .nullish(),
    payerName: z.string().max(500).optional(),
    payerPhone: z.string().max(50).optional(),
    mpesaCode: z.string().max(50),
    amountMinor: z.number().nullish(),
  })
  .refine((d) => Boolean(d.paymentLinkId) !== Boolean(d.invoiceCode), {
    message: "invalid_target",
  });

/**
 * Field rules. For invoices, name, phone and amount come from the invoice
 * itself, so they are only checked for payment-link claims.
 */
const claimFieldsSchema = claimTargetSchema
  .transform((d) => ({
    isInvoice: Boolean(d.invoiceCode),
    paymentLinkId: d.paymentLinkId ?? null,
    invoiceCode: d.invoiceCode ?? null,
    mpesaCode: d.mpesaCode.trim().toUpperCase(),
    payerName: (d.payerName ?? "").trim().slice(0, 100),
    payerPhone: d.invoiceCode
      ? ""
      : (normalizeKenyanPhoneSync((d.payerPhone ?? "").trim()) ?? ""),
    amountMinor: d.amountMinor == null ? null : Math.round(d.amountMinor),
  }))
  .superRefine((d, ctx) => {
    if (!/^[A-Z0-9]{10}$/.test(d.mpesaCode)) {
      ctx.addIssue({ code: "custom", path: ["mpesa_code"], message: CLAIM_ERROR_MESSAGES.invalid_code });
    }
    if (d.isInvoice) return;
    if (!d.payerName) {
      ctx.addIssue({ code: "custom", path: ["payer_name"], message: CLAIM_ERROR_MESSAGES.invalid_name });
    }
    if (!d.payerPhone) {
      ctx.addIssue({ code: "custom", path: ["payer_phone"], message: "Enter a valid Kenyan number (e.g. 0712 345 678)." });
    }
    if (
      d.amountMinor !== null &&
      (!Number.isFinite(d.amountMinor) ||
        d.amountMinor <= 0 ||
        d.amountMinor > 15_000_000)
    ) {
      ctx.addIssue({ code: "custom", path: ["amount"], message: CLAIM_ERROR_MESSAGES.invalid_amount });
    }
  });

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
  // 1. Validate on the server with zod (Task 1.9).
  const parsed = claimFieldsSchema.safeParse(data);
  if (!parsed.success) {
    const errors: NonNullable<SubmitClaimResult["errors"]> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (
        field === "mpesa_code" ||
        field === "payer_name" ||
        field === "payer_phone" ||
        field === "amount"
      ) {
        errors[field] ??= issue.message;
      } else {
        // Wrong types or not exactly one target: the page itself is broken.
        errors.general = CLAIM_ERROR_MESSAGES.invalid_target;
      }
    }
    return { success: false, errors };
  }
  const {
    isInvoice,
    paymentLinkId,
    invoiceCode,
    mpesaCode,
    payerName,
    payerPhone,
    amountMinor,
  } = parsed.data;

  // 2. Shared rate limit (Task 1.9): 5 claims per 10 minutes per IP + target.
  const ip = getClientIp(await headers());
  const target = isInvoice ? `inv:${invoiceCode}` : `link:${paymentLinkId}`;
  const allowed = await hitRateLimit(
    `claim:${ip}:${target}`,
    RATE_LIMITS.claim
  );
  if (!allowed) {
    return {
      success: false,
      errors: { general: CLAIM_ERROR_MESSAGES.rate_limited },
    };
  }

  const supabase = await createClient();
  const { data: raw, error } = await supabase.rpc("submit_payment_claim", {
    p_payment_link_id: isInvoice ? null : paymentLinkId,
    p_invoice_code: isInvoice ? invoiceCode : null,
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
    revalidatePath(`/i/${invoiceCode}`);
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

const claimIdSchema = z.string().uuid();
const rejectReasonSchema = z.string().max(500).optional();

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

  const parsedId = claimIdSchema.safeParse(claimId);
  if (!parsedId.success) {
    return { success: false, message: SELLER_ERROR_MESSAGES.not_found };
  }

  const { data: raw, error } = await supabase.rpc("confirm_payment_claim", {
    p_claim_id: parsedId.data,
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

  const parsedId = claimIdSchema.safeParse(claimId);
  const parsedReason = rejectReasonSchema.safeParse(reason);
  if (!parsedId.success) {
    return { success: false, message: SELLER_ERROR_MESSAGES.not_found };
  }
  if (!parsedReason.success) {
    return {
      success: false,
      message: "Reason is too long (500 characters at most).",
    };
  }

  const { data: raw, error } = await supabase.rpc("reject_payment_claim", {
    p_claim_id: parsedId.data,
    p_reason: parsedReason.data ?? "",
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
