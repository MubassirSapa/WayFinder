# Dashboard QR viewer (view a floor exactly like /map, generate room QR codes)

Status: **implemented.** Supersedes the "Where the button lives" part of
`docs/technical/QR_WAYFINDING.md`'s admin sticker section — QR generation
moved out of the map editor into its own dashboard page,
`/dashboard/buildings/[buildingId]/floors/[floorId]/qr-codes`
(`src/features/qr-codes/`). The scope trims noted below (no zoom/reset/grid
buttons, single floor only) still describe the shipped v1.

## The ask

A new, separate dashboard page per floor where an admin can **look at the
floor exactly as a guest would see it on `/map`** (same rendering, same
pan/zoom feel) — not to edit anything, just to look and pick a room — and
generate/download that room's QR sticker from there. Explicitly not the map
editor (`/editor/[floorId]`): that's for building the floor plan, this is
for browsing the finished result and producing stickers from it.

## Where it lives

A new route, `/dashboard/buildings/[buildingId]/floors/[floorId]/qr-codes`,
reached via a button on the existing floor page
(`src/app/(frontend)/(private)/dashboard/buildings/[buildingId]/floors/[floorId]/page.tsx`)
— same pattern already used there for "Open Editor"
(`buildEditorHref`/`BUILDINGS_CLIENT.FLOOR_OPEN_EDITOR`), not embedded
inline. That page today is a single-purpose metadata form (`FloorMetadataForm`);
a full canvas + room list + QR dialog belongs on its own page rather than
doubling that page's job.

## What "exactly like /map" means for reuse

Read the actual `map-viewer` feature code to figure out what's genuinely
reusable versus what would need new work. It splits into three tiers:

### Reuse verbatim: `MapViewerSvg`

`src/features/map-viewer/components/MapViewerSvg.tsx` — confirmed
prop-driven, no store access inside it at all. Takes `objects`/`nodes`/`edges`/
`activeFloor` plus a set of *nullable* route-highlight props
(`originObjectId`, `destinationObjectId`, `routePoints`, `routeConnectorNodeId`,
etc.). For this page: pass all the route-related props as `null`/`false`/`[]`,
wire `onObjectSelect` to open the QR flow instead of a route action. Same
rooms, same rendering, same visuals as `/map` — nothing to change here.

### Reuse the math and the hooks, isolate the state: a new slice, not a new store

`MapViewerCanvas`, `useMapViewerViewport.ts`, and
`useMapViewerViewportGestures.ts` (pinch, drag inertia, wheel-zoom — 418
lines in the gestures hook alone) all read and write pan/zoom/dragging state
through one hardcoded singleton:

```ts
// src/store/index.ts
export const useAppStore = create<AppStore>()((...args) => ({
  ...createEditorSlice(...args),
  ...createObjectSlice(...args),
  // ...every slice in the whole app, including createNavigationSlice
  // (originNodeId/destinationNodeId/accessibleOnly/...) and
  // createMapViewerViewportSlice (viewportPan/viewportZoom/isViewportDragging)
  ...createMapViewerViewportSlice(...args),
}));
```

There is exactly one `useAppStore` in this app — every slice, including
navigation, lives in it, and there's no existing precedent anywhere in this
codebase for a second, independent store instance (no Context/Provider
multi-store pattern exists today). If this new dashboard page imported
`useMapViewerViewport`/`useMapViewerViewportGestures` unmodified, it would
read and write the *same* `viewportPan`/`viewportZoom` fields the public
`/map` viewer uses, in the same browser tab (Next.js does client-side
navigation between routes in this app, so the store isn't reset just by
changing pages) — and if the object-click handling were reused unmodified
too (`MapViewerShell`'s `focusObject`, which calls `setOrigin` on the first
click when no origin is set yet), browsing rooms on this admin page would
silently start setting real navigation state that then shows up if that
admin later opens `/map` for real in the same tab.

**Decided**: not a second store instance — a **new slice on the same
`useAppStore`**, matching how every other piece of state in this app is
already organized. `createQrViewerViewportSlice.ts`
(`src/features/qr-codes/store/`), same shape as
`createMapViewerViewportSlice.ts` but with its own field names —
`qrViewerPan`/`qrViewerZoom`/`isQrViewerDragging`, not the same
`viewportPan`/`viewportZoom` — so there's nothing to bleed between this page
and the public viewer regardless of navigation. To still share the gesture
*math* (not duplicate 418 lines), `useMapViewerViewport`/
`useMapViewerViewportGestures` need a small refactor to accept which
slice's accessors to read/write (a small "viewport binding" parameter —
state values + setters) instead of hardcoding the
`viewportPan`/`setViewportView`/etc. names directly. The existing
`MapViewerShell` call site passes the navigation-viewport slice's accessors
(today's behavior, unchanged); this new page passes the QR-viewer slice's
accessors. One implementation of the interaction code, two independent
pieces of state.

## Feature ownership: reuse `map-viewer`, new feature for the rest

Same split this codebase already uses for `navigation` vs. `map-viewer` —
`navigation`'s components (`MapSelectionBar`, `RouteSearchFields`, its own
store slice, its own tests) render *inside* `MapViewerShell` but live in
their own feature folder, not inside `map-viewer`. This follows the same
pattern:

- **Stays in `map-viewer`** (unmodified or lightly refactored, not
  duplicated): `MapViewerSvg`, `mapViewerTransform.ts`/`mapViewerViewport.ts`,
  and `useMapViewerViewport`/`useMapViewerViewportGestures` (after the
  injectable-binding refactor above). These are genuinely "how do we
  render/pan/zoom a floor," not QR-specific — no reason for a second copy.
- **New feature, `src/features/qr-codes/`**: the new page's top-level
  component, the QR dialog (`qrcode` lib, download/print — mechanics from
  `QR_WAYFINDING.md`), the room-click-to-QR glue, the new
  `createQrViewerViewportSlice.ts`, the new admin-scoped floor data loader,
  and this feature's own tests. This is where the actual new capability
  lives — nothing here belongs inside `map-viewer` or `buildings`.
- **`buildings`** only gains the one new button/link on the existing floor
  page pointing at the new route — same shape as the existing "Open Editor"
  button, no other change to that feature.

### New work: data loading

`getMapViewerData` (what `/map` uses) filters floors to
`status: "published"` only (confirmed at
`src/features/map-viewer/services/server/getMapViewerData.ts`) — wrong for
an admin tool, which should work on a floor before it's published too.
Needs its own small service, same auth-gated shape `getFloorForEdit`
already uses (`src/features/buildings/services/server/buildings.ports.ts`),
just returning the same node/edge/object shape `MapViewerSvg` expects,
without the published-status filter.

## New UI on this page

- The canvas (as above), read-only — no Start/Route buttons, no
  `MapSelectionBar`, no floor-wheel navigation. Single floor only, matching
  the page it's reached from — no floor switcher on this page (building-wide
  QR browsing would fold into the already-deferred bulk-generation feature
  in `QR_WAYFINDING.md`, not this).
- Clicking a searchable room opens the same QR flow already designed in
  `QR_WAYFINDING.md`'s admin section: a dialog with the QR image
  (`QRCode.toDataURL` from the `qrcode` package, still not installed),
  Download, and Print — generation and download/print mechanics unchanged
  from that doc, only the entry point (map click here, instead of an
  `ObjectInspector` button in the editor) is different. Still gated on
  `object.isSearchable`, same reasoning as before (a QR only makes sense for
  a room/place someone would navigate *to*).
- The QR still encodes `/qr/{objectId}` (the resolver route), not
  `/map/{floorId}?startObject=...` directly — that reasoning
  (physical stickers need to survive a room moving floors) is unchanged by
  where the button lives.

## Decisions made

- **State**: a new `createQrViewerViewportSlice.ts` on the same `useAppStore`
  (distinct field names, not a second store instance), with
  `useMapViewerViewport`/`useMapViewerViewportGestures` refactored to accept
  an injectable viewport binding so both this slice and the existing
  navigation-viewport slice share one implementation.
- **Feature split**: rendering/viewport code stays in `map-viewer`; the page,
  QR dialog, room-click glue, and the new slice live in a new
  `src/features/qr-codes/` feature; `buildings` only gains a link to it.
- **Scope**: single floor only, no floor switcher on this page.
- **Naming**: feature folder `src/features/qr-codes/`, route ends in
  `/qr-codes`.
