import { NextRequest, NextResponse } from "next/server";

/** Daraja callbacks are small; anything bigger is junk. */
const MAX_BODY_BYTES = 10_000;

const ACK = { ResultCode: 0, ResultDesc: "Accepted" };

export async function POST(request: NextRequest) {
  try {
    const declared = Number(request.headers.get("content-length") ?? 0);
    if (declared > MAX_BODY_BYTES) {
      return NextResponse.json(ACK, { status: 200 });
    }

    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json(ACK, { status: 200 });
    }

    // Log only non-personal fields (no phone numbers, no full body).
    // TODO(Phase 2): verify the callback before trusting it for anything real.
    const stk = (JSON.parse(raw) as { Body?: { stkCallback?: unknown } })?.Body
      ?.stkCallback as
      { CheckoutRequestID?: string; ResultCode?: number } | undefined;
    console.log("[Daraja callback]", {
      checkoutRequestId: String(stk?.CheckoutRequestID ?? "").slice(0, 64),
      resultCode: stk?.ResultCode,
    });
  } catch {
    console.error("[Daraja callback] could not parse body");
  }

  // Always acknowledge so Daraja does not retry.
  return NextResponse.json(ACK, { status: 200 });
}

export async function GET() {
  return NextResponse.json({ status: "active" });
}
