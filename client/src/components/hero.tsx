import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import brandVideo from "@/assets/brand-video.mp4";

export default function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Video with Gradient Overlays */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-black/10 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 z-10" />
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-90"
          src={brandVideo}
        />
      </div>

      <div className="relative z-20 container mx-auto px-6 md:px-12 h-full flex flex-col justify-center items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl"
        >
          <h1 className="font-serif text-6xl md:text-8xl lg:text-[10rem] leading-[0.9] mb-12 text-black">
            Connect through <br />
            <span className="italic font-light">Heritage</span>
          </h1>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-10">
            <button className="group bg-primary text-white px-14 py-6 rounded-none flex items-center gap-4 hover:bg-primary/95 transition-all duration-500 shadow-xl shadow-primary/10">
              <span className="uppercase tracking-[0.3em] text-[10px] font-bold">Shop Heritage</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-2 transition-transform duration-500" />
            </button>
            <button className="flex items-center gap-4 group">
                <div className="w-14 h-14 rounded-full border border-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all backdrop-blur-sm">
                    <Play className="w-3 h-3 fill-current ml-0.5 text-primary group-hover:text-white" />
                </div>
                <span className="uppercase tracking-[0.3em] text-[9px] font-bold text-primary">Watch Our Story</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Aesthetic Accents */}
      <div className="absolute bottom-12 left-12 hidden lg:block z-20">
        <p className="text-[10px] uppercase tracking-[0.5em] text-white/40 font-bold vertical-text">Crafted in Hebron</p>
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
