import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { shopifyService } from "@/lib/shopify";
import { USE_MOCK_PRODUCTS } from "@/lib/flags";
import {
  MOCK_PRODUCTS,
  normaliseShopify,
  ProductCard,
  SkeletonProductCard,
  type DisplayProduct,
} from "@/pages/shop";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

// The catalog currently has a single real product; this section is built to
// render one product today and scale as more are added (no fixed count).
const MAX_FEATURED = 4;

function pickFeatured(products: DisplayProduct[]): DisplayProduct[] {
  return [...products]
    .sort(
      (a, b) =>
        (b.availableForSale ? 1 : 0) - (a.availableForSale ? 1 : 0) ||
        (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0) ||
        new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime(),
    )
    .slice(0, MAX_FEATURED);
}

export default function FeaturedProducts() {
  const { t } = useTranslation("common");
  const { t: tCommerce } = useTranslation("commerce");
  const prefersReducedMotion = useReducedMotion();
  const useMock = USE_MOCK_PRODUCTS;
  const [isLoading, setIsLoading] = useState(!useMock);
  const [products, setProducts] = useState<DisplayProduct[]>(
    useMock ? MOCK_PRODUCTS : [],
  );

  useEffect(() => {
    if (useMock) return;
    let cancelled = false;
    shopifyService
      .getProducts()
      .then((result) => {
        if (cancelled) return;
        if (result?.length) setProducts(result.map(normaliseShopify));
        setIsLoading(false);
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [useMock]);

  const featured = useMemo(() => pickFeatured(products), [products]);

  // Nothing to feature (e.g. Shopify unreachable): render no section at all.
  if (!isLoading && featured.length === 0) return null;

  const gridClass =
    featured.length === 1
      ? "grid grid-cols-1 justify-items-center"
      : featured.length === 2
        ? "mx-auto grid max-w-3xl grid-cols-1 gap-10 sm:grid-cols-2"
        : "grid grid-cols-2 gap-5 md:gap-6 lg:grid-cols-4";

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-6 md:px-12 max-w-[1820px]">
        <div className="flex items-center justify-between mb-10">
          <span className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold">
            {t("featuredProducts.badge")}
          </span>
          <Link href="/shop">
            <button className="text-[10px] uppercase tracking-[0.3em] font-bold border-b border-primary/20 pb-1 hover:border-primary transition-all text-primary">
              {t("collectionCards.shopAll")} →
            </button>
          </Link>
        </div>

        <div className={gridClass}>
          {isLoading
            ? Array.from({ length: 4 }).map((_, idx) => (
                <SkeletonProductCard
                  key={idx}
                  idx={idx}
                  prefersReducedMotion={prefersReducedMotion}
                />
              ))
            : featured.map((product, idx) => (
                <div
                  key={product.id}
                  className={featured.length === 1 ? "w-full max-w-sm" : undefined}
                >
                  <ProductCard
                    product={product}
                    idx={idx}
                    prefersReducedMotion={prefersReducedMotion}
                    t={tCommerce}
                  />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
