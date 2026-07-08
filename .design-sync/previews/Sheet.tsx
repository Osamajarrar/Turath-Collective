import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  Button,
} from "turath-collective";

export function CartDrawer() {
  return (
    <Sheet open>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Your cart</SheetTitle>
          <SheetDescription>
            Handmade in Montreal, shipped with care.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 space-y-4 py-6 text-sm">
          <div className="flex justify-between">
            <span>Burgundy Bowl</span>
            <span>$68.00</span>
          </div>
          <div className="flex justify-between">
            <span>Classic Mug</span>
            <span>$42.00</span>
          </div>
        </div>
        <SheetFooter>
          <Button className="w-full">Checkout · $110.00</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
