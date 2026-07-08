import { Alert, AlertTitle, AlertDescription } from "turath-collective";
import { Info, Truck } from "lucide-react";

export function Default() {
  return (
    <Alert>
      <Truck />
      <AlertTitle>Free shipping over $100 CAD</AlertTitle>
      <AlertDescription>
        Your order ships from our Montreal studio within 2–3 business days.
      </AlertDescription>
    </Alert>
  );
}

export function Informational() {
  return (
    <Alert>
      <Info />
      <AlertTitle>Each piece is one of a kind</AlertTitle>
      <AlertDescription>
        Slight variations in glaze and form are the mark of genuine hand craft.
      </AlertDescription>
    </Alert>
  );
}

export function Destructive() {
  return (
    <Alert variant="destructive">
      <AlertTitle>Payment could not be processed</AlertTitle>
      <AlertDescription>
        Please check your card details and try again.
      </AlertDescription>
    </Alert>
  );
}
