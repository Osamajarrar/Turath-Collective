// Placeholder for media assets (product photos, video, large jpg). Real media
// is NOT baked into the design-system bundle — it would blow past the 12 MB
// upload limit and a design system supplies its own imagery anyway. All
// `@/assets/*` image/video imports resolve here via tsconfig.build.json, so
// components render with a neutral branded placeholder instead of real photos.
const PLACEHOLDER =
  "data:image/svg+xml," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'>" +
      "<rect width='100%' height='100%' fill='#f5f3f0'/>" +
      "<rect x='1' y='1' width='598' height='598' fill='none' stroke='#3A0606' stroke-opacity='0.15'/>" +
      "<text x='50%' y='50%' font-family='Playfair Display, serif' font-size='34' fill='#3A0606' fill-opacity='0.4' text-anchor='middle' dominant-baseline='middle'>Turath</text>" +
      "</svg>",
  );

export default PLACEHOLDER;
