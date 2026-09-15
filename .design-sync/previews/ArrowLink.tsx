import { ArrowLink } from "turath-collective";

export function Default() {
  return <ArrowLink href="/shop">Shop the collection</ArrowLink>;
}

export function InContext() {
  return (
    <div className="max-w-sm space-y-3">
      <h3 className="font-serif text-2xl">Our Story</h3>
      <p className="text-sm text-muted-foreground">
        Rooted in heritage, made by hand in Montreal.
      </p>
      <ArrowLink href="/about">Read our story</ArrowLink>
    </div>
  );
}
