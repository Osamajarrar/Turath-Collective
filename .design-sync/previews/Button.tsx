import { Button } from "turath-collective";

export function Primary() {
  return <Button>Add to Cart</Button>;
}

export function Variants() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="default">Shop Collection</Button>
      <Button variant="secondary">View Story</Button>
      <Button variant="outline">Learn More</Button>
      <Button variant="ghost">Details</Button>
      <Button variant="destructive">Remove</Button>
      <Button variant="link">Read the journal</Button>
    </div>
  );
}

export function Sizes() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Add to Cart</Button>
    </div>
  );
}

export function Disabled() {
  return <Button disabled>Sold Out</Button>;
}
