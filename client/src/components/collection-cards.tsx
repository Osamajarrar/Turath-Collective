import { motion } from "framer-motion";
import { Link } from "wouter";
import { collections } from "@/lib/collections";

type Collection = (typeof collections)[number];

function SingleCard({
  collection,
  idx,
}: {
  collection: Collection;
  idx: number;
}) {
  const href = collection.link; // Always use collection.link which includes category param

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: idx * 0.2 }}
      className={`group ${collection.comingSoon ? "pointer-events-none" : ""}`}
    >
      {collection.comingSoon ? (
        <div className="relative mb-8 block aspect-[16/10] overflow-hidden rounded-[2rem]">
          <img
            src={collection.image}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <span className="text-[10px] uppercase tracking-[0.5em] text-white/70 font-bold">
              Coming Soon
            </span>
            <div className="h-px w-12 bg-white/30" />
            <span className="font-serif text-white text-2xl italic">
              In the works
            </span>
          </div>
        </div>
      ) : (
        <Link
          href={href}
          className="relative mb-8 block aspect-[16/10] cursor-pointer overflow-hidden rounded-[2rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <img
            src={collection.image}
            alt=""
            className="h-full w-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/5 transition-colors duration-500 group-hover:bg-black/20" />
          <span className="sr-only">
            {collection.title} — {collection.cta}
          </span>
        </Link>
      )}

      <div className="px-4">
        <h3
          className={`font-serif text-4xl mb-4 ${collection.comingSoon ? "text-foreground/40" : "text-foreground"}`}
        >
          {collection.title}
        </h3>
        <p className="text-foreground/60 font-light mb-8 max-w-sm leading-relaxed">
          {collection.description}
        </p>
        {collection.comingSoon ? (
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-foreground/30">
            Available Soon
          </span>
        ) : (
          <Link href={href}>
            <button className="text-[10px] uppercase tracking-[0.3em] font-bold border-b border-primary/20 pb-1 hover:border-primary transition-all text-primary group-hover:text-foreground">
              {collection.cta} →
            </button>
          </Link>
        )}
      </div>
    </motion.div>
  );
}

function getGridClass(count: number): string {
  if (count === 3) return "grid-cols-1 md:grid-cols-3";
  return "grid-cols-1 md:grid-cols-2";
}

export default function CollectionCards() {
  const visibleCollections = collections.filter((c) => !c.hidden);
  const isSingle = visibleCollections.length === 1;

  return (
    <section className="py-32 bg-background">
      <div className="container mx-auto px-6 md:px-12">
        {/* Header row */}
        <div
          className={`flex items-center ${isSingle ? "justify-center mb-4" : "justify-between mb-6"}`}
        >
          <span
            className={`text-[10px] uppercase tracking-[0.4em] text-primary font-bold ${isSingle ? "text-center" : ""}`}
          >
            Explore the Collections
          </span>
          {!isSingle && (
            <Link href="/shop">
              <button className="text-[10px] uppercase tracking-[0.3em] font-bold border-b border-primary/20 pb-1 hover:border-primary transition-all text-primary mb-6">
                Shop All →
              </button>
            </Link>
          )}
        </div>

        {isSingle ? (
          <>
            {/* Shop All above card when single */}
            <div className="flex justify-center mb-8">
              <Link href="/shop">
                <button className="text-[10px] uppercase tracking-[0.3em] font-bold border-b border-primary/20 pb-1 hover:border-primary transition-all text-primary">
                  Shop All →
                </button>
              </Link>
            </div>
            <div className="flex justify-center">
              <div className="w-full md:w-7/12">
                <SingleCard collection={visibleCollections[0]} idx={0} />
              </div>
            </div>
          </>
        ) : (
          <div
            className={`grid gap-10 ${getGridClass(visibleCollections.length)}`}
          >
            {visibleCollections.map((collection, idx) => (
              <SingleCard
                key={collection.title}
                collection={collection}
                idx={idx}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}