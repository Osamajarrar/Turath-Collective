import { useEffect } from "react";

/**
 * Keeps the /design preview pages out of search results.
 *
 * The site has no head-management library, so this adds and removes a single
 * <meta name="robots" content="noindex, nofollow"> for as long as a preview
 * page is mounted. These pages exist to compare unfinished homepage designs —
 * they should never be indexed, and they should never be the thing someone
 * finds when searching for the brand.
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
