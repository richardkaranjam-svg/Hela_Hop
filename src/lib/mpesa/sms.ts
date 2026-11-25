/**
 * Reads pasted M-PESA "received" messages and matches them to pending claims.
 *
 * Fail safe (R25): anything we cannot read, or that does not match on BOTH the
 * code and the amount, is "needs the seller", never "paid". Nothing here
 * confirms a claim; the seller still taps Confirm.
 */

export interface ParsedSms {
  code: string;
  /** Amount in KES minor units (cents), or null if it could not be read. */
  amountMinor: number | null;
}

export interface MatchableClaim {
  id: string;
  mpesa_code: string;
  amount_minor: number;
}

export interface SmsMatchResult {
  /** Code and amount both agree: safe to offer one-tap confirm. */
  matched: { claim: MatchableClaim; sms: ParsedSms }[];
  /** Code found but the amount differs or is unreadable: check by hand. */
  amountMismatch: { claim: MatchableClaim; sms: ParsedSms }[];
  /** Pending claims whose code is not in the pasted messages. */
  notFound: MatchableClaim[];
  /** How many messages were recognised in the pasted text. */
  messagesRead: number;
}

const MESSAGE_START = /\b([A-Z0-9]{10})\s+Confirmed\b/gi;
const AMOUNT = /Ksh\.?\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)/i;

export function parseMpesaMessages(text: string): ParsedSms[] {
  const starts = [...text.matchAll(MESSAGE_START)];
  const results: ParsedSms[] = [];

  starts.forEach((m, i) => {
    const code = m[1].toUpperCase();
    // Real codes mix letters and digits; skips ordinary 10-letter words.
    if (!/[0-9]/.test(code) || !/[A-Z]/.test(code)) return;

    const from = (m.index ?? 0) + m[0].length;
    const to = starts[i + 1]?.index ?? text.length;
    const amountText = text.slice(from, to).match(AMOUNT)?.[1];
    const kes = amountText ? Number(amountText.replace(/,/g, "")) : NaN;

    results.push({
      code,
      amountMinor: Number.isFinite(kes) ? Math.round(kes * 100) : null,
    });
  });

  return results;
}

export function matchClaimsToSms(
  text: string,
  pendingClaims: MatchableClaim[]
): SmsMatchResult {
  const messages = parseMpesaMessages(text);
  const byCode = new Map<string, ParsedSms>();
  for (const sms of messages) byCode.set(sms.code, sms);

  const out: SmsMatchResult = {
    matched: [],
    amountMismatch: [],
    notFound: [],
    messagesRead: messages.length,
  };

  for (const claim of pendingClaims) {
    const sms = byCode.get(claim.mpesa_code.trim().toUpperCase());
    if (!sms) out.notFound.push(claim);
    else if (sms.amountMinor === claim.amount_minor)
      out.matched.push({ claim, sms });
    else out.amountMismatch.push({ claim, sms });
  }

  return out;
}
