import { describe, expect, it } from "vitest";

import { isSameOrigin } from "@/lib/same-origin";

const APP = "https://helahop.app";

describe("isSameOrigin", () => {
  it("accepts the app's own origin", () => {
    expect(isSameOrigin("https://helahop.app", APP)).toBe(true);
  });

  it("ignores a trailing path on the app URL", () => {
    expect(isSameOrigin("http://localhost:3000", "http://localhost:3000/")).toBe(
      true
    );
  });

  it("rejects other sites, look-alikes, schemes and ports", () => {
    expect(isSameOrigin("https://evil.com", APP)).toBe(false);
    expect(isSameOrigin("https://helahop.app.evil.com", APP)).toBe(false);
    expect(isSameOrigin("http://helahop.app", APP)).toBe(false);
    expect(isSameOrigin("https://helahop.app:8443", APP)).toBe(false);
  });

  it("rejects a missing or junk Origin, or a missing app URL", () => {
    expect(isSameOrigin(null, APP)).toBe(false);
    expect(isSameOrigin("null", APP)).toBe(false);
    expect(isSameOrigin("https://helahop.app", undefined)).toBe(false);
  });
});
