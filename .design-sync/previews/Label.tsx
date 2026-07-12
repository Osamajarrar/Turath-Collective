import { Label, Input } from "turath-collective";

export function WithInput() {
  return (
    <div className="grid w-[320px] max-w-full gap-2">
      <Label htmlFor="full-name">Full name</Label>
      <Input id="full-name" placeholder="Elena Haddad" />
    </div>
  );
}
