import { motion } from "framer-motion";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { getVisibleCategories } from "@/lib/collections";
import PageLayout from "@/components/PageLayout";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

function CareSection({
  title,
  children,
  index,
}: {
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
      <h2 className="heading-subsection text-foreground mb-6">{title}</h2>
      {children}
    </motion.div>
  );
}

function CareRule({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="mb-5">
      <p className="font-medium text-foreground mb-2">{label}</p>
      <ul className="space-y-1 text-muted-foreground font-light">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3">
            <span className="text-[#C9A96E] mt-0.5 shrink-0">—</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Which care sections exist, and which rule blocks each one has.
 *
 * Keyed by CATEGORY HANDLE so it lines up with lib/collections.ts — a
 * category that is hidden there produces no care section here. The rule names
 * differ per craft (ceramics is handled/cleaned/used/stored; textiles are
 * washed/dried/ironed/stored), so they are listed rather than assumed.
 */
// ⚠ Only list a handle here once `care.<handle>.*` copy exists in ALL THREE
// locales, otherwise the page renders raw key strings. Glass is deliberately
// absent: it is a visible (coming-soon) category but has no care copy written
// yet, and care instructions are not something to invent.
const CARE_CONTENT: Record<string, string[]> = {
  ceramics: ["handling", "cleaning", "use", "displayStorage"],
  embroidery: ["washing", "drying", "ironing", "storage"],
};

export default function Care() {
  const { t } = useTranslation(["pages", "common"]);

  // getVisibleCategories, not getAvailableCategories: a coming-soon craft is
  // still advertised, and someone who already owns an early piece should be
  // able to read how to look after it.
  const careSections = getVisibleCategories(((key: string) =>
    t(key, { ns: "common" })) as (key: string) => string)
    .filter((category) => CARE_CONTENT[category.handle])
    .map((category) => ({ handle: category.handle, rules: CARE_CONTENT[category.handle] }));

  return (
    <PageLayout>
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <motion.h1
            className="font-serif text-5xl mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {t('care.title')}
          </motion.h1>

          <motion.p
            className="text-muted-foreground font-light leading-relaxed mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {t('care.intro')}
          </motion.p>

          <div className="space-y-14 text-muted-foreground font-light leading-relaxed">
            {/* Driven by the SAME visibility source as the navbar, collection
                cards, about page and shop filters. Previously these sections
                were hardcoded, so hiding embroidery in lib/collections.ts left
                a full Tatreez care guide on this page for a craft we do not
                sell — the exact failure this now prevents. */}
            {careSections.map((section, i) => (
              <Fragment key={section.handle}>
                {i > 0 && <div className="border-t border-border" />}
                <CareSection title={t(`care.${section.handle}.title`)} index={i + 1}>
                  <p className="mb-6">{t(`care.${section.handle}.intro`)}</p>
                  {section.rules.map((rule) => (
                    <CareRule
                      key={rule}
                      label={t(`care.${section.handle}.${rule}.label`)}
                      items={
                        t(`care.${section.handle}.${rule}.items`, {
                          returnObjects: true,
                        }) as string[]
                      }
                    />
                  ))}
                </CareSection>
              </Fragment>
            ))}

            <div className="border-t border-border" />

            <CareSection title={t('care.general.title')} index={careSections.length + 1}>
              <p className="mb-4">
                {t('care.general.paragraph1')}
              </p>
              <p>
                {t('care.general.unsure')}{" "}
                <a
                  href="mailto:support@turathcollective.com"
                  className="text-foreground underline underline-offset-2"
                >
                  support@turathcollective.com
                </a>{" "}
                {t('care.general.paragraph2')}
              </p>
            </CareSection>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}