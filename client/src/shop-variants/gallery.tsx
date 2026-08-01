import { Link } from "wouter";
import PageLayout from "@/components/PageLayout";
import { FILTER_STRATEGIES } from "./strategies";
import { useNoIndex } from "./useNoIndex";

/**
 * The menu at /shop-filters — five ways the shop could group its products,
 * each with the honest case for and against.
 *
 * Internal tooling: not linked from the navbar or footer, noindexed, and
 * lazy-loaded so none of it lands in the main bundle.
 */
export default function ShopFilterGallery() {
  useNoIndex("Shop filter variants");

  return (
    <PageLayout>
      <div className="container mx-auto px-6 md:px-12">
        <div className="mx-auto max-w-3xl">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.4em] text-primary">
            Internal preview
          </p>
          <h1 className="mb-6 font-serif text-5xl">Shop filtering</h1>
          <p className="mb-4 font-light leading-relaxed text-muted-foreground">
            Five ways to group the shop. Each opens a working preview using the
            same catalogue and the same sort function as the real shop, so the
            only thing that differs between them is the grouping itself.
          </p>
          <p className="mb-12 font-light leading-relaxed text-muted-foreground">
            The real shop is untouched — it still filters by craft. Judge these
            on a phone as well as a desktop: a filter bar costs far more of the
            screen there, which is where most ad traffic will land.
          </p>

          <div className="space-y-10">
            {FILTER_STRATEGIES.map((strategy) => (
              <div key={strategy.id} className="border-t border-border pt-8">
                <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
                  <h2 className="font-serif text-2xl text-foreground">{strategy.label}</h2>
                  <Link
                    href={`/shop-filters/${strategy.id}`}
                    className="border-b border-primary/30 pb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary transition-colors hover:border-primary"
                  >
                    Open preview →
                  </Link>
                </div>

                <p className="mb-4 font-light leading-relaxed text-muted-foreground">
                  {strategy.description}
                </p>

                <dl className="space-y-2 text-sm font-light">
                  <div>
                    <dt className="inline text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
                      For —{" "}
                    </dt>
                    <dd className="inline text-muted-foreground">{strategy.argues}</dd>
                  </div>
                  <div>
                    <dt className="inline text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
                      Against —{" "}
                    </dt>
                    <dd className="inline text-muted-foreground">{strategy.against}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>

          <div className="mt-16 border-t border-border pt-8">
            <p className="text-sm font-light leading-relaxed text-muted-foreground">
              Once one is chosen: apply it to{" "}
              <code className="text-foreground">client/src/pages/shop.tsx</code>, then delete{" "}
              <code className="text-foreground">client/src/shop-variants/</code> and the two{" "}
              <code className="text-foreground">/shop-filters</code> routes in{" "}
              <code className="text-foreground">App.tsx</code>. If “By use” wins it needs a real
              product field first — the preview infers it from the product name, which is fine to
              look at and must not ship.
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
