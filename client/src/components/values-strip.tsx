import { Hand, MapPin, Package } from "lucide-react";
import { useTranslation } from "react-i18next";

// Slim, claim-safe trust strip shown directly under the hero. Replaces
// scarcity/social-proof messaging with three facts already true of the
// brand's positioning (see CLAUDE.md honesty framework) — no shipping,
// returns, or ratings claims belong here.
const ITEMS = [
  { icon: Hand, key: "handmade" },
  { icon: MapPin, key: "heritageCraft" },
  { icon: Package, key: "smallBatches" },
] as const;

export default function ValuesStrip() {
  const { t } = useTranslation("common");

  return (
    <section className="border-y border-border bg-background">
      <div className="container mx-auto px-6 md:px-12 max-w-[1820px]">
        <div className="grid grid-cols-1 divide-y divide-border md:grid-cols-3 md:divide-y-0 md:divide-x">
          {ITEMS.map(({ icon: Icon, key }) => (
            <div
              key={key}
              className="flex items-center gap-4 py-6 md:justify-center md:px-6"
              data-testid={`values-strip-${key}`}
            >
              <Icon className="h-5 w-5 shrink-0 text-primary" strokeWidth={1.5} aria-hidden="true" />
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
                  {t(`valuesStrip.${key}.label`)}
                </span>
                <span className="block text-sm text-muted-foreground font-light">
                  {t(`valuesStrip.${key}.description`)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
