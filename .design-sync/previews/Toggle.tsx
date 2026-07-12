import { Toggle } from "turath-collective";
import { Heart } from "lucide-react";

export function Default() {
  return <Toggle aria-label="Save to wishlist">Save</Toggle>;
}

export function Pressed() {
  return (
    <Toggle defaultPressed aria-label="Saved to wishlist">
      <Heart />
      Saved
    </Toggle>
  );
}

export function Outline() {
  return (
    <Toggle variant="outline" aria-label="Toggle gift wrap">
      Gift wrap
    </Toggle>
  );
}

export function Sizes() {
  return (
    <div className="flex items-center gap-3">
      <Toggle size="sm" variant="outline">S</Toggle>
      <Toggle size="default" variant="outline">M</Toggle>
      <Toggle size="lg" variant="outline">L</Toggle>
    </div>
  );
}
