import { Suspense } from "react";
import { useRoute } from "wouter";
import NotFound from "@/pages/not-found";
import { getDesignVariant } from "./registry";
import VariantSwitcher from "./VariantSwitcher";
import { useNoIndex } from "./useNoIndex";

/** Renders one homepage variant at /design/:variant, with the switcher on top. */
export default function VariantPage() {
  const [, params] = useRoute("/design/:variant");
  const variant = getDesignVariant(params?.variant);

  useNoIndex(variant ? `${variant.label} — design preview` : "Design preview");

  if (!variant) return <NotFound />;

  const Page = variant.component;

  return (
    <>
      <Suspense fallback={null}>
        <Page />
      </Suspense>
      <VariantSwitcher activeId={variant.id} />
    </>
  );
}
