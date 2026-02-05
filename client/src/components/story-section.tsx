import { motion } from "framer-motion";
import lifestyle1 from "@/assets/lifestyle-1.png";

export default function StorySection() {
  return (
    <section className="py-24 bg-[#F4F2EE]">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-5"
          >
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-8 leading-tight">
              A Dialogue Between <span className="italic">Earth and Hand</span>
            </h2>
            <p className="text-lg text-foreground/70 mb-8 font-light leading-relaxed">
              Every curve tells a story of patience. Our process is a slow meditation, transforming raw Hebron clay into vessels that honor the quiet moments of your day.
            </p>
            <div className="grid grid-cols-2 gap-8 border-t border-border pt-8">
              <div>
                <span className="block text-2xl font-serif mb-1">100%</span>
                <span className="text-xs uppercase tracking-widest text-primary font-medium">Local Clay</span>
              </div>
              <div>
                <span className="block text-2xl font-serif mb-1">48hrs</span>
                <span className="text-xs uppercase tracking-widest text-primary font-medium">Kiln Fired</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 relative"
          >
            <div className="aspect-[16/9] overflow-hidden">
              <img 
                src={lifestyle1} 
                alt="Minimalist interior" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-background p-8 hidden md:block max-w-xs shadow-sm">
              <p className="text-sm italic font-serif leading-relaxed">
                "The most beautiful objects are those that invite us to be present."
              </p>
              <span className="block text-[10px] uppercase tracking-widest mt-4 text-primary font-bold">— Studio Philosophy</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
