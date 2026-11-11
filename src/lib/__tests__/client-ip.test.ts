import { describe, expect, it } from "vitest";

import { getClientIp } from "@/lib/client-ip";

describe("getClientIp", () => {
  it("uses the first x-forwarded-for entry", () => {
    const h = new Headers({ "x-forwarded-for": "41.90.1.2, 10.0.0.1" });
    expect(getClientIp(h)).toBe("41.90.1.2");
  });

  it("falls back to x-real-ip", () => {
    const h = new Headers({ "x-real-ip": "41.90.1.3" });
    expect(getClientIp(h)).toBe("41.90.1.3");
  });

  it("returns 'unknown' when no header is present", () => {
    expect(getClientIp(new Headers())).toBe("unknown");
  });

  it("caps very long values", () => {
    const h = new Headers({ "x-forwarded-for": "a".repeat(500) });
    expect(getClientIp(h)).toHaveLength(64);
  });
});
