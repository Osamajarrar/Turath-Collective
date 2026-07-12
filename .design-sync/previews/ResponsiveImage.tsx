import { ResponsiveImage } from "turath-collective";

const IMG =
  "data:image/svg+xml," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='480' height='600'>" +
      "<rect width='100%' height='100%' fill='#eae5df'/>" +
      "<text x='50%' y='50%' font-family='Playfair Display, serif' font-size='34' fill='#3A0606' fill-opacity='0.4' text-anchor='middle' dominant-baseline='middle'>Turath</text></svg>",
  );

export function ProductGrid() {
  return (
    <div className="w-[240px] max-w-full overflow-hidden rounded-md">
      <ResponsiveImage src={IMG} alt="Handmade ceramic vase" layout="product-grid" />
    </div>
  );
}
