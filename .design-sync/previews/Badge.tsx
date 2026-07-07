import { Badge } from "turath-collective";

export function Variants() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Badge variant="default">New</Badge>
      <Badge variant="secondary">Handmade</Badge>
      <Badge variant="destructive">Sold Out</Badge>
      <Badge variant="outline">Limited Edition</Badge>
    </div>
  );
}

export function OnProduct() {
  return (
    <div className="flex items-center gap-3">
      <Badge>Bestseller</Badge>
      <Badge variant="secondary">Made in Montreal</Badge>
    </div>
  );
}
