"use client";

import { useDeferredValue, useState } from "react";

import { Badge } from "@/components/ui/badge";
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
  X,
  type LucideIcon,
} from "lucide-react";

import { filterRouteCandidates } from "../lib/filterRouteCandidates";
import { findNodeIdForObject } from "../lib/findNodeForObject";
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

function findObjectLabelForNode(
  nodeId: string | null,
  nodes: ViewerMapNode[],
  objects: ViewerMapObject[],
): string | null {
  if (!nodeId) {
    return null;
  }

  const node = nodes.find((candidate) => candidate.id === nodeId);
  if (!node?.objectId) {
    return null;
  }

  const object = objects.find((candidate) => candidate.id === node.objectId);
  return object ? object.label || object.name : null;
}

function findFloorNameForObject(
  object: ViewerMapObject,
  floors: ViewerFloor[],
): string | null {
  return floors.find((floor) => floor.id === object.floorId)?.name ?? null;
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
  const setOrigin = useAppStore((state) => state.setOrigin);
  const setDestination = useAppStore((state) => state.setDestination);
  const clearRoute = useAppStore((state) => state.clearRoute);

  const originLabel = findObjectLabelForNode(
    originNodeId,
    nodes,
    searchableObjects,
  );
  const destinationLabel = findObjectLabelForNode(
    destinationNodeId,
    nodes,
    searchableObjects,
  );

  // Only the field currently being edited needs its own state — the other
  // field's displayed value is derived straight from the store, so there's
  // nothing to keep in sync via an effect.
  const [focusedField, setFocusedField] = useState<"from" | "to" | null>(null);
  const [draftQuery, setDraftQuery] = useState("");
  const deferredDraftQuery = useDeferredValue(draftQuery);

  const fromValue = focusedField === "from" ? draftQuery : (originLabel ?? "");
  const toValue = focusedField === "to" ? draftQuery : (destinationLabel ?? "");
  const candidates = focusedField
    ? filterRouteCandidates(searchableObjects, nodes, deferredDraftQuery)
    : [];

  const startEditing = (field: "from" | "to") => {
    setFocusedField(field);
    setDraftQuery("");
  };

  const stopEditing = (field: "from" | "to") => {
    // Delay so a click on a suggestion registers before the list unmounts.
    // Only clear if this field is still the focused one — otherwise a blur
    // fired when switching straight from one field to the other would wipe
    // out the field just focused instead of the one actually losing focus.
    window.setTimeout(() => {
      setFocusedField((current) => (current === field ? null : current));
    }, 120);
  };

  const pickOrigin = (object: ViewerMapObject) => {
    const nodeId = findNodeIdForObject(object.id, nodes);
    if (nodeId) {
      setOrigin(nodeId);
    }
    setFocusedField(null);
  };

  const pickDestination = (object: ViewerMapObject) => {
    const nodeId = findNodeIdForObject(object.id, nodes);
    if (nodeId) {
      setDestination(nodeId);
    }
    setFocusedField(null);
  };

  return (
    <div className="rounded-3xl border border-border bg-muted/35 p-4">
      <div className="flex items-center gap-2">
        <Navigation className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Get directions</h3>
        {originNodeId || destinationNodeId ? (
          <button
            aria-label="Clear navigation"
            className="ml-auto rounded-full px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={clearRoute}
            type="button"
          >
            Clear
          </button>
        ) : null}
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3">
          <span
            aria-hidden
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: "var(--map-viewer-route-origin)" }}
          />
          <input
            className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            onBlur={() => stopEditing("from")}
            onChange={(event) => setDraftQuery(event.target.value)}
            onFocus={() => startEditing("from")}
            placeholder="Nearest entrance"
            value={fromValue}
          />
          {originNodeId ? (
            <button
              aria-label="Clear starting point"
              className="shrink-0"
              onClick={() => setOrigin(null)}
              type="button"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          ) : null}
        </div>

        {focusedField === "from" && candidates.length > 0 ? (
          <div className="space-y-1 rounded-2xl border border-border bg-background p-1.5">
            {candidates.map((object) => (
              <button
                key={object.id}
                className="block w-full rounded-xl px-3 py-2 text-left hover:bg-muted/60"
                onClick={() => pickOrigin(object)}
                onMouseDown={(event) => event.preventDefault()}
                type="button"
              >
                <span className="block truncate text-sm">
                  {object.label || object.name}
                </span>
                {findFloorNameForObject(object, floors) ? (
                  <span className="block truncate text-xs text-muted-foreground">
                    {findFloorNameForObject(object, floors)}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        ) : null}

        <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3">
          <span
            aria-hidden
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: "var(--map-viewer-route-destination)" }}
          />
          <input
            className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            onBlur={() => stopEditing("to")}
            onChange={(event) => setDraftQuery(event.target.value)}
            onFocus={() => startEditing("to")}
            placeholder="Where to?"
            value={toValue}
          />
          {destinationNodeId ? (
            <button
              aria-label="Clear destination"
              className="shrink-0"
              onClick={clearRoute}
              type="button"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          ) : null}
        </div>

        {focusedField === "to" && candidates.length > 0 ? (
          <div className="space-y-1 rounded-2xl border border-border bg-background p-1.5">
            {candidates.map((object) => (
              <button
                key={object.id}
                className="block w-full rounded-xl px-3 py-2 text-left hover:bg-muted/60"
                onClick={() => pickDestination(object)}
                onMouseDown={(event) => event.preventDefault()}
                type="button"
              >
                <span className="block truncate text-sm">
                  {object.label || object.name}
                </span>
                {findFloorNameForObject(object, floors) ? (
                  <span className="block truncate text-xs text-muted-foreground">
                    {findFloorNameForObject(object, floors)}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <label className="mt-3 flex items-center justify-between gap-3 text-sm">
        <span className="text-muted-foreground">Accessible route only</span>
        <Switch
          aria-label="Accessible route only"
          checked={accessibleOnly}
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
              <div className="grid gap-2 rounded-2xl border border-border bg-background p-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="size-2.5 shrink-0 rounded-full bg-[var(--map-viewer-route-origin)]" />
                  <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Start</span>
                  <span className="truncate font-medium">{originLabel ?? "Route start"}</span>
                </div>
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="size-2.5 shrink-0 rounded-full bg-[var(--map-viewer-route-destination)]" />
                  <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Destination</span>
                  <span className="truncate font-medium">{destinationLabel ?? "Route destination"}</span>
                </div>
              </div>
              <Badge className="font-semibold" variant="outline">
                {route.totalDistanceMeters.toFixed(1)} m
                {segments.length > 1
                  ? ` • crosses ${segments.length - 1} floor${segments.length > 2 ? "s" : ""}`
                  : ""}
              </Badge>
              {segments.length > 1 ? (
                <div className="space-y-1 rounded-2xl border border-border bg-background p-1.5">
                  {segments.map((segment, index) => {
                    const segmentFloor = floors.find(
                      (floor) => floor.id === segment.floorId,
                    );
                    const isActive = index === activeSegmentIndex;
                    const ConnectorIcon = segment.enterViaEdgeType
                      ? CONNECTOR_ICONS[segment.enterViaEdgeType]
                      : null;

                    return (
                      <div key={segment.floorId + index}>
                        {index > 0 && ConnectorIcon ? (
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
                          onClick={() => onJumpToSegment(index)}
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
                            {index + 1}
                          </span>
                          <span className="truncate">
                            {segmentFloor?.name ?? "Floor"}
                          </span>
                          <span className="ml-auto flex shrink-0 items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide">
                            {index === 0 ? (
                              <><span className="size-2 rounded-full bg-[var(--map-viewer-route-origin)]" />Start</>
                            ) : null}
                            {index === segments.length - 1 ? (
                              <><span className="size-2 rounded-full bg-[var(--map-viewer-route-destination)]" />Destination</>
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
