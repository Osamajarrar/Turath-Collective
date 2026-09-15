import { SuggestedProductCard } from "turath-collective";

const IMG =
  "data:image/svg+xml," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='400' height='500'>" +
      "<rect width='100%' height='100%' fill='#eae5df'/>" +
      "<text x='50%' y='50%' font-family='Playfair Display, serif' font-size='30' fill='#3A0606' fill-opacity='0.4' text-anchor='middle' dominant-baseline='middle'>Turath</text></svg>",
  );

export function Default() {
  return (
    <div className="w-[240px] max-w-full">
      <SuggestedProductCard
        product={{
          id: "1",
          handle: "burgundy-bowl",
          name: "Burgundy Bowl",
          price: 68,
          currencyCode: "CAD",
          isBestSeller: true,
          variations: [{ color: "Maroon", images: [IMG] }],
        }}
      />
    </div>
  );
}
