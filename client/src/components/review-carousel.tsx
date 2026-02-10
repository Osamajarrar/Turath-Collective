import { motion, AnimatePresence } from "framer-motion";
import { Quote } from "lucide-react";
import { useState, useEffect } from "react";

const reviews = [
  {
    text: "The quality of the ceramic bowl is breathtaking. You can truly feel the weight of tradition in your hands. A stunning addition to my home.",
    author: "Elena M.",
    location: "Montreal, QC",
    product: "Indigo Mosaic Bowl"
  },
  {
    text: "The embroidery on the cushions is so intricate. It's more than just decor; it's a conversation piece about heritage and resilience.",
    author: "Sami K.",
    location: "Toronto, ON",
    product: "Tatreez Pattern Cushion"
  },
  {
    text: "Beautifully packaged and the craftsmanship is unparalleled. Turath Collective has become my go-to for thoughtful, cultural gifts.",
    author: "Amira J.",
    location: "Vancouver, BC",
    product: "Hebron Glass Vase"
  }
];

export default function ReviewCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % reviews.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-32 bg-white">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <span className="text-[10px] uppercase tracking-[0.4em] text-primary mb-6 block font-bold">Patron Stories</span>
            <h2 className="font-serif text-5xl md:text-6xl text-foreground mb-8">Voices of the <br/><span className="italic">Collective</span></h2>
            <div className="flex gap-4">
              {reviews.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActive(idx)}
                  className={`h-1 transition-all duration-500 ${active === idx ? "w-12 bg-primary" : "w-6 bg-primary/10"}`}
                />
              ))}
            </div>
          </div>

          <div className="relative h-80 flex items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 flex flex-col justify-center"
              >
                <Quote className="w-12 h-12 text-primary/10 mb-8" />
                <p className="font-serif text-2xl md:text-3xl text-foreground/90 leading-relaxed mb-10">
                  {reviews[active].text}
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-px bg-primary/20" />
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary">{reviews[active].author}</p>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{reviews[active].location} • {reviews[active].product}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
