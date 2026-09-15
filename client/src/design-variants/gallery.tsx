import { Link } from "wouter";
import PageLayout from "@/components/PageLayout";
import { DESIGN_VARIANTS } from "./registry";
import { useNoIndex } from "./useNoIndex";

/**
 * /design — the menu. Lists every homepage variant collected from the design
 * branches so they can be opened and compared one at a time.
 *
 * Internal preview surface: not linked from the navbar or footer, noindexed,
 * and not translated (see VariantSwitcher for why).
 */
export default function DesignGallery() {
  useNoIndex("Homepage design variants");

  return (
    <PageLayout>
      <div className="mx-auto max-w-3xl px-6 py-20 md:py-28">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Internal preview
        </p>
        <h1 className="mt-4 font-serif text-3xl md:text-4xl text-foreground">
          Homepage design variants
        </h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Six directions explored on separate branches, collected here so they
          can be opened side by side. The live homepage is unchanged — each
          variant keeps its own copies of the components it altered.
        </p>

        <ul className="mt-12 border-t border-border">
          {DESIGN_VARIANTS.map((variant) => (
            <li key={variant.id} className="border-b border-border">
              <Link
                href={`/design/${variant.id}`}
                data-testid={`link-variant-${variant.id}`}
                className="group block py-8 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="font-serif text-xl text-foreground">
                    {variant.label}
                  </h2>
                  <span
                    aria-hidden="true"
                    className="text-muted-foreground transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                  >
                    →
                  </span>
                </div>
                <p className="mt-3 max-w-xl text-sm text-muted-foreground">
                  {variant.description}
                </p>
                {variant.note && (
                  <p className="mt-2 max-w-xl text-sm text-foreground/70">
                    {variant.note}
                  </p>
                )}
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {variant.branch}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </PageLayout>
  );
}
