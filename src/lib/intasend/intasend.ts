/**
 * IntaSend API — Card payments & FX payouts
 * Docs: https://developers.intasend.com/
 */

const INTASEND_BASE_URL =
  process.env.INTASEND_ENV === "production"
    ? "https://payment.intasend.com/api/v1"
    : "https://sandbox.intasend.com/api/v1";

const intasendHeaders = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${process.env.INTASEND_SECRET_KEY}`,
};

/** Create a payment collection request */
export async function createPaymentRequest({
  currency,
  amount,
  email,
  firstName,
  lastName,
  reference,
}: {
  currency: string;
  amount: number;
  email: string;
  firstName: string;
  lastName: string;
  reference: string;
}) {
  const res = await fetch(`${INTASEND_BASE_URL}/checkout/`, {
    method: "POST",
    headers: intasendHeaders,
    body: JSON.stringify({
      currency,
      amount,
      email,
      first_name: firstName,
      last_name: lastName,
      reference,
      redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
    }),
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`IntaSend checkout failed: ${res.statusText}`);
  return res.json();
}
