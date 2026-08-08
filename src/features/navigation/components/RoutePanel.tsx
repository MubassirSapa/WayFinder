"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type {
  ViewerFloor,
  ViewerMapNode,
  ViewerMapObject,
  ViewerPathEdge,
} from "@/features/map-viewer/types/map-viewer.types";
import {
  ArrowUpDown,
  ArrowUpRight,
  Navigation,
  TrendingUp,
  Waypoints,
  type LucideIcon,
} from "lucide-react";

import { RouteSearchFields } from "./RouteSearchFields";
import { useAppStore } from "@/store";
import type {
  RouteFloorSegment,
  ShortestPathResult,
} from "../types/navigation.types";

interface RoutePanelProps {
  activeSegmentIndex: number;
  effectiveOriginId: string | null;
  floors: ViewerFloor[];
  nodes: ViewerMapNode[];
  onJumpToSegment: (index: number) => void;
  route: ShortestPathResult | null;
  searchableObjects: ViewerMapObject[];
  segments: RouteFloorSegment[];
}

const CONNECTOR_ICONS: Record<ViewerPathEdge["type"], LucideIcon> = {
  elevator: ArrowUpDown,
  escalator: TrendingUp,
  ramp: Waypoints,
  stairs: ArrowUpRight,
  walkway: Waypoints,
};

export function RoutePanel({
  activeSegmentIndex,
  effectiveOriginId,
  floors,
  nodes,
  onJumpToSegment,
  route,
  searchableObjects,
  segments,
}: RoutePanelProps) {
  const originNodeId = useAppStore((state) => state.originNodeId);
  const destinationNodeId = useAppStore((state) => state.destinationNodeId);
  const accessibleOnly = useAppStore((state) => state.accessibleOnly);
  const setAccessibleOnly = useAppStore((state) => state.setAccessibleOnly);
  const clearRoute = useAppStore((state) => state.clearRoute);

  // Displayed level-descending (a higher floor above a lower one, mimicking
  // a real building) instead of raw route order, which can run either
  // direction depending on where the destination is. Every check below
  // keys off `originalIndex` (the segment's real position in the walked
  // path), not this display position, so step numbers, Start/Destination,
  // the "via elevator/stairs" connector note, and jump-to-segment clicks
  // all stay correct regardless of how the list is visually sorted.
  const orderedSegments = segments
    .map((segment, originalIndex) => ({
      floor: floors.find((floor) => floor.id === segment.floorId),
      originalIndex,
      segment,
    }))
    .sort((a, b) => (b.floor?.level ?? -Infinity) - (a.floor?.level ?? -Infinity));

  return (
    <div className="rounded-3xl border border-border bg-muted/35 p-4">
      <div className="flex items-center gap-2">
        <Navigation className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Get directions</h3>
        {originNodeId || destinationNodeId ? (
          <Button
            aria-label="Clear navigation"
            className="ml-auto"
            onClick={clearRoute}
            size="sm"
            type="button"
            variant="destructive"
          >
            Clear
          </Button>
        ) : null}
      </div>

      <div className="mt-3">
        <RouteSearchFields floors={floors} nodes={nodes} searchableObjects={searchableObjects} />
      </div>

      <label className="mt-3 flex items-center justify-between gap-3 text-sm">
        <span className="text-muted-foreground">Accessible route only</span>
        <Switch
          aria-label="Accessible route only"
          checked={accessibleOnly}
          // Without this, clicking the switch blurs whichever search field
          // is currently focused, which closes its suggestion list a moment
          // later - same trick RouteSearchFields already uses on its own
          // suggestion buttons, just applied here too.
          onMouseDown={(event) => event.preventDefault()}
          onCheckedChange={setAccessibleOnly}
        />
      </label>

      {destinationNodeId ? (
        <div className="mt-3 space-y-3 border-t border-border pt-3 text-sm">
          {!effectiveOriginId ? (
            <p className="text-muted-foreground">
              No starting point available on this floor yet.
            </p>
          ) : route ? (
            <>
              <Badge className="font-semibold" variant="outline">
                {route.totalDistanceMeters.toFixed(1)} m
                {segments.length > 1
                  ? ` • crosses ${segments.length - 1} floor${segments.length > 2 ? "s" : ""}`
                  : ""}
              </Badge>
              {segments.length > 1 ? (
                <div className="space-y-1 rounded-2xl border border-border bg-background p-1.5">
                  {orderedSegments.map(({ floor: segmentFloor, originalIndex, segment }) => {
                    const isActive = originalIndex === activeSegmentIndex;
                    const ConnectorIcon = segment.enterViaEdgeType
                      ? CONNECTOR_ICONS[segment.enterViaEdgeType]
                      : null;

                    return (
                      <div key={segment.floorId + originalIndex}>
                        {originalIndex > 0 && ConnectorIcon ? (
                          <div className="flex items-center gap-1.5 py-1 pl-4 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                            <ConnectorIcon className="h-3 w-3" />
                            <span>via {segment.enterViaEdgeType}</span>
                          </div>
                        ) : null}
                        <button
                          className={cn(
                            "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm transition-colors",
                            isActive
                              ? "bg-primary/10 font-semibold text-foreground ring-1 ring-primary/30"
                              : "text-muted-foreground hover:bg-muted/60",
                          )}
                          onClick={() => onJumpToSegment(originalIndex)}
                          type="button"
                        >
                          <span
                            className={cn(
                              "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground",
                            )}
                          >
                            {originalIndex + 1}
                          </span>
                          <span className="truncate">
                            {segmentFloor?.name ?? "Floor"}
                          </span>
                          <span className="ml-auto flex shrink-0 items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide">
                            {originalIndex === 0 ? (
                              <><span className="size-2 rounded-full bg-(--map-viewer-route-origin)" />Start</>
                            ) : null}
                            {originalIndex === segments.length - 1 ? (
                              <><span className="size-2 rounded-full bg-(--map-viewer-route-destination)" />Destination</>
                            ) : null}
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </>
          ) : (
            <p className="text-muted-foreground">
              {accessibleOnly
                ? "No accessible route found between these points."
                : "No route found between these points."}
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
