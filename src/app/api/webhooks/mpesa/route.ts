import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log(
      "[Daraja M-PESA Webhook Callback]:",
      JSON.stringify(body, null, 2)
    );

    // Daraja expects a JSON response acknowledging receipt
    return NextResponse.json(
      {
        ResultCode: 0,
        ResultDesc: "Accepted",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Daraja M-PESA Webhook Error]:", error);

    // Acknowledge receipt even on error to prevent Daraja retry loops
    return NextResponse.json(
      {
        ResultCode: 0,
        ResultDesc: "Accepted",
      },
      { status: 200 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "active",
    endpoint: "/api/webhooks/mpesa",
    message: "Daraja M-PESA webhook endpoint is active",
  });
}
