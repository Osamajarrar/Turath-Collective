import { useState, useMemo, useEffect } from "react";
import { Link } from "wouter";
import Navbar from "@/components/navbar";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { shopifyService, type ShopifyProduct } from "@/lib/shopify";
import img1 from "@/assets/burgundy-mug.png";
import img2 from "@/assets/burgundy-plate.png";
import img3 from "@/assets/burgundy-bowl.png";
import img4 from "@/assets/burgundy-mezze.png";

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
    rating: 4.8,
    reviews: 24,
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
    rating: 5.0,
    reviews: 12,
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
    rating: 4.5,
    reviews: 8,
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
    rating: 4.9,
    reviews: 45,
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
  rating: number;
  reviews: number;
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
    rating: 5.0,
    reviews: 0,
    isBestSeller: p.tags?.includes("best-seller") ?? false,
    isNew: p.tags?.includes("new") ?? false,
    isLimited: p.tags?.includes("limited") ?? false,
    // Use real Shopify createdAt for accurate "newest" sorting
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

  // Attempt to load live Shopify data; fall back silently to mock data
  useEffect(() => {
    let cancelled = false;

    // Load products
    shopifyService.getProducts().then((result) => {
      if (cancelled || !result || result.length === 0) return;
      setProducts(result.map(normaliseShopify));
    });

    // Load collections for filter categories
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
      case "highest-rated":
        result.sort((a, b) => b.rating - a.rating);
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

  // Build the href: /product/<handle> for Shopify, /product/<id> for mock
  const productHref = (p: DisplayProduct) =>
    p.handle ? `/product/${p.handle}` : `/product/${p.id}`;

  // Derive display label for a category (handle → title-case)
  const categoryLabel = (cat: string) =>
    cat === "all" ? "All" : cat.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <main className="min-h-screen bg-background pt-32">
      <Navbar />

      <div className="container mx-auto px-6 md:px-12 py-12">
        <header className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <h1 className="font-serif text-5xl md:text-6xl mb-6 capitalize">
                {selectedCategory === "all" ? "The Collection" : categoryLabel(selectedCategory)}
              </h1>
              <div className="flex flex-wrap gap-4">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    data-testid={`filter-${cat}`}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "px-6 py-2 text-[10px] uppercase tracking-widest font-bold border transition-all",
                      selectedCategory === cat
                        ? "bg-primary text-white border-primary"
                        : "border-border hover:border-primary"
                    )}
                  >
                    {categoryLabel(cat)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                Sort By
              </span>
              <select
                data-testid="select-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-b border-border py-2 text-[10px] uppercase tracking-widest font-bold focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="best-seller">Best Seller</option>
                <option value="highest-rated">Highest Rated</option>
              </select>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {filteredAndSortedProducts.map((product, idx) => (
            <Link href={productHref(product)} key={product.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group cursor-pointer"
                data-testid={`card-product-${product.id}`}
              >
                <div className="aspect-[4/5] overflow-hidden bg-muted mb-6 relative">
                  <img
                    src={product.image}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    alt={product.name}
                  />

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.isBestSeller && (
                      <span className="bg-primary text-white text-[8px] uppercase tracking-widest font-bold px-3 py-1">
                        Best Seller
                      </span>
                    )}
                    {product.isNew && (
                      <span className="bg-black text-white text-[8px] uppercase tracking-widest font-bold px-3 py-1">
                        New
                      </span>
                    )}
                    {product.isLimited && (
                      <span className="bg-secondary text-secondary-foreground text-[8px] uppercase tracking-widest font-bold px-3 py-1">
                        Limited Stock
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-serif text-xl">{product.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-primary text-primary" />
                    <span className="text-[10px] font-bold">{product.rating}</span>
                  </div>
                </div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
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
