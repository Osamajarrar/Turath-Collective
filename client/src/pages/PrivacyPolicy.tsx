import { motion } from "framer-motion";
import PageLayout from "@/components/PageLayout";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

function Section({
  number,
  title,
  children,
  index,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
  index: number;
}) {
  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
    >
      <div className="flex gap-4 mb-3">
        <span className="font-serif text-[#C9A96E] text-lg leading-tight">
          {number}.
        </span>
        <h2 className="font-serif text-xl text-foreground leading-tight">
          {title}
        </h2>
      </div>
      <div className="pl-8 space-y-3 text-muted-foreground font-light leading-relaxed">
        {children}
      </div>
    </motion.div>
  );
}

export default function PrivacyPolicy() {
  return (
    <PageLayout>
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <motion.h1
            className="font-serif text-5xl mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            Privacy Policy
          </motion.h1>

          <motion.div
            className="text-sm text-muted-foreground mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p>Effective date: April 2025 · Last updated: April 2025</p>
          </motion.div>

          <motion.div
            className="text-muted-foreground font-light leading-relaxed mb-12 pb-12 border-b border-border space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p>
              This Privacy Policy describes how{" "}
              <span className="text-foreground">Collectif Turath</span>, doing
              business as Turath Collective (turathcollective.com), collects,
              uses, discloses, and protects your personal information.
            </p>
            <p>
              It is written in compliance with Quebec's{" "}
              <em>
                Act Respecting the Protection of Personal Information in the
                Private Sector
              </em>{" "}
              (Law 25 / Bill 64, as amended) and Canada's{" "}
              <em>
                Personal Information Protection and Electronic Documents Act
              </em>{" "}
              (PIPEDA).
            </p>
            <p>
              For questions or concerns regarding your personal information,
              contact our Privacy Officer at:{" "}
              <a
                href="mailto:support@turathcollective.com"
                className="text-foreground underline underline-offset-2"
              >
                support@turathcollective.com
              </a>
            </p>
          </motion.div>

          <div className="space-y-10">
            <Section number="1" title="Information We Collect" index={1}>
              <p>
                We collect personal information only for identified, legitimate
                purposes.
              </p>
              <div>
                <p className="font-medium text-foreground mb-2">
                  Information you provide directly:
                </p>
                <ul className="space-y-1">
                  {[
                    "Name, email address, mailing address, and phone number (for order processing and customer service)",
                    "Payment information (processed securely by our payment provider — we do not store card details)",
                    "Communications you send us via email or contact form",
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="text-[#C9A96E] shrink-0">—</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-medium text-foreground mb-2">
                  Information collected automatically:
                </p>
                <ul className="space-y-1">
                  {[
                    "Browser type, device type, IP address, and pages visited (via standard web analytics)",
                    "Cookie and session data (see Section 6)",
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="text-[#C9A96E] shrink-0">—</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-medium text-foreground mb-2">
                  Information from third parties:
                </p>
                <ul className="space-y-1">
                  <li className="flex gap-3">
                    <span className="text-[#C9A96E] shrink-0">—</span>
                    <span>
                      Order and shipping data shared between us and our shipping
                      carriers
                    </span>
                  </li>
                </ul>
              </div>
            </Section>

            <Section number="2" title="Purpose of Collection" index={2}>
              <p>
                We collect personal information solely for the following
                purposes:
              </p>
              <ul className="space-y-1">
                {[
                  "Processing and fulfilling your orders",
                  "Communicating with you about your order, account, or inquiries",
                  "Sending marketing communications, only with your explicit consent (newsletter)",
                  "Improving our website and customer experience through analytics",
                  "Complying with applicable legal obligations",
                ].map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-[#C9A96E] shrink-0">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p>
                We do not collect personal information beyond what is necessary
                for these purposes.
              </p>
            </Section>

            <Section number="3" title="Legal Basis & Consent" index={3}>
              <p>
                Under Quebec Law 25, we are required to obtain your consent
                before collecting, using, or disclosing your personal
                information, except where the law permits otherwise (e.g. legal
                obligations).
              </p>
              <p>
                By placing an order or subscribing to our newsletter, you
                consent to the collection and use of your personal information
                as described in this Policy. You may withdraw consent at any
                time, subject to legal or contractual restrictions, by
                contacting us at{" "}
                <a
                  href="mailto:support@turathcollective.com"
                  className="text-foreground underline underline-offset-2"
                >
                  support@turathcollective.com
                </a>
                .
              </p>
            </Section>

            <Section number="4" title="Disclosure to Third Parties" index={4}>
              <p>
                We do not sell your personal information. We may share it with
                the following third parties strictly as necessary to operate our
                business:
              </p>
              <div className="border border-border rounded-sm overflow-hidden my-2">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-3 font-medium text-foreground">
                        Third Party
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-foreground">
                        Purpose
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      [
                        "Payment processor (Shopify Payments)",
                        "Secure payment processing",
                      ],
                      [
                        "Shipping carriers (Canada Post / couriers)",
                        "Order delivery",
                      ],
                      [
                        "Email service provider (Resend)",
                        "Transactional emails",
                      ],
                      [
                        "Marketing platform (Mailchimp)",
                        "Newsletter delivery (subscribers only)",
                      ],
                      ["Website hosting (Vercel)", "Website infrastructure"],
                    ].map(([party, purpose], i) => (
                      <tr
                        key={i}
                        className={i < 4 ? "border-b border-border" : ""}
                      >
                        <td className="px-4 py-3">{party}</td>
                        <td className="px-4 py-3">{purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>
                All third parties are required to handle your information in
                accordance with applicable privacy law. We do not authorize them
                to use your information for any purpose beyond providing
                services to us.
              </p>
              <p>
                Some of these providers may store or process data outside of
                Canada. Where this occurs, your information receives protection
                equivalent to that provided under Quebec and Canadian law, to
                the extent reasonably practicable.
              </p>
            </Section>

            <Section number="5" title="Data Retention" index={5}>
              <p>
                We retain your personal information only as long as necessary to
                fulfill the purposes for which it was collected, or as required
                by law. Order records are generally retained for seven years in
                accordance with Quebec tax and accounting obligations. You may
                request deletion of your personal information at any time,
                subject to these legal retention requirements.
              </p>
            </Section>

            <Section number="6" title="Cookies" index={6}>
              <p>
                Our website uses cookies and similar technologies to operate
                correctly and to understand how visitors interact with our site:
              </p>
              <ul className="space-y-1">
                {[
                  "Essential cookies — required for the site to function (e.g. cart, session)",
                  "Analytics cookies — used to understand aggregate site usage (no personally identifying data)",
                ].map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-[#C9A96E] shrink-0">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p>
                You may disable cookies in your browser settings. Disabling
                essential cookies may affect site functionality. We do not use
                cookies for targeted advertising.
              </p>
            </Section>

            <Section
              number="7"
              title="Your Rights Under Quebec Law 25"
              index={7}
            >
              <p>
                As a Quebec resident (and as applicable to all Canadian
                residents), you have the right to:
              </p>
              <ul className="space-y-1">
                {[
                  ["Access", "the personal information we hold about you"],
                  ["Correct", "inaccurate or incomplete information"],
                  [
                    "Withdraw consent",
                    "to the collection or use of your information",
                  ],
                  [
                    "Request deletion",
                    "of your personal information, subject to legal retention obligations",
                  ],
                  [
                    "Be informed",
                    "of any privacy incident that creates a serious risk of harm to you",
                  ],
                  [
                    "Data portability",
                    "— receive your information in a structured, commonly used format upon request",
                  ],
                ].map(([right, desc], i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-[#C9A96E] shrink-0">—</span>
                    <span>
                      <span className="text-foreground">{right}</span> — {desc}
                    </span>
                  </li>
                ))}
              </ul>
              <p>
                To exercise any of these rights, contact us at{" "}
                <a
                  href="mailto:support@turathcollective.com"
                  className="text-foreground underline underline-offset-2"
                >
                  support@turathcollective.com
                </a>
                . We will respond within 30 days as required by law.
              </p>
            </Section>

            <Section number="8" title="Security" index={8}>
              <p>
                We implement reasonable technical and organizational measures to
                protect your personal information against unauthorized access,
                loss, or disclosure.
              </p>
              <p>
                In the event of a privacy incident that presents a serious risk
                of harm, we will notify the Commission d'accès à l'information
                du Québec (CAI) and affected individuals as required by Law 25.
              </p>
            </Section>

            <Section number="9" title="Children's Privacy" index={9}>
              <p>
                Our website is not directed at children under the age of 14. We
                do not knowingly collect personal information from children. If
                you believe a child has provided us with personal information,
                please contact us and we will delete it promptly.
              </p>
            </Section>

            <Section number="10" title="Changes to This Policy" index={10}>
              <p>
                We may update this Privacy Policy from time to time. The updated
                version will be posted on this page with a revised effective
                date. We encourage you to review this Policy periodically.
              </p>
            </Section>

            <Section number="11" title="Contact & Privacy Officer" index={11}>
              <p>
                For any questions, requests, or concerns regarding your personal
                information or this Policy:
              </p>
              <p>
                <span className="text-foreground">
                  Privacy Officer — Collectif Turath
                </span>
                <br />
                <a
                  href="mailto:support@turathcollective.com"
                  className="underline underline-offset-2"
                >
                  support@turathcollective.com
                </a>
                <br />
                turathcollective.com
              </p>
              <p>
                You also have the right to lodge a complaint with the{" "}
                <a
                  href="https://www.cai.gouv.qc.ca"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground underline underline-offset-2"
                >
                  Commission d'accès à l'information du Québec (CAI)
                </a>{" "}
                if you believe your privacy rights have not been respected.
              </p>
            </Section>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}