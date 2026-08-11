"use client";

import { useEffect, type ReactNode } from "react";
import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { ViewerFloor, ViewerMapNode, ViewerMapObject } from "@/features/map-viewer/types/map-viewer.types";

import { useAppStore } from "@/store";
import type { RouteGraphAdjacency } from "../types/navigation.types";
import { RouteSearchFields } from "./RouteSearchFields";

interface MapSelectionBarProps {
  floors: ViewerFloor[];
  graph: RouteGraphAdjacency;
  isDestination: boolean;
  isOrigin: boolean;
  label: string | null;
  nodes: ViewerMapNode[];
  onClose: () => void;
  routeNodeId: string | null;
  searchableObjects: ViewerMapObject[];
  startNodeId: string | null;
}

// Shared shell for every drawer hinging off the bar's bottom edge - only the
// content differs per drawer. A future second drawer is another instance of
// this with different children, not another copy of this positioning/
// animation CSS.
function MapSelectionDrawer({ children, isOpen }: { children: ReactNode; isOpen: boolean }) {
  return (
    <div
      className={cn(
        // Height sizes to content (2 fields + the toggle, by default a lot
        // shorter than the old fixed height was) and only grows - up to this
        // cap, then scrolls - when there's actually more to show, like an
        // autocomplete list while a field is focused. left-0, not centered:
        // the bar itself is now left-anchored and grows rightward from a
        // fixed left edge, not symmetrically from its center - a centered
        // drawer would visibly drift sideways as the bar's own center point
        // shifted during that grow animation. Sharing the same fixed left
        // edge keeps both anchored together with nothing to drift.
        //
        // -left-px, not left-0: an absolutely positioned element's offset is
        // measured from its containing block's *padding* edge, not its
        // outer border edge - the bar has a 1px border, so left-0 lands 1px
        // inside that border, shifting the drawer's whole box (same width)
        // 1px right of the bar's actual outer edge. -left-px cancels that
        // exactly, so the two right edges land on the same pixel.
        "pointer-events-auto absolute -left-px top-full z-40 max-h-[60dvh] w-[min(92vw,26rem)] origin-top-left overflow-y-auto rounded-b-3xl border border-t-0 border-border bg-card/95 p-4 shadow-2xl backdrop-blur-xl transition-[opacity,transform] duration-200 ease-out",
        isOpen
          ? "translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-1 opacity-0",
      )}
    >
      {children}
    </div>
  );
}

// A persistent floating toolbar over the map, not just a "something's
// selected" pill: the search trigger is always here, and the selected
// object's own Start-here/Route-here actions slide in alongside it once
// something's actually selected. The bar only ever has two widths - compact
// (just the trigger) or one fixed expanded width, never something in
// between driven by label length - so selecting a short vs. a long room
// name (or opening the drawer with nothing selected at all) always produces
// the exact same bar, and its row never needs to scroll internally (the
// label just truncates harder instead). The drawer hinges flush off the
// bar's own bottom edge, squaring the bar's bottom corners while open, so
// it reads as one continuous shape growing out of the bar.
export function MapSelectionBar({
  floors,
  graph,
  isDestination,
  isOrigin,
  label,
  nodes,
  onClose,
  routeNodeId,
  searchableObjects,
  startNodeId,
}: MapSelectionBarProps) {
  const originNodeId = useAppStore((state) => state.originNodeId);
  const destinationNodeId = useAppStore((state) => state.destinationNodeId);
  const setOrigin = useAppStore((state) => state.setOrigin);
  const setDestination = useAppStore((state) => state.setDestination);
  const clearRoute = useAppStore((state) => state.clearRoute);
  const accessibleOnly = useAppStore((state) => state.accessibleOnly);
  const setAccessibleOnly = useAppStore((state) => state.setAccessibleOnly);
  // Store-owned, not component-local: MapViewerShell also needs to close
  // this (a background map click), and it needs to auto-close itself once a
  // route's found - both are easier as one shared value than trying to keep
  // a local useState in sync with what other components are doing.
  const isSearchOpen = useAppStore((state) => state.isRouteSearchOpen);
  const setRouteSearchOpen = useAppStore((state) => state.setRouteSearchOpen);

  const hasSelection = label !== null;
  // A route can exist with nothing selected on the map at all - set purely
  // through the search drawer's own fields. hasSelection alone used to gate
  // the close button and the bar's expanded state, so a route set that way
  // had no way to be seen or cancelled once the drawer closed. This is the
  // single source of truth for "the bar has something worth showing/
  // clearing" - everything that isn't specifically about the selected
  // object's own label (the grid section below, the Start/Route buttons)
  // reads from this instead of hasSelection directly.
  const hasRoute = originNodeId !== null || destinationNodeId !== null;
  const hasActiveContent = hasSelection || hasRoute;
  // Three concrete widths, not a two-way switch - a route with nothing
  // selected only needs to show the search trigger and the cancel button,
  // not the full label/Start/Route width, which used to leave a big empty
  // gap between them. All three are fixed lengths (never w-auto) so any
  // transition between them still animates instead of snapping.
  const barWidthClassName = hasSelection || isSearchOpen
    ? "w-[min(92vw,26rem)]"
    : hasRoute
      ? "w-24"
      : "w-14";

  // The search trigger is the only thing a user directly clicks to open or
  // close the drawer - no click-outside/backdrop dismissal. That was tried
  // and caused real problems: a full-screen backdrop blocked all map
  // interaction while open, and even a non-blocking outside-click listener
  // still treated selecting an object on the map as a "dismiss" gesture,
  // closing the drawer in the middle of what's actually the same routing
  // workflow. Two things still close it automatically, both intentional
  // rather than "anything outside": MapViewerShell closes it on a
  // background (non-object) map click, and the effect below closes it once
  // both endpoints are set - the search task is done at that point.
  useEffect(() => {
    if (originNodeId && destinationNodeId) {
      setRouteSearchOpen(false);
    }
  }, [originNodeId, destinationNodeId, setRouteSearchOpen]);

  // px-3 md:px-4, not sm: - matches MapCornerControls' inset-x-3
  // md:inset-x-4 breakpoint exactly, so the bar's left edge lines up with
  // the zoom/floor-wheel controls below it at every viewport width instead
  // of drifting apart between the sm and md breakpoints.
  return (
    <div className="pointer-events-none absolute inset-x-0 top-3 z-10 flex justify-start px-3 md:px-4">
      {/* relative + no overflow set: the drawer below is positioned off
          *this* box's own bottom edge (top-full) and needs to escape its
          bounds, so nothing here may clip. */}
      {/* Width itself isn't transitioned (only border-radius is) - the
          drawer below shares this exact w-[min(92vw,26rem)] class but its
          own width isn't animated either (only its opacity/transform are),
          so animating the bar's width here would leave it visibly narrower
          than the already-full-width drawer for the length of that
          transition, even though both settle at the identical value. */}
      <div
        className={cn(
          "pointer-events-auto relative flex h-14 max-w-full items-stretch gap-1 rounded-2xl border border-border bg-card/95 shadow-lg backdrop-blur-xl transition-[border-radius] duration-200 ease-out",
          barWidthClassName,
          isSearchOpen && "rounded-b-none",
        )}
      >
        {/* Row content only ever truncates, never scrolls - min-w-0 lets the
            grid-animated section below shrink, overflow-hidden clips
            anything that still doesn't fit instead of showing a scrollbar. */}
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden p-1.5 sm:p-2">
          <Button
            aria-label="Search for a start or destination"
            className={cn("size-10 shrink-0 rounded-full", isSearchOpen && "bg-muted text-foreground")}
            onClick={() => setRouteSearchOpen(!isSearchOpen)}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Search className="size-4" />
          </Button>

          {/* grid-cols-[0fr]->[1fr] animates this section's width smoothly
              in/out as hasSelection flips, instead of an instant mount/
              unmount snap. min-w-0 + overflow-hidden on the grid item is
              required for the 0fr collapse to actually clip content instead
              of just ignoring it. */}
          <div
            className={cn(
              "grid min-w-0 shrink transition-[grid-template-columns] duration-300 ease-out",
              hasSelection ? "grid-cols-[1fr]" : "grid-cols-[0fr]",
            )}
          >
            <div className="flex min-w-0 items-center gap-1 overflow-hidden">
              <span aria-hidden className="mx-0.5 h-5 w-px shrink-0 bg-border" />
              {/* flex-1 instead of a hand-picked max-w: claims exactly
                  whatever space is actually left over in the fixed-width
                  bar once the search button and the pinned Start/Route/close
                  buttons take theirs, so it never leaves the gap a fixed cap
                  would if those buttons happen to be short. */}
              <span className="min-w-0 flex-1 truncate px-1 text-sm font-medium sm:px-2">{label}</span>

              {!startNodeId && !routeNodeId ? (
                <span className="min-w-0 truncate px-1 text-xs text-muted-foreground">
                  Not available for routing yet
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Pinned outside the truncating row on purpose, same as the close
            button below: these need a spot on the label's actual rendered
            width, so a short vs. a long room name would otherwise shove them
            sideways. grid-cols-[0fr]->[1fr] still animates them in/out
            smoothly - it just does it as their own pinned block now instead
            of as part of the label's flex line. */}
        <div
          className={cn(
            "grid shrink-0 transition-[grid-template-columns] duration-300 ease-out",
            hasSelection && (startNodeId || routeNodeId) ? "grid-cols-[1fr]" : "grid-cols-[0fr]",
          )}
        >
          <div className="flex min-w-0 items-center gap-1 overflow-hidden py-1.5 sm:py-2">
            {startNodeId || routeNodeId ? (
              <>
                {startNodeId ? (
                  <Button
                    aria-label={isOrigin ? "Currently your starting point" : "Set as starting point"}
                    className="shrink-0 sm:px-3"
                    disabled={isOrigin}
                    onClick={() => setOrigin(startNodeId)}
                    size="sm"
                    variant={isOrigin ? "default" : "outline"}
                  >
                    {isOrigin ? "Started" : "Start"}
                  </Button>
                ) : null}
                {routeNodeId ? (
                  <Button
                    aria-label={isDestination ? "Currently your destination" : "Set as destination"}
                    className="shrink-0 sm:px-3"
                    disabled={isDestination}
                    onClick={() => setDestination(routeNodeId)}
                    size="sm"
                    variant={isDestination ? "default" : "outline"}
                  >
                    {isDestination ? "Routed" : "Route"}
                  </Button>
                ) : null}
              </>
            ) : null}
          </div>
        </div>

        {/* Pinned outside the row on purpose: this is the one dismiss action
            for the current selection or route, so it must stay visible
            regardless of how much the row above truncates - and regardless
            of whether the route came from a map selection or from the
            search drawer alone. */}
        {hasActiveContent ? (
          <div className="flex shrink-0 items-center py-1.5 pr-1.5 sm:py-2 sm:pr-2">
            <Button
              aria-label="Clear route and close"
              className="rounded-full"
              onClick={() => {
                clearRoute();
                onClose();
              }}
              size="icon-sm"
              type="button"
              variant="destructive"
            >
              <X className="size-3" />
            </Button>
          </div>
        ) : null}

        <MapSelectionDrawer isOpen={isSearchOpen}>
          <RouteSearchFields floors={floors} graph={graph} nodes={nodes} searchableObjects={searchableObjects} />
          <label className="mt-3 flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">Accessible route only</span>
            <Switch
              aria-label="Accessible route only"
              checked={accessibleOnly}
              // Without this, clicking the switch blurs whichever search
              // field is currently focused, which closes its suggestion
              // list a moment later - same trick RouteSearchFields already
              // uses on its own suggestion buttons, just applied here too.
              onMouseDown={(event) => event.preventDefault()}
              onCheckedChange={setAccessibleOnly}
            />
          </label>
        </MapSelectionDrawer>
      </div>
    </div>
  );
}
