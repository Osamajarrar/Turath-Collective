import { useState, useMemo, useEffect } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { useTranslation } from "react-i18next";
import PageLayout from "@/components/PageLayout";
import { motion } from "framer-motion";
import { shopifyService, type ShopifyProduct } from "@/lib/shopify";
import { cn } from "@/lib/utils";
import img1 from "@/assets/burgundy-mug.png";
import img2 from "@/assets/burgundy-plate.png";
import img3 from "@/assets/burgundy-bowl.png";
import img4 from "@/assets/burgundy-mezze.png";
import classicBowl from "@/assets/classic-bowl.png";
import classicMezze from "@/assets/classic-mezze-plate.png";
import { getAvailableCategories } from "@/lib/collections";

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
  },
  {
    id: "3",
    name: "Hebron Glass Vase",
    handle: "hebron-glass-vase",
    category: "ceramics",
    price: 65,
    currencyCode: "CAD",
    image: img3,
    imageSecondary: img4,
    isBestSeller: false,
    isNew: false,
    isLimited: true,
    dateAdded: "2023-12-20",
  },
  {
    id: "4",
    name: "Tatreez Pattern Cushion",
    handle: "tatreez-pattern-cushion",
    category: "embroidery",
    price: 85,
    currencyCode: "CAD",
    image: img4,
    imageSecondary: img1,
    isBestSeller: true,
    isNew: false,
    isLimited: false,
    dateAdded: "2024-01-01",
  },
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
    price: parseFloat(p.priceRange.minVariantPrice.amount),
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

// ── Component ──────────────────────────────────────────────────────────────

export default function ShopPage() {
  const { t } = useTranslation("common");
  const [, navigate] = useLocation();
  const search = useSearch();
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

  // Fetch live Shopify data
  useEffect(() => {
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
      <div className="container mx-auto px-6 py-12 md:px-12">
        <header className="mb-16">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <h1 className="mb-6 font-serif text-5xl capitalize md:text-6xl">
                {selectedCategory === "all"
                  ? "The Collection"
                  : categoryLabel(selectedCategory)}
              </h1>
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
                Sort By
              </span>
              <select
                data-testid="select-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="cursor-pointer border-b border-border bg-transparent py-2 text-[10px] font-bold uppercase tracking-widest focus:border-primary focus:outline-none"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="best-seller">Best Seller</option>
              </select>
            </div>
          </div>
        </header>

        <div
          className={`grid gap-12 ${visibleProducts.length > 1 ? "grid-cols-2 md:grid-cols-2 lg:grid-cols-3" : "justify-center"}`}
        >
          {filteredAndSortedProducts.map((product, idx) => (
            <Link href={productHref(product)} key={product.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group cursor-pointer"
                data-testid={`card-product-${product.id}`}
              >
                <div className="relative mb-6 aspect-[4/5] overflow-hidden bg-muted">
                  {product.imageSecondary ? (
                    <div className="absolute inset-0">
                      <img
                        src={product.image}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover opacity-100 transition-opacity duration-700 ease-in-out group-hover:opacity-0"
                      />
                      <img
                        src={product.imageSecondary}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 ease-in-out group-hover:opacity-100"
                      />
                    </div>
                  ) : (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  )}

                  <div className="pointer-events-none absolute left-4 top-4 flex flex-col gap-2">
                    {product.isBestSeller && (
                      <span className="bg-primary px-3 py-1 text-[8px] font-bold uppercase tracking-widest text-white">
                        Best Seller
                      </span>
                    )}
                    {product.isNew && (
                      <span className="bg-black px-3 py-1 text-[8px] font-bold uppercase tracking-widest text-white">
                        New
                      </span>
                    )}
                    {product.isLimited && (
                      <span className="bg-secondary px-3 py-1 text-[8px] font-bold uppercase tracking-widest text-secondary-foreground">
                        Limited Stock
                      </span>
                    )}
                  </div>
                </div>
                <h3 className="mb-2 font-serif text-lg">{product.name}</h3>
                {/* <p className="mb-4 text-[xx-small] uppercase tracking-widest text-muted-foreground">
                  {product.category}
                </p> */}
                <p className="text-sm">
                  ${product.price.toFixed(2)}
                </p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
