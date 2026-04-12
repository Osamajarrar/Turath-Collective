import { motion } from "framer-motion";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { getVisibleCategories, Category } from "@/lib/collections";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

function SingleCard({
  category,
  idx,
  t,
}: {
  category: Category;
  idx: number;
  t: (key: string) => string;
}) {
  const prefersReducedMotion = useReducedMotion();
  // Use the first collection for CTA if present, else fallback
  const mainCollection = category.collections?.[0];
  const href = `/shop?category=${category.handle}`;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: prefersReducedMotion ? 0.1 : 0.8, delay: prefersReducedMotion ? 0 : idx * 0.2 }}
      className={`group ${category.comingSoon ? "pointer-events-none" : ""}`}
    >
      {category.comingSoon ? (
        <div className="relative mb-8 block aspect-[16/10] overflow-hidden rounded-[2rem]">
          <img
            src={category.image}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <span className="text-[10px] uppercase tracking-[0.5em] text-white/70 font-bold">
              {t("collectionCards.comingSoon")}
            </span>
            <div className="h-px w-12 bg-white/30" />
            <span className="font-serif text-white text-2xl italic">
              {t("collectionCards.inTheWorks")}
            </span>
          </div>
        </div>
      ) : (
        <Link
          href={href}
          className="relative mb-8 block aspect-[16/10] cursor-pointer overflow-hidden rounded-[2rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <img
            src={category.image}
            alt=""
            className={`h-full w-full object-cover transition-transform ${prefersReducedMotion ? "duration-100" : "duration-[1.5s]"} group-hover:scale-110`}
          />
          <div className={`absolute inset-0 bg-black/5 transition-colors ${prefersReducedMotion ? "duration-100" : "duration-500"} group-hover:bg-black/20`} />
          <span className="sr-only">
            {category.title} — {mainCollection?.cta || "Shop Now"}
          </span>
        </Link>
      )}

      <div className="px-4">
        <h3
          className={`font-serif text-4xl mb-4 ${category.comingSoon ? "text-foreground/40" : "text-foreground"}`}
        >
          {category.title}
        </h3>
        <p className="text-foreground/60 font-light mb-8 max-w-sm leading-relaxed">
          {category.description}
        </p>
        {category.comingSoon ? (
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-foreground/30">
            {t("collectionCards.availableSoon")}
          </span>
        ) : (
          <Link href={href}>
            <button className="text-[10px] uppercase tracking-[0.3em] font-bold border-b border-primary/20 pb-1 hover:border-primary transition-all text-primary group-hover:text-foreground">
              {mainCollection?.cta || "Shop Now"} →
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
  const { t } = useTranslation("common");
  const categories = getVisibleCategories(t);
  const isSingle = categories.length === 1;

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-6 md:px-12">
        {/* Header row */}
        <div
          className={`flex items-center ${isSingle ? "justify-center mb-4" : "justify-between mb-6"}`}
        >
          <span
            className={`text-[10px] uppercase tracking-[0.4em] text-primary font-bold ${isSingle ? "text-center" : ""}`}
          >
            {t("collectionCards.badge")}
          </span>
          {!isSingle && (
            <Link href="/shop">
              <button className="text-[10px] uppercase tracking-[0.3em] font-bold border-b border-primary/20 pb-1 hover:border-primary transition-all text-primary">
                {t("collectionCards.shopAll")} →
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
                  {t("collectionCards.shopAll")} →
                </button>
              </Link>
            </div>
            <div className="flex justify-center">
              <div className="w-full md:w-7/12">
                <SingleCard category={categories[0]} idx={0} t={t} />
              </div>
            </div>
          </>
        ) : (
          <div
            className={`grid gap-10 ${getGridClass(categories.length)}`}
          >
            {categories.map((category, idx) => (
              <SingleCard
                key={category.title}
                category={category}
                idx={idx}
                t={t}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}