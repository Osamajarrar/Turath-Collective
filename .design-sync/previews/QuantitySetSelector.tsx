import { QuantitySetSelector } from "turath-collective";

const noop = () => {};

export function Default() {
  return <QuantitySetSelector quantity={2} setQuantity={noop} maxSets={4} />;
}
