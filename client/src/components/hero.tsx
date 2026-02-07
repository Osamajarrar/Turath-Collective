import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import heroImage from "@/assets/hero-morning.png";
import brandVideo from "@/assets/brand-video.mp4";
import { useState } from "react";

export default function Hero() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);

  return (
    <section className="relative h-[95vh] w-full overflow-hidden bg-[#FAF9F6]">
      {/* Background Video/Image */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-black/5 z-10" />
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          src={brandVideo}
        />
      </div>

      <div className="relative z-20 container mx-auto px-6 md:px-12 h-full flex flex-col justify-center items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl"
        >
          <span className="text-[10px] uppercase tracking-[0.5em] mb-8 text-primary font-bold block">Heritage Craftsmanship</span>
          <h1 className="font-serif text-5xl md:text-8xl lg:text-9xl leading-[1] mb-12 text-foreground">
            The Morning <br />
            <span className="italic font-light">Ritual</span>
          </h1>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <button className="group bg-primary text-primary-foreground px-12 py-5 rounded-none flex items-center gap-4 hover:bg-primary/95 transition-all duration-500 shadow-xl shadow-primary/10">
              <span className="uppercase tracking-[0.3em] text-[10px] font-bold">Shop Collection</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-2 transition-transform duration-500" />
            </button>
            <button className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-full border border-foreground/20 flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-all">
                    <Play className="w-3 h-3 fill-current" />
                </div>
                <span className="uppercase tracking-[0.3em] text-[9px] font-bold">Watch Process</span>
            </button>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-12 left-12 hidden lg:block z-20">
        <p className="text-[9px] uppercase tracking-[0.4em] text-foreground/40 font-bold vertical-text">Crafted in Hebron</p>
      </div>

      <style>{`
        .vertical-text {
            writing-mode: vertical-rl;
            transform: rotate(180deg);
        }
      `}</style>
    </section>
  );
}
