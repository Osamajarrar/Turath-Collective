import { Input, Label } from "turath-collective";

export function Default() {
  return <Input placeholder="you@example.com" className="w-[320px] max-w-full" />;
}

export function WithLabel() {
  return (
    <div className="grid w-[320px] max-w-full gap-2">
      <Label htmlFor="email">Email address</Label>
      <Input id="email" type="email" placeholder="you@example.com" />
    </div>
  );
}

export function Disabled() {
  return (
    <Input
      disabled
      placeholder="Notify me when back in stock"
      className="w-[320px] max-w-full"
    />
  );
}
