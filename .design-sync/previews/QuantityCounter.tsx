import { QuantityCounter } from "turath-collective";

const noop = () => {};

export function Default() {
  return <QuantityCounter quantity={2} setQuantity={noop} availableQuantity={10} />;
}

export function FullWidth() {
  return (
    <div className="w-[280px] max-w-full">
      <QuantityCounter quantity={1} setQuantity={noop} availableQuantity={10} fullWidth />
    </div>
  );
}
