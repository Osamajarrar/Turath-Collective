import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import PageLayout from "@/components/PageLayout";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as const},
  }),
};

export default function About() {
  const { t } = useTranslation("pages");
  return (
  <PageLayout>
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <motion.h1
            className="font-serif text-5xl mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {t('about.title')}
          </motion.h1>

          <div className="space-y-10 text-muted-foreground font-light leading-relaxed">
            <motion.p
              className="text-xl text-foreground font-light leading-relaxed"
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              {t('about.intro')}
            </motion.p>

            <motion.p
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              {t('about.paragraph1')}
            </motion.p>

            <motion.p
              custom={3}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              {t('about.paragraph2')}
            </motion.p>

            <motion.p
              custom={4}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              {t('about.paragraph3')}
            </motion.p>

            <motion.div
              custom={5}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <h2 className="font-serif text-2xl text-foreground mt-12 mb-4">
                {t('about.whatWeCarry.title')}
              </h2>
              <p className="mb-6">
                {t('about.whatWeCarry.intro')}
              </p>
              <div className="border-l-2 border-[#C9A96E] pl-6 space-y-6">
                <div>
                  <p className="font-medium text-foreground mb-1">
                    {t('about.whatWeCarry.ceramics.title')}
                  </p>
                  <p>
                    {t('about.whatWeCarry.ceramics.description')}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">
                    {t('about.whatWeCarry.embroidery.title')}
                  </p>
                  <p>
                    {t('about.whatWeCarry.embroidery.description')}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              custom={6}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <h2 className="font-serif text-2xl text-foreground mt-12 mb-4">
                {t('about.commitment.title')}
              </h2>
              <p>
                {t('about.commitment.paragraph1')}
              </p>
              <p className="mt-4">
                {t('about.commitment.paragraph2')}
              </p>
            </motion.div>

            <motion.div
              custom={7}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <h2 className="font-serif text-2xl text-foreground mt-12 mb-4">
                {t('about.authenticity.title')}
              </h2>
              <p>
                {t('about.authenticity.description')}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
