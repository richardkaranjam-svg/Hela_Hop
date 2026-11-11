import { describe, expect, it } from "vitest";

import { safeRedirectPath } from "@/lib/safe-redirect";

describe("safeRedirectPath", () => {
  it("allows valid same-site relative paths", () => {
    expect(safeRedirectPath("/dashboard")).toBe("/dashboard");
    expect(safeRedirectPath("/dashboard/claims")).toBe("/dashboard/claims");
    expect(safeRedirectPath("/dashboard/invoices/new")).toBe(
      "/dashboard/invoices/new"
    );
    expect(safeRedirectPath("/pay/summer-promo?ref=partner")).toBe(
      "/pay/summer-promo?ref=partner"
    );
    expect(safeRedirectPath("/i/inv-abcdef12345#breakdown")).toBe(
      "/i/inv-abcdef12345#breakdown"
    );
  });

  it("blocks protocol-relative URLs (e.g. //evil.com)", () => {
    expect(safeRedirectPath("//evil.com")).toBe("/dashboard");
    expect(safeRedirectPath("//evil.com/phish")).toBe("/dashboard");
    expect(safeRedirectPath("///evil.com")).toBe("/dashboard");
  });

  it("blocks mixed slashes (e.g. /\\evil.com)", () => {
    expect(safeRedirectPath("/\\evil.com")).toBe("/dashboard");
    expect(safeRedirectPath("/\\evil.com/login")).toBe("/dashboard");
  });

  it("blocks non-slash-prefixed URLs (e.g. @evil.com, https://)", () => {
    expect(safeRedirectPath("@evil.com")).toBe("/dashboard");
    expect(safeRedirectPath("https://evil.com")).toBe("/dashboard");
    expect(safeRedirectPath("http://evil.com")).toBe("/dashboard");
    expect(safeRedirectPath("javascript:alert(1)")).toBe("/dashboard");
    expect(safeRedirectPath("data:text/html,evil")).toBe("/dashboard");
  });

  it("blocks control characters, newlines, tabs, and backslashes", () => {
    expect(safeRedirectPath("/dashboard\\nested")).toBe("/dashboard");
    expect(safeRedirectPath("/dashboard\r\nevil")).toBe("/dashboard");
    expect(safeRedirectPath("/dashboard\tevil")).toBe("/dashboard");
    expect(safeRedirectPath("/dashboard\0evil")).toBe("/dashboard");
  });

  it("falls back to /dashboard on empty, null, or undefined input", () => {
    expect(safeRedirectPath(null)).toBe("/dashboard");
    expect(safeRedirectPath(undefined)).toBe("/dashboard");
    expect(safeRedirectPath("")).toBe("/dashboard");
  });

  it("supports a custom fallback path", () => {
    expect(safeRedirectPath("//evil.com", "/login")).toBe("/login");
    expect(safeRedirectPath("/\\evil.com", "/onboarding")).toBe("/onboarding");
    expect(safeRedirectPath("@evil.com", "/home")).toBe("/home");
    expect(safeRedirectPath(null, "/settings")).toBe("/settings");
    expect(safeRedirectPath("/valid/path", "/fallback")).toBe("/valid/path");
  });
});
