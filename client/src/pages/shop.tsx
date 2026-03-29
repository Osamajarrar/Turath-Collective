import { useState, useMemo, useEffect } from "react";
import { Link } from "wouter";
import Navbar from "@/components/navbar";
import { motion } from "framer-motion";
import { shopifyService, type ShopifyProduct } from "@/lib/shopify";
import img1 from "@/assets/burgundy-mug.png";
import img2 from "@/assets/burgundy-plate.png";
import img3 from "@/assets/burgundy-bowl.png";
import img4 from "@/assets/burgundy-mezze.png";
import classicBowl from "@/assets/classic-bowl.png";
import classicMezze from "@/assets/classic-mezze-plate.png";

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

// Expose the original ALL_PRODUCTS name for any existing imports
export const ALL_PRODUCTS = MOCK_PRODUCTS;

// Static category list used in mock mode
const MOCK_CATEGORIES = ["all", "ceramics", "embroidery"];

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
  return {
    id: p.id,
    name: p.title,
    handle: p.handle,
    category: p.productType?.toLowerCase() || p.tags?.[0]?.toLowerCase() || "ceramics",
    price: parseFloat(p.priceRange.minVariantPrice.amount),
    currencyCode: p.priceRange.minVariantPrice.currencyCode,
    image: p.images.edges[0]?.node.url ?? "",
    imageSecondary: p.images.edges[1]?.node.url ?? null,
    isBestSeller: p.tags?.includes("best-seller") ?? false,
    isNew: p.tags?.includes("new") ?? false,
    isLimited: p.tags?.includes("limited") ?? false,
    dateAdded: p.createdAt ? p.createdAt.split("T")[0] : new Date().toISOString().split("T")[0],
  };
}

// ── Component ──────────────────────────────────────────────────────────────

export default function ShopPage() {
  const searchParams = new URLSearchParams(window.location.search);
  const initialCategory = searchParams.get("category") || "all";

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState("newest");
  const [products, setProducts] = useState<DisplayProduct[]>(MOCK_PRODUCTS);
  const [categories, setCategories] = useState<string[]>(MOCK_CATEGORIES);

  useEffect(() => {
    let cancelled = false;

    shopifyService.getProducts().then((result) => {
      if (cancelled || !result || result.length === 0) return;
      setProducts(result.map(normaliseShopify));
    });

    shopifyService.getCollections().then((cols) => {
      if (cancelled || !cols || cols.length === 0) return;
      const liveCategories = ["all", ...cols.map((c) => c.handle.toLowerCase())];
      setCategories(liveCategories);
    });

    return () => { cancelled = true; };
  }, []);

  const filteredAndSortedProducts = useMemo(() => {
    let result =
      selectedCategory === "all"
        ? [...products]
        : products.filter((p) => p.category === selectedCategory);

    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "best-seller":
        result.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
        break;
      case "newest":
      default:
        result.sort(
          (a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
        );
        break;
    }
    return result;
  }, [selectedCategory, sortBy, products]);

  const productHref = (p: DisplayProduct) =>
    p.handle ? `/product/${p.handle}` : `/product/${p.id}`;

  const categoryLabel = (cat: string) =>
    cat === "all" ? "All" : cat.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <main className="min-h-screen bg-background pt-36">
      <Navbar />

      <div className="container mx-auto px-6 py-12 md:px-12">
        <header className="mb-16">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <h1 className="mb-6 font-serif text-5xl capitalize md:text-6xl">
                {selectedCategory === "all" ? "The Collection" : categoryLabel(selectedCategory)}
              </h1>
              <div className="flex flex-wrap gap-4">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    data-testid={`filter-${cat}`}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "border px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all",
                      selectedCategory === cat
                        ? "border-primary bg-primary text-white"
                        : "border-border hover:border-primary"
                    )}
                  >
                    {categoryLabel(cat)}
                  </button>
                ))}
              </div>
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

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
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
                <h3 className="mb-2 font-serif text-xl">{product.name}</h3>
                <p className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">
                  {product.category}
                </p>
                <p className="font-bold">
                  {product.currencyCode} ${product.price.toFixed(2)}
                </p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

function cn(...classes: unknown[]) {
  return (classes.filter(Boolean) as string[]).join(" ");
}
