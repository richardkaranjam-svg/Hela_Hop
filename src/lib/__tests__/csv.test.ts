import { describe, expect, it } from "vitest";

import { escapeCsvCell } from "@/lib/csv";

describe("escapeCsvCell", () => {
  it("escapes formula injection prefixes with a leading apostrophe", () => {
    expect(escapeCsvCell("=SUM(A1)")).toBe("'=SUM(A1)");
    expect(escapeCsvCell("+12345")).toBe("'+12345");
    expect(escapeCsvCell("-100")).toBe("'-100");
    expect(escapeCsvCell("@evil.com")).toBe("'@evil.com");
    expect(escapeCsvCell("\tTabbed")).toBe("'\tTabbed");
  });

  it("wraps values with commas in double quotes", () => {
    expect(escapeCsvCell("John, Doe")).toBe('"John, Doe"');
    expect(escapeCsvCell("KES 1,500.00")).toBe('"KES 1,500.00"');
  });

  it("escapes internal quotes by doubling them and wraps in quotes", () => {
    expect(escapeCsvCell('He said "Hello"')).toBe('"He said ""Hello"""');
    expect(escapeCsvCell('"quoted"')).toBe('"""quoted"""');
  });

  it("handles values with both commas and quotes", () => {
    expect(escapeCsvCell('Acme, "Special" Goods')).toBe(
      '"Acme, ""Special"" Goods"'
    );
  });

  it("handles newlines (LF and CRLF)", () => {
    expect(escapeCsvCell("Line 1\nLine 2")).toBe('"Line 1\nLine 2"');
    expect(escapeCsvCell("Line 1\r\nLine 2")).toBe('"Line 1\r\nLine 2"');
  });

  it("handles combination of formula prefix and quotes or commas", () => {
    expect(escapeCsvCell('=CMD("calc")')).toBe('"\'=CMD(""calc"")"');
    expect(escapeCsvCell("=SUM(A1, B2)")).toBe('"\'=SUM(A1, B2)"');
  });

  it("returns plain strings unmodified when safe", () => {
    expect(escapeCsvCell("Standard Text")).toBe("Standard Text");
    expect(escapeCsvCell("REC-2026-0001")).toBe("REC-2026-0001");
    expect(escapeCsvCell("QA12345678")).toBe("QA12345678");
  });

  it("handles numeric inputs properly", () => {
    expect(escapeCsvCell(1500)).toBe("1500");
    expect(escapeCsvCell(0)).toBe("0");
    expect(escapeCsvCell(-50)).toBe("'-50");
  });

  it("returns empty string for null, undefined, or empty string", () => {
    expect(escapeCsvCell(null)).toBe("");
    expect(escapeCsvCell(undefined)).toBe("");
    expect(escapeCsvCell("")).toBe("");
  });
});
