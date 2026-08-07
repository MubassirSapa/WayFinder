# QR Code Wayfinding (scan a room → open viewer already routing from there)

Status: **designed, not implemented.** No QR-related code exists anywhere in
this repo today (confirmed by grep) — this is the plan to build from.

## The idea

Print a QR code sticker for a room/place and stick it on the wall there.
Someone scans it with their phone camera, it opens the map viewer with
**that room already set as the starting point** — they just pick where they
want to go and the route is ready. No searching for "where am I" first.

This is explicitly called out as a gap in `docs/technical/HOW_DIRECTIONS_WORK.md`
already: the app has no live indoor positioning, and that doc names
"QR-code checkpoints" as one of the technologies that would close it. This
feature is the static version of that — not live tracking, just "the last
place someone scanned a code."

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
  origin), the "Start here" button in `MapSelectionBar`/`RouteOriginTrigger`,
  or typing into the "From" field in `RoutePanel`. A QR scan is just a new,
  fourth way to call `setOrigin` — arriving with the value already decided
  instead of picked in the UI.
- **The viewer route has zero URL query-param support today.** Grepped the
  whole `map-viewer` feature and the `map/` route tree for
  `useSearchParams`/`searchParams`/`router.push`/`router.replace` — no
  matches. The only URL-based state right now is the `floorId` **route**
  segment in `src/app/(frontend)/(public)/(viewers)/map/[floorId]/page.tsx`.
  Everything else (selected object, origin, destination, viewport) is pure
  client state. So "add URL state" is a real, new piece of work, not
  something to hook into — see [What has to change](#what-has-to-change).
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

Two pieces need deciding: what the printed sticker's URL looks like, and
what query param the viewer reads.

### The link a sticker encodes: `/qr/{objectId}`, not the viewer URL directly

It's tempting to have the QR code just encode the final viewer URL directly
— `/map/{floorId}?startObject={objectId}`. The problem: that hardcodes the
floor into a **physical, unchangeable sticker**. If a room ever gets moved to
a different floor plan, split, or a floor gets restructured, every sticker
that encoded the old `floorId` breaks and needs reprinting on-site.

Better: the sticker encodes a **stable indirection**, `/qr/{objectId}`,
and a small resolver route looks up that object's *current* floor and
redirects:

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

### The query param: `startObject`

`/map/{floorId}?startObject={objectId}` — chosen over encoding a node ID
directly because node IDs are an internal graph-modeling detail
(`map-nodes`); a room's own `map-objects` ID is the stable, meaningful
"what this sticker is about" identifier, and the object→node resolution
already has to happen client-side via `findNodeIdForObject` regardless of
where the ID comes from.

## What has to change

1. **`src/app/(frontend)/(public)/(viewers)/map/[floorId]/page.tsx`** — start
   accepting the `searchParams` prop (currently unused), read `startObject`,
   pass it down: `<MapViewerShell data={{ ...data, initialFloorId: floorId, startObjectId: searchParams.startObject ?? null }} />`.

2. **`src/app/(frontend)/(public)/qr/[objectId]/page.tsx`** — new resolver
   route described above.

3. **`MapViewerShell.tsx`** — currently has a `useEffect` that calls
   `resetNavigation()` whenever `data.initialFloorId` changes (a real floor
   navigation). The QR-apply logic has to be sequenced *after* that reset,
   not race it — either as a continuation of the same effect, or a second
   effect with `initialFloorId` in its dependency array so it always reruns
   together with the reset on a fresh page load:
   - Resolve `startObjectId` → node via `findNodeIdForObject(nodes, startObjectId)`.
   - If found: `setOrigin(nodeId)`, and set the existing local
     `selectedObjectId` state too, so the room is visibly highlighted/
     "You are here" rather than just silently routable.
   - If the object has no associated node yet (a room with no entry point
     modeled in the graph): leave origin unset, let the existing
     ground-floor-entrance fallback apply, and surface a small toast/notice
     rather than failing silently.
   - After applying, `router.replace()` the same path **without** the query
     string. Otherwise a manual refresh — or the user picking a different
     "From" location afterward, then refreshing — would keep re-forcing the
     origin back to the QR value on every reload.

4. **Admin-side: a way to actually generate the stickers.** See
   [Generating QR codes in the dashboard](#generating-qr-codes-in-the-dashboard)
   below.

## Generating QR codes in the dashboard

Where an admin actually gets the sticker image, confirmed against the real
editor code:

### Where the button lives

The map editor already has an **object inspector** —
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

No QR library exists in this repo yet (`package.json` has none — confirmed).
Needs one new dependency: **`qrcode`** (isomorphic — same API works in the
browser or on the server, so it isn't locked into one rendering path if a
bulk/server-rendered flow gets built later).

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

- `NavigationSlice`, `useRoute`, `RoutePanel`, the whole existing
  origin/destination selection UI — none of it changes. The QR flow's whole
  job is to call the exact same `setOrigin` that "Start here" already calls;
  destination is still picked afterward through the existing UI exactly as
  it works today. That matches the actual ask — QR sets *where you are*,
  the person still chooses *where they're going*.
- `MapObjects`/`MapNodes`/`PathEdges` schema — no new fields needed. The
  object's existing `id` is the only thing a sticker needs to encode.
- `getMapViewerData` — already loads the whole building's floors/objects/
  nodes/edges up front, so a QR-provided origin on a different floor than
  wherever a normal visit would start still has everything it needs already
  loaded; no separate fetch required.

## Open questions

- **Should scanning also jump the viewport to that floor/room**, or just
  set the origin and leave the person to orient themselves? Leaning toward
  "also center the viewport on it" for a good first-scan experience, but
  that's a `viewportPan`/`viewportZoom` detail (`MapViewerViewportSlice`)
  layered on top of this, not core to the URL-state design above.
- **Bulk generation** — today's design is one-object-at-a-time from
  `ObjectInspector`. A dedicated "print every searchable room's QR code for
  this building" page would be more useful once there are dozens of rooms to
  sticker up, but isn't needed for a first version — deliberately deferred,
  not designed here.
- **Analytics** — worth logging QR scans (which room, when) to see which
  codes actually get used? Out of scope for the core mechanism, but cheap
  to add later since the resolver route already sees every scan pass
  through it.
