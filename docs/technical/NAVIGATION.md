# Navigation & Pathfinding

`src/features/navigation/` computes shortest-path routes over the existing `MapNode`/`PathEdge` graph and renders them on the public map viewer. It is a derived view over data `map-viewer` already normalizes — it does not fetch data of its own and does not define a parallel type layer beyond a few genuinely new shapes.

## Graph model

`lib/graph.ts`'s `buildRouteGraph(nodes, edges, { accessibleOnly? })` turns the flat `ViewerMapNode[]` / `ViewerPathEdge[]` arrays (already loaded for **all** floors by `getMapViewerData.ts`) into an adjacency list (`Map<nodeId, entry[]>`):

- An edge always contributes a `from → to` entry.
- It contributes `to → from` as well only when `edge.bidirectional` is true.
- With `accessibleOnly: true`, nodes and edges with `isAccessible: false` are dropped entirely rather than just deprioritized.
- Edges referencing a node id not present in the input `nodes` array are skipped (mirrors the dangling-reference guard `ViewerEdges` already has when rendering).

Crucially, the graph is built once from **all floors' nodes/edges merged together**, not per floor. A cross-floor `PathEdge` (`type: "stairs" | "elevator" | "escalator"`) is just another edge in this graph — nothing about `buildRouteGraph` or the search below is floor-aware or cares how many connector types exist. See [`FLOOR_LINKS_EDITOR.md`](FLOOR_LINKS_EDITOR.md) for how admins create these cross-floor edges in the map editor.

## Why Dijkstra, not A*

Floor-local `x`/`y` are pixel coordinates private to each floor's own SVG space (`MapViewerSvg.tsx`'s `MAP_VIEWER_FLOOR_CONTENT_PADDING`-offset group). Once a route crosses a stairs/elevator edge, the destination floor's coordinates bear no geometric relationship to the origin floor's — there is no admissible cross-floor heuristic without real building/GPS alignment, which is out of scope. Indoor node counts per building are small, so `lib/dijkstra.ts`'s `findShortestPath(graph, originNodeId, destinationNodeId)` is a plain array-scan Dijkstra (no binary heap) — simpler and provably correct, with no measurable performance cost at this scale.

It returns `{ nodeIds, edgeIds, totalDistanceMeters } | null` — `null` when the destination is unreachable or either id isn't in the graph; `origin === destination` returns a zero-distance single-node result.

## Floor segments

`lib/routeSegments.ts`'s `splitRouteByFloor(path, nodesById, edgesById)` groups a computed path's nodes into `RouteFloorSegment[]`, one per contiguous run of same-floor nodes. The edge that crosses floors is attributed to the *previous* segment's `edgeIds`, and its `type` (`"stairs"` or `"elevator"`) tags the *next* segment's `enterViaEdgeType` — this is what a floor-hop UI reads to show "Continue via stairs to Floor 2".

## Origin selection

There's no `router.push`-driven "current location" — indoor apps have no GPS fix to anchor on. Instead:

- Clicking any searchable object in the map viewer surfaces a **"Start here"** action (`RouteOriginTrigger`, resolved via `lib/findNodeForObject.ts`'s `findNodeIdForObject`, which finds the `MapNode` whose `objectId` matches the selected object).
- If no origin has been explicitly chosen, `lib/defaultOrigin.ts`'s `findDefaultOriginNode(floors, nodesByFloorId)` falls back to the first `role: "entrance"` node (or `"exit"` if none) on the building's lowest-level floor — `floors[0]` is already guaranteed lowest-level since `getMapViewerData.ts` queries floors with `sort: "level"`.

This resolution happens transparently inside `hooks/useRoute.ts`, so the rest of the UI never needs to know whether the origin was explicit or defaulted.

## State: intent, not the computed route

`store/useNavigationStore.ts` is a standalone Zustand store (not merged into the map-editor's `useEditorStore` — the public viewer and the admin editor are separate audiences with separate stores) holding only **user intent**: `originNodeId`, `destinationNodeId`, `accessibleOnly`, `activeSegmentIndex`.

The computed route itself — the graph, the shortest path, the floor segments — is **not** stored. `hooks/useRoute.ts` derives all of it via `useMemo` from the store's intent plus the `MapViewerData` already available to `MapViewerShell`. Storing a value that's cheap to recompute from other state invites a stale-route bug (e.g. after `accessibleOnly` flips) for no benefit, so it's deliberately left out of the store.

## Rendering

`MapViewerSvg.tsx` accepts an optional `routePoints: {x, y}[]` prop (raw floor-local coordinates — the same unpadded space `ViewerEdges`/`ViewerNodes`/`ViewerObjects` already render in) and draws a dashed `<polyline>` plus origin/destination markers, styled via the `--map-viewer-route-line` / `-origin` / `-destination` theme tokens in `mapViewerTheme.constants.ts` (light + dark variants, alongside the existing `--map-viewer-path-*` tokens). `map-viewer` components receive this as plain geometry — they never import from `src/features/navigation`; only `MapViewerShell` bridges the two features, calling `useRoute` and threading `routePoints`/`RoutePanel`/`RouteOriginTrigger` down as props and slots.

## Multi-floor viewer UX

`MapViewerShell`'s `activeFloorId` is real client state (`useState(data.initialFloorId)`), not derived from props — every floor's `objects`/`nodes`/`edges` are already resident in `data` (fetched once by `getMapViewerData.ts`), so switching floors is an instant state update, not a page navigation. `MapViewerSidebar`'s floor list is a plain button calling this state setter instead of a `<Link>`; the URL (`/map/[floorId]`) still reflects the floor you *arrived* on, not necessarily the one currently displayed — deliberate, since re-navigating would re-run the Server Component and reset the in-progress route/viewport state for no benefit.

When the active route segment isn't the last one (`activeSegmentIndex < segments.length - 1`), `FloorHopIndicator` renders a "Continue via stairs/elevator to Floor N" button. Clicking it advances `useNavigationStore`'s `activeSegmentIndex`, switches `activeFloorId` to the next segment's floor, and calls the viewport hook's `focusWorldBounds` (backed by `getFitBoundsView` in `mapViewerViewport.ts`) with that segment's bounding box (`getRouteSegmentBounds`) so the camera reframes on the new floor's portion of the route instead of the floor's full default view.

One subtlety this required: the viewport hook already resets pan/zoom to the floor's default fit-to-view every time `activeFloorId` changes (needed for a manual floor switch via the sidebar, where you *do* want the full-floor overview). A floor hop needs the opposite — keep the just-computed route-bounds view. `useMapViewerViewport.ts` resolves this with a one-shot `pendingFocusRef`: `focusWorldBounds` sets it before changing zoom/pan, and the floor-change effect checks it to skip the default-view reset exactly once, for exactly that transition.
