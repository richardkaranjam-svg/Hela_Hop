import { describe, expect, it } from "vitest";

import { isAdminEmail } from "@/lib/admin";

describe("isAdminEmail", () => {
  const list = " Founder@Example.com , helper@example.com ,";

  it("matches listed emails, ignoring case and spaces", () => {
    expect(isAdminEmail("founder@example.com", list)).toBe(true);
    expect(isAdminEmail("HELPER@example.com ", list)).toBe(true);
  });

  it("rejects emails not on the list", () => {
    expect(isAdminEmail("someone@example.com", list)).toBe(false);
    expect(isAdminEmail("founder@example.com.evil.com", list)).toBe(false);
  });

  it("allows nobody when the list or email is empty", () => {
    expect(isAdminEmail("founder@example.com", "")).toBe(false);
    expect(isAdminEmail("founder@example.com", undefined)).toBe(false);
    expect(isAdminEmail("", list)).toBe(false);
    expect(isAdminEmail(null, list)).toBe(false);
  });
});
