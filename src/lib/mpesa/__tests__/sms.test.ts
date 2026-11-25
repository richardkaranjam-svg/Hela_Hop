import { describe, expect, it } from "vitest";

import { matchClaimsToSms, parseMpesaMessages } from "@/lib/mpesa/sms";

const SMS_A =
  "SDF489K1L2 Confirmed. You have received Ksh2,500.00 from JOHN DOE 0712***678 on 5/11/26 at 2:30 PM. New M-PESA balance is Ksh9,100.00.";
const SMS_B =
  "QWE123R4T5 Confirmed. Ksh 1,000.50 paid to SHOP on 5/11/26 at 3:00 PM.";

describe("parseMpesaMessages", () => {
  it("reads code and amount from several pasted messages", () => {
    expect(parseMpesaMessages(`${SMS_A}\n\n${SMS_B}`)).toEqual([
      { code: "SDF489K1L2", amountMinor: 250000 },
      { code: "QWE123R4T5", amountMinor: 100050 },
    ]);
  });

  it("ignores text that is not an M-PESA message", () => {
    expect(parseMpesaMessages("hello Confirmed. Ksh100")).toEqual([]);
    expect(parseMpesaMessages("ABCDEFGHIJ Confirmed. Ksh100")).toEqual([]);
  });

  it("returns a null amount when none can be read", () => {
    expect(parseMpesaMessages("SDF489K1L2 Confirmed.")).toEqual([
      { code: "SDF489K1L2", amountMinor: null },
    ]);
  });
});

describe("matchClaimsToSms", () => {
  const claims = [
    { id: "1", mpesa_code: "SDF489K1L2", amount_minor: 250000 },
    { id: "2", mpesa_code: "QWE123R4T5", amount_minor: 500000 },
    { id: "3", mpesa_code: "ZZZ999Z9Z9", amount_minor: 100000 },
  ];

  it("matches only when code and amount agree", () => {
    const r = matchClaimsToSms(`${SMS_A}\n${SMS_B}`, claims);
    expect(r.matched.map((m) => m.claim.id)).toEqual(["1"]);
    expect(r.amountMismatch.map((m) => m.claim.id)).toEqual(["2"]);
    expect(r.notFound.map((c) => c.id)).toEqual(["3"]);
    expect(r.messagesRead).toBe(2);
  });

  it("never matches when nothing is pasted", () => {
    const r = matchClaimsToSms("", claims);
    expect(r.matched).toEqual([]);
    expect(r.notFound).toHaveLength(3);
  });
});
