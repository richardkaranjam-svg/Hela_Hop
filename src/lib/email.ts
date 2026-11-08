import { createAdminClient } from "@/lib/supabase/admin";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendEmail(args: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(
      "[email] RESEND_API_KEY not set; skipping email:",
      args.subject
    );
    return;
  }
  const from = process.env.EMAIL_FROM || "Hela Hop <onboarding@resend.dev>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [args.to],
      subject: args.subject,
      text: args.text,
      html: args.html,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("[email] Resend error", res.status, body.slice(0, 300));
  }
}

/**
 * Emails the seller that a payer has sent a claim (Task 1.5).
 * Never throws: a failed email must not break the payer's claim.
 * Wording follows D9: it is a claim; the seller checks their own M-PESA SMS.
 * The payer's phone number is intentionally left out of the email.
 */
export async function notifySellerOfClaim(claimId: string): Promise<void> {
  try {
    const admin = createAdminClient();

    const { data: claim } = await admin
      .from("payment_claims")
      .select("payer_name, mpesa_code, amount_minor, seller_id")
      .eq("id", claimId)
      .maybeSingle();
    if (!claim) return;

    const { data: seller } = await admin
      .from("profiles")
      .select("email, full_name, username")
      .eq("id", claim.seller_id)
      .maybeSingle();
    if (!seller?.email) return;

    const appUrl = (
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    ).replace(/\/$/, "");
    const claimsUrl = `${appUrl}/dashboard/claims`;
    const amount = `KES ${(claim.amount_minor / 100).toLocaleString("en-KE")}`;
    const greetingName = seller.full_name || seller.username || "there";

    const text =
      `Hi ${greetingName},\n\n` +
      `${claim.payer_name} says they paid you ${amount} (M-PESA code ${claim.mpesa_code}).\n\n` +
      `This is a claim, not a receipt yet. Check your own M-PESA SMS for that code and amount, ` +
      `then confirm or reject it here:\n${claimsUrl}\n\n` +
      `Hela Hop`;

    const html =
      `<p>Hi ${escapeHtml(greetingName)},</p>` +
      `<p><strong>${escapeHtml(claim.payer_name)}</strong> says they paid you ` +
      `<strong>${escapeHtml(amount)}</strong> (M-PESA code ` +
      `<strong>${escapeHtml(claim.mpesa_code)}</strong>).</p>` +
      `<p>This is a claim, not a receipt yet. Check your own M-PESA SMS for that code and ` +
      `amount, then confirm or reject it.</p>` +
      `<p><a href="${escapeHtml(claimsUrl)}" style="display:inline-block;padding:12px 20px;` +
      `background:#059669;color:#ffffff;border-radius:8px;text-decoration:none;font-weight:bold">` +
      `Review claim</a></p><p>Hela Hop</p>`;

    await sendEmail({
      to: seller.email,
      subject: `New payment claim: ${amount} from ${claim.payer_name}`,
      text,
      html,
    });
  } catch (err) {
    console.error("[email] notifySellerOfClaim failed:", err);
  }
}
