import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export default function ValuesSection() {
  const { t } = useTranslation("pages");
  const prefersReducedMotion = useReducedMotion();
  const values = t('values.items', { returnObjects: true }) as Array<{
    number: string;
    title: string;
    description: string;
  }>;
  return (
    <section className="py-12 bg-background border-t border-border/40">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {values.map((value, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: prefersReducedMotion ? 0 : idx * 0.1, duration: prefersReducedMotion ? 0.1 : 0.6 }}
              className="text-center md:text-left"
            >
              <span className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold mb-4 block">{value.number}</span>
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
