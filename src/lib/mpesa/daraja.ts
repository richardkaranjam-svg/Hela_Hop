/**
 * Safaricom Daraja API — M-PESA helpers
 * Docs: https://developer.safaricom.co.ke/
 */

const DARAJA_BASE_URL =
  process.env.DARAJA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

/** Generate OAuth bearer token from Daraja consumer key/secret */
export async function getDarajaAccessToken(): Promise<string> {
  const credentials = Buffer.from(
    `${process.env.DARAJA_CONSUMER_KEY}:${process.env.DARAJA_CONSUMER_SECRET}`
  ).toString("base64");

  const res = await fetch(
    `${DARAJA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: { Authorization: `Basic ${credentials}` },
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error(`Daraja auth failed: ${res.statusText}`);
  const data = await res.json();
  return data.access_token as string;
}

/** Initiate STK Push (Lipa na M-PESA Online) */
export async function stkPush({
  phone,
  amount,
  accountRef,
  description,
}: {
  phone: string;
  amount: number;
  accountRef: string;
  description: string;
}) {
  const token = await getDarajaAccessToken();
  const shortcode = process.env.DARAJA_SHORTCODE!;
  const passkey = process.env.DARAJA_PASSKEY!;
  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, "")
    .slice(0, 14);
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString(
    "base64"
  );

  const res = await fetch(
    `${DARAJA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phone,
        PartyB: shortcode,
        PhoneNumber: phone,
        CallBackURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mpesa`,
        AccountReference: accountRef,
        TransactionDesc: description,
      }),
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error(`STK Push failed: ${res.statusText}`);
  return res.json();
}
