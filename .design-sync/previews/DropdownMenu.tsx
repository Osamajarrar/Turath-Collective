import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Button,
} from "turath-collective";

export function Open() {
  return (
    <div className="flex justify-center py-4">
      <DropdownMenu open>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Sort by</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Sort collection</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Newest arrivals</DropdownMenuItem>
          <DropdownMenuItem>Price: low to high</DropdownMenuItem>
          <DropdownMenuItem>Price: high to low</DropdownMenuItem>
          <DropdownMenuItem>Bestselling</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
