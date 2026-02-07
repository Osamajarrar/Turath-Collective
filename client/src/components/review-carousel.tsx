import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useState, useEffect } from "react";

const reviews = [
  {
    text: "The quality of the ceramic bowl is breathtaking. You can truly feel the weight of tradition in your hands. A stunning addition to my home.",
    author: "Elena M.",
    location: "Montreal, QC"
  },
  {
    text: "The embroidery on the cushions is so intricate. It's more than just decor; it's a conversation piece about heritage and resilience.",
    author: "Sami K.",
    location: "Toronto, ON"
  },
  {
    text: "Beautifully packaged and the craftsmanship is unparalleled. Turath Collective has become my go-to for thoughtful, cultural gifts.",
    author: "Amira J.",
    location: "Vancouver, BC"
  }
];

export default function ReviewCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-32 bg-[#F4F2EE] overflow-hidden">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center gap-1 mb-10">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-primary text-primary" />
            ))}
          </div>

          <div className="relative h-48 md:h-32">
            {reviews.map((review, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: active === idx ? 1 : 0,
                  y: active === idx ? 0 : 20,
                  pointerEvents: active === idx ? "auto" : "none"
                }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 flex flex-col justify-center"
              >
                <p className="font-serif text-2xl md:text-3xl lg:text-4xl italic text-foreground/80 leading-relaxed mb-8">
                  "{review.text}"
                </p>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary">{review.author}</p>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{review.location}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center gap-3 mt-16">
            {reviews.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActive(idx)}
                className={cn("w-1.5 h-1.5 rounded-full transition-all", active === idx ? "bg-primary w-6" : "bg-primary/20")}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
