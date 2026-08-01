import { useEffect } from "react";

/**
 * Keeps the /shop-filters preview pages out of search results.
 *
 * Deliberately a private copy of design-variants/useNoIndex.ts rather than an
 * import: that directory gets deleted once a homepage design is chosen, and
 * this gallery must not break when it goes.
 */
export function useNoIndex(title: string) {
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);

    const previousTitle = document.title;
    document.title = title;

    return () => {
      meta.remove();
      document.title = previousTitle;
    };
  }, [title]);
}
