import { describe, expect, it } from "vitest";

import {
  parseAllowedOtpType,
  resolveActionOrigin,
  resolveSafeAppOrigin,
} from "../app-origin";

describe("parseAllowedOtpType", () => {
  it("accepts expected email verification OTP types", () => {
    expect(parseAllowedOtpType("signup")).toBe("signup");
    expect(parseAllowedOtpType("recovery")).toBe("recovery");
    expect(parseAllowedOtpType("email")).toBe("email");
    expect(parseAllowedOtpType("email_change")).toBe("email_change");
  });

  it("rejects arbitrary or empty OTP types", () => {
    expect(parseAllowedOtpType(null)).toBeNull();
    expect(parseAllowedOtpType("")).toBeNull();
    expect(parseAllowedOtpType("sms")).toBeNull();
    expect(parseAllowedOtpType("phone_change")).toBeNull();
    expect(parseAllowedOtpType("admin")).toBeNull();
  });
});

describe("resolveActionOrigin", () => {
  const vercelHosts = [
    "hela-hop-abc.vercel.app",
    "hela-hop-git-main.vercel.app",
  ];

  it("rejects spoofed external Origin headers and falls back to configured URL", () => {
    expect(
      resolveActionOrigin({
        headerOrigin: "https://evil-phishing.com",
        configuredAppUrl: "https://hela-hop.vercel.app",
        vercelHosts,
        allowLocalhost: false,
      })
    ).toBe("https://hela-hop.vercel.app");

    expect(
      resolveActionOrigin({
        headerOrigin: "https://evil-clone.vercel.app",
        configuredAppUrl: "https://hela-hop.vercel.app",
        vercelHosts,
        allowLocalhost: false,
      })
    ).toBe("https://hela-hop.vercel.app");
  });

  it("allows matching Vercel preview Origin headers for preview testing", () => {
    expect(
      resolveActionOrigin({
        headerOrigin: "https://hela-hop-abc.vercel.app",
        configuredAppUrl: "https://hela-hop.vercel.app",
        vercelHosts,
        allowLocalhost: false,
      })
    ).toBe("https://hela-hop-abc.vercel.app");
  });

  it("allows localhost only when allowLocalhost is enabled", () => {
    expect(
      resolveActionOrigin({
        headerOrigin: "http://localhost:3000",
        configuredAppUrl: "https://hela-hop.vercel.app",
        allowLocalhost: true,
      })
    ).toBe("http://localhost:3000");

    expect(
      resolveActionOrigin({
        headerOrigin: "http://localhost:3000",
        configuredAppUrl: "https://hela-hop.vercel.app",
        allowLocalhost: false,
      })
    ).toBe("https://hela-hop.vercel.app");
  });
});

describe("resolveSafeAppOrigin", () => {
  const vercelHosts = ["hela-hop-abc.vercel.app"];

  it("ignores spoofed x-forwarded-host headers", () => {
    expect(
      resolveSafeAppOrigin({
        requestOrigin: "https://hela-hop.vercel.app",
        forwardedHost: "evil.com",
        configuredAppUrl: "https://hela-hop.vercel.app",
        vercelHosts,
        isDev: false,
      })
    ).toBe("https://hela-hop.vercel.app");

    expect(
      resolveSafeAppOrigin({
        requestOrigin: "https://internal-host:3000",
        forwardedHost: "evil.com/path@attacker",
        configuredAppUrl: "https://hela-hop.vercel.app",
        vercelHosts,
        isDev: false,
      })
    ).toBe("https://hela-hop.vercel.app");
  });

  it("uses x-forwarded-host only when it matches configured or Vercel hosts", () => {
    expect(
      resolveSafeAppOrigin({
        requestOrigin: "http://localhost:3000",
        forwardedHost: "hela-hop-abc.vercel.app",
        configuredAppUrl: "https://hela-hop.vercel.app",
        vercelHosts,
        isDev: false,
      })
    ).toBe("https://hela-hop-abc.vercel.app");
  });
});
