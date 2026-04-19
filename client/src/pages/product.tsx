import { useState, useMemo, useEffect, useRef } from "react";
import { useRoute, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, ShoppingBag, ChevronDown, ChevronUp, Brush, Droplets,
} from "lucide-react";
import PageLayout from "@/components/PageLayout";
import SuggestedProductCard from "@/components/suggested-product-card";
import ResponsiveImage from "@/components/ui/responsive-image";
import ProductImageCarousel from "@/components/product-image-carousel";
import ProductGallery from "@/components/product-gallery";
import QuantityCounter from "@/components/QuantityCounter";
import QuantitySetSelector from "@/components/QuantitySetSelector";
import { cn } from "@/lib/utils";
import { shopifyService, type ShopifyProduct } from "@/lib/shopify";
import { useCart } from "@/context/cart-context";
import { getAvailableCategories } from "@/lib/collections";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

// Mock assets
import burgundyBowl from "@/assets/bburgundy-bowl.png";
import burgundyMezze from "@/assets/burgundy-mezze.png";
import classicBowl from "@/assets/classic-bowl.png";
import classicMezze from "@/assets/classic-mezze-plate.png";

// ── Local mock data (fallback) ─────────────────────────────────────────────

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
      { color: "Indigo", variantId: "mock-variant-1-indigo", images: [classicBowl, classicMezze], price: 45.0 },
      { color: "Burgundy", variantId: "mock-variant-1-burgundy", images: [burgundyBowl, burgundyMezze], price: 48.0 },
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

  // Ensure at least one variation
  if (variations.length === 0) {
    variations.push({
      color: "Default",
      variantId: "",
      images: p.images.edges.map((img) => img.node.url),
      price: parseFloat(p.priceRange.minVariantPrice.amount),
    });
  }

  // Extract quantity style and max sets from metafields (optional)
  let quantityStyle = p.quantityStyle ?? "counter";
  let maxSets = p.maxSets ?? 3;

  // If metafields were fetched from Shopify, parse them (filter out nulls)
  if (p.metafields && Array.isArray(p.metafields)) {
    const metafieldsMap = Object.fromEntries(
      p.metafields.filter((mf: any) => mf != null).map((mf: any) => [mf.key, mf.value])
    );
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
    specs: {},
    quantityStyle: quantityStyle as "counter" | "sets",
    maxSets,
  };
}

// ── Sub-components ────────────────────────────────────────────────────────

const Accordion = ({ title, children, duration = 0.3 }: { title: string; children: React.ReactNode; duration?: number }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex justify-between items-center group"
        data-testid={`accordion-${title.toLowerCase().replace(/\s+/g, "-")}`}
      >
        <span className="text-xs uppercase tracking-[0.2em] font-bold group-hover:text-primary transition-colors">
          {title}
        </span>
        {isOpen ? <ChevronUp className="w-4 h-4 opacity-40" /> : <ChevronDown className="w-4 h-4 opacity-40" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration }}
            className="overflow-hidden"
          >
            <div className="pb-8 text-sm text-foreground/60 font-light leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────

export default function ProductPage() {
  const [, params] = useRoute("/product/:id");
  const { addItem, isBusy } = useCart();
  const prefersReducedMotion = useReducedMotion();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariationIdx, setSelectedVariationIdx] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [liveProduct, setLiveProduct] = useState<DisplayProduct | null>(null);
  const [suggestedProducts, setSuggestedProducts] = useState<DisplayProduct[]>([]);
  const [isLoading, setIsLoading] = useState(() => import.meta.env.VITE_USE_MOCK_PRODUCTS !== "true");

  // Animation durations based on motion preference
  const imageDuration = prefersReducedMotion ? 0.1 : 1;
  const sectionDuration = prefersReducedMotion ? 0.1 : 0.6;
  const accordionDuration = prefersReducedMotion ? 0.05 : 0.3;

  useEffect(() => {
    const handle = params?.id;
    if (!handle) return;
    let cancelled = false;

    // Skip API calls if using mock products
    if (import.meta.env.VITE_USE_MOCK_PRODUCTS === "true") {
      const mockProduct = MOCK_PRODUCTS.find((p) => p.handle === handle);
      if (mockProduct) {
        setLiveProduct(mockProduct);
      }
      const suggested = MOCK_PRODUCTS
        .filter((p) => p.handle !== handle)
        .sort(() => Math.random() - 0.5)
        .slice(0, 8);
      setSuggestedProducts(suggested);
      return;
    }

    // Fetch from Shopify API
    setIsLoading(true);
    console.log("[Product Page] Fetching product from Shopify:", handle);
    shopifyService.getProduct(handle).then((result) => {
      if (cancelled) return;
      console.log("[Product Page] Shopify fetch result:", result);
      if (result) {
        const normalized = normaliseShopify(result);
        console.log("[Product Page] Normalized product with variants:", normalized);
        setLiveProduct(normalized);
      } else {
        console.warn("[Product Page] Shopify returned null, will fallback to mock");
      }
      setIsLoading(false);
    }).catch((err) => {
      if (cancelled) return;
      console.error("[Product Page] Shopify fetch error:", err);
      setIsLoading(false);
    });

    // Fetch suggested products with fallback to mock data
    shopifyService.getProducts().then((products) => {
      if (cancelled) return;

      // Use fetched products or fallback to mock
      const productsToUse = products && products.length > 0 ? products : MOCK_PRODUCTS;

      const normalized = productsToUse
        .filter((p) => (p as any).handle !== handle)
        .map((p) => {
          // Check if it's a ShopifyProduct (has variants.edges) or already normalized
          if ("variants" in p && "edges" in (p as any).variants) {
            return normaliseShopify(p as ShopifyProduct);
          }
          return p as DisplayProduct;
        })
        .sort(() => Math.random() - 0.5)
        .slice(0, 8);
      setSuggestedProducts(normalized);
    }).catch(() => {
      // On error, use mock products
      if (cancelled) return;
      const normalized = MOCK_PRODUCTS
        .filter((p) => p.handle !== handle)
        .sort(() => Math.random() - 0.5)
        .slice(0, 8);
      setSuggestedProducts(normalized);
    });

    return () => { cancelled = true; };
  }, [params?.id]);

  const product: DisplayProduct = useMemo(() => {
    if (liveProduct) return liveProduct;
    
    // If loading from API, show a minimal skeleton product
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
    
    // Loading complete - use mock as fallback if not in API mode
    return (
      MOCK_PRODUCTS.find((p) => p.handle === params?.id) ||
      MOCK_PRODUCTS.find((p) => p.id === params?.id) ||
      MOCK_PRODUCTS[0]
    );
  }, [liveProduct, params?.id, isLoading]);

  const currentVariation = product.variations[selectedVariationIdx] ?? product.variations[0];
  const images = currentVariation?.images ?? [];

  const handleAddToCart = async () => {
    if (!currentVariation.variantId) return;
    const primaryImage = images[0];
    const imageUrl = typeof primaryImage === "string" ? primaryImage : String(primaryImage ?? "");

    console.log("[Product Page] Adding to cart - variantId:", currentVariation.variantId, "isMock:", currentVariation.variantId.startsWith("mock-"));

    if (currentVariation.variantId.startsWith("mock-")) {
      console.log("[Product Page] Using mock cart flow");
      await addItem(currentVariation.variantId, quantity, {
        productTitle: product.name,
        variantTitle: currentVariation.color,
        price: currentVariation.price,
        currencyCode: product.currencyCode,
        imageUrl: imageUrl || undefined,
      });
      return;
    }

    console.log("[Product Page] Using Shopify cart flow");
    await addItem(currentVariation.variantId, quantity);
  };

  const handleBuyNow = async () => {
    if (!currentVariation.variantId || currentVariation.variantId.startsWith("mock-")) return;
    const url = await shopifyService.buyNow(currentVariation.variantId, quantity);
    if (url) window.location.href = url;
  };

  return (
    <PageLayout paddingClass="pt-36 pb-24">
      {/* Mobile Product Image Carousel (visible on mobile only) */}
      <ProductImageCarousel
        images={images}
        selectedImageIdx={selectedImage}
        onImageSelect={setSelectedImage}
        productName={product.name}
      />

      {/* SECTION 1: Main Product Image + Details */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-8 items-start px-8 bg-background">
        {/* Left Column: Main Image - Square (3/5 width) - Desktop only */}
        <motion.div
          key={`${selectedVariationIdx}-${selectedImage}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: imageDuration }}
          className="hidden lg:flex lg:col-span-3 justify-center items-center overflow-hidden bg-background rounded-lg"
        >
          {images[selectedImage] && (
            <ResponsiveImage
              src={images[selectedImage]}
              alt={product.name}
              layout="product-hero"
              width={1791}
              height={1791}
              className={`transition-transform ${prefersReducedMotion ? "duration-100" : "duration-1000"}`}
            />
          )}
        </motion.div>

        {/* Right Column: Details Text Block (2/5 width) */}
        <div className="lg:col-span-2 self-center">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: sectionDuration }}
            className="w-full"
          >
            {/* Badge */}
            {product.isBestSeller && (
              <div className="mb-4">
                <div className="badge-product w-fit">
                  Top Rated
                </div>
              </div>
            )}

            {/* Title & Price */}
            <div className="mb-4">
              <div className="flex items-center justify-between gap-4 mb-2">
                <h1 className="font-serif text-4xl leading-tight text-foreground flex-1">
                  {product.name}
                </h1>
                <p className="font-sans text-xl font-medium text-foreground/80 text-right whitespace-nowrap" data-testid="text-price">
                  ${currentVariation?.price.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Separator */}
            <div className="border-b border-border my-6" />

            {/* Color Variations Section */}
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

                {/* Separator */}
                <div className="border-b border-border my-6" />
              </>
            )}

            {/* Quantity & CTA Section */}
            <div className="space-y-4">
              {/* Debug: Show whether using Shopify or Mock */}
              <div className={`p-2 rounded text-[10px] text-center font-bold uppercase tracking-widest ${
                liveProduct ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
              }`}>
                {liveProduct ? "✓ Using Real Shopify Data" : "⚠ Using Mock Data (Fallback)"}
              </div>

              {product.quantityStyle === "sets" ? (
                <QuantitySetSelector
                  quantity={quantity}
                  setQuantity={setQuantity}
                  maxSets={product.maxSets || 3}
                />
              ) : (
                <QuantityCounter quantity={quantity} setQuantity={setQuantity} />
              )}
              <button
                onClick={handleAddToCart}
                disabled={!product.availableForSale || isBusy}
                data-testid="button-add-to-cart"
                className="w-full flex items-center justify-center gap-2 bg-primary py-3 px-6 text-sm font-medium uppercase tracking-widest text-white transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingBag className="h-4 w-4" />
                {product.availableForSale ? "Add to Bag" : "Sold Out"}
              </button>
              {product.availableForSale && currentVariation?.variantId && !currentVariation.variantId.startsWith("mock-") && (
                <button
                  onClick={handleBuyNow}
                  data-testid="button-buy-now"
                  className="w-full border border-primary py-3 text-sm font-medium uppercase tracking-widest text-primary transition-all hover:bg-primary/5"
                >
                  Buy Now
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* SECTION 2: Images Gallery + Features/Accordions */}
      {images.length > 1 && (
        <div className="mt-8 md:mt-12 grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Product Gallery (3/5 width) - Desktop: grid, Mobile: hidden */}
          <ProductGallery
            images={images}
            selectedImageIdx={selectedImage}
            onImageSelect={setSelectedImage}
            productName={product.name}
          />

          {/* Right: Features + Accordions (2/5 width) */}
          <div className="lg:col-span-2 flex flex-col">
            {/* Product Features */}
            <div className="rounded-lg p-6 bg-gradient-to-br from-background to-muted/20 border border-border mb-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="flex flex-row items-start gap-4">
                  <div className="shrink-0 mt-0.5">
                    <Droplets className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-foreground mb-1">Dishwasher Safe</p>
                    <p className="text-xs text-foreground/60 leading-relaxed">Everyday convenience without compromise</p>
                  </div>
                </div>
                <div className="flex flex-row items-start gap-4">
                  <div className="shrink-0 mt-0.5">
                    <Brush className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-foreground mb-1">Hand Painted</p>
                    <p className="text-xs text-foreground/60 leading-relaxed">Traditional artistry in every brushstroke</p>
                  </div>
                </div>
              </div>

              {/* Separator */}
              <div className="border-b border-border" />

              {/* Accordions */}
              <div>
                <Accordion title="Description" duration={accordionDuration}>
                  <p className="text-sm leading-relaxed">{product.description}</p>
                </Accordion>
                {Object.keys(product.specs).length > 0 && (
                  <Accordion title="Details" duration={accordionDuration}>
                    <ul className="space-y-3 text-sm">
                      {Object.entries(product.specs).map(([key, val]) => (
                        <li key={key} className="flex justify-between gap-4">
                          <span className="capitalize text-foreground/70">{key}</span>
                          <span className="font-medium text-foreground text-right">{val}</span>
                        </li>
                      ))}
                    </ul>
                  </Accordion>
                )}
                <Accordion title="Care" duration={accordionDuration}>
                  <p className="text-sm leading-relaxed text-foreground/80">
                    Hand-crafted in Palestine. Dishwasher safe for easy cleaning. Hand painted with natural dyes. Handle with care to preserve the artistry of each piece.
                  </p>
                </Accordion>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suggested Products */}
      {suggestedProducts.length > 0 && (
        <div className="mt-20 md:mt-24 border-t border-border pt-16 md:pt-20">
          <div className="mb-12 md:mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h2 className="mb-2 font-serif text-3xl md:text-4xl leading-tight">More Treasures</h2>
              <p className="text-sm text-foreground/60 max-w-2xl">Explore more handcrafted pieces from our curated collection.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (carouselRef.current) {
                    carouselRef.current.scrollBy({ left: -300, behavior: "smooth" });
                  }
                }}
                className="p-3 rounded-full border border-border hover:bg-muted transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (carouselRef.current) {
                    carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
                  }
                }}
                className="p-3 rounded-full border border-border hover:bg-muted transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Carousel Container */}
          <div
            ref={carouselRef}
            className="flex overflow-x-auto scrollbar-hide gap-4 md:gap-6 pb-4"
            style={{ scrollBehavior: "smooth", scrollSnapType: "x mandatory" }}
          >
            {suggestedProducts.map((suggestedProduct) => (
              <div
                key={suggestedProduct.id}
                className="flex-shrink-0 w-1/2 md:w-1/3 lg:w-1/4"
                style={{ scrollSnapAlign: "start" }}
              >
                <SuggestedProductCard product={suggestedProduct} />
              </div>
            ))}
          </div>
        </div>
      )}
    </PageLayout>
  );
}
