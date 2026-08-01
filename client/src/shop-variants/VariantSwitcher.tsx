import { useState } from "react";
import { Link } from "wouter";
import { FILTER_STRATEGIES } from "./strategies";

/**
 * Floating switcher so the five groupings can be compared without going back
 * to the menu each time — the only way to judge them is to flick between them
 * at the same scroll position.
 */
export default function VariantSwitcher({ activeId }: { activeId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-[90] print:hidden">
      {open && (
        <div className="mb-3 w-64 border border-border bg-background shadow-lg">
          <p className="border-b border-border px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Filter variants
          </p>
          {FILTER_STRATEGIES.map((strategy) => (
            <Link
              key={strategy.id}
              href={`/shop-filters/${strategy.id}`}
              onClick={() => setOpen(false)}
              className={`block px-4 py-3 text-sm transition-colors hover:bg-muted ${
                strategy.id === activeId
                  ? "font-medium text-foreground"
                  : "font-light text-muted-foreground"
              }`}
            >
              {strategy.label}
            </Link>
          ))}
          <Link
            href="/shop-filters"
            onClick={() => setOpen(false)}
            className="block border-t border-border px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:bg-muted"
          >
            All variants
          </Link>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="border border-border bg-background px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground shadow-lg transition-colors hover:bg-muted"
      >
        {open ? "Close" : "Variants"}
      </button>
    </div>
  );
}
