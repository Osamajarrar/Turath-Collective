import { useState, useMemo, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, Minus, Plus, ShoppingBag, ChevronDown, ChevronUp, Star,
} from "lucide-react";
import Navbar from "@/components/navbar";
import { cn } from "@/lib/utils";
import { shopifyService, type ShopifyProduct } from "@/lib/shopify";

// Mock assets
import burgundyBowl from "@/assets/burgundy-bowl.png";
import burgundyMezze from "@/assets/burgundy-mezze.png";
import classicBowl from "@/assets/classic-bowl.png";
import classicMezze from "@/assets/classic-mezze-plate.png";
import img1 from "@/assets/social-1.png";
import img2 from "@/assets/social-2.png";

// ── Local mock data (fallback) ─────────────────────────────────────────────

const MOCK_PRODUCTS = [
  {
    id: "1",
    handle: "indigo-mosaic-bowl",
    name: "Indigo Mosaic Bowl",
    price: 45.0,
    currencyCode: "CAD",
    rating: 4.8,
    reviewCount: 24,
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
    reviews: [
      { name: "Sarah L.", rating: 5, comment: "Breathtaking quality. The colors are even more vibrant in person.", date: "Feb 12, 2024", image: img1 },
      { name: "Omar K.", rating: 4, comment: "Beautiful craftsmanship, arrived well packaged.", date: "Jan 28, 2024", image: img2 },
    ],
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
  rating: number;
  reviewCount: number;
  isBestSeller: boolean;
  availableForSale: boolean;
  variations: Variation[];
  description: string;
  specs: Record<string, string>;
  reviews: Array<{ name: string; rating: number; comment: string; date: string; image?: string }>;
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
    rating: 5.0,
    reviewCount: 0,
    isBestSeller: p.tags?.includes("best-seller") ?? false,
    availableForSale: p.availableForSale,
    variations,
    description: p.description,
    specs: {},
    reviews: [],
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
  const [quantity, setQuantity] = useState(1);
  const [selectedVariationIdx, setSelectedVariationIdx] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [liveProduct, setLiveProduct] = useState<DisplayProduct | null>(null);

  // Attempt to fetch from Shopify using the URL param as a handle.
  // Falls back silently to mock data if Shopify is not configured or the
  // product is not found.
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
    // Fall back to mock: try matching by handle first, then by numeric id
    return (
      MOCK_PRODUCTS.find((p) => p.handle === params?.id) ||
      MOCK_PRODUCTS.find((p) => p.id === params?.id) ||
      MOCK_PRODUCTS[0]
    );
  }, [liveProduct, params?.id]);

  const currentVariation = product.variations[selectedVariationIdx] ?? product.variations[0];
  const images = currentVariation?.images ?? [];

  const handleAddToCart = async () => {
    if (!currentVariation.variantId || currentVariation.variantId.startsWith("mock-")) return;
    const cart = await shopifyService.createCart([{ merchandiseId: currentVariation.variantId, quantity }]);
    if (cart?.checkoutUrl) window.location.href = cart.checkoutUrl;
  };

  const handleBuyNow = async () => {
    if (!currentVariation.variantId || currentVariation.variantId.startsWith("mock-")) return;
    const url = await shopifyService.buyNow(currentVariation.variantId, quantity);
    if (url) window.location.href = url;
  };

  const scrollToReviews = () => {
    document.getElementById("reviews-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-background pt-24 pb-12">
      <Navbar />

      <div className="container mx-auto px-6 md:px-12">
        <Link href="/shop">
          <button
            data-testid="button-back-to-shop"
            className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mb-12 group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Collection
          </button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 mb-32">
          {/* Gallery */}
          <div className="space-y-6">
            <motion.div
              key={`${selectedVariationIdx}-${selectedImage}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-[4/5] bg-[#f4f2ee] overflow-hidden"
            >
              {images[selectedImage] && (
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-contain p-12 transition-transform duration-1000 hover:scale-105"
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
                      "aspect-square bg-[#f4f2ee] p-4 transition-all border",
                      selectedImage === idx ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-contain" />
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
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={scrollToReviews}
                  className="flex items-center gap-4 hover:opacity-70 transition-opacity text-left"
                  data-testid="button-scroll-reviews"
                >
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-3 h-3",
                          i < Math.floor(product.rating) ? "fill-primary text-primary" : "text-border"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] uppercase tracking-widest font-bold opacity-40 border-b border-border/40 pb-0.5">
                    {product.reviewCount} Reviews
                  </span>
                </button>
                {product.isBestSeller && (
                  <span className="bg-primary text-white text-[8px] uppercase tracking-widest font-bold px-3 py-1">
                    Best Seller
                  </span>
                )}
              </div>

              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-4 leading-tight">
                {product.name}
              </h1>
              <p className="text-2xl font-sans font-medium text-foreground/80 mb-8" data-testid="text-price">
                {product.currencyCode} ${currentVariation?.price.toFixed(2)}
              </p>

              {/* Variations */}
              {product.variations.length > 1 && (
                <div className="mb-12">
                  <p className="text-[10px] uppercase tracking-widest font-bold mb-4">
                    Color: <span className="opacity-40">{currentVariation?.color}</span>
                  </p>
                  <div className="flex gap-4">
                    {product.variations.map((v, idx) => (
                      <button
                        key={v.color}
                        onClick={() => { setSelectedVariationIdx(idx); setSelectedImage(0); }}
                        data-testid={`button-variation-${idx}`}
                        className={cn(
                          "w-12 h-12 rounded-full border-2 transition-all p-1",
                          selectedVariationIdx === idx ? "border-primary" : "border-transparent"
                        )}
                      >
                        <div
                          className={cn(
                            "w-full h-full rounded-full",
                            v.color === "Indigo" ? "bg-[#3D52A0]" : "bg-[#800000]"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-6 mb-12">
                <div className="flex items-center gap-8">
                  <div className="flex items-center border border-border">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-4 hover:bg-muted transition-colors"
                      data-testid="button-quantity-decrease"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-medium" data-testid="text-quantity">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="p-4 hover:bg-muted transition-colors"
                      data-testid="button-quantity-increase"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.availableForSale}
                    data-testid="button-add-to-cart"
                    className="flex-1 bg-primary text-white py-4 flex items-center justify-center gap-3 uppercase tracking-widest text-sm font-medium hover:bg-primary/90 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    {product.availableForSale ? "Add to Bag" : "Sold Out"}
                  </button>
                </div>

                {product.availableForSale && currentVariation?.variantId && !currentVariation.variantId.startsWith("mock-") && (
                  <button
                    onClick={handleBuyNow}
                    data-testid="button-buy-now"
                    className="w-full py-4 border border-primary text-primary uppercase tracking-widest text-sm font-medium hover:bg-primary/5 transition-all"
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

        {/* Reviews Section */}
        {product.reviews.length > 0 && (
          <section id="reviews-section" className="pt-24 border-t border-border">
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
              <div>
                <h2 className="font-serif text-4xl mb-4">Customer Stories</h2>
                <div className="flex items-center gap-4">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{product.rating} Average Rating</span>
                </div>
              </div>
              <button
                data-testid="button-write-review"
                className="px-8 py-4 border border-border text-[10px] uppercase tracking-widest font-bold hover:bg-muted transition-colors"
              >
                Write a Review
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {product.reviews.map((review, idx) => (
                <div key={idx} className="space-y-6" data-testid={`review-card-${idx}`}>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn("w-3 h-3", i < review.rating ? "fill-primary text-primary" : "text-border")}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{review.date}</span>
                  </div>
                  {review.image && (
                    <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
                      <img src={review.image} className="w-full h-full object-cover" alt="Review" />
                    </div>
                  )}
                  <p className="text-lg font-serif italic text-foreground/80 leading-relaxed">
                    "{review.comment}"
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary">— {review.name}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
