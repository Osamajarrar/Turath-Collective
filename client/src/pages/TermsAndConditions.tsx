import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import PageLayout from "@/components/PageLayout";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const},
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

export default function TermsAndConditions() {
  const { t } = useTranslation("legal");
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
            {t('terms.title')}
          </motion.h1>

          <motion.div
            className="text-sm text-muted-foreground mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p>{t('terms.effectiveDate')}</p>
          </motion.div>

          <motion.p
            className="text-muted-foreground font-light leading-relaxed mb-12 pb-12 border-b border-border"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            These Terms and Conditions govern your use of the Turath Collective
            website (turathcollective.com) and any purchases made through it. By
            accessing the site or placing an order, you agree to these terms in
            full. Turath Collective is operated by{" "}
            <span className="text-foreground">Collectif Turath</span>, a sole
            proprietorship registered in the province of Quebec, Canada, doing
            business as Turath Collective. Contact:{" "}
            <a
              href="mailto:support@turathcollective.com"
              className="text-foreground underline underline-offset-2"
            >
              support@turathcollective.com
            </a>
            .
          </motion.p>

          <div className="space-y-10">
            <Section number="1" title="Use of the Website" index={1}>
              <p>
                You agree to use this website for lawful purposes only. You may
                not use the site in any way that could damage, disable, or
                impair its operation, or interfere with any other user's access.
              </p>
              <p>
                We reserve the right to modify or discontinue any part of the
                website at any time without notice.
              </p>
            </Section>

            <Section number="2" title="Products & Pricing" index={2}>
              <p>
                All product descriptions, images, and pricing are provided in
                good faith and are subject to change without notice. Slight
                variations in colour, texture, and size are inherent to handmade
                goods and are not grounds for return unless the item is
                defective.
              </p>
              <p>
                Prices are listed in Canadian dollars (CAD) and are exclusive of
                applicable taxes, calculated and added at checkout in accordance
                with applicable Quebec and federal tax law.
              </p>
              <p>
                We reserve the right to refuse or cancel any order at our
                discretion, including in cases of pricing errors or suspected
                fraudulent activity. If an order is cancelled after payment, a
                full refund will be issued promptly.
              </p>
            </Section>

            <Section number="3" title="Orders & Payment" index={3}>
              <p>
                By placing an order, you confirm that you are at least 18 years
                of age and that the payment information provided is accurate and
                authorized.
              </p>
              <p>
                Orders are subject to product availability. In the event that an
                item becomes unavailable after your order is placed, we will
                notify you and offer a full refund or an alternative.
              </p>
              <p>
                Payment is processed securely through our payment provider.
                Turath Collective does not store your payment card information.
              </p>
            </Section>

            <Section number="4" title="Shipping" index={4}>
              <p>
                Turath Collective ships within Canada only. Shipping terms,
                rates, and estimated delivery windows are detailed on our{" "}
                <a
                  href="/shipping"
                  className="text-foreground underline underline-offset-2"
                >
                  Shipping & Returns page
                </a>
                . Delivery estimates are not guaranteed and may be affected by
                factors outside our control, including carrier delays and
                extreme weather.
              </p>
              <p>
                Risk of loss and title for products pass to you upon delivery to
                the carrier.
              </p>
            </Section>

            <Section number="5" title="Returns & Refunds" index={5}>
              <p>
                Our return and refund policy is detailed on our{" "}
                <a
                  href="/shipping"
                  className="text-foreground underline underline-offset-2"
                >
                  Shipping & Returns page
                </a>{" "}
                and forms part of these Terms. By placing an order, you
                acknowledge and agree to the terms of that policy.
              </p>
            </Section>

            <Section number="6" title="Intellectual Property" index={6}>
              <p>
                All content on this website — including text, images, logos,
                brand assets, and product photography — is the property of
                Collectif Turath or its content suppliers and is protected under
                applicable Canadian intellectual property law. You may not
                reproduce, distribute, or use any content without prior written
                permission.
              </p>
            </Section>

            <Section number="7" title="Disclaimer of Warranties" index={7}>
              <p>
                The website and its content are provided "as is" without
                warranties of any kind, express or implied. We do not warrant
                that the site will be uninterrupted, error-free, or free of
                viruses or other harmful components.
              </p>
            </Section>

            <Section number="8" title="Limitation of Liability" index={8}>
              <p>
                To the maximum extent permitted by applicable law, Collectif
                Turath shall not be liable for any indirect, incidental,
                special, or consequential damages arising from your use of the
                website or purchase of products, even if advised of the
                possibility of such damages.
              </p>
              <p>
                Our total liability for any claim arising from a purchase shall
                not exceed the amount paid for the product in question.
              </p>
            </Section>

            <Section number="9" title="Governing Law" index={9}>
              <p>
                These Terms are governed by and construed in accordance with the
                laws of the Province of Quebec and the applicable federal laws
                of Canada. Any disputes shall be subject to the exclusive
                jurisdiction of the courts of Quebec.
              </p>
            </Section>

            <Section number="10" title="Changes to These Terms" index={10}>
              <p>
                We reserve the right to update these Terms at any time. Changes
                will be posted on this page with an updated effective date.
                Continued use of the site after changes constitutes acceptance
                of the revised Terms.
              </p>
            </Section>

            <Section number="11" title="Contact" index={11}>
              <p>
                For questions regarding these Terms:{" "}
                <a
                  href="mailto:support@turathcollective.com"
                  className="text-foreground underline underline-offset-2"
                >
                  support@turathcollective.com
                </a>
              </p>
            </Section>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}