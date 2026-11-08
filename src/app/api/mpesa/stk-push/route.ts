import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { stkPush } from "@/lib/mpesa/daraja";

const stkPushSchema = z.object({
  phone: z
    .string({
      required_error: "Phone number is required",
      invalid_type_error: "Phone number must be a string",
    })
    .regex(/^2547\d{8}$/, {
      message: "Phone number must be in 2547XXXXXXXX format",
    }),
  amount: z
    .number({
      required_error: "Amount is required",
      invalid_type_error: "Amount must be a number",
    })
    .gt(0, { message: "Amount must be greater than 0" })
    .lte(150000, { message: "Amount must be less than or equal to 150,000" }),
  accountRef: z.string().optional(),
  description: z.string().optional(),
});

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  const result = stkPushSchema.safeParse(body);

  if (!result.success) {
    const errorMessages = result.error.errors
      .map((issue) => issue.message)
      .join(", ");

    return NextResponse.json(
      {
        error: errorMessages,
        details: result.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const { phone, amount, accountRef, description } = result.data;

  try {
    const darajaResponse = await stkPush({
      phone,
      amount,
      accountRef: accountRef || "HelaHop",
      description: description || "Payment",
    });

    return NextResponse.json(darajaResponse, { status: 200 });
  } catch (error: unknown) {
    console.error("Daraja STK push error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to initiate STK push";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
