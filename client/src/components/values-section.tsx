import { motion } from "framer-motion";

const values = [
  {
    title: "Artisanal Integrity",
    description: "Every piece is hand-thrown and hand-painted by master craftsmen in Hebron, preserving centuries-old techniques."
  },
  {
    title: "Slow Living",
    description: "We design for the ritual of the morning—objects that encourage you to pause, breathe, and savor the moment."
  },
  {
    title: "Organic Provenance",
    description: "Our materials are sourced directly from the earth, using natural pigments and lead-free glazes."
  }
];

export default function ValuesSection() {
  return (
    <section className="py-24 bg-background border-t border-border/40">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {values.map((value, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="text-center md:text-left"
            >
              <span className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold mb-4 block">0{idx + 1}</span>
              <h3 className="font-serif text-2xl mb-4">{value.title}</h3>
              <p className="text-sm text-foreground/60 leading-relaxed font-light">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
