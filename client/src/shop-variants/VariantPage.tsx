import { useRoute } from "wouter";
import NotFound from "@/pages/not-found";
import ShopPreview from "./ShopPreview";
import VariantSwitcher from "./VariantSwitcher";
import { getFilterStrategy } from "./strategies";
import { useNoIndex } from "./useNoIndex";

/** Renders one shop-filtering variant at /shop-filters/:variant. */
export default function ShopVariantPage() {
  const [, params] = useRoute("/shop-filters/:variant");
  const strategy = getFilterStrategy(params?.variant);

  useNoIndex(strategy ? `${strategy.label} — shop filter preview` : "Shop filter preview");

  if (!strategy) return <NotFound />;

  return (
    <>
      {/* A visible banner, not just a noindex tag: these pages are reachable
          by URL and must never be mistaken for the real shop. */}
      <div className="sticky top-0 z-[80] bg-foreground px-4 py-2 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-background">
        Preview — {strategy.label}. Not the real shop.
      </div>
      <ShopPreview strategy={strategy} />
      <VariantSwitcher activeId={strategy.id} />
    </>
  );
}
