# Navigation & Pathfinding

`src/features/navigation/` computes shortest-path routes over the existing `MapNode`/`PathEdge` graph and renders them on the public map viewer. It is a derived view over data `map-viewer` already normalizes — it does not fetch data of its own and does not define a parallel type layer beyond a few genuinely new shapes.

## Graph model

`lib/graph.ts`'s `buildRouteGraph(nodes, edges, { accessibleOnly? })` turns the flat `ViewerMapNode[]` / `ViewerPathEdge[]` arrays (already loaded for **all** floors by `getMapViewerData.ts`) into an adjacency list (`Map<nodeId, entry[]>`):

- An edge always contributes a `from → to` entry.
- It contributes `to → from` as well only when `edge.bidirectional` is true.
- With `accessibleOnly: true`, nodes and edges with `isAccessible: false` are dropped entirely rather than just deprioritized.
- Edges referencing a node id not present in the input `nodes` array are skipped (mirrors the dangling-reference guard `ViewerEdges` already has when rendering).

Crucially, the graph is built once from **all floors' nodes/edges merged together**, not per floor. A cross-floor `PathEdge` (`type: "stairs" | "elevator" | "escalator"`) is just another edge in this graph, weighted by `edge.distanceMeters` plus a flat `FLOOR_CHANGE_PENALTY_METERS` (`constants/routing.constants.ts`) whenever the edge's two nodes are on different floors. Stairs/elevator/escalator connectors otherwise carry small, flat default distances (`CROSS_FLOOR_DEFAULT_DISTANCE_METERS` in `map-editor/floor-links`) regardless of the floor's actual size — without the penalty, Dijkstra could treat hopping through a floor and back as "cheaper" than a longer same-floor walk, producing a route that revisits the same floor non-consecutively. `totalDistanceMeters` on the result includes this penalty, since it reflects real wayfinding effort rather than raw geometry. See [`FLOOR_LINKS_EDITOR.md`](FLOOR_LINKS_EDITOR.md) for how admins create these cross-floor edges in the map editor.

## Why Dijkstra, not A*

Floor-local `x`/`y` are pixel coordinates private to each floor's own SVG space (`MapViewerSvg.tsx`'s `MAP_VIEWER_FLOOR_CONTENT_PADDING`-offset group). Once a route crosses a stairs/elevator edge, the destination floor's coordinates bear no geometric relationship to the origin floor's — there is no admissible cross-floor heuristic without real building/GPS alignment, which is out of scope. Indoor node counts per building are small, so `lib/dijkstra.ts`'s `findShortestPath(graph, originNodeId, destinationNodeId)` is a plain array-scan Dijkstra (no binary heap) — simpler and provably correct, with no measurable performance cost at this scale.

It returns `{ nodeIds, edgeIds, totalDistanceMeters } | null` — `null` when the destination is unreachable or either id isn't in the graph; `origin === destination` returns a zero-distance single-node result.

## Floor segments

`lib/routeSegments.ts`'s `splitRouteByFloor(path, nodesById, edgesById)` groups a computed path's nodes into `RouteFloorSegment[]`, one per contiguous run of same-floor nodes. The edge that crosses floors is attributed to the *previous* segment's `edgeIds`, and its `type` (`"stairs"` or `"elevator"`) tags the *next* segment's `enterViaEdgeType` — this is what a floor-hop UI reads to show "Continue via stairs to Floor 2".

## Origin selection

There's no `router.push`-driven "current location" — indoor apps have no GPS fix to anchor on. Instead:

- Clicking any searchable object in the map viewer surfaces "Start"/"Route" buttons in **`MapSelectionBar`** (`src/features/navigation/components/MapSelectionBar.tsx`), which call `setOrigin`/`setDestination` directly. The object-id-to-node-id resolution goes through `lib/findNodeForObject.ts`'s `findNodeIdForObject` (called from `MapViewerShell.tsx`, which passes the resolved `nodeId` down as a prop). The very first click on any object before an origin exists also auto-sets the origin the same way (`MapViewerShell.tsx`'s `focusObject`).
- If no origin has been explicitly chosen, `lib/defaultOrigin.ts`'s `findDefaultOriginNode(floors, nodesByFloorId)` falls back to the first `role: "entrance"` node (or `"exit"` if none) on the building's lowest-level floor — `floors[0]` is already guaranteed lowest-level since `getMapViewerData.ts` queries floors with `sort: "level"`.

This resolution happens transparently inside `hooks/useRoute.ts`, so the rest of the UI never needs to know whether the origin was explicit or defaulted.

## State: intent, not the computed route

`store/createNavigationSlice.ts` is one slice of the app-wide `useAppStore` (composed alongside the map editor's slices in `src/store/index.ts`), holding only **user intent**: `originNodeId`, `destinationNodeId`, `accessibleOnly`, `activeSegmentIndex`, and `activeFloorId` (see "Multi-floor viewer UX" below for why the active floor lives here too).

The computed route itself — the graph, the shortest path, the floor segments — is **not** stored. `hooks/useRoute.ts` derives all of it via `useMemo` from the store's intent plus the `MapViewerData` already available to `MapViewerShell`. Storing a value that's cheap to recompute from other state invites a stale-route bug (e.g. after `accessibleOnly` flips) for no benefit, so it's deliberately left out of the store.

## Rendering

`MapViewerSvg.tsx` accepts an optional `routePoints: {x, y}[]` prop (raw floor-local coordinates — the same unpadded space `ViewerEdges`/`ViewerNodes`/`ViewerObjects` already render in) and draws a dashed `<polyline>` plus origin/destination markers, styled via the `--map-viewer-route-line` / `-origin` / `-destination` theme tokens defined in `global.css` (light + dark variants, alongside the existing `--map-viewer-path-*` tokens; `MAP_VIEWER_THEME_CLASSNAMES` in `mapViewerTheme.constants.ts` is what scopes these tokens onto the viewer's `<section>`, it doesn't define them itself). `map-viewer` components mostly receive this as plain geometry — `MapViewerShell` is the main bridge (calling `useRoute` and threading `routePoints`/segments down as props), though `MapViewerToolbar` and `RouteFloorSelect` also import the `RouteFloorSegment` type directly from `src/features/navigation/types` for their own props.

## Multi-floor viewer UX

`activeFloorId` lives in the navigation slice (`useAppStore`), not as `MapViewerShell` component state — every floor's `objects`/`nodes`/`edges` are already resident in `data` (fetched once by `getMapViewerData.ts`), so switching floors is an instant state update, not a page navigation. `MapViewerShell` falls back to `data.initialFloorId` on the very first render (before its mount effect writes the store), and that same effect calls `resetNavigation()` whenever `data.initialFloorId` changes — which only happens on a real page load to a different floor's server data, never from in-app floor switching — so a client-side navigation to a different building's `/map/[floorId]` page can't leak a stale route/floor forward from the singleton store.

There are four separate places a user can change the active floor: the corner floor-wheel widget in `MapViewerToolbar` (`FloorNavigator` when there's no active multi-floor route, or `RouteFloorSelect` when there is), double-clicking/double-tapping a canvas connector, and `FloorHopIndicator`'s "Continue via stairs/elevator to Floor N" button. (`MapViewerSidebar` and `RoutePanel` still exist as components/tests but are currently commented out of `MapViewerShell`'s render tree — not reachable in the live UI; the header itself, `MapViewerPageHeader.tsx`, no longer has a floor select at all.) All of these write to the same `activeFloorId`/`activeSegmentIndex` pair in the store, which is what keeps the in-canvas breadcrumb (`MapViewerToolbar`), the floor-wheel widget, and the drawn route line (`routePointsForActiveFloor` in `MapViewerShell`, which only draws when `activeSegment.floorId === activeFloorId`) all in agreement. The floor-wheel/connector paths go through a shared `goToFloor(floorId)` helper in `MapViewerShell` that also looks up and syncs `activeSegmentIndex` to whichever segment (if any) matches the new floor; the floor-hop button already knows the exact segment index, so it sets it directly instead.

One subtlety this required: the viewport hook already resets pan/zoom to the floor's default fit-to-view every time `activeFloorId` changes (needed for a manual floor switch via the sidebar, where you *do* want the full-floor overview). A floor hop needs the opposite — keep the just-computed route-bounds view. `useMapViewerViewport.ts` resolves this with a one-shot `pendingFocusRef`: `focusWorldBounds` sets it before changing zoom/pan, and the floor-change effect checks it to skip the default-view reset exactly once, for exactly that transition.
