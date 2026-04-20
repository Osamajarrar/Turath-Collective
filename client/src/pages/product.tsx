import { useState, useMemo, useEffect, useRef } from "react";
import { useRoute } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Plus, Minus, Brush, Droplets, Package, Heart } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import SuggestedProductCard from "@/components/suggested-product-card";
import ResponsiveImage from "@/components/ui/responsive-image";
import ProductImageCarousel from "@/components/product-image-carousel";
import QuantityCounter from "@/components/QuantityCounter";
import QuantitySetSelector from "@/components/QuantitySetSelector";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { shopifyService, type ShopifyProduct } from "@/lib/shopify";
import { useCart } from "@/context/cart-context";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

// Mock assets
import burgundyBowl from "@/assets/bburgundy-bowl.png";
import burgundyMezze from "@/assets/burgundy-mezze.png";
import classicBowl from "@/assets/classic-bowl.png";
import classicMezze from "@/assets/classic-mezze-plate.png";

// ── Local mock data (fallback) ─────────────────────────────────────────────

// Build 8-image arrays by cycling through available mock assets so we can
// preview the hero + 2x2 grid + overflow row in the unified product layout.
const eightImages = (a: string, b: string) => [a, b, a, b, a, b, a, b];

const MOCK_PRODUCTS = [
  {
    id: "1",
    handle: "indigo-mosaic-bowl",
    name: "Indigo Mosaic Bowl",
    price: 45.0,
    currencyCode: "CAD",
    isBestSeller: true,
    availableForSale: true,
    variations: [
      { color: "Indigo", variantId: "mock-variant-1-indigo", images: eightImages(classicBowl, classicMezze), price: 45.0 },
      { color: "Burgundy", variantId: "mock-variant-1-burgundy", images: eightImages(burgundyBowl, burgundyMezze), price: 48.0 },
    ],
    description:
      "A hand-painted indigo bowl inspired by traditional Palestinian motifs. Each stroke is a tribute to the craftsmen of Hebron.",
    specs: {
      material: "Hebron Clay",
      size: "18cm Diameter",
      weight: "450g",
      origin: "Hebron, Palestine",
    },
    quantityStyle: "counter" as const,
    maxSets: 3,
  },
  {
    id: "2",
    handle: "burgundy-mezze-plate",
    name: "Burgundy Mezze Plate",
    price: 38.0,
    currencyCode: "CAD",
    isBestSeller: false,
    availableForSale: true,
    variations: [
      { color: "Burgundy", variantId: "mock-variant-2-burgundy", images: [burgundyMezze, burgundyBowl], price: 38.0 },
    ],
    description: "Hand-painted mezze plate in deep burgundy, perfect for sharing.",
    specs: { material: "Hebron Clay", size: "22cm Diameter", weight: "650g", origin: "Hebron, Palestine" },
    quantityStyle: "counter" as const,
    maxSets: 3,
  },
  {
    id: "3",
    handle: "classic-mezze-plate",
    name: "Classic Mezze Plate",
    price: 38.0,
    currencyCode: "CAD",
    isBestSeller: true,
    availableForSale: true,
    variations: [
      { color: "Indigo", variantId: "mock-variant-3-indigo", images: [classicMezze, classicBowl], price: 38.0 },
    ],
    description: "Classic indigo mezze plate, hand-painted with traditional motifs.",
    specs: { material: "Hebron Clay", size: "22cm Diameter", weight: "650g", origin: "Hebron, Palestine" },
    quantityStyle: "counter" as const,
    maxSets: 3,
  },
  {
    id: "4",
    handle: "burgundy-bowl",
    name: "Burgundy Bowl",
    price: 45.0,
    currencyCode: "CAD",
    isBestSeller: false,
    availableForSale: true,
    variations: [
      { color: "Burgundy", variantId: "mock-variant-4-burgundy", images: [burgundyBowl, burgundyMezze], price: 45.0 },
    ],
    description: "Rich burgundy hand-painted bowl, an heirloom in the making.",
    specs: { material: "Hebron Clay", size: "18cm Diameter", weight: "450g", origin: "Hebron, Palestine" },
    quantityStyle: "counter" as const,
    maxSets: 3,
  },
  {
    id: "5",
    handle: "classic-bowl",
    name: "Classic Indigo Bowl",
    price: 45.0,
    currencyCode: "CAD",
    isBestSeller: false,
    availableForSale: true,
    variations: [
      { color: "Indigo", variantId: "mock-variant-5-indigo", images: [classicBowl, classicMezze], price: 45.0 },
    ],
    description: "A timeless indigo bowl in our signature mosaic pattern.",
    specs: { material: "Hebron Clay", size: "18cm Diameter", weight: "450g", origin: "Hebron, Palestine" },
    quantityStyle: "counter" as const,
    maxSets: 3,
  },
];

// Compact product features displayed above the accordion (icon + tiny label).
const PRODUCT_FEATURES = [
  { icon: Brush, label: "Hand Painted" },
  { icon: Droplets, label: "Dishwasher Safe" },
  { icon: Package, label: "Gift Ready" },
  { icon: Heart, label: "Crafted in Hebron" },
];

// ── Normalise a Shopify product for this page ─────────────────────────────

interface Variation {
  color: string;
  variantId: string;
  images: string[];
  price: number;
}

interface DisplayProduct {
  id: string;
  handle: string;
  name: string;
  price: number;
  currencyCode: string;
  isBestSeller: boolean;
  availableForSale: boolean;
  variations: Variation[];
  description: string;
  specs: Record<string, string>;
  quantityStyle?: "counter" | "sets";
  maxSets?: number;
}

function normaliseShopify(p: ShopifyProduct): DisplayProduct {
  const variations: Variation[] = p.variants.edges.map((e) => ({
    color: e.node.selectedOptions.find((o) => o.name.toLowerCase() === "color")?.value ?? e.node.title,
    variantId: e.node.id,
    images: p.images.edges.map((img) => img.node.url),
    price: parseFloat(e.node.price.amount),
  }));

  if (variations.length === 0) {
    variations.push({
      color: "Default",
      variantId: "",
      images: p.images.edges.map((img) => img.node.url),
      price: parseFloat(p.priceRange.minVariantPrice.amount),
    });
  }

  let quantityStyle = p.quantityStyle ?? "counter";
  let maxSets = p.maxSets ?? 3;
  const specs: Record<string, string> = {};

  if (p.metafields && Array.isArray(p.metafields)) {
    const metafieldsMap = Object.fromEntries(
      p.metafields.filter((mf: any) => mf != null).map((mf: any) => [mf.key, mf.value])
    );

    // Extract specs from metafields
    if (metafieldsMap.material) specs.material = metafieldsMap.material;
    if (metafieldsMap.size) specs.size = metafieldsMap.size;
    if (metafieldsMap.weight) specs.weight = metafieldsMap.weight;
    if (metafieldsMap.origin) specs.origin = metafieldsMap.origin;

    if (metafieldsMap.quantity_style && ["counter", "sets"].includes(metafieldsMap.quantity_style)) {
      quantityStyle = metafieldsMap.quantity_style;
    }
    if (metafieldsMap.max_sets) {
      maxSets = Math.max(1, parseInt(metafieldsMap.max_sets, 10) || 3);
    }
  }

  return {
    id: p.id,
    handle: p.handle,
    name: p.title,
    price: parseFloat(p.priceRange.minVariantPrice.amount),
    currencyCode: p.priceRange.minVariantPrice.currencyCode,
    isBestSeller: p.tags?.includes("best-seller") ?? false,
    availableForSale: p.availableForSale,
    variations,
    description: p.description,
    specs,
    quantityStyle: quantityStyle as "counter" | "sets",
    maxSets,
  };
}

// ── Refined Accordion ─────────────────────────────────────────────────────

const Accordion = ({
  title,
  children,
  defaultOpen = false,
  duration = 0.3,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  duration?: number;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border/60">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex justify-between items-center group"
        data-testid={`accordion-${title.toLowerCase().replace(/\s+/g, "-")}`}
      >
        <span className="font-sans text-base text-foreground group-hover:text-primary transition-colors">
          {title}
        </span>
        <span className="text-foreground/40 group-hover:text-primary transition-colors">
          {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration }}
            className="overflow-hidden"
          >
            <div className="pb-6 pr-4 text-sm text-foreground/70 font-light leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Skeleton Product Details Component ─────────────────────────────────────

function SkeletonProductDetails() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full space-y-6"
    >
      {/* Title & Price */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-1/3" />
      </div>

      <div className="border-b border-border my-6" />

      {/* Color Variations */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-3">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-10 w-10 rounded-full" />
          ))}
        </div>
      </div>

      <div className="border-b border-border my-6" />

      {/* Quantity & CTA */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Product Features */}
      <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-4 w-20" />
        ))}
      </div>

      {/* Accordion placeholders */}
      <div className="mt-8 border-t border-border/60 space-y-4 pt-4">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </motion.div>
  );
}

// ── Skeleton Carousel Component ────────────────────────────────────────────

function SkeletonCarousel() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="lg:hidden"
    >
      <Skeleton className="w-full aspect-square rounded-lg shadow-md" />
      {/* Dots placeholder */}
      <div className="flex gap-2 justify-center mt-4 pb-4">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-1 w-6 rounded-full" />
        ))}
      </div>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function ProductPage() {
  const [, params] = useRoute("/product/:id");
  const { addItem, isBusy } = useCart();
  const prefersReducedMotion = useReducedMotion();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariationIdx, setSelectedVariationIdx] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [liveProduct, setLiveProduct] = useState<DisplayProduct | null>(null);
  const [suggestedProducts, setSuggestedProducts] = useState<DisplayProduct[]>([]);
  const [isLoading, setIsLoading] = useState(() => import.meta.env.VITE_USE_MOCK_PRODUCTS !== "true");

  const sectionDuration = prefersReducedMotion ? 0.1 : 0.6;
  const accordionDuration = prefersReducedMotion ? 0.05 : 0.3;

  const addToCartBtnRef = useRef<HTMLButtonElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const btn = addToCartBtnRef.current;
    if (!btn) return;

    let lastScrollY = window.scrollY;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const currentScrollY = window.scrollY;
        const scrollingDown = currentScrollY > lastScrollY;
        lastScrollY = currentScrollY;

        if (!entry.isIntersecting && scrollingDown) {
          setShowStickyBar(true);
        } else if (entry.isIntersecting) {
          setShowStickyBar(false);
        }
      },
  { threshold: 0, rootMargin: "-40px 0px 0px 0px" }
    );

    observer.observe(btn);
    return () => observer.disconnect();
  }, [liveProduct, isLoading]);

  useEffect(() => {
    const handle = params?.id;
    if (!handle) return;
    let cancelled = false;

    if (import.meta.env.VITE_USE_MOCK_PRODUCTS === "true") {
      const mockProduct = MOCK_PRODUCTS.find((p) => p.handle === handle);
      if (mockProduct) setLiveProduct(mockProduct);
      const suggested = MOCK_PRODUCTS
        .filter((p) => p.handle !== handle)
        .sort(() => Math.random() - 0.5)
        .slice(0, 8);
      setSuggestedProducts(suggested);
      return;
    }

    setIsLoading(true);
    shopifyService.getProduct(handle).then((result) => {
      if (cancelled) return;
      console.log("[Product] Single product fetched:", result?.handle || "not found");
      if (result) setLiveProduct(normaliseShopify(result));
      setIsLoading(false);
    }).catch((err) => {
      console.error("[Product] Error fetching single product:", err);
      if (cancelled) return;
      setIsLoading(false);
    });

    shopifyService.getProducts().then((products) => {
      if (cancelled) return;
      console.log("[Product] Shopify products fetched:", products?.length || 0);
      if (!products || products.length === 0) {
        console.log("[Product] No Shopify products");
        // Only fallback to mocks if explicitly enabled
        if (import.meta.env.VITE_USE_MOCK_PRODUCTS === "true") {
          console.log("[Product] Using mock fallback");
          const normalized = MOCK_PRODUCTS
            .filter((p) => p.handle !== handle)
            .sort(() => Math.random() - 0.5)
            .slice(0, 8);
          setSuggestedProducts(normalized);
        }
        return;
      }
      const normalized = products
        .filter((p) => p.handle !== handle)
        .map((p) => normaliseShopify(p))
        .sort(() => Math.random() - 0.5)
        .slice(0, 8);
      console.log("[Product] Suggested products (Shopify):", normalized.length);
      // If no suggested products after filtering, only use mocks if explicitly enabled
      if (normalized.length === 0) {
        console.log("[Product] No suggested products after filtering");
        if (import.meta.env.VITE_USE_MOCK_PRODUCTS === "true") {
          console.log("[Product] Using mock fallback");
          const mockFallback = MOCK_PRODUCTS
            .filter((p) => p.handle !== handle)
            .sort(() => Math.random() - 0.5)
            .slice(0, 8);
          setSuggestedProducts(mockFallback);
        }
      } else {
        setSuggestedProducts(normalized);
      }
    }).catch((err) => {
      console.error("[Product] Error fetching Shopify products:", err);
      if (cancelled) return;
      // Only fallback to mocks if explicitly enabled
      if (import.meta.env.VITE_USE_MOCK_PRODUCTS === "true") {
        const normalized = MOCK_PRODUCTS
          .filter((p) => p.handle !== handle)
          .sort(() => Math.random() - 0.5)
          .slice(0, 8);
        setSuggestedProducts(normalized);
      }
    });

    return () => { cancelled = true; };
  }, [params?.id]);

  const product: DisplayProduct = useMemo(() => {
    if (liveProduct) return liveProduct;

    // Show loading skeleton while fetching from Shopify
    if (isLoading) {
      return {
        id: "loading",
        handle: params?.id ?? "",
        name: "Loading...",
        price: 0,
        currencyCode: "CAD",
        isBestSeller: false,
        availableForSale: false,
        variations: [{ color: "Loading", variantId: "", images: [], price: 0 }],
        description: "",
        specs: {},
      };
    }

    // Only use mock products if explicitly enabled in env
    if (import.meta.env.VITE_USE_MOCK_PRODUCTS === "true") {
      return (
        MOCK_PRODUCTS.find((p) => p.handle === params?.id) ||
        MOCK_PRODUCTS.find((p) => p.id === params?.id) ||
        MOCK_PRODUCTS[0]
      );
    }

    // No product found and not in mock mode - show empty state
    return {
      id: "not-found",
      handle: params?.id ?? "",
      name: "Product Not Found",
      price: 0,
      currencyCode: "CAD",
      isBestSeller: false,
      availableForSale: false,
      variations: [{ color: "N/A", variantId: "", images: [], price: 0 }],
      description: "This product could not be found.",
      specs: {},
    };
  }, [liveProduct, params?.id, isLoading]);

  const currentVariation = product.variations[selectedVariationIdx] ?? product.variations[0];
  const images = currentVariation?.images ?? [];

  // Split images for the unified left column:
  // - Hero: first image (large)
  // - Grid: next up to 4 images (2x2 below the hero) — keeps left column comparable to right
  // - Overflow: any extra images render full-width 4-col below the unified section
  const heroImage = images[0];
  const gridImages = images.slice(1, 5);
  const overflowImages = images.slice(5);

  const handleAddToCart = async () => {
    if (!currentVariation.variantId) return;
    const primaryImage = images[0];
    const imageUrl = typeof primaryImage === "string" ? primaryImage : String(primaryImage ?? "");

    if (currentVariation.variantId.startsWith("mock-")) {
      await addItem(currentVariation.variantId, quantity, {
        productTitle: product.name,
        variantTitle: currentVariation.color,
        price: currentVariation.price,
        currencyCode: product.currencyCode,
        imageUrl: imageUrl || undefined,
      });
      return;
    }
    await addItem(currentVariation.variantId, quantity);
  };

  const handleBuyNow = async () => {
    if (!currentVariation.variantId || currentVariation.variantId.startsWith("mock-")) return;
    const url = await shopifyService.buyNow(currentVariation.variantId, quantity);
    if (url) window.location.href = url;
  };

  return (
    <PageLayout>
      {/* MOBILE: swipeable image carousel (Embla) */}
      {isLoading && !liveProduct ? (
        <SkeletonCarousel />
      ) : (
        <ProductImageCarousel
          images={images}
          selectedImageIdx={selectedImage}
          onImageSelect={setSelectedImage}
          productName={product.name}
        />
      )}

      {/* UNIFIED PRODUCT SECTION — single grid with images left, all info right */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start bg-background">
        {/* LEFT COLUMN (3/5): Hero + 2-col grid of secondary images (desktop only) */}
        <div className="hidden lg:flex lg:col-span-3 flex-col gap-4 justify-center">
          {isLoading && !liveProduct ? (
            // Skeleton images while loading
            <>
              <Skeleton className="w-full aspect-square rounded-lg" />
              <div className="grid grid-cols-2 gap-4">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="w-full aspect-square rounded-lg" />
                ))}
              </div>
            </>
          ) : (
            // Real images when loaded
            <>
              {heroImage && (
                <div className="overflow-hidden bg-background rounded-lg flex justify-center">
                  <ResponsiveImage
                    src={heroImage}
                    alt={`${product.name} - main view`}
                    layout="product-hero"
                    width={1791}
                    height={1791}
                    maxWidth="70%"
                  />
                </div>
              )}
              {gridImages.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {gridImages.map((image, idx) => (
                    <div
                      key={idx}
                      className="aspect-square overflow-hidden bg-background rounded-lg"
                      data-testid={`gallery-image-${idx + 1}`}
                    >
                      <ResponsiveImage
                        src={image}
                        alt={`${product.name} - view ${idx + 2}`}
                        layout="thumbnail"
                        width={900}
                        height={900}
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* RIGHT COLUMN (2/5): All product info + accordion */}
        <div className="lg:col-span-2 lg:sticky lg:top-24 self-start">
          {isLoading && !liveProduct ? (
            <SkeletonProductDetails />
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: sectionDuration }}
              className="w-full"
            >
              {/* Badge - hidden on mobile */}
              {product.isBestSeller && (
                <div className="mb-4 hidden md:block">
                  <div className="badge-product w-fit">Top Rated</div>
                </div>
              )}

              {/* Title & Price */}
              <div className="mb-4">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h1 className="font-serif text-3xl md:text-4xl leading-tight text-foreground flex-1">
                    {product.name}
                  </h1>
                  <p
                    className="font-sans text-xl font-medium text-foreground/80 text-right whitespace-nowrap pt-2"
                    data-testid="text-price"
                  >
                    ${currentVariation?.price.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="border-b border-border my-6" />

              {/* Color Variations */}
              {product.variations.length > 1 && (
                <>
                  <div className="mb-6">
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-foreground">
                      Color: <span className="opacity-60">{currentVariation?.color}</span>
                    </p>
                    <div className="flex gap-3">
                      {product.variations.map((v, idx) => (
                        <button
                          key={v.color}
                          onClick={() => { setSelectedVariationIdx(idx); setSelectedImage(0); }}
                          data-testid={`button-variation-${idx}`}
                          className={cn(
                            "h-10 w-10 rounded-full border-2 p-0.5 transition-all",
                            selectedVariationIdx === idx ? "border-primary" : "border-border/50 opacity-70 hover:opacity-100"
                          )}
                          title={v.color}
                        >
                          <div
                            className={cn(
                              "h-full w-full rounded-full",
                              v.color === "Indigo" ? "bg-[#3D52A0]" : "bg-primary"
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="border-b border-border my-6" />
                </>
              )}

              {/* Quantity & CTA */}
              <div className="space-y-4">
                {product.quantityStyle === "sets" ? (
                  <QuantitySetSelector
                    quantity={quantity}
                    setQuantity={setQuantity}
                    maxSets={product.maxSets || 3}
                  />
                ) : (
                  <QuantityCounter quantity={quantity} setQuantity={setQuantity} fullWidth />
                )}
                <button
                  ref={addToCartBtnRef}
                  onClick={handleAddToCart}
                  disabled={!product.availableForSale || isBusy}
                  data-testid="button-add-to-cart"
                  className="w-full flex items-center justify-center gap-2 bg-primary py-3 px-6 text-sm font-medium uppercase tracking-widest text-white transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ShoppingBag className="h-4 w-4" />
                  {product.availableForSale ? "Add to Bag" : "Sold Out"}
                </button>
              </div>

              {/* Product Features — compact icon row above the accordion */}
              <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5">
                {PRODUCT_FEATURES.map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3"
                    data-testid={`feature-${label.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <Icon className="h-4 w-4 text-primary shrink-0" strokeWidth={1.5} />
                    <span className="text-xs uppercase tracking-[0.15em] text-foreground/70">
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Refined Accordion: Description / Details / Care */}
              <div className="mt-8 border-t border-border/60">
                <Accordion title="Description" duration={accordionDuration}>
                  <p>{product.description}</p>
                </Accordion>
                <Accordion title="Details" duration={accordionDuration}>
                  {Object.keys(product.specs).length > 0 ? (
                    <ul className="space-y-3">
                      {Object.entries(product.specs).map(([key, val]) => (
                        <li key={key} className="flex justify-between gap-4">
                          <span className="capitalize text-foreground/60">{key}</span>
                          <span className="font-medium text-foreground text-right">{val}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Hand-crafted in Hebron, Palestine, using traditional materials and techniques passed down through generations.</p>
                  )}
                </Accordion>
                <Accordion title="Care" duration={accordionDuration}>
                  <p>
                    Hand-painted with natural dyes — dishwasher safe for everyday use. Handle with care to preserve the artistry of each piece.
                    Ships from Montreal in 2–3 business days. Free shipping on orders above $100 CAD.
                  </p>
                </Accordion>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* OVERFLOW IMAGES — render below the unified section, full-width 4-col */}
      {overflowImages.length > 0 && (
        <div className="hidden lg:block mt-8">
          <div className="grid grid-cols-4 gap-4">
            {overflowImages.map((image, idx) => (
              <div
                key={idx}
                className="aspect-square overflow-hidden bg-background rounded-lg"
                data-testid={`gallery-overflow-${idx}`}
              >
                <ResponsiveImage
                  src={image}
                  alt={`${product.name} - view ${idx + gridImages.length + 2}`}
                  layout="thumbnail"
                  width={700}
                  height={700}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUGGESTED PRODUCTS — refined editorial grid */}
      {suggestedProducts.length > 0 && (
        <section className="mt-24 md:mt-32 pt-16 md:pt-20 border-t border-border/60">
          {/* Centered header */}
          <div className="mb-12 md:mb-16 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/70 mb-3">
              The Collection
            </p>
            <h2 className="font-serif text-3xl md:text-4xl leading-tight text-foreground">
              You May Also Love
            </h2>
            <p className="mt-3 text-sm text-foreground/60 italic max-w-md mx-auto">
              Discover more handcrafted pieces, each carrying the heritage of Hebron.
            </p>
          </div>

          {/* Responsive grid: 2 cols mobile, 4 cols desktop, max 4 shown */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 md:gap-x-8 gap-y-12">
            {suggestedProducts.slice(0, 4).map((suggestedProduct) => (
              <SuggestedProductCard key={suggestedProduct.id} product={suggestedProduct} />
            ))}
          </div>
        </section>
      )}
      {/* STICKY ADD TO BAG BAR */}
      <AnimatePresence>
        {showStickyBar && !isLoading && liveProduct && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.05 : 0.3, ease: "easeInOut" }}
            className="fixed bottom-0 left-0 right-0 z-50 shadow-md bg-primary "
          >
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
              {/* Left: product name + price — desktop (1024px+) only */}
              <div className="flex flex-col justify-center min-w-0">
                <h2 className="font-serif text-lg md:text-xl leading-tight text-primary-foreground">
                  {product.name}
                </h2>
                <span className="text-xs font-sans tracking-widest mt-0.5 text-primary-foreground/80">
                  {currentVariation?.color}
                </span>
              </div>

              {/* Right (or full-width on mobile/tablet): Add to Bag button */}
              <button
                onClick={handleAddToCart}
                disabled={!product.availableForSale || isBusy}
                className="md:px-32 flex bg-background text-primary items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>{product.availableForSale ? "Add to Bag" : "Sold Out"}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageLayout>
  );
}
