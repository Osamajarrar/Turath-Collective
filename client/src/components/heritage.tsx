import { motion } from "framer-motion";
import workshopImage from "@/assets/workshop.png";

export default function Heritage() {
  return (
    <section className="py-24 md:py-32 bg-background border-t border-border/40">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative aspect-[3/4] lg:aspect-square overflow-hidden"
          >
            <div className="absolute inset-0 bg-primary/10 mix-blend-multiply z-10" />
            <img 
              src={workshopImage} 
              alt="Hebron ceramics workshop" 
              className="w-full h-full object-cover grayscale-[20%] sepia-[10%] contrast-[1.1]"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col justify-center lg:pl-12"
          >
            <span className="text-sm uppercase tracking-[0.2em] text-primary mb-6 font-medium">Heritage</span>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-8 leading-tight">
              Crafted in the Heart of Hebron
            </h2>
            <div className="space-y-6 text-foreground/80 font-light leading-relaxed text-lg">
              <p>
                There is a rhythm to the wheel that mirrors the rhythm of life. 
                In our small workshop, time slows down. The clay, sourced from 
                local riverbeds, carries the memory of the earth.
              </p>
              <p>
                Each piece is not merely manufactured, but birthed through fire 
                and patience. We honor the imperfections—the slight wobble of a 
                rim, the unpredictable drip of a glaze—as the signature of the 
                human hand.
              </p>
            </div>
            
            <div className="mt-12">
              <a href="/about" className="inline-block border-b border-primary text-primary pb-1 hover:text-foreground hover:border-foreground transition-all duration-300 uppercase tracking-widest text-sm font-medium">
                Read Our Story
              </a>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
