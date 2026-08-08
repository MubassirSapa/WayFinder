# Route URL state (the consumer slice of QR wayfinding)

Status: **designed, not implemented.** This is the current, scoped-down
implementation task — the first slice of the fuller feature designed in
`docs/technical/QR_WAYFINDING.md`. Read that doc for the full picture (why
this exists, the eventual Share button, the eventual admin sticker
generator); this doc is only the part actually being built right now.

## Scope: consumer only, no UI, public viewer only

The public map viewer (`/map/[floorId]`) learns to read `startObject` /
`destObject` / `accessible` off its own URL and set the matching store state
on load. That's it — no new button, no dialog, no QR image, nothing
rendered that wasn't already rendered.

Explicitly **out of scope**, left as reference design in
`QR_WAYFINDING.md` for later:

- The map-editor "Generate QR Code" button and the `/qr/{objectId}` resolver
  route — dashboard/admin surface area.
- The "Share route" button, dialog, and QR-image generation in the viewer
  itself — the *producer* side of this same mechanism. This doc only builds
  the consumer; nothing in this repo constructs one of these URLs yet. It's
  verified by hand-typing one.

Two files change. No new npm dependency, no new route, no new component.

## URL contract

`/map/{floorId}?startObject={objectId}&destObject={objectId}&accessible=1` —
all three params optional and independent. Full reasoning for this shape
(including why it's `map-objects` IDs, not node IDs, and why there's no
`/qr/{objectId}` indirection needed here) lives in `QR_WAYFINDING.md`'s
"URL shape" section — not repeated here.

## What changes

1. **`src/app/(frontend)/(public)/(viewers)/map/[floorId]/page.tsx`** — start
   accepting the `searchParams` prop (currently unused), read `startObject`,
   `destObject`, and `accessible`, pass all three down:
   `<MapViewerShell data={{ ...data, initialFloorId: floorId, startObjectId: searchParams.startObject ?? null, destObjectId: searchParams.destObject ?? null, sharedAccessibleOnly: searchParams.accessible === "1" }} />`.

2. **`MapViewerShell.tsx`** — currently has a `useEffect` that calls
   `resetNavigation()` whenever `data.initialFloorId` changes (a real floor
   navigation). The apply-from-URL logic has to be sequenced *after* that
   reset, not race it — either as a continuation of the same effect, or a
   second effect with `initialFloorId` in its dependency array so it always
   reruns together with the reset on a fresh page load:
   - Resolve `startObjectId`/`destObjectId` → node via
     `findNodeIdForObject(nodes, objectId)` — note this needs the *whole
     building's* nodes (`allNodes`), not just the active floor's, since a
     shared route's destination is very often on a different floor than
     where the link lands.
   - If found: `setOrigin(nodeId)` / `setDestination(nodeId)`, and
     `setAccessibleOnly(true)` when `sharedAccessibleOnly` was set. For a
     start-only link, also set the existing local `selectedObjectId` state,
     so the room is visibly highlighted/"You are here" rather than just
     silently routable. (A start+dest link skips that — both endpoints
     being pre-set already makes the state legible via the route line
     itself and the existing "jump to route start floor" effect, without
     needing an object visually "selected".)
   - If an object has no associated node yet (a room with no entry point
     modeled in the graph): leave that side unset (falls back to the normal
     default-origin / no-destination behavior), and surface a small
     toast/notice rather than failing silently.
   - After applying, `router.replace()` the same path **without** the query
     string. Otherwise a manual refresh — or the user picking a different
     "From"/"To" location afterward, then refreshing — would keep
     re-forcing the state back to the URL's value on every reload.

## What does *not* need to change

- `NavigationSlice`, `useRoute`, `RoutePanel`, `MapSelectionBar`,
  `RouteSearchFields` — no component in the existing origin/destination
  selection UI changes. Applying a URL param just calls the exact same
  `setOrigin`/`setDestination`/`setAccessibleOnly` the existing UI already
  calls.
- `MapObjects`/`MapNodes`/`PathEdges` schema, `getMapViewerData` — same
  reasoning as `QR_WAYFINDING.md`'s "What does not need to change".

## How to verify

No UI exists yet to produce one of these links, so verification is manual:
visit `/map/{floorId}?startObject={id}&destObject={id}&accessible=1` by
hand (real object IDs from that floor/building) and confirm:

- The store ends up with the right `originNodeId`/`destinationNodeId`/
  `accessibleOnly`.
- The route draws immediately if both endpoints resolved.
- The URL's query string is gone after load (`router.replace` ran).
- A `startObject` with no matching node degrades gracefully (falls back to
  default origin, doesn't crash).

Plus a unit test covering the apply effect's branches (found node, missing
node, start-only vs. start+dest, `accessible` flag) alongside
`MapViewerShell`'s existing test coverage.
