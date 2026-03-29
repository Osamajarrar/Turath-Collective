import { motion } from "framer-motion";
import { Link } from "wouter";
import ceramicCard from "@/assets/burgundy-olive-set.png";
import embroideryCard from "@/assets/embroidery.jpg";

const collections = [
  {
    title: "Ceramics",
    description: "Hand-thrown Hebron clay vessels, painted with the rhythm of the wheel.",
    cta: "SHOP CERAMICS",
    image: ceramicCard,
    link: "/shop?category=ceramics"
  },
  {
    title: "Embroidery",
    description: "Centuries-old Tatreez patterns, hand-stitched on the finest local linens.",
    cta: "SHOP EMBROIDERY",
    image: embroideryCard,
    link: "/shop?category=embroidery"
  }
];

export default function CollectionCards() {
  return (
    <section className="py-32 bg-background">
      <div className="container mx-auto px-6 md:px-12">
      <span className="text-[10px] uppercase tracking-[0.4em] text-primary mb-8 block font-bold">Explore the Collections</span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {collections.map((collection, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: idx * 0.2 }}
              className="group"
            >
              <Link
                href={collection.link}
                className="relative mb-8 block aspect-[16/10] cursor-pointer overflow-hidden rounded-[2rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <img 
                  src={collection.image} 
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/5 transition-colors duration-500 group-hover:bg-black/20" />
                <span className="sr-only">{collection.title} — {collection.cta}</span>
              </Link>
              <div className="px-4">
                <h3 className="font-serif text-4xl mb-4 text-foreground">{collection.title}</h3>
                <p className="text-foreground/60 font-light mb-8 max-w-sm leading-relaxed">{collection.description}</p>
                <Link href={collection.link}>
                  <button className="text-[10px] uppercase tracking-[0.3em] font-bold border-b border-primary/20 pb-1 hover:border-primary transition-all text-primary group-hover:text-foreground">
                    {collection.cta} →
                  </button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
