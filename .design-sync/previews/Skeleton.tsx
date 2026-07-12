import { Skeleton } from "turath-collective";

export function ProductCard() {
  return (
    <div className="w-[240px] max-w-full">
      <Skeleton className="aspect-square w-full rounded-md" />
      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

export function TextLines() {
  return (
    <div className="w-[320px] max-w-full space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}
