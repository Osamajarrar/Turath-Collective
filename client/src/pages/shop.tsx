import { useMemo, useEffect, useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { useTranslation } from "react-i18next";
import PageLayout from "@/components/PageLayout";
import { motion } from "framer-motion";
import { shopifyService, type ShopifyProduct } from "@/lib/shopify";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import img1 from "@/assets/burgundy-mug.png";
import img2 from "@/assets/burgundy-plate.png";
import img3 from "@/assets/burgundy-bowl.png";
import img4 from "@/assets/burgundy-mezze.png";
import classicBowl from "@/assets/classic-bowl.png";
import classicMezze from "@/assets/classic-mezze-plate.png";
import { getAvailableCategories } from "@/lib/collections";

// ── Variant interface ──────────────────────────────────────────────────────

interface ProductVariant {
  color: string;
  colorHex: string;
  image: string;
}

// ── Local mock data (fallback) ─────────────────────────────────────────────

export const MOCK_PRODUCTS = [
  {
    id: "1",
    name: "Indigo Mosaic Bowl",
    handle: "indigo-mosaic-bowl",
    category: "ceramics",
    price: 45,
    currencyCode: "CAD",
    image: img1,
    imageSecondary: classicMezze,
    isBestSeller: true,
    isNew: false,
    isLimited: false,
    dateAdded: "2024-01-15",
    variants: [
      { color: "Burgundy", colorHex: "#8B0000", image: img1 },
      { color: "Navy", colorHex: "#000080", image: classicBowl },
    ],
  },
  {
    id: "2",
    name: "Olive Tree Embroidery",
    handle: "olive-tree-embroidery",
    category: "embroidery",
    price: 120,
    currencyCode: "CAD",
    image: img2,
    imageSecondary: classicBowl,
    isBestSeller: false,
    isNew: true,
    isLimited: true,
    dateAdded: "2024-02-10",
    variants: [
      { color: "Burgundy", colorHex: "#8B0000", image: img2 },
      { color: "Green", colorHex: "#2D5016", image: classicBowl },
    ],
  },
  // {
  //   id: "3",
  //   name: "Hebron Glass Vase",
  //   handle: "hebron-glass-vase",
  //   category: "ceramics",
  //   price: 65,
  //   currencyCode: "CAD",
  //   image: img3,
  //   imageSecondary: img4,
  //   isBestSeller: false,
  //   isNew: false,
  //   isLimited: true,
  //   dateAdded: "2023-12-20",
  //   variants: [
  //     { color: "Burgundy", colorHex: "#8B0000", image: img3 },
  //     { color: "Cream", colorHex: "#F5F3F0", image: img4 },
  //     { color: "Sage", colorHex: "#9A8B7A", image: classicMezze },
  //   ],
  // },
  // {
  //   id: "4",
  //   name: "Tatreez Pattern Cushion",
  //   handle: "tatreez-pattern-cushion",
  //   category: "embroidery",
  //   price: 85,
  //   currencyCode: "CAD",
  //   image: img4,
  //   imageSecondary: img1,
  //   isBestSeller: true,
  //   isNew: false,
  //   isLimited: false,
  //   dateAdded: "2024-01-01",
  //   variants: [
  //     { color: "Red", colorHex: "#DC143C", image: img4 },
  //     { color: "Blue", colorHex: "#4169E1", image: img1 },
  //   ],
  // },
];

export const ALL_PRODUCTS = MOCK_PRODUCTS;

// ── Normalise a Shopify product into a display-friendly shape ──────────────

interface DisplayProduct {
  id: string;
  name: string;
  handle: string;
  category: string;
  price: number;
  currencyCode: string;
  image: string;
  imageSecondary: string | null;
  isBestSeller: boolean;
  isNew: boolean;
  isLimited: boolean;
  dateAdded: string;
  variants?: ProductVariant[];
}

function normaliseShopify(p: ShopifyProduct): DisplayProduct {
  const sourceCategory = p.productType || p.tags?.[0] || "";
  const normalizedCategory = sourceCategory.trim().toLowerCase();

  const inferCategoryHandle = (value: string) => {
    if (!value) return "ceramics";
    if (
      value.includes("embroider") ||
      value.includes("tatreez") ||
      value.includes("textile") ||
      value.includes("linen")
    ) {
      return "embroidery";
    }
    if (
      value.includes("ceramic") ||
      value.includes("potter") ||
      value.includes("clay") ||
      value.includes("mug") ||
      value.includes("bowl") ||
      value.includes("plate")
    ) {
      return "ceramics";
    }
    return value.replace(/\s+/g, "-").replace(/&/g, "and");
  };

  return {
    id: p.id,
    name: p.title,
    handle: p.handle,
    category: inferCategoryHandle(normalizedCategory),
    price: parseInt(p.priceRange.minVariantPrice.amount),
    currencyCode: p.priceRange.minVariantPrice.currencyCode,
    image: p.images.edges[0]?.node.url ?? "",
    imageSecondary: p.images.edges[1]?.node.url ?? null,
    isBestSeller: p.tags?.includes("best-seller") ?? false,
    isNew: p.tags?.includes("new") ?? false,
    isLimited: p.tags?.includes("limited") ?? false,
    dateAdded: p.createdAt
      ? p.createdAt.split("T")[0]
      : new Date().toISOString().split("T")[0],
  };
}

// ── ProductCard Component with Variant Swatches ────────────────────────────

interface ProductCardProps {
  product: DisplayProduct;
  idx: number;
  prefersReducedMotion: boolean;
  t: any;
}

function ProductCard({ product, idx, prefersReducedMotion, t }: ProductCardProps) {
  const [, navigate] = useLocation();

  return (
    <Link href={`/product/${product.handle}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: prefersReducedMotion ? 0 : idx * 0.1, duration: prefersReducedMotion ? 0.1 : 0.6 }}
        className="group cursor-pointer"
        data-testid={`card-product-${product.id}`}
      >
        <div className="relative mb-6 aspect-square overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
            width={500}
            height={500}
            loading="lazy"
            decoding="async"
          />

          <div className="pointer-events-none absolute left-4 top-4 flex flex-row gap-2">
            {product.isBestSeller && (
              <div className="badge-product !hidden md:!block">
                {t("shop.badges.bestSeller")}
              </div>
            )}
            {product.isNew && (
              <div className="badge-product !hidden md:!block">
                {t("shop.badges.new")}
              </div>
            )}
            {product.isLimited && (
              <div className="badge-product !hidden md:!block">
                {t("shop.badges.limitedStock")}
              </div>
            )}
          </div>
        </div>

        <div className="mb-2 flex flex-col md:flex-row md:items-baseline md:justify-between gap-2 md:gap-4">
          <h3 className="font-sans font-normal text-base md:text-lg lg:text-xl leading-tight tracking-wide mb-0 w-full md:w-auto">{product.name}</h3>
          <p className="text-xs md:text-sm lg:text-base md:whitespace-nowrap">${Math.floor(product.price)}</p>
        </div>

        {/* Variant Swatches */}
        {product.variants && product.variants.length > 0 && (
          <div
            className="flex gap-2 mt-3 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {product.variants.map((variant, variantIdx) => (
              <button
                key={variantIdx}
                onClick={(e) => {
                  e.preventDefault?.();
                  e.stopPropagation();
                  navigate(`/product/${product.handle}?variant=${variantIdx}`);
                }}
                className="w-8 h-8 rounded-full border-2 border-border hover:border-foreground transition-all"
                style={{ backgroundColor: variant.colorHex }}
                title={variant.color}
                aria-label={`Select ${variant.color} variant`}
              />
            ))}
          </div>
        )}
      </motion.div>
    </Link>
  );
}

// ── Component ──────────────────────────────────────────────────────────────

export default function ShopPage() {
  const { t } = useTranslation("commerce");
  const [, navigate] = useLocation();
  const search = useSearch();
  const prefersReducedMotion = useReducedMotion();
  const [sortBy, setSortBy] = useState("newest");
  const [products, setProducts] = useState<DisplayProduct[]>(MOCK_PRODUCTS);

  const availableCategories = useMemo(() => getAvailableCategories(t), [t]);
  const availableCategoryHandles = useMemo(
    () => availableCategories.map((category) => category.handle),
    [availableCategories],
  );
  const shopCategories = useMemo(
    () => ["all", ...availableCategoryHandles],
    [availableCategoryHandles],
  );

  const isCategoryAvailable = (category: string) =>
    category === "all" || availableCategoryHandles.includes(category);

  // Single source of truth: availableCategories from collections.ts
  const isSingleCategory = availableCategories.length === 1;
  const showFilters = !isSingleCategory;

  // Determine effective category: if single category, always use it; else read from URL
  const getSelectedCategoryFromURL = () => {
    const params = new URLSearchParams(search);
    const cat = params.get("category") || "all";
    return isCategoryAvailable(cat) ? cat : "all";
  };

  const selectedCategory = getSelectedCategoryFromURL();

  // Filter products to only show those in available categories (by handle)
  const visibleProducts = products.filter((p) =>
    availableCategoryHandles.includes(p.category),
  );

  // Sync selectedCategory with URL whenever location changes (multi-category mode only)
  useEffect(() => {
    const params = new URLSearchParams(search); // ← same fix here
    const urlCategory = params.get("category") || "all";
    if (!isCategoryAvailable(urlCategory)) {
      navigate("/shop", { replace: true });
    }
  }, [search, navigate]);

  // Fetch live Shopify data (or use mock if VITE_USE_MOCK_PRODUCTS=true)
  useEffect(() => {
    // Skip API call if using mock products
    if (import.meta.env.VITE_USE_MOCK_PRODUCTS === "true") {
      return;
    }

    let cancelled = false;
    shopifyService.getProducts().then((result) => {
      if (cancelled || !result?.length) return;
      const fallbackCategory = availableCategoryHandles[0] || "ceramics";
      const normalizedProducts = result.map((item) => {
        const normalized = normaliseShopify(item);
        if (availableCategoryHandles.includes(normalized.category)) {
          return normalized;
        }
        return { ...normalized, category: fallbackCategory };
      });
      setProducts(normalizedProducts);
    });
    return () => {
      cancelled = true;
    };
  }, [availableCategoryHandles]);

  const filteredAndSortedProducts = useMemo(() => {
    let result =
      selectedCategory === "all"
        ? [...visibleProducts]
        : visibleProducts.filter((p) => p.category === selectedCategory);

    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "best-seller":
        result.sort(
          (a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0),
        );
        break;
      case "newest":
      default:
        result.sort(
          (a, b) =>
            new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime(),
        );
    }
    return result;
  }, [selectedCategory, sortBy, visibleProducts]);

  const productHref = (p: DisplayProduct) => `/product/${p.handle}`;

  const categoryLabel = (cat: string) => {
    if (cat === "all") return "All";
    const found = availableCategories.find((c) => c.handle === cat);
    return found ? found.title : cat.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <PageLayout>
      <div>
        <header className="mb-16">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <h1 className="mb-6 font-serif text-5xl capitalize md:text-6xl">
                {selectedCategory === "all"
                  ? t("shop.title")
                  : categoryLabel(selectedCategory)}
              </h1>
              <p className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase mb-8 font-medium">
                {t("shop.pricesCurrency")}
              </p>
              {showFilters && (
                <div className="flex flex-wrap gap-4">
                  {shopCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        navigate(`/shop?category=${cat}`);
                      }}
                      className={cn(
                        "border px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all",
                        selectedCategory === cat
                          ? "border-primary bg-primary text-white"
                          : "border-border hover:border-primary",
                      )}
                    >
                      {categoryLabel(cat)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                {t("shop.sortBy")}
              </span>
              <select
                data-testid="select-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="cursor-pointer border-b border-border bg-transparent py-2 text-[10px] font-bold uppercase tracking-widest focus:border-primary focus:outline-none"
              >
                <option value="newest">{t("shop.sortOptions.newest")}</option>
                <option value="price-low">{t("shop.sortOptions.priceLow")}</option>
                <option value="price-high">{t("shop.sortOptions.priceHigh")}</option>
                <option value="best-seller">{t("shop.sortOptions.bestSeller")}</option>
              </select>
            </div>
          </div>
        </header>

        <div
          className="grid gap-5 md:gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredAndSortedProducts.map((product, idx) => (
            <ProductCard key={product.id} product={product} idx={idx} prefersReducedMotion={prefersReducedMotion} t={t} />
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
