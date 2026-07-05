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

export default function Care() {
  const { t } = useTranslation("pages");
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
            <CareSection title={t('care.ceramics.title')} index={1}>
              <p className="mb-6">
                {t('care.ceramics.intro')}
              </p>

              <CareRule
                label={t('care.ceramics.handling.label')}
                items={t('care.ceramics.handling.items', { returnObjects: true }) as string[]}
              />

              <CareRule
                label={t('care.ceramics.cleaning.label')}
                items={t('care.ceramics.cleaning.items', { returnObjects: true }) as string[]}
              />

              <CareRule
                label={t('care.ceramics.use.label')}
                items={t('care.ceramics.use.items', { returnObjects: true }) as string[]}
              />

              <CareRule
                label={t('care.ceramics.displayStorage.label')}
                items={t('care.ceramics.displayStorage.items', { returnObjects: true }) as string[]}
              />
            </CareSection>

            <div className="border-t border-border" />

            <CareSection title={t('care.embroidery.title')} index={2}>
              <p className="mb-6">
                {t('care.embroidery.intro')}
              </p>

              <CareRule
                label={t('care.embroidery.washing.label')}
                items={t('care.embroidery.washing.items', { returnObjects: true }) as string[]}
              />

              <CareRule
                label={t('care.embroidery.drying.label')}
                items={t('care.embroidery.drying.items', { returnObjects: true }) as string[]}
              />

              <CareRule
                label={t('care.embroidery.ironing.label')}
                items={t('care.embroidery.ironing.items', { returnObjects: true }) as string[]}
              />

              <CareRule
                label={t('care.embroidery.storage.label')}
                items={t('care.embroidery.storage.items', { returnObjects: true }) as string[]}
              />
            </CareSection>

            <div className="border-t border-border" />

            <CareSection title={t('care.general.title')} index={3}>
              <p className="mb-4">
                {t('care.general.paragraph1')}
              </p>
              <p>
                If you are ever unsure how to care for a specific piece, reach
                out to us at{" "}
                <a
                  href="mailto:support@turathcollective.com"
                  className="text-foreground underline underline-offset-2"
                >
                  support@turathcollective.com
                </a>{" "}
                and {t('care.general.paragraph2')}
              </p>
            </CareSection>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}