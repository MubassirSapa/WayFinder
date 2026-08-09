# QR Code Wayfinding (scan a room → open viewer already routing from there)

Status: **mostly implemented.** The URL-state consumer
(`docs/technical/ROUTE_URL_STATE.md`) and the admin sticker generator +
`/qr/{objectId}` resolver (`docs/technical/DASHBOARD_QR_VIEWER.md`,
`src/features/qr-codes/`) are both built. The one piece from this doc that
is **not** built yet is ["Sharing a route from the viewer"](#sharing-a-route-from-the-viewer)
below — the guest-facing "Share" button/dialog in `MapSelectionBar`. That
section remains a reference design only.

## The idea

Two related entry points into the same mechanism:

1. **Scan a sticker at a location** → the map viewer opens with that room
   already set as the starting point. Someone scans it with their phone
   camera, picks where they want to go, and the route is ready — no
   searching for "where am I" first.
2. **Share a route** → someone already routing from A to B in the viewer
   taps "Share", and sends a link (or a QR code of that link) that opens the
   viewer for someone else with *both* the same start and destination
   already set — e.g. "meet me at gate 3", sent from one phone to another.

Both are the same underlying feature: the viewer reads origin/destination
out of the URL on load instead of requiring them to be picked in the UI. A
sticker just encodes only the start half; a shared route encodes both.

This is explicitly called out as a gap in `docs/technical/HOW_DIRECTIONS_WORK.md`
already: the app has no live indoor positioning, and that doc names
"QR-code checkpoints" as one of the technologies that would close it. The
scan-a-sticker case is the static version of that — not live tracking, just
"the last place someone scanned a code."

## What already exists (so this is additive, not a rewrite)

Confirmed by reading the actual code, not assumed:

- **Origin and destination are already separate, first-class concepts.**
  The navigation store (`NavigationSlice`,
  `src/features/navigation/store/createNavigationSlice.ts`) holds
  `originNodeId` and `destinationNodeId` independently, with `setOrigin` /
  `setDestination` actions. A route is computed automatically (`useRoute`,
  reactive/derived, no explicit "Go" button) any time both are set.
- **There's already more than one way to set the origin today**: clicking a
  place on the map/sidebar (first click with no origin set becomes the
  origin), the "Start"/"Route" buttons in `MapSelectionBar`, or typing into
  the from/to fields in `RouteSearchFields`. A QR scan is just a new way to
  call `setOrigin` — arriving with the value already decided instead of
  picked in the UI.
- **The viewer route has zero URL query-param support today.** Grepped the
  whole `map-viewer` feature and the `map/` route tree for
  `useSearchParams`/`searchParams`/`router.push`/`router.replace` — no
  matches. The only URL-based state right now is the `floorId` **route**
  segment in `src/app/(frontend)/(public)/(viewers)/map/[floorId]/page.tsx`.
  Everything else (selected object, origin, destination, viewport) is pure
  client state.
- **Origin/destination are stored as `map-nodes` IDs, not `map-objects`
  IDs.** A QR code naturally identifies a *room* (`map-objects`), so
  resolving room → node is a required step
  (`findNodeIdForObject`, `src/features/navigation/lib/findNodeForObject.ts`:
  `nodes.find(n => n.objectId === objectId)?.id`).
- **A default origin already exists as a fallback** — `findDefaultOriginNode`
  picks the ground floor's `entrance` node (or `exit`) when nothing else is
  set. A QR-provided origin simply pre-empts that fallback for the rest of
  the visit.

## URL shape

`/map/{floorId}?startObject={objectId}&destObject={objectId}&accessible=1` —
all three params optional and independent:

- `startObject` alone → the scan-a-sticker case (pre-fills origin, person
  still picks a destination through the normal UI).
- `startObject` + `destObject` → the share-a-route case (both endpoints
  pre-filled, route is live the moment the page loads — same as if both had
  been typed into the from/to fields).
- `destObject` alone is a valid combination too (someone shares "how do I
  get to the auditorium" without a fixed starting point) — falls back to the
  existing `findDefaultOriginNode` ground-floor-entrance behavior for
  origin, same as visiting the viewer fresh with no origin set today.
- `accessible=1` (only meaningful alongside `destObject`) carries the
  sharer's `accessibleOnly` toggle, so the recipient's route matches the one
  the sharer actually saw instead of silently resolving to a different
  (possibly non-accessible) path under their own default toggle state.
  Omitted entirely rather than `accessible=0` when off, so the query string
  stays clean for the common case.

Chosen over encoding a node ID directly because node IDs are an internal
graph-modeling detail (`map-nodes`); a room's own `map-objects` ID is the
stable, meaningful identifier, and the object→node resolution already has to
happen client-side via `findNodeIdForObject` regardless of where the ID
comes from.

### Why a shared route link skips the `/qr/{objectId}` indirection

The sticker case (below) needs a stable `/qr/{objectId}` redirect rather than
`/map/{floorId}?...` directly, because a **physical, printed sticker**
outlives the floor plan — if a room moves to a different floor, the sticker
would encode a dead `floorId` forever.

That risk doesn't apply to a shared route link: it's generated fresh from
the *current* session's state and is expected to be short-lived (sent,
opened, discarded) — never printed, never expected to still resolve months
later. So the Share button (design below) would encode
`/map/{floorId}?startObject=...&destObject=...` directly, with `floorId`
taken from the route's own start floor (`segments[0].floorId`) — no
resolver hop, no extra Payload lookup for that path. The two producers
(sticker resolver, Share button) both just emit the same
`?startObject=&destObject=` contract the viewer consumes — independent of
each other.

## Sharing a route from the viewer

Where the user would get the link/QR for their current route — entirely new
UI, entirely client-side. Not built yet.

### Where the trigger lives

`MapSelectionBar`'s search drawer (`RouteSearchFields` plus the accessibility
toggle) already becomes the place a route's two endpoints live once both are
set. A **"Share"** button belongs in that same drawer, enabled once
`originNodeId && destinationNodeId` are both set (mirrors how Start/Route
already gate on having a `nodeId` to act on) — greyed out or hidden before
that, same as there being nothing meaningful to share yet.

### Building the link

Reverse of the apply direction: `MapViewerShell` already computes
`originObjectId`/`destinationObjectId` (node → object, floor-scoped) for
highlighting the selected object on the canvas — sharing needs the same
node→object resolution but across the *whole* route, not just the active
floor, since origin and destination can be on different floors. Build:

```
`${window.location.origin}/map/${segments[0].floorId}?startObject=${originObjectId}&destObject=${destinationObjectId}`
```

`segments[0].floorId` (the route's own start floor, from `useRoute`), not
`activeFloorId` — so the link lands on the floor the route actually begins
on regardless of which floor the *sharer* happens to be looking at when they
tap Share.

### Generating the image

No route-sharing UI exists yet, but the **`qrcode`** dependency this would
need is already installed — it was added for the room-sticker generator (see
below). Same usage pattern would apply: `QRCode.toDataURL(url)`, entirely
client-side, no server action.

Tapping Share opens a small shadcn `Dialog` (same primitive already used
elsewhere, e.g. `AddTeamMemberDialog`) showing the generated QR image plus
the plain-text link with a **Copy link** button
(`navigator.clipboard.writeText`) and a **Download** button (plain
`<a href={dataUrl} download="route-qr.png">`, the browser's native way to
save a data URL). No Print button here — that's specifically an admin/sticker
concern (see below), not something a guest sharing a route on their own
phone needs.

## Generating printable room stickers

> **Implemented** — see `docs/technical/DASHBOARD_QR_VIEWER.md` and
> `src/features/qr-codes/`. Built as its own dashboard page (a read-only
> view rendered like `/map`), not the map editor's `ObjectInspector`
> described below — that placement was superseded before implementation.
> The rest of this section (the resolver route, generation/download/print
> mechanics, why no storage) still describes what shipped.

This is the **permanent, printable** per-room QR sticker an admin generates
once and sticks on a physical wall. Dashboard/admin surface area. Not built
yet. Needs its own `/qr/{objectId}` resolver route (a real server page doing
a Payload lookup) to protect a printed sticker from breaking if the room's
floor ever changes — see
[why a shared route link skips that indirection](#why-a-shared-route-link-skips-the-qrobjectid-indirection),
which only applies to the ephemeral share-link case, not this one.

### The link a sticker encodes: `/qr/{objectId}`, not the viewer URL directly

```ts
// src/app/(frontend)/(public)/qr/[objectId]/page.tsx
export default async function QrRedirectPage({ params }: { params: Promise<{ objectId: string }> }) {
  const { objectId } = await params;
  const floorId = await getObjectFloorId(objectId); // payload.findByID({ collection: "map-objects", id: objectId, select: { floor: true } })
  if (!floorId) notFound();
  redirect(`/map/${floorId}?startObject=${objectId}`);
}
```

`map-objects` IDs only ever need to be looked up within the `map-objects`
collection (`payload.findByID({ collection: "map-objects", id })`), so it
doesn't matter that raw IDs aren't guaranteed globally unique across every
collection on the SQLite adapter used in local dev — the route path itself
already scopes which collection the ID belongs to.

One extra redirect hop, but the sticker never needs reprinting unless the
room itself is deleted (which would require a new sticker regardless).

### Where the button lives

Where an admin actually gets the sticker image, confirmed against the real
editor code. The map editor already has an **object inspector** —
`src/features/map-editor/core/components/ObjectInspector.tsx`, rendered by
`InspectorPanel.tsx` whenever the selected entity is a `map-objects` doc.
It already has a "Searchable (Index for guests)" checkbox bound to
`object.isSearchable`, and a single footer action row at the bottom:

```tsx
<div className="pt-4 border-t border-editor-border flex gap-2">
  <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="w-full text-xs">
    {isDeleting ? 'Deleting...' : 'Delete Object'}
  </Button>
</div>
```

A **"Generate QR Code"** button goes in that same row, before the
destructive delete button (non-destructive action first), and is only
rendered `if (object.isSearchable)` — matches the rule already established
above that a QR code only makes sense for a room/place someone would
actually navigate *to*, not a `wall`/`door` geometry piece.

Clicking it opens a small shadcn `Dialog` (same primitive already used
elsewhere, e.g. `AddTeamMemberDialog`) showing the generated code plus
**Download** and **Print** buttons — matching the exact ask ("generate QR,
user can download or print directly").

### Generating the image

**`qrcode`** (`package.json`) is the dependency this uses, generated
client-side via `QRCode.toDataURL(...)` in
`src/features/qr-codes/components/QrCodeDialog.tsx` (isomorphic — same API
would also work server-side if a bulk/server-rendered flow gets built
later).

Nothing about this needs a server round trip: the dialog already has the
object's own `id` in memory (`ObjectInspector` already holds `objectId`),
and the URL it encodes is deterministic —
`${NEXT_PUBLIC_SERVER_URL}/qr/{objectId}` (same env var
`Users.ts`/`page.tsx` already use for building absolute links elsewhere in
this app). So generation runs entirely **client-side**,
`QRCode.toDataURL(url)`, no new server action needed.

### Download / print

Neither pattern exists in this codebase yet (no `download` attribute usage,
no `window.print()` calls anywhere in `src/` — confirmed by grep), so this
introduces both as new, small conventions rather than reusing an existing
one:

- **Download**: a plain `<a href={dataUrl} download={\`${object.name}-qr.png\`}>` —
  the browser's native way to save a data URL, no library needed beyond the
  QR generation itself.
- **Print**: `window.print()` alone would print the whole dashboard page
  behind the dialog, not just the code. The standard workaround — render
  just the QR `<img>` into a hidden `<iframe>` and call
  `iframe.contentWindow.print()` — prints only that image without needing a
  dedicated print route or print stylesheet for the rest of the app.

### No storage — generate on demand, every time

Per your call: **no**, not for now. The encoded URL
(`/qr/{objectId}`) is fully determined by the object's own `id`, which
never changes for the life of that object — regenerating produces the same
QR every time, so there's nothing to cache or persist. No new `QrCodes`
collection, no R2/media upload of the generated image. If a *bulk*
"print every room's QR code for this building at once" page gets built
later (flagged as a maybe in the open questions below), generating on the
fly there too is still simplest — storage would only start to matter if QR
images needed to be generated **server-side and emailed/exported**, which
isn't part of this ask.

## What does *not* need to change

- `NavigationSlice`, `useRoute`, `RoutePanel`, `MapSelectionBar`,
  `RouteSearchFields` — no component in the existing origin/destination
  selection UI changes. Applying a URL param just calls the exact same
  `setOrigin`/`setDestination`/`setAccessibleOnly` that the existing UI
  already calls; a start-only link still leaves the person to pick a
  destination through the existing UI exactly as it works today.
- `MapObjects`/`MapNodes`/`PathEdges` schema — no new fields needed. Objects'
  existing `id`s are the only thing this ever needs to encode.
- `getMapViewerData` — already loads the whole building's floors/objects/
  nodes/edges up front, so a URL-provided origin/destination on a different
  floor than wherever a normal visit would start still has everything it
  needs already loaded; no separate fetch required.

## Decisions made

- **Query param names**: `startObject` / `destObject` (+ `accessible`).
- **Shared route links carry `accessibleOnly`** via `&accessible=1`, so the
  recipient sees the same route the sharer saw, not just the same endpoints.

## Open questions

- **Should scanning/opening a shared link also jump the viewport to
  focus/zoom the relevant floor content**, or is landing on the right floor
  with the route drawn (already true via existing effects) enough? A
  `viewportPan`/`viewportZoom` detail (`MapViewerViewportSlice`) layered on
  top of this, not core to the URL-state design above.
- **Bulk generation** — today's design is one-object-at-a-time from
  `ObjectInspector`. A dedicated "print every searchable room's QR code for
  this building" page would be more useful once there are dozens of rooms to
  sticker up, but isn't needed for a first version — deliberately deferred,
  not designed here.
- **Analytics** — worth logging QR scans (which room, when) to see which
  codes actually get used? Out of scope for the core mechanism, but cheap to
  add later since the resolver route already sees every scan pass through
  it.
