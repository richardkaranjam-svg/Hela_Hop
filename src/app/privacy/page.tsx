import type { Metadata } from "next";

import { LegalPage } from "@/components/public/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy | Hela Hop",
  description: "What Hela Hop collects, why, and how to ask for a copy or deletion.",
};

/**
 * DRAFT privacy policy (Task 1.9B). Structure is final; wording and the
 * [bracketed] values must be confirmed by a Kenyan advocate (Data Protection
 * Act 2019, ODPC registration) before real users.
 */
export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="[DATE TO CONFIRM]">
      <section>
        <h2>1. Who we are</h2>
        <p>
          Hela Hop ([LEGAL ENTITY NAME, company registration pending]) runs the
          website at [DOMAIN]. We help sellers in Kenya share M-PESA payment
          details, send invoices and keep track of who has paid. Contact us
          about privacy at [PRIVACY CONTACT EMAIL].
        </p>
      </section>

      <section>
        <h2>2. Hela Hop never holds your money</h2>
        <p>
          Payers send money directly from their own M-PESA to the seller&apos;s
          own Till, Paybill, Pochi la Biashara or phone number. Hela Hop never
          receives, holds or moves that money. We only store the details
          described below so the seller can match payments to customers.
        </p>
      </section>

      <section>
        <h2>3. What we collect</h2>
        <p className="font-semibold text-slate-900">From sellers:</p>
        <ul>
          <li>Email address and password (the password is stored encrypted by our login provider).</li>
          <li>Name, phone number and username.</li>
          <li>Payout numbers: Till, Paybill and account reference, Pochi or phone number.</li>
          <li>Payment links and invoices you create, including your customers&apos; names and phone numbers.</li>
        </ul>
        <p className="mt-3 font-semibold text-slate-900">From payers:</p>
        <ul>
          <li>Name and phone number.</li>
          <li>The M-PESA transaction code and amount you enter when you say you have paid.</li>
        </ul>
        <p className="mt-3 font-semibold text-slate-900">From everyone:</p>
        <ul>
          <li>Your IP address, kept for up to 1 day to stop spam and abuse.</li>
          <li>If you report a page: your optional name and what you wrote.</li>
          <li>
            Anonymous page-view counts (no cookies, no names, phone numbers or
            private link codes).
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Why we collect it</h2>
        <ul>
          <li>To show payers where to send money and to let sellers confirm who paid.</li>
          <li>To create receipts after a seller confirms a payment.</li>
          <li>To email sellers when a payer says they have paid.</li>
          <li>To keep the service safe: rate limits, abuse reports and fraud checks.</li>
          <li>To meet our legal duties, for example tax and record-keeping rules.</li>
        </ul>
        <p className="mt-2">
          We do not sell your data. We do not use it for credit scoring.
          [TO CONFIRM: legal basis for each purpose under the Data Protection
          Act 2019.]
        </p>
      </section>

      <section>
        <h2>5. Who we share it with</h2>
        <ul>
          <li>The seller you are paying sees your name, phone number, M-PESA code and amount.</li>
          <li>Public receipt pages show the payer&apos;s phone number masked (for example 0712 *** 678).</li>
          <li>
            Service providers who host or run parts of Hela Hop for us:
            Supabase (database and login), Vercel (website hosting and
            anonymous page counts) and Resend (emails). [TO CONFIRM: where
            each one stores data and the cross-border transfer safeguards.]
          </li>
          <li>Authorities, only when the law requires it.</li>
        </ul>
      </section>

      <section>
        <h2>6. How long we keep it</h2>
        <ul>
          <li>Seller account details: while your account is open, then [X] months.</li>
          <li>Payment claims, receipts and invoices: [X] years, for record-keeping and tax rules.</li>
          <li>IP addresses used for rate limits: up to 1 day.</li>
          <li>Abuse reports: [X] months after they are reviewed.</li>
        </ul>
        <p className="mt-2">[TO CONFIRM all periods with a lawyer.]</p>
      </section>

      <section>
        <h2>7. Your rights: a copy, a correction or deletion</h2>
        <p>
          You can ask us for a copy of the data we hold about you, ask us to
          correct it, or ask us to delete it. Email [PRIVACY CONTACT EMAIL]
          from the email address or phone number linked to the data. We will
          reply within [X] days. Some records may have to be kept for legal
          reasons; if so, we will tell you which and why.
        </p>
        <p className="mt-2">
          If you are not happy with our answer, you can complain to the Office
          of the Data Protection Commissioner (ODPC), Kenya.
        </p>
      </section>

      <section>
        <h2>8. Security</h2>
        <p>
          Data is sent over encrypted connections (HTTPS). Database access is
          restricted so each seller can only see their own records, and public
          pages use long random links. No system is perfectly secure; if we
          learn of a breach that affects you, we will tell you and the ODPC as
          the law requires.
        </p>
      </section>

      <section>
        <h2>9. Changes</h2>
        <p>
          We will post any changes on this page and update the date above. If
          a change is important, sellers will be told by email.
        </p>
      </section>
    </LegalPage>
  );
}
