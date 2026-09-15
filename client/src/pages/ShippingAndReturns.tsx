import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import PageLayout from "@/components/PageLayout";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

/**
 * Render a content string that may contain blank-line separated paragraphs
 * and dash-prefixed bullet lines (as stored in legal.json).
 */
function MixedContent({ text }: { text: string }) {
  const blocks: React.ReactNode[] = [];
  let paraLines: string[] = [];
  let bulletLines: string[] = [];

  const flushPara = () => {
    if (paraLines.length) {
      blocks.push(<p key={`b${blocks.length}`}>{paraLines.join(" ")}</p>);
      paraLines = [];
    }
  };
  const flushBullets = () => {
    if (bulletLines.length) {
      blocks.push(
        <ul key={`b${blocks.length}`} className="space-y-1 pl-4">
          {bulletLines.map((b, i) => (
            <li
              key={i}
              className="before:content-['—'] before:mr-2 before:text-primary"
            >
              {b}
            </li>
          ))}
        </ul>,
      );
      bulletLines = [];
    }
  };

  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (line === "") {
      flushPara();
      flushBullets();
    } else if (line.startsWith("- ")) {
      flushPara();
      bulletLines.push(line.slice(2));
    } else {
      flushBullets();
      paraLines.push(line);
    }
  }
  flushPara();
  flushBullets();

  return <div className="space-y-2">{blocks}</div>;
}

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="font-medium text-foreground mb-1">{title}</p>
      {children}
    </div>
  );
}

export default function ShippingAndReturns() {
  const { t } = useTranslation("legal");
  const estimateItems = t("shipping.shipping.deliveryEstimates.items", {
    returnObjects: true,
  }) as { service: string; estimate: string }[];
  const eligibilityItems = t("shipping.returnsRefunds.eligibility.items", {
    returnObjects: true,
  }) as string[];

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
            {t("shipping.title")}
          </motion.h1>

          <motion.p
            className="text-sm text-muted-foreground mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {t("shipping.lastUpdated")}
          </motion.p>

          <div className="space-y-12 text-muted-foreground font-light leading-relaxed">
            {/* Shipping */}
            <motion.div
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <h2 className="font-serif text-2xl text-foreground mb-4">
                {t("shipping.shipping.title")}
              </h2>

              <div className="space-y-6">
                <Block title={t("shipping.shipping.whereWeShip.title")}>
                  <p>{t("shipping.shipping.whereWeShip.content")}</p>
                </Block>

                <Block title={t("shipping.shipping.processingTime.title")}>
                  <p>{t("shipping.shipping.processingTime.content")}</p>
                </Block>

                <div>
                  <p className="font-medium text-foreground mb-2">
                    {t("shipping.shipping.deliveryEstimates.title")}
                  </p>
                  <div className="border border-border rounded-sm overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          <th className="text-left px-4 py-3 font-medium text-foreground">
                            {t(
                              "shipping.shipping.deliveryEstimates.tableHeaders.service",
                            )}
                          </th>
                          <th className="text-left px-4 py-3 font-medium text-foreground">
                            {t(
                              "shipping.shipping.deliveryEstimates.tableHeaders.estimate",
                            )}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {estimateItems.map((row, i) => (
                          <tr
                            key={i}
                            className={
                              i < estimateItems.length - 1
                                ? "border-b border-border"
                                : ""
                            }
                          >
                            <td className="px-4 py-3">{row.service}</td>
                            <td className="px-4 py-3">{row.estimate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-2 text-sm">
                    {t("shipping.shipping.deliveryEstimates.note")}
                  </p>
                </div>

                <Block title={t("shipping.shipping.shippingRates.title")}>
                  <p>{t("shipping.shipping.shippingRates.content")}</p>
                </Block>

                <Block title={t("shipping.shipping.orderTracking.title")}>
                  <p>{t("shipping.shipping.orderTracking.content")}</p>
                </Block>

                <Block title={t("shipping.shipping.delaysExceptions.title")}>
                  <p>{t("shipping.shipping.delaysExceptions.content")}</p>
                </Block>
              </div>
            </motion.div>

            <div className="border-t border-border" />

            {/* Returns */}
            <motion.div
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <h2 className="font-serif text-2xl text-foreground mb-4">
                {t("shipping.returnsRefunds.title")}
              </h2>

              <div className="space-y-6">
                <p>{t("shipping.returnsRefunds.intro")}</p>

                <Block title={t("shipping.returnsRefunds.returnWindow.title")}>
                  <p>{t("shipping.returnsRefunds.returnWindow.content")}</p>
                </Block>

                <div>
                  <p className="font-medium text-foreground mb-1">
                    {t("shipping.returnsRefunds.eligibility.title")}
                  </p>
                  <p className="mb-2">
                    {t("shipping.returnsRefunds.eligibility.intro")}
                  </p>
                  <ul className="space-y-1 pl-4">
                    {eligibilityItems.map((item, i) => (
                      <li
                        key={i}
                        className="before:content-['—'] before:mr-2 before:text-primary"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2">
                    {t("shipping.returnsRefunds.eligibility.outro")}
                  </p>
                </div>

                <Block title={t("shipping.returnsRefunds.saleItems.title")}>
                  <p>{t("shipping.returnsRefunds.saleItems.content")}</p>
                </Block>

                <Block title={t("shipping.returnsRefunds.howToInitiate.title")}>
                  <MixedContent
                    text={t("shipping.returnsRefunds.howToInitiate.content")}
                  />
                </Block>

                <Block title={t("shipping.returnsRefunds.refundProcessing.title")}>
                  <MixedContent
                    text={t("shipping.returnsRefunds.refundProcessing.content")}
                  />
                </Block>

                <div className="border-l-2 border-primary pl-6">
                  <p className="font-medium text-foreground mb-1">
                    {t("shipping.returnsRefunds.damageDefective.title")}
                  </p>
                  <p>{t("shipping.returnsRefunds.damageDefective.content")}</p>
                </div>

                <Block title={t("shipping.returnsRefunds.exchanges.title")}>
                  <p>{t("shipping.returnsRefunds.exchanges.content")}</p>
                </Block>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
