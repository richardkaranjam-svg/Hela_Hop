import type { Metadata } from "next";

import { LegalPage } from "@/components/public/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Use | Hela Hop",
  description: "The rules for using Hela Hop as a seller or payer.",
};

/**
 * DRAFT terms of use (Task 1.9B). Structure is final; wording and the
 * [bracketed] values must be confirmed by a Kenyan advocate before real users.
 */
export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use" updated="[DATE TO CONFIRM]">
      <section>
        <h2>1. About these terms</h2>
        <p>
          These terms apply to everyone who uses Hela Hop at [DOMAIN]: sellers
          who create payment links and invoices, and payers who use them. By
          using Hela Hop you agree to these terms and to our Privacy Policy.
          Hela Hop is run by [LEGAL ENTITY NAME, company registration pending].
        </p>
      </section>

      <section>
        <h2>2. What Hela Hop is, and is not</h2>
        <ul>
          <li>
            Hela Hop shows payers a seller&apos;s own M-PESA Till, Paybill,
            Pochi la Biashara or phone number, and helps the seller track who
            has paid.
          </li>
          <li>
            Hela Hop never receives, holds or moves money. Every payment goes
            directly from the payer&apos;s M-PESA to the seller.
          </li>
          <li>Hela Hop is not a bank, a payment service provider or a lender.</li>
          <li>
            Hela Hop does not check who sellers are. A seller page does not
            mean the seller is approved or trusted by Hela Hop.
          </li>
          <li>
            Invoices made with Hela Hop are not KRA eTIMS tax invoices.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. Payment claims and receipts</h2>
        <p>
          When a payer enters an M-PESA code, that is only a claim that they
          have paid. A receipt is created only after the seller checks their
          own M-PESA messages and confirms the payment. Hela Hop does not
          check M-PESA codes with Safaricom.
        </p>
      </section>

      <section>
        <h2>4. Seller rules</h2>
        <ul>
          <li>Give true details and only add payout numbers you own or are allowed to use.</li>
          <li>Keep your password safe. You are responsible for activity on your account.</li>
          <li>
            Do not use Hela Hop for scams, illegal goods or services, or to
            collect money you are not owed.
          </li>
          <li>Only confirm a payment after you have seen it in your own M-PESA.</li>
          <li>You are responsible for your own taxes and for any refunds to your customers.</li>
        </ul>
      </section>

      <section>
        <h2>5. Payer rules</h2>
        <ul>
          <li>Only pay people you know and trust.</li>
          <li>Only enter M-PESA codes for payments you really made.</li>
          <li>
            Disputes about goods, services or refunds are between you and the
            seller. If a page looks like a scam, use &quot;Report this
            page&quot;.
          </li>
        </ul>
      </section>

      <section>
        <h2>6. Fees</h2>
        <p>
          Hela Hop is free during the beta. If we add paid plans, we will tell
          sellers at least [X] days before any charge. M-PESA charges set by
          Safaricom still apply to payers and sellers.
        </p>
      </section>

      <section>
        <h2>7. Closing accounts and removing pages</h2>
        <p>
          You can close your seller account at any time by emailing
          [SUPPORT EMAIL]. We may suspend accounts or remove payment links and
          invoices that break these terms or are reported as scams.
        </p>
      </section>

      <section>
        <h2>8. Our responsibility</h2>
        <p>
          We work hard to keep Hela Hop running, but we provide it &quot;as
          is&quot; during the beta. Because money never passes through Hela
          Hop, we are not responsible for payments sent to the wrong number,
          payments a seller does not confirm, or disputes between sellers and
          payers. [TO CONFIRM: limits of liability under Kenyan law, including
          the Consumer Protection Act 2012.]
        </p>
      </section>

      <section>
        <h2>9. Law and disputes</h2>
        <p>
          These terms are governed by the laws of Kenya. [TO CONFIRM: dispute
          process and courts.]
        </p>
      </section>

      <section>
        <h2>10. Changes and contact</h2>
        <p>
          We may update these terms. We will post changes here and update the
          date above, and tell sellers by email about important changes.
          Questions: [SUPPORT EMAIL].
        </p>
      </section>
    </LegalPage>
  );
}
