import crypto from "crypto";

/**
 * Masks a phone number for public display per Master Plan D10.
 * Example: "0712345678" -> "0712 *** 678"
 * Example: "+254712345678" -> "+254 712 *** 678"
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone) return "";
  const cleaned = phone.trim().replace(/\s+/g, "");

  // Match +254 7XX... or 07XX...
  if (cleaned.startsWith("+254") && cleaned.length >= 13) {
    const prefix = cleaned.slice(0, 7); // +2547XX
    const suffix = cleaned.slice(-3); // XXX
    return `${prefix.slice(0, 4)} ${prefix.slice(4)} *** ${suffix}`;
  }

  if (cleaned.startsWith("0") && cleaned.length >= 10) {
    const prefix = cleaned.slice(0, 4); // 07XX
    const suffix = cleaned.slice(-3); // XXX
    return `${prefix} *** ${suffix}`;
  }

  if (cleaned.length > 6) {
    const start = cleaned.slice(0, 3);
    const end = cleaned.slice(-3);
    return `${start} *** ${end}`;
  }

  return cleaned;
}

/**
 * Generates an unguessable, non-sequential, crypto-secure code for invoices.
 * Minimum 10 characters from crypto.randomBytes.
 * Example: "inv-8k2p-9mx4-w7b1"
 */
export function generateSecureInvoiceCode(): string {
  // 9 random bytes = 18 hex chars or ~14 base36 chars
  const randomPart = crypto.randomBytes(8).toString("hex").slice(0, 12);
  return `inv-${randomPart}`;
}
