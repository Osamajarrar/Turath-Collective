import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "turath-collective";

export function TwoPanels() {
  return (
    <div className="h-[220px] w-[420px] max-w-full overflow-hidden rounded-md border">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={40}>
          <div className="flex h-full items-center justify-center p-4 text-sm">
            Filters
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={60}>
          <div className="flex h-full items-center justify-center p-4 text-sm">
            Collection
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
