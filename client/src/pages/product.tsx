import { useState, useMemo, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, Minus, Plus, ShoppingBag, ChevronDown, ChevronUp, Brush, Droplets,
} from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { cn } from "@/lib/utils";
import { shopifyService, type ShopifyProduct } from "@/lib/shopify";
import { useCart } from "@/context/cart-context";
import { getAvailableCategories } from "@/lib/collections";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

// Mock assets
import burgundyBowl from "@/assets/burgundy-bowl.png";
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
  const [quantity, setQuantity] = useState(1);
  const [selectedVariationIdx, setSelectedVariationIdx] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [liveProduct, setLiveProduct] = useState<DisplayProduct | null>(null);
  const [suggestedProducts, setSuggestedProducts] = useState<DisplayProduct[]>([]);

  // Animation durations based on motion preference
  const imageDuration = prefersReducedMotion ? 0.1 : 1;
  const sectionDuration = prefersReducedMotion ? 0.1 : 0.6;
  const accordionDuration = prefersReducedMotion ? 0.05 : 0.3;

  useEffect(() => {
    const handle = params?.id;
    if (!handle) return;
    let cancelled = false;
    shopifyService.getProduct(handle).then((result) => {
      if (cancelled || !result) return;
      setLiveProduct(normaliseShopify(result));
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
        .slice(0, 4);
      setSuggestedProducts(normalized);
    }).catch(() => {
      // On error, use mock products
      if (cancelled) return;
      const normalized = MOCK_PRODUCTS
        .filter((p) => p.handle !== handle)
        .sort(() => Math.random() - 0.5)
        .slice(0, 4);
      setSuggestedProducts(normalized);
    });

    return () => { cancelled = true; };
  }, [params?.id]);

  const product: DisplayProduct = useMemo(() => {
    if (liveProduct) return liveProduct;
    return (
      MOCK_PRODUCTS.find((p) => p.handle === params?.id) ||
      MOCK_PRODUCTS.find((p) => p.id === params?.id) ||
      MOCK_PRODUCTS[0]
    );
  }, [liveProduct, params?.id]);

  const currentVariation = product.variations[selectedVariationIdx] ?? product.variations[0];
  const images = currentVariation?.images ?? [];

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

      <div className="container mx-auto px-6 md:px-12">
        <Link href="/shop">
          <button
            data-testid="button-back-to-shop"
            className="group mb-12 flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
          >
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Collection
          </button>
        </Link>

        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">
          {/* Gallery */}
          <div className="space-y-6">
            <motion.div
              key={`${selectedVariationIdx}-${selectedImage}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: imageDuration }}
              className="aspect-[4/5] overflow-hidden bg-[#f4f2ee]"
            >
              {images[selectedImage] && (
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className={`h-full w-full object-contain p-12 transition-transform ${prefersReducedMotion ? "duration-100" : "duration-1000"} hover:scale-105`}
                />
              )}
            </motion.div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    data-testid={`thumbnail-${idx}`}
                    className={cn(
                      "aspect-square border bg-[#f4f2ee] p-4 transition-all",
                      selectedImage === idx ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <img src={img} alt="Thumbnail" className="h-full w-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: sectionDuration }}
            >
              <div className="mb-6 flex flex-row items-center gap-4">
                {product.isBestSeller && (
                  <div className="badge-product">
                    Best Seller
                  </div>
                )}
              </div>

              <h1 className="mb-4 font-serif text-4xl leading-tight text-foreground md:text-5xl lg:text-6xl">
                {product.name}
              </h1>
              <p className="mb-8 font-sans text-2xl font-medium text-foreground/80" data-testid="text-price">
                ${currentVariation?.price.toFixed(2)}
              </p>

              {/* Variations */}
              {product.variations.length > 1 && (
                <div className="mb-12">
                  <p className="mb-4 text-[10px] font-bold uppercase tracking-widest">
                    Color: <span className="opacity-40">{currentVariation?.color}</span>
                  </p>
                  <div className="flex gap-4">
                    {product.variations.map((v, idx) => (
                      <button
                        key={v.color}
                        onClick={() => { setSelectedVariationIdx(idx); setSelectedImage(0); }}
                        data-testid={`button-variation-${idx}`}
                        className={cn(
                          "h-12 w-12 rounded-full border-2 p-1 transition-all",
                          selectedVariationIdx === idx ? "border-primary" : "border-transparent"
                        )}
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
              )}

              <div className="mb-12 flex flex-col gap-6">
                <div className="flex items-center gap-8">
                  <div className="flex items-center border border-border">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-4 transition-colors hover:bg-muted"
                      data-testid="button-quantity-decrease"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center font-medium" data-testid="text-quantity">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="p-4 transition-colors hover:bg-muted"
                      data-testid="button-quantity-increase"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.availableForSale || isBusy}
                    data-testid="button-add-to-cart"
                    className="group flex flex-1 items-center justify-center gap-3 bg-primary py-4 text-sm font-medium uppercase tracking-widest text-white transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ShoppingBag className="h-4 w-4 transition-transform group-hover:scale-110" />
                    {product.availableForSale ? "Add to Bag" : "Sold Out"}
                  </button>
                </div>

                {product.availableForSale && currentVariation?.variantId && !currentVariation.variantId.startsWith("mock-") && (
                  <button
                    onClick={handleBuyNow}
                    data-testid="button-buy-now"
                    className="w-full border border-primary py-4 text-sm font-medium uppercase tracking-widest text-primary transition-all hover:bg-primary/5"
                  >
                    Buy Now
                  </button>
                )}
              </div>

              {/* Product Features */}
              <div className="my-12 rounded-lg p-8 bg-gradient-to-br from-background to-muted/20 border border-border">
                <div className="grid grid-cols-2 gap-12">
                  <div className="flex flex-row items-center gap-6">
                    <div className="shrink-0">
                      <Droplets className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-foreground">Dishwasher Safe</p>
                      <p className="text-xs text-foreground/60 mt-2">Everyday convenience without compromise</p>
                    </div>
                  </div>
                  <div className="flex flex-row items-center gap-6">
                    <div className="shrink-0">
                      <Brush className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-foreground">Hand Painted</p>
                      <p className="text-xs text-foreground/60 mt-2">Traditional artistry in every brushstroke</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Accordions */}
              <div className="border-t border-border">
                <Accordion title="Description" duration={accordionDuration}>
                  <p>{product.description}</p>
                </Accordion>
                {Object.keys(product.specs).length > 0 && (
                  <Accordion title="Details" duration={accordionDuration}>
                    <ul className="space-y-2">
                      {Object.entries(product.specs).map(([key, val]) => (
                        <li key={key} className="flex justify-between">
                          <span className="capitalize">{key}</span>
                          <span className="font-medium text-foreground">{val}</span>
                        </li>
                      ))}
                    </ul>
                  </Accordion>
                )}
                <Accordion title="Care" duration={accordionDuration}>
                  <p>
                    Hand-crafted in Palestine. Dishwasher safe for easy cleaning. Hand painted with natural dyes. Handle with care to preserve the artistry of each piece.
                  </p>
                </Accordion>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Suggested Products */}
        {suggestedProducts.length > 0 && (
          <div className="mt-24 border-t border-border pt-12">
            <h2 className="mb-12 font-serif text-4xl">More Treasures</h2>
            <div className="grid gap-12 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
              {suggestedProducts.map((suggestedProduct, idx) => (
                <Link href={`/product/${suggestedProduct.handle}`} key={suggestedProduct.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: prefersReducedMotion ? 0 : idx * 0.1, duration: sectionDuration }}
                    className="group cursor-pointer"
                    data-testid={`card-suggested-${suggestedProduct.id}`}
                  >
                    <div className="relative mb-6 aspect-[4/5] overflow-hidden bg-muted">
                      <img
                        src={suggestedProduct.variations[0]?.images[0] || ""}
                        alt={suggestedProduct.name}
                        className={`h-full w-full object-cover transition-transform ${prefersReducedMotion ? "duration-100" : "duration-700"} group-hover:scale-105`}
                      />
                      {suggestedProduct.isBestSeller && (
                        <div className="pointer-events-none absolute left-4 top-4">
                          <div className="badge-product">
                            Best Seller
                          </div>
                        </div>
                      )}
                    </div>
                    <h3 className="text-product-name mb-2">{suggestedProduct.name}</h3>
                    <p className="text-sm text-foreground/60">
                      ${suggestedProduct.price.toFixed(2)}
                    </p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
