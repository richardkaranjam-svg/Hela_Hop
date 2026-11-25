import crypto from "crypto";

/**
 * Unguessable public invoice code for /i/[code], e.g. "inv-8k2p9mx4w7b1".
 * 12 hex characters from crypto.randomBytes (the DB requires >= 10 chars).
 */
export function generateSecureInvoiceCode(): string {
  return `inv-${crypto.randomBytes(6).toString("hex")}`;
}
