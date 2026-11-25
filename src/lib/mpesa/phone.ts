/**
 * Normalises user input into E.164 Kenyan mobile format (+2547XXXXXXXX or +2541XXXXXXXX).
 * Returns null when the input is not a valid Kenyan mobile number.
 */
export function normalizeKenyanPhoneSync(input: string): string | null {
  if (!input) return null;
  let cleaned = input.trim().replace(/[\s\-()]/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "+254" + cleaned.slice(1);
  } else if (cleaned.startsWith("254")) {
    cleaned = "+" + cleaned;
  } else if (
    !cleaned.startsWith("+254") &&
    cleaned.length === 9 &&
    (cleaned.startsWith("7") || cleaned.startsWith("1"))
  ) {
    cleaned = "+254" + cleaned;
  }
  return /^\+254(7\d{8}|1\d{8})$/.test(cleaned) ? cleaned : null;
}
