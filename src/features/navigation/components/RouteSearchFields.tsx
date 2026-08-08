"use client";

import { useDeferredValue, useState } from "react";
import { X } from "lucide-react";

import { useAppStore } from "@/store";
import type { ViewerFloor, ViewerMapNode, ViewerMapObject } from "@/features/map-viewer/types/map-viewer.types";

import { filterRouteCandidates } from "../lib/filterRouteCandidates";
import { findNodeIdForObject } from "../lib/findNodeForObject";

interface RouteSearchFieldsProps {
  floors: ViewerFloor[];
  nodes: ViewerMapNode[];
  searchableObjects: ViewerMapObject[];
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

// The from/to search inputs + autocomplete dropdowns - shared by the
// sidebar's "Get directions" panel (RoutePanel) and MapSelectionBar's
// bottom drawer, so this search/candidate logic only exists in one place.
export function RouteSearchFields({ floors, nodes, searchableObjects }: RouteSearchFieldsProps) {
  const originNodeId = useAppStore((state) => state.originNodeId);
  const destinationNodeId = useAppStore((state) => state.destinationNodeId);
  const setOrigin = useAppStore((state) => state.setOrigin);
  const setDestination = useAppStore((state) => state.setDestination);
  const clearRoute = useAppStore((state) => state.clearRoute);

  const originLabel = findObjectLabelForNode(originNodeId, nodes, searchableObjects);
  const destinationLabel = findObjectLabelForNode(destinationNodeId, nodes, searchableObjects);

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
    <div className="space-y-2">
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
  );
}
