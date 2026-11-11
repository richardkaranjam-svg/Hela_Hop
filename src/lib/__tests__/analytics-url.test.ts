import { describe, expect, it } from "vitest";

import { redactAnalyticsUrl } from "../analytics-url";

const O = "https://helahop.co.ke";

describe("redactAnalyticsUrl", () => {
  it("hides invoice codes, receipt tokens and payment-link slugs", () => {
    expect(redactAnalyticsUrl(`${O}/i/Xy7_aB9kLmN0pQ`)).toBe(`${O}/i/[code]`);
    expect(redactAnalyticsUrl(`${O}/r/abcDEF123456789xyz`)).toBe(
      `${O}/r/[token]`
    );
    expect(redactAnalyticsUrl(`${O}/pay/mama-jane-shop`)).toBe(
      `${O}/pay/[slug]`
    );
  });

  it("drops query strings and hashes (auth codes, reset tokens)", () => {
    expect(redactAnalyticsUrl(`${O}/auth/callback?code=secret123`)).toBe(
      `${O}/auth/callback`
    );
    expect(redactAnalyticsUrl(`${O}/reset-password#access_token=abc`)).toBe(
      `${O}/reset-password`
    );
  });

  it("replaces UUID segments anywhere in the path", () => {
    expect(
      redactAnalyticsUrl(
        `${O}/dashboard/invoices/3f2b8c1e-9a4d-4e7f-b6a1-0c2d3e4f5a6b/edit`
      )
    ).toBe(`${O}/dashboard/invoices/[id]/edit`);
  });

  it("leaves ordinary pages alone", () => {
    expect(redactAnalyticsUrl(`${O}/`)).toBe(`${O}/`);
    expect(redactAnalyticsUrl(`${O}/privacy`)).toBe(`${O}/privacy`);
    expect(redactAnalyticsUrl(`${O}/dashboard/links`)).toBe(
      `${O}/dashboard/links`
    );
    // "/pay" with no slug has nothing to hide.
    expect(redactAnalyticsUrl(`${O}/pay`)).toBe(`${O}/pay`);
  });

  it("sends nothing for unparseable URLs", () => {
    expect(redactAnalyticsUrl("not a url")).toBeNull();
  });
});
