# Floor Links (Cross-Floor Editor Tooling)

`src/features/map-editor/floor-links/` lets an admin manually pair a stairs, elevator, or escalator `MapNode` on one floor with its counterpart on another floor, creating the cross-floor `PathEdge` that [`NAVIGATION.md`](NAVIGATION.md)'s pathfinder needs to route between floors. It's a sibling to `smart-builder/`, not part of it — pairing nodes across floors is a distinct, manual workflow, not the automatic same-floor hallway stitching `smart-builder`/`autoConnect.ts` does.

## Why no schema change (beyond adding "escalator" as an option)

`PathEdges` (`src/collections/map/PathEdges.ts`) already allows `fromNode`/`toNode` to reference any `map-nodes` document — there's no same-floor constraint in the collection config, and `createPathEdge`/`updatePathEdge` (`core/actions/server/edge-actions.ts`) never validate the two nodes share a floor. The only place that forbade cross-floor edges was a JS guard inside `autoConnect.ts`'s `buildConnectionEdge`, scoped to that function's own callers (automatic hallway stitching). `PathEdges.type`, `MapNodes.role`, and `MapObjects.type` each got one more `select` option (`"escalator"` / `"escalator_entry"` / `"escalator"`) — a `select` field's options are just a value list, not a DB-level enum constraint under the SQLite adapter, so this needed no migration, just `npm run payload:types` to refresh the generated types.

A cross-floor `PathEdge` is created with `floor` attributed to the **source** node's floor (an arbitrary but harmless choice — see "Known limitation" below), `type` matching the source node's role (see below), and `distanceMeters` **entered by the admin**, not computed: `pixelDistance` only makes sense between two points in the *same* floor's local pixel space, and a stairs node on floor 1 has no meaningful geometric relationship to its counterpart on floor 2. `lib/crossFloorConnect.ts` pre-fills a sane default per type (`CROSS_FLOOR_DEFAULT_DISTANCE_METERS = { stairs: 6, elevator: 3, escalator: 4 }`) that the admin can override.

A `linkedNodeId` pairing field on `MapNodes` was considered and rejected — the `PathEdge` itself already *is* the pairing, so a parallel field would just be a second, desyncable source of truth for the same fact.

## The connector type is derived, never re-asked

A node's `role` already determines which connector type a link from it can be — a `stairs_entry` node can only ever be linked via `"stairs"`. Earlier versions of this panel asked the admin to also pick Stairs/Elevator/Escalator from three buttons, which was redundant (and defaulted to "Stairs" regardless of what was actually selected). `CROSS_FLOOR_TYPE_BY_NODE_ROLE` in `lib/crossFloorConnect.ts` derives the type from `node.role` instead, so selecting an elevator node only ever offers elevator nodes on other floors as targets — no extra step, no wrong-default risk.

`CONNECTOR_NODE_ROLES` / `isConnectorNodeRole` in the same file is the single source of truth for "which node roles are connectors" (`stairs_entry`, `elevator_entry`, `escalator_entry`) — used by the eligibility checks in both inspectors (below) and by `listLinkableNodes`'s query filter, so adding a future connector type (e.g. a ramp entry) only means touching this one list plus the sibling maps in the same file.

## Using the tool

`FloorLinkPanel` is **not** a standalone left-sidebar panel — it renders directly inside the right-hand **Inspector**, contextually, so it appears exactly when you're already looking at the thing you'd want to link:

- Select a `stairs_entry`, `elevator_entry`, or `escalator_entry` **node** on the canvas → `NodeInspector` renders `FloorLinkPanel` below the node's fields.
- Click the **object** itself (a Stairs/Elevator/Escalator `MapObject`) instead of the node → `ObjectInspector` resolves that object's linked node (`nodes.find(n => n.objectId === object.id)`) and renders the same panel. If the object has no linked node yet, it shows guidance to generate one (Smart Builder → Generate Nodes, or Node mode) instead of silently doing nothing.

The panel lists eligible target nodes with the matching role on every *other* floor in the same building, grouped by floor (`actions/client/floor-link-client-actions.ts`'s `listLinkableNodes`, which calls `services/client/floor-link-client.service.ts`'s `listLinkableNodesClient`, filtered by `buildingId` and `role in CONNECTOR_NODE_ROLES`). Pick one, confirm the distance, and the new edge is added to the local editor store exactly like any other edge — it persists on the next **Save**, through the existing `createPathEdge` action (`useSaveEditorChanges.ts` already iterates all local edges through that same, floor-agnostic action; no new persistence code was needed).

If the selected node already has a cross-floor link, the panel shows it inline ("Already linked") with a **Remove** action, instead of only surfacing that fact after a failed duplicate-creation attempt. Link data is fetched once per building via the shared `hooks/useCrossFloorLinks.ts` hook (not re-fetched per node), so switching between several connector nodes in one editing session doesn't re-request the same list.

## Known limitation

Per-floor edge queries (`getMapViewerData.ts`, `getFloorEditorData`) filter `path-edges` by `where: { floor: { equals } }`, so a cross-floor edge only shows up when querying its *attributed* floor, not the other one. This doesn't block pathfinding — `buildRouteGraph` merges every floor's edges into one graph regardless of which floor each edge is nominally filed under (see `NAVIGATION.md`) — but it does mean the *editor's* per-floor edge list, when viewing the "to" floor, won't show a link created from the "from" floor's session. The Floor Links panel works around this by querying building-scoped (`listCrossFloorLinks`), not per-floor.
