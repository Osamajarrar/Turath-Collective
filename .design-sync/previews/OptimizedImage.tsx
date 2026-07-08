import { OptimizedImage } from "turath-collective";

const IMG =
  "data:image/svg+xml," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='480' height='480'>" +
      "<rect width='100%' height='100%' fill='#eae5df'/>" +
      "<text x='50%' y='50%' font-family='Playfair Display, serif' font-size='34' fill='#3A0606' fill-opacity='0.4' text-anchor='middle' dominant-baseline='middle'>Turath</text></svg>",
  );

export function Default() {
  return (
    <div className="w-[280px] max-w-full overflow-hidden rounded-md">
      <OptimizedImage src={IMG} alt="Handmade ceramic bowl" />
    </div>
  );
}
