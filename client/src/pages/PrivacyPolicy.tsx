import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
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
        <span className="font-serif text-primary text-lg leading-tight">
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

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="text-primary shrink-0">—</span>
      <span>{children}</span>
    </li>
  );
}

/** Render a string that may contain blank-line separated paragraphs. */
function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text.split("\n\n").map((para, i) => (
        <p key={i} className="whitespace-pre-line">
          {para}
        </p>
      ))}
    </>
  );
}

export default function PrivacyPolicy() {
  const { t } = useTranslation("legal");
  const arr = (key: string) =>
    t(`privacy.${key}`, { returnObjects: true }) as string[];

  const s1 = {
    direct: arr("sections.section1.subsections.direct.items"),
    automatic: arr("sections.section1.subsections.automatic.items"),
    thirdParty: arr("sections.section1.subsections.thirdParty.items"),
  };
  const thirdParties = t("privacy.sections.section4.thirdParties", {
    returnObjects: true,
  }) as { name: string; purpose: string }[];

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
            {t("privacy.title")}
          </motion.h1>

          <motion.div
            className="text-sm text-muted-foreground mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p>{t("privacy.effectiveDate")}</p>
          </motion.div>

          <motion.div
            className="text-muted-foreground font-light leading-relaxed mb-12 pb-12 border-b border-border space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Paragraphs text={t("privacy.intro")} />
          </motion.div>

          <div className="space-y-10">
            <Section
              number={t("privacy.sections.section1.number")}
              title={t("privacy.sections.section1.title")}
              index={1}
            >
              <p>{t("privacy.sections.section1.intro")}</p>
              <div>
                <p className="font-medium text-foreground mb-2">
                  {t("privacy.sections.section1.subsections.direct.title")}
                </p>
                <ul className="space-y-1">
                  {s1.direct.map((item, i) => (
                    <Bullet key={i}>{item}</Bullet>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-medium text-foreground mb-2">
                  {t("privacy.sections.section1.subsections.automatic.title")}
                </p>
                <ul className="space-y-1">
                  {s1.automatic.map((item, i) => (
                    <Bullet key={i}>{item}</Bullet>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-medium text-foreground mb-2">
                  {t("privacy.sections.section1.subsections.thirdParty.title")}
                </p>
                <ul className="space-y-1">
                  {s1.thirdParty.map((item, i) => (
                    <Bullet key={i}>{item}</Bullet>
                  ))}
                </ul>
              </div>
            </Section>

            <Section
              number={t("privacy.sections.section2.number")}
              title={t("privacy.sections.section2.title")}
              index={2}
            >
              <p>{t("privacy.sections.section2.intro")}</p>
              <ul className="space-y-1">
                {arr("sections.section2.items").map((item, i) => (
                  <Bullet key={i}>{item}</Bullet>
                ))}
              </ul>
              <p>{t("privacy.sections.section2.outro")}</p>
            </Section>

            <Section
              number={t("privacy.sections.section3.number")}
              title={t("privacy.sections.section3.title")}
              index={3}
            >
              <Paragraphs text={t("privacy.sections.section3.content")} />
            </Section>

            <Section
              number={t("privacy.sections.section4.number")}
              title={t("privacy.sections.section4.title")}
              index={4}
            >
              <p>{t("privacy.sections.section4.intro")}</p>
              <div className="border border-border rounded-sm overflow-hidden my-2">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-3 font-medium text-foreground">
                        {t("privacy.sections.section4.tableHeaders.party")}
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-foreground">
                        {t("privacy.sections.section4.tableHeaders.purpose")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {thirdParties.map((row, i) => (
                      <tr
                        key={i}
                        className={
                          i < thirdParties.length - 1
                            ? "border-b border-border"
                            : ""
                        }
                      >
                        <td className="px-4 py-3">{row.name}</td>
                        <td className="px-4 py-3">{row.purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Paragraphs text={t("privacy.sections.section4.outro")} />
            </Section>

            <Section
              number={t("privacy.sections.section5.number")}
              title={t("privacy.sections.section5.title")}
              index={5}
            >
              <Paragraphs text={t("privacy.sections.section5.content")} />
            </Section>

            <Section
              number={t("privacy.sections.section6.number")}
              title={t("privacy.sections.section6.title")}
              index={6}
            >
              <p>{t("privacy.sections.section6.intro")}</p>
              <ul className="space-y-1">
                {arr("sections.section6.items").map((item, i) => (
                  <Bullet key={i}>{item}</Bullet>
                ))}
              </ul>
              <p>{t("privacy.sections.section6.outro")}</p>
            </Section>

            <Section
              number={t("privacy.sections.section7.number")}
              title={t("privacy.sections.section7.title")}
              index={7}
            >
              <p>{t("privacy.sections.section7.intro")}</p>
              <ul className="space-y-1">
                {arr("sections.section7.items").map((item, i) => (
                  <Bullet key={i}>{item}</Bullet>
                ))}
              </ul>
              <p>{t("privacy.sections.section7.outro")}</p>
            </Section>

            <Section
              number={t("privacy.sections.section8.number")}
              title={t("privacy.sections.section8.title")}
              index={8}
            >
              <Paragraphs text={t("privacy.sections.section8.content")} />
            </Section>

            <Section
              number={t("privacy.sections.section9.number")}
              title={t("privacy.sections.section9.title")}
              index={9}
            >
              <Paragraphs text={t("privacy.sections.section9.content")} />
            </Section>

            <Section
              number={t("privacy.sections.section10.number")}
              title={t("privacy.sections.section10.title")}
              index={10}
            >
              <Paragraphs text={t("privacy.sections.section10.content")} />
            </Section>

            <Section
              number={t("privacy.sections.section11.number")}
              title={t("privacy.sections.section11.title")}
              index={11}
            >
              <Paragraphs text={t("privacy.sections.section11.content")} />
            </Section>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
