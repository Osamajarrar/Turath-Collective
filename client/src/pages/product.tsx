import { useState, useMemo, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, Minus, Plus, ShoppingBag, ChevronDown, ChevronUp,
} from "lucide-react";
import Navbar from "@/components/navbar";
import { cn } from "@/lib/utils";
import { shopifyService, type ShopifyProduct } from "@/lib/shopify";
import { useCart } from "@/context/cart-context";

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

const Accordion = ({ title, children }: { title: string; children: React.ReactNode }) => {
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
  const [quantity, setQuantity] = useState(1);
  const [selectedVariationIdx, setSelectedVariationIdx] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [liveProduct, setLiveProduct] = useState<DisplayProduct | null>(null);

  useEffect(() => {
    const handle = params?.id;
    if (!handle) return;
    let cancelled = false;
    shopifyService.getProduct(handle).then((result) => {
      if (cancelled || !result) return;
      setLiveProduct(normaliseShopify(result));
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
    <main className="min-h-screen bg-background pb-12 pt-36">
      <Navbar />

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

        <div className="mb-32 grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">
          {/* Gallery */}
          <div className="space-y-6">
            <motion.div
              key={`${selectedVariationIdx}-${selectedImage}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-[4/5] overflow-hidden bg-[#f4f2ee]"
            >
              {images[selectedImage] && (
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="h-full w-full object-contain p-12 transition-transform duration-1000 hover:scale-105"
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
              transition={{ duration: 0.6 }}
            >
              <div className="mb-6 flex items-center gap-4">
                {product.isBestSeller && (
                  <span className="bg-primary px-3 py-1 text-[8px] font-bold uppercase tracking-widest text-white">
                    Best Seller
                  </span>
                )}
              </div>

              <h1 className="mb-4 font-serif text-4xl leading-tight text-foreground md:text-5xl lg:text-6xl">
                {product.name}
              </h1>
              <p className="mb-8 font-sans text-2xl font-medium text-foreground/80" data-testid="text-price">
                {product.currencyCode} ${currentVariation?.price.toFixed(2)}
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

              {/* Accordions */}
              <div className="border-t border-border">
                <Accordion title="Description">
                  <p>{product.description}</p>
                </Accordion>
                {Object.keys(product.specs).length > 0 && (
                  <Accordion title="Specifications">
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
                <Accordion title="Shipping & Returns">
                  <p>
                    Hand-crafted in Palestine, shipped with carbon-neutral logistics. Delivery within
                    7–14 business days. 14-day heritage guarantee returns.
                  </p>
                </Accordion>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
