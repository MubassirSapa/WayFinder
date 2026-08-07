import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ChevronUp, Search, X } from "lucide-react";

import { formatFloorLabel, formatObjectTypeLabel } from "../lib/mapViewerViewport";
import type { ViewerFloor, ViewerMapObject } from "../types/map-viewer.types";

// A drag on the handle past this many pixels counts as an intentional
// expand/collapse swipe rather than an accidental tap-and-wobble.
const SHEET_DRAG_THRESHOLD = 24;

interface MapViewerSidebarProps {
  activeFloor: ViewerFloor | null;
  activeFloorId: string | null;
  floors: ViewerFloor[];
  isMobileExpanded: boolean;
  routePanelSlot?: ReactNode;
  search: string;
  searchableObjects: ViewerMapObject[];
  selectedObject: ViewerMapObject | null;
  selectedObjectId: string | null;
  selectionActionsSlot?: ReactNode;
  onExpandedHeightChange?: (height: number) => void;
  onFocusObject: (object: ViewerMapObject) => void;
  onFloorChange: (floorId: string) => void;
  onMobileExpandedChange: (expanded: boolean) => void;
  onSearchChange: (value: string) => void;
}

function AccordionSearchInput({
  onChange,
  placeholder,
  value,
  ...props
}: {
  disabled?: boolean;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <div className="relative mb-2">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        className="h-10 rounded-xl border-border bg-background pl-9 text-sm"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type="text"
        value={value}
        {...props}
      />
    </div>
  );
}

export function MapViewerSidebar({
  activeFloor,
  activeFloorId,
  floors,
  isMobileExpanded,
  routePanelSlot,
  search,
  searchableObjects,
  selectedObject,
  selectedObjectId,
  selectionActionsSlot,
  onExpandedHeightChange,
  onFocusObject,
  onFloorChange,
  onMobileExpandedChange,
  onSearchChange,
}: MapViewerSidebarProps) {
  const [floorSearch, setFloorSearch] = useState("");
  const visibleFloors = floorSearch.trim()
    ? floors.filter((floor) => floor.name.toLowerCase().includes(floorSearch.trim().toLowerCase()))
    : floors;

  const dragStartYRef = useRef<number | null>(null);
  const asideRef = useRef<HTMLElement>(null);

  // Reports the sheet's real, content-driven height once when it opens - not
  // a fixed guess (it isn't always the full 80dvh cap; "Get directions" with
  // no route computed yet is much shorter). scrollHeight reflects the full
  // content extent regardless of the outer max-height clip still animating,
  // so this reads correctly before that transition even finishes. Only fires
  // on open/close, not continuously, so anything driven by it (the corner
  // controls lifting above the sheet) gets one clean target to transition
  // toward instead of following a noisy, constantly-changing value.
  useLayoutEffect(() => {
    if (!isMobileExpanded || !onExpandedHeightChange) {
      return;
    }

    const node = asideRef.current;
    if (!node) {
      return;
    }

    onExpandedHeightChange(Math.min(node.scrollHeight, window.innerHeight * 0.8));
  }, [isMobileExpanded, onExpandedHeightChange]);

  const handleHandlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    dragStartYRef.current = event.clientY;
    // Without this, moving the pointer off the (small, collapsed) handle
    // mid-drag hands subsequent events to whatever's now underneath it —
    // usually the map — so pointerup never reaches this handler at all.
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleHandlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const startY = dragStartYRef.current;
    dragStartYRef.current = null;
    if (startY === null) {
      return;
    }

    const delta = event.clientY - startY;
    if (delta < -SHEET_DRAG_THRESHOLD) {
      onMobileExpandedChange(true);
    } else if (delta > SHEET_DRAG_THRESHOLD) {
      onMobileExpandedChange(false);
    } else {
      // Too small to be a swipe — treat it as a plain tap toggle instead.
      onMobileExpandedChange(!isMobileExpanded);
    }
  };

  return (
    <aside
      className={[
        "fixed inset-x-0 bottom-0 z-30 flex flex-col overflow-hidden rounded-t-3xl border border-border bg-card/95 shadow-2xl backdrop-blur-md transition-[max-height] duration-300 ease-out",
        isMobileExpanded ? "max-h-[80dvh]" : "max-h-17",
        "md:static md:inset-auto md:z-auto md:order-0 md:h-full md:max-h-none md:min-h-0 md:rounded-3xl md:border md:bg-card/80 md:shadow-sm lg:rounded-4xl",
      ].join(" ")}
      ref={asideRef}
    >
      <div
        className="shrink-0 cursor-pointer touch-none select-none border-b border-border px-5 py-3 md:cursor-default md:py-4"
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onMobileExpandedChange(!isMobileExpanded);
          }
        }}
        onPointerDown={handleHandlePointerDown}
        onPointerUp={handleHandlePointerUp}
        role="button"
        tabIndex={0}
        aria-expanded={isMobileExpanded}
        aria-label="Toggle the map sidebar"
      >
        <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-border md:hidden" />
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold">Navigate</h2>
          {isMobileExpanded ? (
            <button
              aria-label="Close navigation panel"
              className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
              onClick={(event) => {
                event.stopPropagation();
                onMobileExpandedChange(false);
              }}
              onPointerDown={(event) => event.stopPropagation()}
              onPointerUp={(event) => event.stopPropagation()}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <ChevronUp aria-hidden className="h-4 w-4 text-muted-foreground transition-transform duration-300 md:hidden" />
          )}
        </div>
      </div>

      <div
        className={[
          "space-y-5 overflow-y-auto p-5 transition-opacity duration-200",
          isMobileExpanded ? "opacity-100" : "pointer-events-none max-h-0 opacity-0",
          "md:pointer-events-auto md:min-h-0 md:max-h-none md:flex-1 md:opacity-100",
        ].join(" ")}
      >
        {routePanelSlot ? (
          <>
            {routePanelSlot}
            <Separator className="hidden md:block" />
          </>
        ) : null}

        {/* Floor/Rooms browsing is a desktop-only convenience on this page —
            mobile keeps just "Get directions" visible so the sheet stays
            short and focused instead of also duplicating floor/room
            browsing that's already reachable from the header and search. */}
        <Accordion multiple defaultValue={[]} className="hidden rounded-2xl border-border bg-background md:flex">
          <AccordionItem value="floor" className="data-open:bg-transparent">
            <AccordionTrigger className="items-center px-4 py-3 no-underline hover:bg-accent/50 hover:no-underline">
              <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                <span className="text-sm font-semibold">Floor</span>
                {activeFloor ? (
                  <Badge variant="outline" className="shrink-0">{activeFloor.name}</Badge>
                ) : null}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-3">
              {floors.length > 1 ? (
                <AccordionSearchInput
                  onChange={setFloorSearch}
                  placeholder="Search floors..."
                  value={floorSearch}
                />
              ) : null}
              <div className="grid gap-1">
                {visibleFloors.length === 0 ? (
                  <p className="px-3 py-4 text-sm text-muted-foreground">No floors match &ldquo;{floorSearch}&rdquo;.</p>
                ) : (
                  visibleFloors.map((floor) => {
                    const isActive = floor.id === activeFloorId;

                    return (
                      <button
                        key={floor.id}
                        className={[
                          "flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-left transition-colors",
                          isActive
                            ? "bg-accent text-accent-foreground"
                            : "text-foreground hover:bg-accent/60",
                        ].join(" ")}
                        onClick={() => onFloorChange(floor.id)}
                        type="button"
                      >
                        <span className="truncate text-sm font-medium">{floor.name}</span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatFloorLabel(floor)}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="rooms" className="border-t border-border data-open:bg-transparent">
            <AccordionTrigger className="items-center px-4 py-3 no-underline hover:bg-accent/50 hover:no-underline">
              <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                <span className="text-sm font-semibold">Rooms</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {searchableObjects.length} visible
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-3">
              <AccordionSearchInput
                disabled={!activeFloor}
                onChange={onSearchChange}
                placeholder="Search rooms, exits, POIs..."
                value={search}
              />
              <ScrollArea className="h-55 pr-3 sm:h-70">
                <div className="grid gap-1">
                  {searchableObjects.length === 0 ? (
                    <p className="px-3 py-4 text-sm text-muted-foreground">
                      No rooms match this floor.
                    </p>
                  ) : (
                    searchableObjects.map((object) => (
                      <button
                        key={object.id}
                        className={[
                          "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left transition-colors",
                          selectedObjectId === object.id
                            ? "bg-accent text-accent-foreground"
                            : "text-foreground hover:bg-accent/60",
                        ].join(" ")}
                        onClick={() => onFocusObject(object)}
                        type="button"
                      >
                        <span className="truncate text-sm font-medium">
                          {object.label || object.name}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatObjectTypeLabel(object.type)}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {selectedObject ? (
          <div className="rounded-3xl border border-border bg-muted/35 p-4">
            <h3 className="text-sm font-semibold">Selection</h3>
            <div className="mt-3 space-y-2 text-sm">
              <p className="text-base font-semibold">
                {selectedObject.label || selectedObject.name}
              </p>
              <p className="text-muted-foreground">
                {formatObjectTypeLabel(selectedObject.type)} on {activeFloor?.name}
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge variant="outline">
                  {selectedObject.isAccessible ? "Accessible" : "Not marked accessible"}
                </Badge>
                <Badge variant="outline">
                  {Math.round(selectedObject.width)} x {Math.round(selectedObject.height)}
                </Badge>
              </div>
              {selectionActionsSlot}
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
