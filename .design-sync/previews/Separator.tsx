import { Separator } from "turath-collective";

export function Horizontal() {
  return (
    <div className="w-[320px] max-w-full">
      <div className="space-y-1">
        <h4 className="font-serif text-lg">Turath Collective</h4>
        <p className="text-sm text-muted-foreground">Heritage craftsmanship</p>
      </div>
      <Separator className="my-4" />
      <div className="flex h-5 items-center gap-4 text-sm">
        <span>Ceramics</span>
        <Separator orientation="vertical" />
        <span>Embroidery</span>
        <Separator orientation="vertical" />
        <span>Classics</span>
      </div>
    </div>
  );
}
