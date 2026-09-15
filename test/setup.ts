import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Image imports (`@/assets/*.png`) resolve to URL strings under Vite; jsdom
// does not fetch them, so nothing else is needed for them here.

// jsdom implements no media queries at all, but useReducedMotion (and any
// component using it, e.g. the consent dialog) calls matchMedia on mount.
// Default to "no preference" — the animated path — so tests exercise what a
// typical visitor sees rather than the reduced-motion shortcut.
if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

afterEach(() => {
  cleanup();
});

// localStorage is real in jsdom but shared between test files in the same
// worker. Cart tests depend on a clean slate (the cart ID is persisted there).
beforeEach(() => {
  localStorage.clear();
});
