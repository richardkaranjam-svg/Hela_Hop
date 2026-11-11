import { describe, expect, it } from "vitest";

import { maskPhoneNumber } from "@/lib/formatters";

describe("maskPhoneNumber", () => {
  it("masks +254 international numbers per Master Plan D10", () => {
    expect(maskPhoneNumber("+254712345678")).toBe("+254 712 *** 678");
    expect(maskPhoneNumber("+254112345678")).toBe("+254 112 *** 678");
    expect(maskPhoneNumber("+254700000000")).toBe("+254 700 *** 000");
  });

  it("masks 07/01 local Kenyan numbers", () => {
    expect(maskPhoneNumber("0712345678")).toBe("0712 *** 678");
    expect(maskPhoneNumber("0112345678")).toBe("0112 *** 678");
  });

  it("handles whitespace in phone numbers", () => {
    expect(maskPhoneNumber("+254 712 345 678")).toBe("+254 712 *** 678");
    expect(maskPhoneNumber(" 0712 345 678 ")).toBe("0712 *** 678");
  });

  it("masks generic numbers longer than 6 digits", () => {
    expect(maskPhoneNumber("1234567")).toBe("123 *** 567");
    expect(maskPhoneNumber("9876543210")).toBe("987 *** 210");
  });

  it("leaves numbers 6 characters or shorter as-is", () => {
    expect(maskPhoneNumber("123456")).toBe("123456");
    expect(maskPhoneNumber("12345")).toBe("12345");
  });

  it("returns empty string for empty input", () => {
    expect(maskPhoneNumber("")).toBe("");
  });
});
