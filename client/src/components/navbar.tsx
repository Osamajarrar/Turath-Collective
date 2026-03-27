import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ShoppingBag, Globe, User, X, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { useTranslation } from "react-i18next";
import { applyRtl } from "@/lib/i18n";
import img1 from "@/assets/burgundy-mug.png";

const LANGS = [
  { code: "en", label: "EN", full: "English" },
  { code: "fr", label: "FR", full: "Français" },
  { code: "ar", label: "AR", full: "العربية" },
] as const;

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const [hidden, setHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  // Apply RTL whenever language changes
  useEffect(() => {
    applyRtl(i18n.language);
  }, [i18n.language]);

  const switchLang = (code: string) => {
    i18n.changeLanguage(code);
    applyRtl(code);
    setIsLangOpen(false);
  };

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    setIsScrolled(latest > 50);
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  const currentLang = LANGS.find(l => l.code === i18n.language) ?? LANGS[0];

  return (
    <>
      {/* Announcement Banner */}
      <div className="bg-secondary text-secondary-foreground py-2 text-center text-[10px] uppercase tracking-[0.2em] font-medium z-[60] relative">
        {t("announcement")}
      </div>

      <motion.nav
        variants={{
          visible: { y: 0 },
          hidden: { y: "-100%" },
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className={cn(
          "fixed left-0 right-0 z-50 transition-all duration-300 border-b",
          isScrolled || isCartOpen || isLangOpen || isMenuOpen
            ? "bg-background/80 backdrop-blur-md border-border py-4 top-0"
            : "bg-transparent border-transparent py-6 top-10"
        )}
      >
        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Mobile Menu Trigger */}
          <div className="md:hidden w-1/3">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2"
              data-testid="button-menu-open"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Left Side - Desktop nav links */}
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

          {/* Center - Logo */}
          <div className="w-1/3 flex flex-col items-center">
            <Link href="/">
              <span className="font-serif text-xl md:text-2xl tracking-[0.15em] cursor-pointer text-foreground">
                TURATH COLLECTIVE
              </span>
            </Link>
            <span className="text-[8px] uppercase tracking-[0.4em] text-primary font-bold mt-1">Heritage Craftsmanship</span>
          </div>

          {/* Right Side - icons + compact lang switcher */}
          <div className="flex items-center gap-3 md:gap-4 w-1/3 justify-end">
            {/* Compact inline language toggle (desktop only) */}
            <div className="hidden md:flex items-center gap-1 border border-border/40 rounded-full px-1 py-0.5">
              {LANGS.map(({ code, label }) => (
                <button
                  key={code}
                  onClick={() => switchLang(code)}
                  data-testid={`button-lang-${code}`}
                  className={cn(
                    "px-2 py-1 text-[9px] font-bold uppercase tracking-widest rounded-full transition-all",
                    i18n.language === code
                      ? "bg-primary text-white"
                      : "text-foreground/50 hover:text-foreground"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Globe icon (mobile & fallback for full region dialog) */}
            <button
              onClick={() => setIsLangOpen(true)}
              className="p-1.5 hover:bg-muted rounded-full transition-colors md:hidden"
              data-testid="button-lang-open"
            >
              <Globe className="w-4.5 h-4.5 text-foreground" strokeWidth={1.5} />
            </button>

            <Link href="/login">
              <button className="p-1.5 hover:bg-muted rounded-full transition-colors" data-testid="button-account">
                <User className="w-4.5 h-4.5 text-foreground" strokeWidth={1.5} />
              </button>
            </Link>

            <button
              onClick={() => setIsCartOpen(true)}
              className="p-1.5 hover:bg-muted rounded-full transition-colors relative"
              data-testid="button-cart-open"
            >
              <ShoppingBag className="w-4.5 h-4.5 text-foreground" strokeWidth={1.5} />
              <span className="absolute top-0 right-0 h-3 w-3 bg-primary rounded-full flex items-center justify-center text-[7px] text-white font-bold">2</span>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Drawer */}
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
              <div className="p-8 flex items-center justify-between border-b border-border">
                <span className="font-serif text-xl tracking-[0.1em]">TURATH</span>
                <button onClick={() => setIsMenuOpen(false)} data-testid="button-menu-close"><X className="w-6 h-6" /></button>
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
                  <Link href="/login" onClick={() => setIsMenuOpen(false)} className="block text-3xl font-serif">{t("nav.account")}</Link>
                </div>

                {/* Language switcher in mobile menu */}
                <div className="pt-8 border-t border-border/50">
                  <p className="text-[10px] uppercase tracking-widest font-bold opacity-30 mb-4">{t("lang.label")}</p>
                  <div className="flex gap-3">
                    {LANGS.map(({ code, label, full }) => (
                      <button
                        key={code}
                        onClick={() => { switchLang(code); setIsMenuOpen(false); }}
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

      {/* Language / Region Dialog (mobile globe icon) */}
      <AnimatePresence>
        {isLangOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLangOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-background w-full max-w-md p-8 shadow-2xl rounded-none border border-border"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-serif text-2xl uppercase tracking-wider">{t("lang.region")}</h3>
                <button onClick={() => setIsLangOpen(false)}><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-50">{t("lang.country")}</label>
                  <select className="w-full bg-muted/50 border border-border p-3 text-sm focus:outline-none">
                    <option>Canada (CAD $)</option>
                    <option>United States (USD $)</option>
                    <option>Palestine (ILS ₪)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-50">{t("lang.label")}</label>
                  <div className="flex gap-3">
                    {LANGS.map(({ code, label, full }) => (
                      <button
                        key={code}
                        onClick={() => switchLang(code)}
                        data-testid={`button-dialog-lang-${code}`}
                        className={cn(
                          "flex-1 py-3 text-[10px] font-bold uppercase tracking-widest border transition-all",
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
          </div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
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
              className="fixed right-0 top-0 h-full w-full max-w-md bg-background z-[110] shadow-2xl flex flex-col rtl:right-auto rtl:left-0 rtl:translate-x-0"
            >
              <div className="p-8 flex items-center justify-between border-b border-border">
                <h2 className="font-serif text-2xl uppercase tracking-wider">Your Bag</h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors" data-testid="button-cart-close">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 p-8 overflow-y-auto">
                <div className="flex gap-6 mb-8 rtl:flex-row-reverse">
                  <div className="w-20 h-24 bg-muted"><img src={img1} alt="Product" className="w-full h-full object-cover" /></div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-serif text-lg">Classic Indigo Mug</h4>
                      <p className="text-[10px] uppercase tracking-widest font-bold opacity-40 mt-1">Qty: 1</p>
                    </div>
                    <p className="text-sm font-bold">CAD $38.00</p>
                  </div>
                </div>
              </div>
              <div className="p-8 bg-muted/20 border-t border-border space-y-4">
                <div className="flex justify-between font-bold text-xs uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span>CAD $90.00</span>
                </div>
                <Link href="/checkout">
                  <button className="w-full bg-primary text-white py-5 uppercase tracking-[0.2em] text-[10px] font-bold">Checkout</button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
