import { ColorSwatch } from "turath-collective";

const noop = () => {};

export function Options() {
  return (
    <div className="flex items-center gap-4">
      <ColorSwatch color="Maroon" hex="#3A0606" isSelected isOutOfStock={false} onClick={noop} />
      <ColorSwatch color="Forest" hex="#262C1B" isSelected={false} isOutOfStock={false} onClick={noop} />
      <ColorSwatch color="Cream" hex="#F5F3F0" isSelected={false} isOutOfStock={false} onClick={noop} showBorder />
      <ColorSwatch color="Sand" hex="#D8CFC2" isSelected={false} isOutOfStock onClick={noop} />
    </div>
  );
}

export function Sizes() {
  return (
    <div className="flex items-center gap-4">
      <ColorSwatch color="Maroon" hex="#3A0606" isSelected size="sm" isOutOfStock={false} onClick={noop} />
      <ColorSwatch color="Maroon" hex="#3A0606" isSelected size="md" isOutOfStock={false} onClick={noop} />
    </div>
  );
}
