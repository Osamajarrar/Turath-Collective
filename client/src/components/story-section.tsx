import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import lifestyle1 from "@/assets/lifestyle-1.png";

export default function StorySection() {
  const { t } = useTranslation('pages');
  return (
    <section className="py-12 bg-muted">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-5"
          >
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-8 leading-tight">
              {t('story.mainHeading')}
            </h2>
            <p className="text-lg text-foreground/70 mb-8 font-light leading-relaxed">
              {t('story.body')}
            </p>
            <div className="grid grid-cols-2 gap-8 border-t border-border pt-8">
              <div>
                <span className="block text-2xl font-serif mb-1">{t('story.stats.stat1.value')}</span>
                <span className="text-xs uppercase tracking-widest text-primary font-medium">{t('story.stats.stat1.label')}</span>
              </div>
              <div>
                <span className="block text-2xl font-serif mb-1">{t('story.stats.stat2.value')}</span>
                <span className="text-xs uppercase tracking-widest text-primary font-medium">{t('story.stats.stat2.label')}</span>
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
                "{t('story.quote')}"
              </p>
              <span className="block text-[10px] uppercase tracking-widest mt-4 text-primary font-bold">{t('story.attribution')}</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
