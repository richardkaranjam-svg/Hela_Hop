import { describe, expect, it } from "vitest";

import { normalizeKenyanPhoneSync } from "@/lib/phone";

describe("normalizeKenyanPhoneSync", () => {
  it("normalizes numbers starting with 07 or 01 to E.164 +254", () => {
    expect(normalizeKenyanPhoneSync("0712345678")).toBe("+254712345678");
    expect(normalizeKenyanPhoneSync("0722000000")).toBe("+254722000000");
    expect(normalizeKenyanPhoneSync("0110123456")).toBe("+254110123456");
    expect(normalizeKenyanPhoneSync("0100000000")).toBe("+254100000000");
  });

  it("accepts valid E.164 +254 format", () => {
    expect(normalizeKenyanPhoneSync("+254712345678")).toBe("+254712345678");
    expect(normalizeKenyanPhoneSync("+254112345678")).toBe("+254112345678");
  });

  it("handles numbers starting with 254 (without leading +)", () => {
    expect(normalizeKenyanPhoneSync("254712345678")).toBe("+254712345678");
    expect(normalizeKenyanPhoneSync("254112345678")).toBe("+254112345678");
  });

  it("handles 9-digit numbers starting with 7 or 1", () => {
    expect(normalizeKenyanPhoneSync("712345678")).toBe("+254712345678");
    expect(normalizeKenyanPhoneSync("112345678")).toBe("+254112345678");
  });

  it("strips whitespace, dashes, and parentheses", () => {
    expect(normalizeKenyanPhoneSync("0712 345 678")).toBe("+254712345678");
    expect(normalizeKenyanPhoneSync("+254 (712) 345-678")).toBe(
      "+254712345678"
    );
    expect(normalizeKenyanPhoneSync(" 0712-345-678 ")).toBe("+254712345678");
    expect(normalizeKenyanPhoneSync("(011) 234 5678")).toBe("+254112345678");
  });

  it("rejects invalid, short, long, or non-Kenyan mobile numbers", () => {
    expect(normalizeKenyanPhoneSync("")).toBeNull();
    expect(normalizeKenyanPhoneSync("   ")).toBeNull();
    expect(normalizeKenyanPhoneSync("12345")).toBeNull();
    expect(normalizeKenyanPhoneSync("0201234567")).toBeNull(); // Kenyan landline
    expect(normalizeKenyanPhoneSync("0812345678")).toBeNull(); // Invalid prefix 08
    expect(normalizeKenyanPhoneSync("+14155552671")).toBeNull(); // US number
    expect(normalizeKenyanPhoneSync("07123456789")).toBeNull(); // Too many digits
    expect(normalizeKenyanPhoneSync("071234567")).toBeNull(); // Too few digits
    expect(normalizeKenyanPhoneSync("abcdefghij")).toBeNull();
  });
});
