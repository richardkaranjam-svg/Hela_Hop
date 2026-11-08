import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import type { InvoiceItem, InvoiceStatus } from "@/types/database";

/**
 * Typed readers for the public pages (/pay, /i, /r).
 * They call SECURITY DEFINER database functions that return only what a public
 * page may show, with phone numbers already masked (D10). The tables themselves
 * are no longer readable by anonymous visitors.
 */

export type PublicPayout = {
  type: "till" | "paybill" | "pochi" | "phone";
  number: string;
  account_ref: string | null;
  label: string | null;
};

export type PublicPaymentLink = {
  id: string;
  slug: string;
  title: string;
  currency: string;
  amount_minor: number | null;
  seller_name: string;
  seller_username: string;
  payout: PublicPayout | null;
};

export type PublicInvoice = {
  code: string;
  customer_name: string;
  customer_phone_masked: string;
  items: InvoiceItem[];
  total_minor: number;
  currency: string;
  due_date: string | null;
  status: InvoiceStatus;
  seller_name: string;
  seller_username: string;
  payout: PublicPayout | null;
};

export type PublicReceipt = {
  receipt_number: string;
  public_token: string;
  created_at: string;
  amount_minor: number;
  mpesa_code: string;
  payer_name: string;
  payer_phone_masked: string;
  seller_name: string;
  reference: string | null;
  payout: PublicPayout | null;
};

/** Shown when the seller has not added a payout method yet. */
export const PENDING_PAYOUT: PublicPayout = {
  type: "till",
  number: "Pending Setup",
  account_ref: null,
  label: "Seller is still setting up their payout details",
};

export const getPublicPaymentLink = cache(
  async (slug: string): Promise<PublicPaymentLink | null> => {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_public_payment_link", {
      p_slug: slug,
    });
    if (error) {
      console.error("get_public_payment_link failed:", error);
      return null;
    }
    return (data as unknown as PublicPaymentLink | null) ?? null;
  }
);

export const getPublicInvoice = cache(
  async (code: string): Promise<PublicInvoice | null> => {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_public_invoice", {
      p_code: code,
    });
    if (error) {
      console.error("get_public_invoice failed:", error);
      return null;
    }
    return (data as unknown as PublicInvoice | null) ?? null;
  }
);

export const getPublicReceipt = cache(
  async (token: string): Promise<PublicReceipt | null> => {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_public_receipt", {
      p_token: token,
    });
    if (error) {
      console.error("get_public_receipt failed:", error);
      return null;
    }
    return (data as unknown as PublicReceipt | null) ?? null;
  }
);
