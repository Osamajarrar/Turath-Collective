import { ProductImageCarousel } from "turath-collective";

const img = (n: number) =>
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='500'><rect width='100%' height='100%' fill='#eae5df'/><text x='50%' y='50%' font-family='Playfair Display, serif' font-size='60' fill='#3A0606' fill-opacity='0.35' text-anchor='middle' dominant-baseline='middle'>${n}</text></svg>`,
  );

const noop = () => {};

export function Default() {
  return (
    <div className="w-[360px] max-w-full">
      <ProductImageCarousel
        images={[img(1), img(2), img(3), img(4)]}
        selectedImageIdx={0}
        onImageSelect={noop}
        productName="Burgundy Bowl"
      />
    </div>
  );
}
