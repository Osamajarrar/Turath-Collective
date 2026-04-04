import { motion } from "framer-motion";
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
      <h2 className="font-serif text-2xl text-foreground mb-6">{title}</h2>
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
            Artisan Care Guide
          </motion.h1>

          <motion.p
            className="text-muted-foreground font-light leading-relaxed mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Handmade objects ask something of us — a little more attention, a
            little more intention. The guidance below will help your piece
            remain as beautiful in ten years as it is today.
          </motion.p>

          <div className="space-y-14 text-muted-foreground font-light leading-relaxed">
            <CareSection title="Hebron Ceramics" index={1}>
              <p className="mb-6">
                Hebron pottery is fired at high temperatures and finished with
                natural mineral glazes. It is durable, but it is not
                indestructible.
              </p>

              <CareRule
                label="Handling"
                items={[
                  "Handle with care. Ceramic is susceptible to chipping if knocked against hard surfaces.",
                  "Avoid dropping or stacking pieces without protective padding between them.",
                ]}
              />

              <CareRule
                label="Cleaning"
                items={[
                  "Hand wash only with mild dish soap and warm water.",
                  "Do not use abrasive sponges, steel wool, or harsh chemical cleaners — these will damage the glaze over time.",
                  "Dry thoroughly after washing. Prolonged exposure to standing water can affect unglazed areas.",
                ]}
              />

              <CareRule
                label="Use"
                items={[
                  "Most Hebron ceramic pieces are decorative. Food-safe pieces are clearly indicated on the product listing.",
                  "Not recommended for microwave or dishwasher use unless explicitly stated on the product listing.",
                  "Avoid sudden temperature changes (e.g. placing a cold piece on a hot surface) as thermal shock can cause cracking.",
                ]}
              />

              <CareRule
                label="Display & Storage"
                items={[
                  "Keep away from direct sunlight for extended periods, as UV exposure can gradually affect glaze colour.",
                  "Store in a cool, dry place when not on display.",
                ]}
              />
            </CareSection>

            <div className="border-t border-border" />

            <CareSection title="Tatreez Embroidery" index={2}>
              <p className="mb-6">
                Palestinian embroidery is worked in cotton or silk thread on
                fabric. The colours and patterns are the result of painstaking
                skill — they deserve equally careful maintenance.
              </p>

              <CareRule
                label="Washing"
                items={[
                  "Hand wash only in cold water with a gentle, colour-safe detergent.",
                  "Do not wring or twist the fabric. Gently press out excess water.",
                  "Do not bleach under any circumstances — embroidery threads are sensitive to harsh chemicals and colours will fade or bleed.",
                  "Machine washing is not recommended even on delicate cycles.",
                ]}
              />

              <CareRule
                label="Drying"
                items={[
                  "Lay flat to dry away from direct sunlight or heat sources.",
                  "Do not tumble dry.",
                  "Reshape gently while damp if needed.",
                ]}
              />

              <CareRule
                label="Ironing"
                items={[
                  "If ironing is necessary, turn the piece inside out and iron on a low setting.",
                  "Do not iron directly over embroidered areas — use a pressing cloth as a barrier.",
                ]}
              />

              <CareRule
                label="Storage"
                items={[
                  "Store folded (not hung) to prevent stretching.",
                  "Keep away from direct sunlight to preserve thread colour.",
                  "For long-term storage, wrap in acid-free tissue paper to prevent yellowing.",
                ]}
              />
            </CareSection>

            <div className="border-t border-border" />

            <CareSection title="General Guidance" index={3}>
              <p className="mb-4">
                Every piece carried by Turath Collective is made by hand. Minor
                variations in colour, texture, size, and pattern are not
                imperfections — they are evidence of the human skill behind each
                object. These variations are what distinguish genuine craft from
                mass production.
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
                and we will advise you directly.
              </p>
            </CareSection>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}