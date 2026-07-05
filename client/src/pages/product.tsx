import { useState, useMemo, useEffect, useRef } from "react";
import { useRoute } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Plus, Minus, Brush, Droplets, Package, Heart, Bell } from "lucide-react";
import { useTranslation } from "react-i18next";
import PageLayout from "@/components/PageLayout";
import SuggestedProductCard from "@/components/suggested-product-card";
import ResponsiveImage from "@/components/ui/responsive-image";
import ProductImageCarousel from "@/components/product-image-carousel";
import QuantityCounter from "@/components/QuantityCounter";
import QuantitySetSelector from "@/components/QuantitySetSelector";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ColorSwatch } from "@/components/ColorSwatch";
import { cn } from "@/lib/utils";
import { shopifyService, type ShopifyProduct } from "@/lib/shopify";
import { useCart } from "@/context/cart-context";
import { trackEvent } from "@/lib/analytics";
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
      { color: "Cream", variantId: "mock-variant-1-cream", images: eightImages(classicBowl, classicMezze), price: 45.0, quantityAvailable: 12 },
      { color: "Rose", variantId: "mock-variant-1-rose", images: eightImages(classicBowl, classicMezze), price: 45.0, quantityAvailable: 8 },
      { color: "Gray", variantId: "mock-variant-1-gray", images: eightImages(classicMezze, classicBowl), price: 45.0, quantityAvailable: 5 },
      { color: "Navy", variantId: "mock-variant-1-navy", images: eightImages(burgundyBowl, burgundyMezze), price: 48.0, quantityAvailable: 0 },
      { color: "Sage", variantId: "mock-variant-1-sage", images: eightImages(classicBowl, classicMezze), price: 45.0, quantityAvailable: 10 },
      { color: "Burgundy", variantId: "mock-variant-1-burgundy", images: eightImages(burgundyBowl, burgundyMezze), price: 45.0, quantityAvailable: 6 },
      { color: "Taupe", variantId: "mock-variant-1-taupe", images: eightImages(classicBowl, classicMezze), price: 45.0, quantityAvailable: 0 },
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
      { color: "Cream", variantId: "mock-variant-2-cream", images: eightImages(burgundyMezze, burgundyBowl), price: 38.0, quantityAvailable: 4 },
      { color: "Mauve", variantId: "mock-variant-2-mauve", images: eightImages(burgundyMezze, burgundyBowl), price: 38.0, quantityAvailable: 0 },
      { color: "Gray", variantId: "mock-variant-2-gray", images: eightImages(classicBowl, classicMezze), price: 38.0, quantityAvailable: 7 },
      { color: "Navy", variantId: "mock-variant-2-navy", images: eightImages(classicMezze, classicBowl), price: 38.0, quantityAvailable: 0 },
      { color: "Sage", variantId: "mock-variant-2-sage", images: eightImages(burgundyBowl, classicMezze), price: 38.0, quantityAvailable: 3 },
      { color: "Burgundy", variantId: "mock-variant-2-burgundy", images: eightImages(burgundyMezze, burgundyBowl), price: 38.0, quantityAvailable: 8 },
      { color: "Natural", variantId: "mock-variant-2-natural", images: eightImages(burgundyMezze, burgundyBowl), price: 38.0, quantityAvailable: 9 },
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
      { color: "Indigo", variantId: "mock-variant-3-indigo", images: [classicMezze, classicBowl], price: 38.0, quantityAvailable: 5 },
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
      { color: "Burgundy", variantId: "mock-variant-4-burgundy", images: [burgundyBowl, burgundyMezze], price: 45.0, quantityAvailable: 15 },
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
      { color: "Indigo", variantId: "mock-variant-5-indigo", images: [classicBowl, classicMezze], price: 45.0, quantityAvailable: 20 },
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
  quantityAvailable?: number;
  colorHex?: string;
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
  const variations: Variation[] = p.variants.edges.map((e) => {
    const colorHex = e.node.colorHexMf?.value ?? undefined;
    // Start with variant's main image
    const variantImage = e.node.image?.url ? [e.node.image.url] : [];
    // Get additional images from variant media references
    const mediaImages = (e.node.variantMediaMf?.references?.nodes?.map((node) => node.image?.url).filter(Boolean) as string[]) ?? [];
    // Use variant image first, then media images, otherwise fall back to product images
    const images = variantImage.length > 0 || mediaImages.length > 0 ? [...variantImage, ...mediaImages] : p.images.edges.map((img) => img.node.url);
    return {
      color: e.node.selectedOptions.find((o) => o.name.toLowerCase() === "color")?.value ?? e.node.title,
      variantId: e.node.id,
      images: images,
      price: parseFloat(e.node.price.amount),
      quantityAvailable: e.node.quantityAvailable,
      colorHex: colorHex,
    };
  });

  if (variations.length === 0) {
    variations.push({
      color: "Default",
      variantId: "",
      images: p.images.edges.map((img) => img.node.url),
      price: parseFloat(p.priceRange.minVariantPrice.amount),
      quantityAvailable: 0,
      colorHex: "#cccccc",
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

// ── NotifyMe Modal Component ───────────────────────────────────────────────

interface NotifyMeModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: DisplayProduct;
  variant: Variation;
  t: any;
}

function NotifyMeModal({ isOpen, onClose, product, variant, t }: NotifyMeModalProps) {
  const [email, setEmail] = useState("");
  const [optIn, setOptIn] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      // Simulate API call - replace with actual endpoint
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Notify me request:", { email, productHandle: product.handle, variantId: variant.variantId, optIn });
      setSubmitted(true);
      setTimeout(() => {
        setEmail("");
        setOptIn(true);
        setSubmitted(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error submitting notify me:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>{t("shop.notifyMe.title", "Notify Me")}</AlertDialogTitle>
          <AlertDialogDescription className="text-left space-y-4">
            {!submitted ? (
              <>
                <div className="text-sm text-foreground/70">
                  {t("shop.notifyMe.description", "Get notified when this item is back in stock.")}
                </div>
                <div className="bg-muted p-3 rounded text-sm">
                  <p className="font-medium text-foreground">{product.name}</p>
                  <p className="text-foreground/60">{variant.color}</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="email"
                    placeholder={t("shop.notifyMe.emailPlaceholder", "Enter your email")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-primary"
                  />
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={optIn}
                      onChange={(e) => setOptIn(e.target.checked)}
                      className="w-4 h-4 border border-border rounded cursor-pointer accent-primary"
                    />
                    <span className="text-xs text-foreground/60">
                      {t("shop.notifyMe.optIn", "Send me promotional emails")}
                    </span>
                  </label>
                  <div className="flex gap-3 pt-4">
                    <AlertDialogCancel className="flex-1" onClick={onClose}>
                      {t("shop.notifyMe.cancel", "Cancel")}
                    </AlertDialogCancel>
                    <AlertDialogAction
                      type="submit"
                      onClick={handleSubmit}
                      disabled={!email || isSubmitting}
                      className="flex-1"
                    >
                      {isSubmitting ? t("shop.notifyMe.submitting", "Submitting...") : t("shop.notifyMe.notify", "Notify Me")}
                    </AlertDialogAction>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-foreground font-medium">{t("shop.notifyMe.success", "Thanks! We'll notify you when it's back in stock.")}</p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
}

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
            <Skeleton key={i} className="h-8 w-8 rounded-full" />
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
  const { t } = useTranslation("commerce");
  const [, params] = useRoute("/product/:id");
  const { addItem, isBusy, cart, mockLines, hasMockCart } = useCart();
  const prefersReducedMotion = useReducedMotion();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariationIdx, setSelectedVariationIdx] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [liveProduct, setLiveProduct] = useState<DisplayProduct | null>(null);
  const [suggestedProducts, setSuggestedProducts] = useState<DisplayProduct[]>([]);
  const [isLoading, setIsLoading] = useState(() => import.meta.env.VITE_USE_MOCK_PRODUCTS !== "true");
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);
  const [selectedNotifyVariant, setSelectedNotifyVariant] = useState<Variation | null>(null);

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

  // Reset quantity to 1 when switching variants
  useEffect(() => {
    setQuantity(1);
  }, [selectedVariationIdx]);

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

  // Calculate remaining inventory (available - already in cart)
  const remainingInventory = useMemo(() => {
    const available = currentVariation.quantityAvailable ?? Infinity;
    let cartQuantity = 0;

    if (hasMockCart) {
      // Check mock cart for this variant
      const mockLine = mockLines.find((line) => line.variantId === currentVariation.variantId);
      cartQuantity = mockLine?.quantity ?? 0;
    } else if (cart) {
      // Check Shopify cart for this variant
      const cartLine = cart.lines.edges.find(
        (edge) => edge.node.merchandise.id === currentVariation.variantId
      );
      cartQuantity = cartLine?.node.quantity ?? 0;
    }

    return Math.max(0, available - cartQuantity);
  }, [currentVariation.variantId, currentVariation.quantityAvailable, cart, mockLines, hasMockCart]);

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
      trackEvent("add_to_cart", {
        product_name: product.name,
        variant: currentVariation.color,
        price: currentVariation.price,
        currency: product.currencyCode,
        quantity,
      });
      return;
    }

    await addItem(currentVariation.variantId, quantity);
    trackEvent("add_to_cart", {
      product_name: product.name,
      variant: currentVariation.color,
      price: currentVariation.price,
      currency: product.currencyCode,
      quantity,
    });
  };

  const handleBuyNow = async () => {
    if (!currentVariation.variantId || currentVariation.variantId.startsWith("mock-")) return;
    trackEvent("begin_checkout", {
      product_name: product.name,
      variant: currentVariation.color,
      price: currentVariation.price,
      currency: product.currencyCode,
      quantity,
    });
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
              {/* Badges - hidden on mobile */}
              <div className="mb-4 hidden md:block space-y-2">
                {!product.availableForSale && (
                  <div className="badge-product w-fit bg-red-600 text-white">
                    {t("product.soldOut")}
                  </div>
                )}
                {product.isBestSeller && (
                  <div className="badge-product w-fit">Top Rated</div>
                )}
              </div>

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
                      {product.variations.map((v, idx) => {
                        const isOutOfStock = (v.quantityAvailable ?? 0) === 0;
                        const colorHex = v.colorHex || "#cccccc";

                        return (
                          <ColorSwatch
                            key={v.color}
                            color={v.color}
                            hex={colorHex}
                            isSelected={selectedVariationIdx === idx}
                            isOutOfStock={isOutOfStock}
                            onClick={() => {
                              setSelectedVariationIdx(idx);
                              setSelectedImage(0);
                            }}
                            size="md"
                            showOutOfStockStyle={true}
                            t={t}
                          />
                        );
                      })}
                    </div>
                  </div>
                  <div className="border-b border-border my-6" />
                </>
              )}

              {/* Quantity & CTA */}
              <div className="space-y-4">
                {!product.availableForSale || (currentVariation.quantityAvailable ?? 0) === 0 ? (
                  <button
                    onClick={() => {
                      setSelectedNotifyVariant(currentVariation);
                      setNotifyModalOpen(true);
                    }}
                    data-testid="button-notify-me"
                    className="w-full flex items-center justify-center gap-2 bg-primary py-3 px-6 text-sm font-medium uppercase tracking-widest text-white transition-all hover:bg-primary/90"
                  >
                    <Bell className="h-4 w-4" />
                    {t("shop.notifyMe.title", "Notify Me")}
                  </button>
                ) : (
                  <>
                    {product.quantityStyle === "sets" ? (
                      <QuantitySetSelector
                        quantity={quantity}
                        setQuantity={setQuantity}
                        maxSets={product.maxSets || 3}
                      />
                    ) : (
                      <QuantityCounter 
                        quantity={quantity} 
                        setQuantity={setQuantity} 
                        availableQuantity={remainingInventory}
                        fullWidth 
                      />
                    )}
                    <button
                      ref={addToCartBtnRef}
                      onClick={handleAddToCart}
                      disabled={isBusy || remainingInventory <= 0}
                      data-testid="button-add-to-cart"
                      className="w-full flex items-center justify-center gap-2 bg-primary py-3 px-6 text-sm font-medium uppercase tracking-widest text-white transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      {remainingInventory <= 0 ? "Already in Bag" : "Add to Bag"}
                    </button>
                  </>
                )}
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
                disabled={!product.availableForSale || isBusy || remainingInventory <= 0}
                className="md:px-32 flex bg-background text-primary items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>{!product.availableForSale ? "Sold Out" : remainingInventory <= 0 ? "Already in Bag" : "Add to Bag"}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {selectedNotifyVariant && (
        <NotifyMeModal
          isOpen={notifyModalOpen}
          onClose={() => setNotifyModalOpen(false)}
          product={product}
          variant={selectedNotifyVariant}
          t={t}
        />
      )}
    </PageLayout>
  );
}
