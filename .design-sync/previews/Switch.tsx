import { Switch, Label } from "turath-collective";

export function Off() {
  return <Switch />;
}

export function On() {
  return <Switch defaultChecked />;
}

export function WithLabel() {
  return (
    <div className="flex items-center gap-3">
      <Switch id="newsletter" defaultChecked />
      <Label htmlFor="newsletter">Subscribe to the Turath Circle</Label>
    </div>
  );
}

export function Disabled() {
  return <Switch disabled />;
}
