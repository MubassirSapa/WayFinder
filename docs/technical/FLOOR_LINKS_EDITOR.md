# Floor Links (Cross-Floor Editor Tooling)

`src/features/map-editor/floor-links/` lets an admin manually pair a stairs or elevator `MapNode` on one floor with its counterpart on another floor, creating the cross-floor `PathEdge` that [`NAVIGATION.md`](NAVIGATION.md)'s pathfinder needs to route between floors. It's a sibling to `smart-builder/`, not part of it — pairing nodes across floors is a distinct, manual workflow, not the automatic same-floor hallway stitching `smart-builder`/`autoConnect.ts` does.

## Why no schema change

`PathEdges` (`src/collections/map/PathEdges.ts`) already allows `fromNode`/`toNode` to reference any `map-nodes` document — there's no same-floor constraint in the collection config, and `createPathEdge`/`updatePathEdge` (`floorEditorActions.ts`) never validate the two nodes share a floor. The only place that forbade cross-floor edges was a JS guard inside `autoConnect.ts`'s `buildConnectionEdge`, scoped to that function's own callers (automatic hallway stitching). `PathEdges.type` already has `"stairs"` / `"elevator"` options — this tooling is the first thing to actually use them.

A cross-floor `PathEdge` is created with `floor` attributed to the **source** node's floor (an arbitrary but harmless choice — see "Known limitation" below), `type: "stairs" | "elevator"`, and `distanceMeters` **entered by the admin**, not computed: `pixelDistance` only makes sense between two points in the *same* floor's local pixel space, and a stairs node on floor 1 has no meaningful geometric relationship to its counterpart on floor 2. `lib/crossFloorConnect.ts` pre-fills a sane default per type (`CROSS_FLOOR_DEFAULT_DISTANCE_METERS = { stairs: 6, elevator: 3 }`) that the admin can override.

A `linkedNodeId` pairing field on `MapNodes` was considered and rejected — the `PathEdge` itself already *is* the pairing, so a parallel field would just be a second, desyncable source of truth for the same fact.

## Using the tool

In the map editor (`/editor/[floorId]`), select a `stairs_entry` or `elevator_entry` node on the canvas. The **Floor Links** panel (left sidebar, below Automation) then lists eligible nodes with the matching role on every *other* floor in the same building (`actions/floorLinkActions.ts`'s `listLinkableNodes`, filtered by `buildingId` and `role in [stairs_entry, elevator_entry]`). Pick the counterpart, confirm the type and distance, and the new edge is added to the local editor store exactly like any other edge — it persists on the next **Save**, through the existing `createPathEdge` action (`useSaveEditorChanges.ts` already iterates all local edges through that same, floor-agnostic action; no new persistence code was needed).

The panel also lists existing cross-floor links for the building (`listCrossFloorLinks`, filtered by `type in [stairs, elevator]`) with a **Remove** action, which calls the existing `deletePathEdge` action directly.

## Known limitation

Per-floor edge queries (`getMapViewerData.ts`, `getFloorEditorData`) filter `path-edges` by `where: { floor: { equals } }`, so a cross-floor edge only shows up when querying its *attributed* floor, not the other one. This doesn't block pathfinding — `buildRouteGraph` merges every floor's edges into one graph regardless of which floor each edge is nominally filed under (see `NAVIGATION.md`) — but it does mean the *editor's* per-floor edge list, when viewing the "to" floor, won't show a link created from the "from" floor's session. The Floor Links panel works around this by querying building-scoped (`listCrossFloorLinks`), not per-floor.
