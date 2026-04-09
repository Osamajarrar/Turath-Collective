import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ShoppingBag, X, Menu, Minus, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { useTranslation } from "react-i18next";
import { applyRtl } from "@/lib/i18n";
import { useCart, lineDisplayImage, lineUnitPrice } from "@/context/cart-context";
import Logo from "./Logo";

const LANGS = [
  { code: "en", label: "EN", full: "English" },
  { code: "fr", label: "FR", full: "Français" },
] as const;

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const {
    cart,
    mockLines,
    hasMockCart,
    totalQuantity,
    isBusy,
    updateLineQuantity,
    removeLine,
  } = useCart();
  const [hidden, setHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  const mockSubtotal = mockLines.reduce(
    (sum, line) => sum + line.price * line.quantity,
    0
  );
  const mockCurrency = mockLines[0]?.currencyCode ?? "CAD";
  const subtotalLabel = cart
    ? `${cart.cost.subtotalAmount.currencyCode} $${parseFloat(cart.cost.subtotalAmount.amount).toFixed(2)}`
    : hasMockCart
      ? `${mockCurrency} $${mockSubtotal.toFixed(2)}`
      : "—";

  useEffect(() => {
    applyRtl(i18n.language);
    setHidden(false);
  }, [i18n.language]);

  const switchLang = (code: string) => {
    i18n.changeLanguage(code);
    applyRtl(code);
    setHidden(false);
  };



  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    setIsScrolled(latest > 50);
    setHidden(latest > previous && latest > 150);
  });

  return (
    <>
      {/* Announcement Banner — fixed, always visible above the nav */}
      <div className="fixed top-0 left-0 right-0 z-[70] flex h-10 items-center justify-center bg-secondary px-4 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-secondary-foreground">
        {t("announcement")}
      </div>

      <motion.nav
        variants={{ visible: { y: 0 }, hidden: { y: "-100%" } }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className={cn(
          "fixed left-0 right-0 top-10 z-50 border-b transition-all duration-300",
          isScrolled || isCartOpen || isMenuOpen
            ? "border-border bg-background/80 py-4 backdrop-blur-md"
            : "border-transparent bg-transparent py-6"
        )}
      >
        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">

          {/* Mobile: hamburger */}
          <div className="md:hidden w-1/3">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2"
              data-testid="button-menu-open"
              aria-label={t("nav.openMenu")}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Desktop: left nav links */}
          <div className="hidden md:flex items-center gap-8 w-1/3">
            <Link href="/shop" className="text-[10px] uppercase tracking-[0.2em] hover:text-primary transition-colors font-bold">
              {t("nav.shop")}
            </Link>
            <Link href="/about" className="text-[10px] uppercase tracking-[0.2em] hover:text-primary transition-colors font-bold">
              {t("nav.about")}
            </Link>
            <Link href="/contact" className="text-[10px] uppercase tracking-[0.2em] hover:text-primary transition-colors font-bold">
              {t("nav.contact")}
            </Link>
          </div>

          {/* Center: logo */}
          <div className="flex flex-col items-center">
            <Link href="/">
              <Logo variant="with-slogan" />
            </Link>
          </div>

          {/* Right: icons */}
          <div className="flex items-center gap-3 md:gap-4 w-1/3 justify-end">
            {/* Language Toggle - Desktop only */}
            <button
              onClick={() => {
                setHidden(false);
                switchLang(i18n.language === "en" ? "fr" : "en");
              }}
              className="hidden md:block text-[10px] font-bold uppercase tracking-widest hover:text-primary transition-colors"
              data-testid="button-lang-toggle"
              aria-label={t("lang.label")}
            >
              {i18n.language === "en" ? "FR" : "EN"}
            </button>

            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="group relative rounded-full p-1.5 transition-colors"
              data-testid="button-cart-open"
              aria-label={t("cart.heading")}
            >
              <ShoppingBag className="w-4.5 h-4.5 text-foreground transition-colors group-hover:text-primary" strokeWidth={1.5} />
              {totalQuantity > 0 && (
                <span className="absolute top-0 right-0 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-0.5 text-[10px] font-bold text-white">
                  {totalQuantity > 99 ? "99+" : totalQuantity}
                </span>
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* ── Mobile Menu Drawer ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-full max-w-sm bg-background z-[110] shadow-2xl flex flex-col rtl:left-auto rtl:right-0"
            >
              <div className="p-6 flex items-center justify-between border-b border-border">
                <Logo variant="with-slogan" className="w-48 h-auto" />
                <button onClick={() => setIsMenuOpen(false)} data-testid="button-menu-close" aria-label={t("nav.closeMenu")}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 p-8 space-y-8 overflow-y-auto">
                <div className="space-y-4">
                  <p className="text-[10px] uppercase tracking-widest font-bold opacity-30">{t("nav.collections")}</p>
                  <Link href="/shop" onClick={() => setIsMenuOpen(false)} className="block text-3xl font-serif">{t("nav.allProducts")}</Link>
                  <Link href="/shop?category=ceramics" onClick={() => setIsMenuOpen(false)} className="block text-3xl font-serif">{t("nav.ceramics")}</Link>
                  <Link href="/shop?category=embroidery" onClick={() => setIsMenuOpen(false)} className="block text-3xl font-serif">{t("nav.embroidery")}</Link>
                </div>
                <div className="space-y-4 pt-8 border-t border-border/50">
                  <p className="text-[10px] uppercase tracking-widest font-bold opacity-30">{t("nav.brand")}</p>
                  <Link href="/about" onClick={() => setIsMenuOpen(false)} className="block text-3xl font-serif">{t("nav.ourStory")}</Link>
                  <Link href="/contact" onClick={() => setIsMenuOpen(false)} className="block text-3xl font-serif">{t("nav.contact")}</Link>
                </div>
                {/* Language in mobile menu */}
                <div className="pt-8 border-t border-border/50">
                  <p className="text-[10px] uppercase tracking-widest font-bold opacity-30 mb-4">{t("lang.label")}</p>
                  <div className="flex gap-3">
                    {LANGS.map(({ code, label }) => (
                      <button
                        key={code}
                        onClick={() => switchLang(code)}
                        data-testid={`button-mobile-lang-${code}`}
                        className={cn(
                          "px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all",
                          i18n.language === code
                            ? "bg-primary text-white border-primary"
                            : "border-border hover:border-primary"
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Cart Drawer ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-background z-[110] shadow-2xl flex flex-col rtl:right-auto rtl:left-0"
            >
              <div className="p-6 flex items-center justify-between border-b border-border">
                <h2 className="font-serif text-2xl uppercase tracking-wider">{t("cart.heading")}</h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                  data-testid="button-cart-close"
                  aria-label={t("nav.closeMenu")}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                {totalQuantity === 0 && (
                  <p className="text-center text-sm text-muted-foreground">{t("cart.empty")}</p>
                )}

                {cart &&
                  cart.lines.edges.map(({ node: line }) => {
                    const img = lineDisplayImage(line);
                    const unit = lineUnitPrice(line);
                    const lineTotal = unit * line.quantity;
                    return (
                      <div
                        key={line.id}
                        className="mb-8 flex gap-6 border-b border-border/50 pb-8 last:mb-0 last:border-0 last:pb-0 rtl:flex-row-reverse"
                      >
                        <div className="h-24 w-20 flex-shrink-0 bg-muted">
                          {img ? (
                            <img
                              src={img}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-muted" />
                          )}
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                          <div>
                            <h4 className="font-serif text-lg leading-tight">
                              {line.merchandise.product.title}
                            </h4>
                            {line.merchandise.title && line.merchandise.title !== "Default Title" && (
                              <p className="mt-1 text-[10px] font-bold uppercase tracking-widest opacity-40">
                                {line.merchandise.title}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center border border-border">
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() =>
                                  updateLineQuantity(line.id, Math.max(0, line.quantity - 1))
                                }
                                className="p-2 transition-colors hover:bg-muted disabled:opacity-50"
                                aria-label={t("cart.decreaseQty")}
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="min-w-[2rem] text-center text-sm font-medium">
                                {line.quantity}
                              </span>
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => updateLineQuantity(line.id, line.quantity + 1)}
                                className="p-2 transition-colors hover:bg-muted disabled:opacity-50"
                                aria-label={t("cart.increaseQty")}
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => removeLine(line.id)}
                              className="text-muted-foreground transition-colors hover:text-destructive"
                              aria-label={t("cart.remove")}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <span className="ml-auto text-sm font-bold">
                              {line.merchandise.price.currencyCode} ${lineTotal.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {!cart &&
                  hasMockCart &&
                  mockLines.map((line) => (
                    <div
                      key={line.lineId}
                      className="mb-8 flex gap-6 border-b border-border/50 pb-8 last:mb-0 last:border-0 last:pb-0 rtl:flex-row-reverse"
                    >
                      <div className="h-24 w-20 flex-shrink-0 bg-muted">
                        {line.imageUrl ? (
                          <img
                            src={line.imageUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-muted" />
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                        <div>
                          <h4 className="font-serif text-lg leading-tight">{line.productTitle}</h4>
                          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest opacity-40">
                            {line.variantTitle}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center border border-border">
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() =>
                                updateLineQuantity(line.lineId, Math.max(0, line.quantity - 1))
                              }
                              className="p-2 transition-colors hover:bg-muted disabled:opacity-50"
                              aria-label={t("cart.decreaseQty")}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="min-w-[2rem] text-center text-sm font-medium">
                              {line.quantity}
                            </span>
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => updateLineQuantity(line.lineId, line.quantity + 1)}
                              className="p-2 transition-colors hover:bg-muted disabled:opacity-50"
                              aria-label={t("cart.increaseQty")}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => removeLine(line.lineId)}
                            className="text-muted-foreground transition-colors hover:text-destructive"
                            aria-label={t("cart.remove")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <span className="ml-auto text-sm font-bold">
                            {line.currencyCode} ${(line.price * line.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="space-y-4 border-t border-border bg-muted/20 p-8">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest rtl:flex-row-reverse">
                  <span>{t("cart.subtotal")}</span>
                  <span>{subtotalLabel}</span>
                </div>
                {cart?.checkoutUrl ? (
                  <button
                    type="button"
                    disabled={isBusy || totalQuantity === 0}
                    onClick={() => {
                      window.location.href = cart.checkoutUrl;
                    }}
                    className="w-full bg-primary py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-white disabled:opacity-50"
                    data-testid="button-cart-checkout"
                  >
                    {t("cart.checkout")}
                  </button>
                ) : (
                  <Link href="/checkout" className="block">
                    <button
                      type="button"
                      disabled={isBusy || !hasMockCart || totalQuantity === 0}
                      className="w-full bg-primary py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-white disabled:opacity-50"
                      data-testid="button-cart-checkout"
                    >
                      {t("cart.checkout")}
                    </button>
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
