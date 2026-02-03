import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-morning.png";

export default function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-black/10 z-10" /> {/* Subtle overlay */}
        <img
          src={heroImage}
          alt="Morning ritual with ceramics"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="relative z-20 container mx-auto px-6 md:px-12 h-full flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="max-w-xl"
        >
          <h2 className="text-sm md:text-base uppercase tracking-[0.2em] mb-4 text-primary font-medium">
            Collection No. 04
          </h2>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-[1.1] mb-8 text-foreground mix-blend-multiply md:mix-blend-normal">
            The Morning Ritual, <br />
            <span className="italic font-light">Reimagined.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-foreground/80 mb-10 max-w-md font-light leading-relaxed">
            Hand-thrown ceramics designed to slow down your daily routine and ground you in the moment.
          </p>

          <button className="group bg-primary text-primary-foreground px-8 py-4 rounded-none flex items-center gap-3 hover:bg-primary/90 transition-all duration-300">
            <span className="uppercase tracking-widest text-sm font-medium">Shop the Collection</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
      >
        <div className="w-[1px] h-16 bg-foreground/20 overflow-hidden">
          <div className="w-full h-1/2 bg-foreground/60 animate-slide-down"></div>
        </div>
      </motion.div>
    </section>
  );
}
