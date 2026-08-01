import { useState } from "react";
import { Link } from "wouter";
import { DESIGN_VARIANTS } from "./registry";

/**
 * Floating control for hopping between homepage variants without going back
 * to /design.
 *
 * This is preview chrome, not site copy — its labels are the variant names as
 * used in the design conversation, so it deliberately does NOT go through
 * i18n. Adding preview-only keys to the production locale namespaces would put
 * strings in front of translators that no visitor will ever see.
 *
 * Positioned bottom-right and collapsed by default so it stays clear of the
 * Mobile Narrative variant's own bottom CTA bar (fixed, z-40). Sits at z-50 —
 * above that bar, below the cart drawer (z-[100]/z-[110]).
 */
export default function VariantSwitcher({ activeId }: { activeId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 print:hidden">
      {open && (
        <nav
          aria-label="Homepage design variants"
          className="flex w-60 flex-col overflow-hidden border border-border bg-background shadow-lg"
        >
          <Link
            href="/design"
            className="border-b border-border px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
          >
            All variants
          </Link>
          {DESIGN_VARIANTS.map((variant) => {
            const isActive = variant.id === activeId;
            return (
              <Link
                key={variant.id}
                href={`/design/${variant.id}`}
                aria-current={isActive ? "page" : undefined}
                className={`border-b border-border px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] last:border-b-0 transition-colors ${
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {variant.label}
              </Link>
            );
          })}
        </nav>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        data-testid="button-variant-switcher"
        className="border border-border bg-background px-4 py-3 min-h-[44px] text-[10px] font-bold uppercase tracking-[0.2em] text-foreground shadow-lg transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {open ? "Close" : "Variants"}
      </button>
    </div>
  );
}
