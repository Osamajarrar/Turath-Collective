import { motion } from "framer-motion";
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
            Our Story
          </motion.h1>

          <div className="space-y-10 text-muted-foreground font-light leading-relaxed">
            <motion.p
              className="text-xl text-foreground font-light leading-relaxed"
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              Some things are too important to forget.
            </motion.p>

            <motion.p
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              Turath Collective was born from a simple conviction: that the
              hands shaping clay in Hebron and threading needle through fabric
              in Palestinian villages deserve a place in the world — not as
              artifacts of the past, but as living expressions of a culture that
              endures.
            </motion.p>

            <motion.p
              custom={3}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <em>Turath</em> — تراث — means heritage in Arabic. It is the
              thread connecting generations, the knowledge passed quietly from
              artisan to apprentice, the pattern in embroidery that tells a
              story older than any border.
            </motion.p>

            <motion.p
              custom={4}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              We are a Montreal-based collective dedicated to bringing
              Palestinian heritage craftsmanship to homes around the world.
              Every piece we carry is made by hand, by artisans who have
              inherited centuries of tradition and continue to practice it with
              extraordinary skill.
            </motion.p>

            <motion.div
              custom={5}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <h2 className="font-serif text-2xl text-foreground mt-12 mb-4">
                What We Carry
              </h2>
              <p className="mb-6">
                We work with two foundational crafts — chosen because they
                represent the depth and diversity of Palestinian artistic
                heritage.
              </p>
              <div className="border-l-2 border-[#C9A96E] pl-6 space-y-6">
                <div>
                  <p className="font-medium text-foreground mb-1">
                    Hebron Ceramics
                  </p>
                  <p>
                    The city of Hebron (Al-Khalil) has been a centre of ceramic
                    artistry for over five hundred years. The distinctive deep
                    blues, teals, and earthy tones of Hebron pottery emerge from
                    natural mineral glazes and wood-fired kilns. Each piece
                    carries the slight variations that only handwork produces —
                    no two are identical.
                  </p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">
                    Tatreez Embroidery
                  </p>
                  <p>
                    Palestinian cross-stitch embroidery is one of the most
                    sophisticated textile traditions in the world. Each regional
                    pattern is a visual language: a map of village, season, and
                    lineage encoded in thread. Tatreez was inscribed on UNESCO's
                    list of Intangible Cultural Heritage in 2021 — recognition
                    long overdue.
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
                Our Commitment
              </h2>
              <p>
                We work directly with artisan communities, ensuring that the
                people whose skill makes this work possible are fairly
                compensated and properly credited. We do not romanticize
                poverty. We believe craft should sustain the people who practice
                it.
              </p>
              <p className="mt-4">
                Every purchase through Turath Collective supports an artisan
                family continuing a tradition that the world cannot afford to
                lose.
              </p>
            </motion.div>

            <motion.div
              custom={7}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <h2 className="font-serif text-2xl text-foreground mt-12 mb-4">
                A Note on Authenticity
              </h2>
              <p>
                We do not carry mass-produced imitations. Every product is
                sourced directly and verified for craftsmanship. If it carries
                the Turath Collective name, it is the real thing.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
