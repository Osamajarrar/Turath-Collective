import { Tooltip, TooltipTrigger, TooltipContent, Button } from "turath-collective";

export function Open() {
  return (
    <div className="flex items-center justify-center py-10">
      <Tooltip open>
        <TooltipTrigger asChild>
          <Button variant="outline">Add to wishlist</Button>
        </TooltipTrigger>
        <TooltipContent>Save this piece for later</TooltipContent>
      </Tooltip>
    </div>
  );
}
