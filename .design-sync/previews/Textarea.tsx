import { Textarea, Label } from "turath-collective";

export function Default() {
  return (
    <Textarea
      placeholder="Tell us about your order…"
      className="w-[360px] max-w-full"
    />
  );
}

export function WithLabel() {
  return (
    <div className="grid w-[360px] max-w-full gap-2">
      <Label htmlFor="msg">Message</Label>
      <Textarea id="msg" placeholder="How can we help?" rows={4} />
    </div>
  );
}
