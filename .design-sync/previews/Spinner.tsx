import { Spinner } from "turath-collective";

export function Default() {
  return <Spinner className="text-primary" />;
}

export function Large() {
  return <Spinner className="size-8 text-primary" />;
}

export function WithText() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Spinner className="text-primary" />
      <span>Preparing your order…</span>
    </div>
  );
}
