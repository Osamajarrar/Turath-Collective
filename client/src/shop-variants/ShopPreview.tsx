import { useMemo, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import PageLayout from "@/components/PageLayout";
import { MOCK_PRODUCTS, type DisplayProduct } from "@/pages/shop";
import { sortProducts, getSalesRanking } from "@/lib/product-sort";
import { getAvailableCategories } from "@/lib/collections";
import { cn } from "@/lib/utils";
import { type FilterStrategy, resolveGroups } from "./strategies";

/**
 * One shop layout, parameterised by grouping strategy.
 *
 * Deliberately uses the SAME mock catalogue and the SAME sort function as the
 * real shop, so what differs between variants is only the thing being
 * compared: the filter bar. It is not a copy of shop.tsx — reproducing that
 * page would mean maintaining two of it, and the question here is about
 * grouping, not about the product card.
 *
 * Preview chrome is intentionally untranslated (see design-variants/README.md
 * for the same decision): adding preview-only keys to the production locale
 * namespaces would put strings in front of translators no visitor will read.
 */
export default function ShopPreview({ strategy }: { strategy: FilterStrategy }) {
  // Respect the real catalogue rules: a hidden craft must not appear here
  // either, or the preview would be judging a shop we do not have.
  const availableHandles = useMemo(
    () => getAvailableCategories(((k: string) => k) as (k: string) => string).map((c) => c.handle),
    [],
  );

  const products = useMemo(
    () => (MOCK_PRODUCTS as DisplayProduct[]).filter((p) => availableHandles.includes(p.category)),
    [availableHandles],
  );

  const groups = useMemo(() => resolveGroups(strategy, products), [strategy, products]);
  const [active, setActive] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const shown = useMemo(() => {
    const group = groups.find((g) => g.key === active);
    const filtered = group ? products.filter(group.test) : products;
    return sortProducts(filtered, sortBy, getSalesRanking());
  }, [groups, active, products, sortBy]);

  return (
    <PageLayout>
      <div className="container mx-auto px-6 md:px-12">
        {/* ── Landing page, same taxonomy ──────────────────────────────────
            The grouping is site-wide, not a shop-page filter: the homepage
            collection cards, the navbar menu, the about page and the care page
            all read it too. Showing only the shop would hide half the
            consequence of the choice. */}
        <section className="mb-20 border-b border-border pb-16">
          <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
            On the landing page
          </p>

          {groups.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2">
              {groups.map((group) => {
                const first = products.find(group.test);
                const count = products.filter(group.test).length;
                return (
                  <div key={group.key} className="group">
                    <div className="mb-5 aspect-[16/10] overflow-hidden rounded-[2rem] bg-muted/30">
                      {first && (
                        <img
                          src={first.image}
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                      )}
                    </div>
                    <h2 className="mb-2 font-serif text-3xl text-foreground">{group.label}</h2>
                    <p className="text-sm font-light text-muted-foreground">
                      {count} {count === 1 ? "piece" : "pieces"}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div>
              <p className="mb-6 font-light leading-relaxed text-muted-foreground">
                No collection cards. The homepage shows featured pieces directly — hero
                straight to product, with no category step in between.
              </p>
              <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
                {products.slice(0, 4).map((product) => (
                  <div key={product.id}>
                    <div className="mb-3 aspect-square overflow-hidden bg-muted/30">
                      <img
                        src={product.image}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <p className="font-serif text-sm text-foreground">{product.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
          On the shop page
        </p>

        <header className="mb-12">
          <h1 className="mb-6 font-serif text-5xl md:text-6xl">Shop</h1>

          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              {groups.length > 0 ? (
                <div className="flex flex-wrap gap-4">
                  {[{ key: "all", label: "All" }, ...groups].map((group) => (
                    <button
                      key={group.key}
                      onClick={() => setActive(group.key)}
                      className={cn(
                        "border px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all",
                        active === group.key
                          ? "border-primary bg-primary text-white"
                          : "border-border hover:border-primary",
                      )}
                    >
                      {group.label}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  {shown.length} {shown.length === 1 ? "piece" : "pieces"}
                </p>
              )}
            </div>

            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                Sort by
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="cursor-pointer border-b border-border bg-transparent py-2 text-[10px] font-bold uppercase tracking-widest focus:border-primary focus:outline-none"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </header>

        {shown.length > 0 ? (
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {shown.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.04 }}
              >
                <Link href={`/product/${product.handle}`} className="group block" data-testid="preview-product">
                  <div className="mb-4 aspect-square overflow-hidden bg-muted/30">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <h2 className="font-serif text-lg text-foreground">{product.name}</h2>
                  <p className="text-sm font-light text-muted-foreground">
                    ${product.price.toFixed(2)} {product.currencyCode}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="py-16 text-center font-light text-muted-foreground">
            Nothing in this group.
          </p>
        )}
      </div>
    </PageLayout>
  );
}
