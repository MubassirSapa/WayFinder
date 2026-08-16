# WAYFINDER — PROJECT CONTEXT REPORT

Source-of-truth analysis of the Wayfinder repository, compiled by directly
reading the implementation (collections, access control, pathfinding code,
editor code, auth code, storage/deployment config, tests) and cross-checking
against the project's own maintained docs under `docs/`. Every claim below
is either verified against source code directly, or explicitly marked as
coming from project documentation, an inference, or unclear. Nothing here is
guessed. File paths are given as evidence; code is not dumped in full.

Repository root: `indoor_map/` (this is the actual git root — `git rev-parse
--show-toplevel` confirms it, even though it sits inside a parent folder
that is itself not a git repo).

**A note on `docs/project/SCHEMA.md`**: the project owner flagged that this
doc may not be fully up to date. The schema facts in this report were
independently verified by reading the actual Payload collection source
files (`src/collections/**`), not by trusting the doc — so they should be
accurate regardless. Treat `SCHEMA.md` itself with caution if you open it
directly; trust the code.

---

# 1. PROJECT EXECUTIVE SUMMARY

### One-sentence description

Wayfinder is a web platform that lets organizations draw indoor maps of
their buildings (rooms, floors, stairs, elevators) and lets visitors search
for a destination inside that building and get a calculated walking route to
it, including across floors.

### 30-second explanation

Big buildings — hospitals, malls, campuses, offices — are confusing to
navigate, and paper maps or static signage don't help much. Wayfinder gives
an organization a drag-and-place editor to build a real, structured map of
their building (not a picture — actual rooms, walls, doors, and a
walkable network of paths). Once published, any visitor can open that
building's page, search for where they want to go, and get a real
shortest-path route, drawn on the map, that continues correctly if the
route needs to cross floors via stairs or an elevator. Organizations manage
their own team (owner/manager/member roles) and can generate QR code
stickers for rooms so a visitor can scan a sticker and land directly on
directions from there.

### Detailed explanation

**What it is.** A multi-tenant SaaS-style web app. Each signed-up
organization gets its own workspace ("dashboard") where staff can create
buildings, add floors to each building, and use a visual editor to draw
that floor's layout: rooms, walls, doors, hallways, stairs, elevators,
escalators, washrooms, exits, points of interest, aisles, shelves, and
sections. Separately from the visible drawing, staff also place navigation
nodes and connect them with path edges to form a walkable graph — this
graph is what the pathfinding engine actually routes through, distinct from
the visual room shapes.

**What problem it solves.** Finding a specific room, department, or
service inside a large building is a common, real annoyance — verified by
what the product actually implements (a directory + per-room search +
route calculation), not by any market-research claim in the repo. The
product's actual answer is: give the visitor a search box and a computed
route instead of a static floor plan they have to interpret themselves.

**Who would use it.** Two distinct audiences, matching two distinct parts
of the app:
- **Visitors** — the public, unauthenticated side. Anyone can open the
  public site, browse or search for a building, pick a floor, search for a
  room, and get directions. No account needed.
- **Organizations** — the paying/managing side. A person signs up, which
  automatically creates their organization and makes them its `owner`. They
  invite teammates (`manager` or `member` roles) by email, and together they
  build and publish the building's map from the private dashboard/editor.

**Who would purchase/deploy/manage it.** Based purely on what's modeled in
the data (an `Organization.type` field with options `hospital, university,
mall, office, airport, library, other`), the product is aimed at
organizations that run a physical building visitors need to navigate —
verified from the actual enum in `src/collections/Organizations.ts`, not
assumed.

**Value proposition, plainly.** An organization gets a way to publish an
interactive, searchable indoor map without needing their own engineering
team to build pathfinding or map-editing tools. A visitor gets to skip
"wander around looking at signs" and instead search-and-go, including
across floors.

**What makes it different from a generic map app.** Google Maps and similar
tools route between buildings/addresses using outdoor road networks; they
have no concept of a building's internal rooms, floors, or walkable
interior paths. Wayfinder's data model and routing engine are built
specifically for the *inside* of one building at a time — floors, rooms,
doors, stairs, elevators, and a custom weighted graph connecting them (see
Section 7).

**Visitor experience, concretely** (verified against the actual pages):
search or browse for a building on the home/`/buildings` page → pick a
floor → see the map → search for a room → the app draws a route, switching
floors automatically with a "continue via stairs/elevator" prompt when the
route crosses floors → arrive. A visitor can also scan a printed QR sticker
in a physical room and land straight on the map with that room already set
as their starting point.

**Organization/admin experience, concretely**: sign up (auto-creates the
org, makes you `owner`) → create a building → add floors → open the visual
editor for a floor → place rooms/walls/doors/etc., let "Smart Builder"
auto-generate navigation nodes and connect them to the hallway network (or
do it by hand) → connect stairs/elevators between floors → toggle the floor
to "published" from the dashboard → invite teammates by email with a role
and building access → generate a printable QR sticker for any searchable
room.

---

# 2. PROBLEM / BUSINESS CASE

### Current problem

Large indoor spaces are hard to navigate using static signage or printed
maps — this is the implicit premise behind every feature that exists
(search, routing, floor-switching). The repo doesn't contain market
research; this is inferred from what the product was built to do, not
claimed as an externally-sourced fact.

### Who experiences the problem

Two groups, matching the two user-facing halves of the app:
- Visitors trying to find a specific room/department/service in a building
  they don't know well.
- Organizations that want to help those visitors but don't have an
  off-the-shelf way to publish an interactive, structured (not just a
  scanned PDF) indoor map.

### Why current alternatives may be insufficient

The repo doesn't document competitor analysis. What can be said from the
implementation itself: a plain static floor-plan image (a PDF or photo)
has no search, no computed route, and no way to represent "this is
walkable, that is a wall" — Wayfinder's data model deliberately separates
the *visual* layer (`MapObjects` — what's drawn) from the *walkable* layer
(`MapNodes`/`PathEdges` — what's routable), specifically so a route can be
calculated rather than just displayed as a picture (see Section 6).

### How Wayfinder addresses it

- A structured data model per floor (rooms, walls, doors, connectors) instead
  of a flat image.
- A real weighted graph (nodes + edges) with a real shortest-path algorithm
  (Dijkstra — Section 7), not a straight line between two points.
- Multi-floor awareness: a path edge can span two different floors (a
  stairs/elevator/escalator connection), and the UI explicitly prompts the
  visitor to continue to the next floor.
- An accessible-only routing toggle that structurally excludes non-accessible
  nodes/edges from the graph, not just a cosmetic label.
- QR stickers that survive a room later moving to a different floor, because
  the sticker encodes a stable resolver URL (`/qr/{objectId}`) that looks up
  the room's *current* floor at scan time, not a hardcoded floor URL.

### Practical examples

- A hospital publishes its building; a visitor searches "Radiology," gets a
  route from the main entrance, and the app tells them to take the elevator
  to floor 2 partway through.
- A mall organization prints QR stickers near each store entrance; a
  shopper scans one and immediately gets directions from that exact spot to
  wherever they search next.

---

# 3. USER TYPES AND ROLES

Verified directly from `src/collections/constants/roles.ts`,
`src/collections/access/index.ts`, and `docs/security/RBAC.md` (cross-checked
against the access-control code, not trusted blindly).

There are exactly **four** account types in the system: one platform-level
type and three organization-level roles. No other roles exist in the code.

## `admins` (platform administrator)

- Separate Payload auth collection (`src/collections/Admins.ts`), entirely
  unrelated to any Organization — not a "role" on a user record, a
  completely different login system.
- Can manage platform-level access to `organizations`/`users`/`buildings`
  gated by `isPlatformAdmin`.
- Not modeled as having day-to-day building/map management workflows in the
  app's own UI — this collection exists for the Payload Admin panel
  (`/admin`), not the dashboard.
- Typical workflow: not really used through the app's own UI (dashboard,
  editor) at all — it's the backing account type for `/admin`.

## `owner` (organization role, on `users`)

- Exactly one per organization, assigned automatically at signup
  (`src/features/auth/services/server/auth-pl.adapter.ts::signupAdapter`).
- Implicit access to every building in their organization — no explicit
  `buildings` field needed or used.
- Can: create/edit/delete any building in their org; full CRUD on any
  building's floors/map content; edit organization info (name, type, logo);
  read every user in the org; create `manager`/`member` users (never a
  second `owner`); update/delete any non-owner user; block/unblock a
  non-owner user; invite by email (role `manager`/`member` only); edit their
  own profile and password.
- Cannot: be updated or deleted by a manager; be demoted; have their own
  `role`/`organization`/`buildings` fields changed by themself (self-escalation
  is structurally blocked, see Section 12).
- Typical workflow: sign up → build the org's first building/floor →
  invite teammates → publish.

## `manager` (organization role, on `users`)

- Verified in code (`isOwnerOrManager()` helper,
  `src/collections/constants/roles.ts`) to have **the same organization-wide
  management ceiling as `owner`** in every access function checked —
  buildings, map content, users, invitations, organization settings. The
  one asymmetry: a manager cannot update/delete the org's `owner` record,
  and cannot promote anyone to `owner`.
- Typical workflow: identical to owner's day-to-day usage, minus being able
  to touch the owner's own account.

## `member` (organization role, on `users`)

- Scoped access: only the buildings listed in their own `buildings`
  relationship field grant them anything.
- Can: fully create/update/delete map content (floors, objects, nodes,
  edges) — but **only** within a building they're assigned to; read their
  own building's own record (name/address/logo); read only their own user
  record (not the rest of the org's team list); edit their own profile and
  password.
- Cannot: edit a building's own record (name, address, contact, logo — even
  for a building they're assigned to, this is read-only for a member); see
  or manage other users; create/invite anyone; change their own role or
  building assignments; access a building they aren't explicitly assigned to.
- Typical workflow: given access to one or a few specific buildings by an
  owner/manager, then works inside the floor editor for those buildings.

## Permission summary table (verified against `src/collections/access/index.ts`)

| Capability | Owner | Manager | Member |
|---|---|---|---|
| Read every building in own org | Yes | Yes | No (only assigned) |
| Create/edit/delete a building's own record | Yes | Yes | No |
| Full CRUD on map content of an accessible building | Yes | Yes | Yes (assigned buildings only) |
| Edit organization info | Yes | Yes | No |
| Read organization's user list | Yes | Yes | Only self |
| Create/invite a user (role manager/member) | Yes | Yes | No |
| Update/delete another non-owner user | Yes | Yes | No |
| Block/unblock a user | Yes | Yes | No |
| Update own profile/password | Yes | Yes | Yes |
| Change own role/org/buildings | No | No | No |

---

# 4. COMPLETE FEATURE INVENTORY

## Public / Visitor Features

- **Building directory & search** (`/`, `/buildings`) — search-as-you-type
  over published buildings, "Filter by organization" shortcut, "Recently
  added" section. Backed by `getPublicLandingData()`
  (`src/features/viewer/services/getPublicLandingData.ts`), which queries
  only `floors` with `status: "published"`. Fully implemented.
- **Public floor map viewer** (`/map/[floorId]`) — renders a floor's rooms,
  walls, and other objects, with pan/zoom (custom-built, supports pinch on
  touch). Fully implemented.
- **Room search + routing** — search a room by name inside a floor, set it
  as origin/destination, get a calculated route drawn on the map. Fully
  implemented (Section 7).
- **Accessible-only routing toggle** — structurally filters the graph, not
  cosmetic. Fully implemented.
- **Multi-floor routing with floor-hop prompts** — `FloorHopIndicator`
  tells the visitor which connector type (stairs/elevator/escalator) to
  take and to which floor. Fully implemented.
- **QR sticker scanning** (`/qr/[objectId]`) — public, unauthenticated
  resolver; looks up the room's *current* floor and redirects into the
  viewer with that room pre-set as the start. Fully implemented.
- **Shareable route URL contract** — `/map/{floorId}?startObject=&destObject=&accessible=1`
  is consumed by the viewer (`useApplyRouteFromUrl`) to pre-fill a route on
  load. This is the *consumer* half. Fully implemented as a consumer.
- **"Share this route" button** (a visitor generating their own shareable
  link/QR from an in-progress route) — **not implemented**. Documented in
  `docs/technical/QR_WAYFINDING.md` as the one remaining undone piece of that
  design; no `Share` button exists in `MapSelectionBar` in the current code.
- **Organization marketing pages** (`/organization`, `/organization/about`,
  `/organization/contact`) — static, pitches the product to potential
  organization customers and gives them a direct email contact. Fully
  implemented, no data fetching (fully static pages).
- **About/Terms/Privacy pages** — static informational pages. Fully
  implemented.
- **Responsive/mobile UI** — hero text hidden on phone, hero illustration
  hidden below `sm`, floor picker as a wheel-style control, mobile nav menu.
  Fully implemented (extensively worked on this session).
- **Light/dark theme** — a green-leaning palette, `next-themes`-based
  toggle. Fully implemented.

## Organization Dashboard

- **Dashboard overview** (`/dashboard`) — role-aware "bento" landing page
  linking to available work areas. Fully implemented.
- **Organization settings** (`/dashboard/organization`) — edit name, type,
  logo. Fully implemented, owner/manager only for edits.
- **Building management** (`/dashboard/buildings`,
  `/dashboard/buildings/[id]`) — list, create, edit building metadata
  (name/address/contact/logo). Fully implemented.
- **Floor management** (within a building's page) — list floors, create a
  floor, edit floor metadata, toggle publish status. Fully implemented.
- **Map editor** (`/editor/[floorId]`) — the visual per-floor editor: place
  objects (13 types), place navigation nodes, draw path edges, adjust a
  background reference image. Fully implemented (Section 8).
- **Smart Builder** (editor extension) — automatic node generation on
  object creation, automatic connection to the nearest hallway, and a
  manual polyline tool for building a hallway's own path quickly. Fully
  implemented, genuinely automated (verified — not a stub).
- **Floor-links** (editor extension) — connect a stairs/elevator/escalator
  node on one floor to its counterpart on another floor of the same
  building, with an auto-derived edge type and a default (estimated, not
  measured) distance. Fully implemented.
- **Dashboard QR viewer + sticker generator**
  (`/dashboard/buildings/[id]/floors/[id]/qr-codes`) — a read-only render of
  a floor (reusing the public viewer's own rendering code) for picking a
  room and generating/downloading/printing its QR sticker. Fully
  implemented.
- **User/team management** (`/dashboard/users`, `/dashboard/users/[id]`) —
  role-grouped directory, per-user detail page for role/building
  assignment, block/unblock, invite history, and removal. Fully
  implemented, owner/manager only.
- **Email invitations** — invite a teammate by email with a role and (for
  members) building assignments; resend (rotates token) or revoke a
  pending invite. Fully implemented (Section 12 has the security detail).
  Direct password-creation by an admin was **removed entirely**, not kept
  as a fallback.
- **Profile page** (`/dashboard/profile`) — edit own name, avatar, and
  password (with current-password verification). Fully implemented.
- **Media/logo/avatar management** — upload and replace organization logo,
  building logo, user avatar, floor background image, with automatic
  cleanup of the previously-replaced file. Fully implemented.

## Platform/Admin Features

- **Payload Admin panel** (`/admin`) — Payload CMS's own generic
  collection-browsing UI, gated to the separate `admins` auth collection.
  This is framework-provided, not custom-built product UI. Present and
  functional, but not a designed "product feature" the way the dashboard is.

## Authentication / Account Features

- **Sign up** — creates an Organization and an `owner` user together.
  Fully implemented.
- **Sign in / sign out** — Payload's own cookie-session auth. Fully
  implemented.
- **Email verification** — required for self-signup accounts (Payload's
  built-in `auth.verify`); invited users skip it (verified true directly at
  acceptance, since the invite link itself already proved email ownership).
  Fully implemented.
- **Forgot/reset password** — Payload's own built-in token flow. Fully
  implemented.
- **Self-service password change** (from Profile) — requires proving the
  current password first; structurally cannot target another account (no
  such parameter exists in the function signature). Fully implemented.
- **Account blocking** — an owner/manager can block a teammate's ability to
  sign in; enforced by a `beforeLogin` hook. Fully implemented. Does not
  force-invalidate an already-active session (see Section 19).

## Other Features

- **SEO**: `robots.txt` and `sitemap.xml`, both dynamically generated
  (`src/app/robots.ts`, `src/app/sitemap.ts`), added this session. Fully
  implemented.
- **Distance/turn-by-turn text instructions and voice guidance** — **not
  implemented**. `docs/technical/HOW_DIRECTIONS_WORK.md` is explicitly a
  design document for this; its own Section 6 ("What still needs to be
  added") lists turn detection, instruction text generation, an
  instruction-list UI, and Web Speech API integration as future work, none
  of which exists in the current codebase (confirmed by the pathfinding
  research above — the engine returns a path and per-floor segments, no
  turn-by-turn text).
- **Live indoor positioning** — explicitly and deliberately not
  implemented; documented as a known, permanent-for-now limitation (no GPS/
  beacon/Wi-Fi/NFC tracking exists or is planned in the current codebase).

---

# 5. CORE USER JOURNEYS

### Visitor Journey (verified against the real components/hooks)

1. Visitor opens `/` or `/buildings`, searches or browses to a building.
2. Picks a floor (`FloorSelectorDialog` on the directory, or floor picker
   inside the viewer).
3. `/map/[floorId]` loads — floor renders read-only, pan/zoom available.
4. Visitor searches for a room (`RouteSearchFields`/`MapSelectionBar`) and
   picks it as origin and/or destination — the *first* object clicked with
   no origin yet set automatically becomes the origin (`focusObject` logic
   in `MapViewerShell.tsx`).
5. `useRoute` builds the graph and runs Dijkstra reactively (no explicit
   "Go" button) the moment both origin and destination are set.
6. Route line renders on the current floor; if the route continues onto
   another floor, `FloorHopIndicator` shows "Continue via stairs/elevator/
   escalator to `<floor name>`."
7. Visitor taps to advance; the viewer switches active floor and shows the
   next segment.
8. Visitor arrives; `RouteStatusIndicator` confirms the route was found (or
   shows "no route found" if the graph had no path).

**QR-scan variant**: visitor scans a sticker → `/qr/[objectId]` looks up
the room's current floor → redirects into `/map/{floorId}?startObject=...`
→ the viewer applies that as the origin automatically on load (steps 4-8
above continue from there, visitor still has to pick a destination).

### Organization Onboarding / Setup Journey

1. Sign up (`/signup`) — creates the Organization + the signer as `owner`.
2. Verify email (Payload's built-in flow, link in the verification email).
3. Land on `/dashboard`.
4. Create a building (`/dashboard/buildings`).
5. Add a floor to that building.
6. Open the floor in the editor (`/editor/[floorId]`).
7. Upload a reference/background image for the floor (optional, but
   practically how most editors start).
8. Place objects, let Smart Builder (on by default) auto-generate nodes and
   connect them to the hallway network, or build manually.
9. Connect any stairs/elevator/escalator nodes to their counterpart on
   another floor (Floor-links panel).
10. Save (explicit Save button — no autosave anywhere in the editor).
11. Toggle the floor to "Published" from the building's dashboard page.
12. Invite teammates (`/dashboard/users` → "Invite" → email, role, building
    access if `member`).

### Creating a Building

Dashboard → Buildings → Create → name (required) + optional
address/contact/website/logo → saved via `createBuildingAction`.

### Creating Floors

Inside a building's dashboard page → "Add floor" → name, level, and default
dimensions (`width: 1200`, `height: 800`, `metersPerPixel: 0.05` unless
changed) → `createFloorAction`.

### Creating Locations (map objects)

Inside the editor → pick a type from the toolbox (Structure / Connectors /
Wayfinding & Amenities / Retail & Storage categories) → **double-click** an
empty spot on the canvas to place it (not drag-and-drop from the panel) →
drag/resize/rotate as needed, snapped to a 20px grid.

### Building the Navigation Network

Either: manually switch to "node" mode and click to place nodes, then
"path" mode and click two nodes to connect them — or let Smart Builder do
it automatically as objects are created (default on), with a manual
"Generate missing nodes"/"Auto-connect" re-run available, plus a
click-a-polyline "Finish hallway path" tool for laying out a hallway's own
walkable spine quickly.

### Publishing a Map

Not done from inside the editor at all — the "Published"/"Draft" toggle
lives on the building's dashboard page (`FloorRow.tsx`), a `Switch` per
floor. This is a deliberate separation: editing and publishing are
different actions in different places.

### Managing Team Members

`/dashboard/users` → "Invite" (name, email, role, buildings if member) →
teammate receives an email, opens `/invite?token=...`, sees their assigned
role and (read-only) email, chooses their own name/password → account
created and they're signed in automatically. Owner/manager can later change
a non-owner's role/building access, block them, or remove them from the
per-user detail page.

### Editing Existing Building Data

Owner/manager: open the building's dashboard page, edit name/address/
contact/logo directly. A `member` assigned to that building can view this
page but the edit controls aren't available to them (enforced server-side,
not just hidden in the UI — see Section 12).

---

# 6. INDOOR MAPPING SYSTEM

### Plain English

Each floor has a fixed-size canvas (like a sheet of graph paper with a set
width and height in "map pixels," default 1200×800). Everything on that
floor — rooms, walls, doors, stairs — is placed at an exact x/y position on
that sheet, with its own width, height, and rotation. Separately from what
you can *see*, the floor also has an invisible network of dots (navigation
nodes) connected by lines (path edges) — this network is what routing
actually uses. A floor can also have a reference image (an uploaded floor
plan photo/scan) shown underneath everything else, which staff can
position, scale, rotate, and dim independently of the actual map data.

### Technical

- **Buildings** group **Floors**; each **Floor** stores its own
  `width`/`height` (pixel-space size) and `metersPerPixel` (real-world
  scale factor, default `0.05`, i.e. 1px ≈ 5cm) — verified in
  `src/collections/map/Floors.ts`.
- **MapObjects** (the visible drawing layer) and **MapNodes** (the routable
  graph layer) both store raw `x`, `y`, `width`, `height`, `rotation` in
  that same floor-pixel space — no 0–1 normalization anywhere.
- Coordinates are **never compared across floors** — an x of 100 on Floor 1
  has no spatial relationship to x=100 on Floor 2; floors are connected
  purely through **PathEdges** with their own configured `distanceMeters`,
  not through any coordinate transform.
- **Rendering**: the editor canvas is a plain SVG sized exactly
  `width={floor.width} height={floor.height}` — one SVG unit always equals
  one floor pixel; the wrapping div carries a `translate(pan) scale(zoom)`
  CSS transform (`buildCanvasViewportTransform()`,
  `src/features/map-editor/core/lib/canvasViewport.ts`) so the on-screen
  size can differ from that pixel size while the underlying coordinate
  space stays fixed. Pointer→canvas coordinate conversion uses
  `getScreenCTM().inverse()` (`src/features/map-editor/core/lib/canvas.ts`),
  which reflects that transform automatically; drag hooks that move stored
  x/y from raw `clientX`/`clientY` deltas instead (`useNodeDrag.ts`,
  `useObjectDrag.ts`'s move/resize cases, `useBackgroundImageDrag.ts`)
  divide the delta by the zoom captured at drag-start, since a screen-pixel
  delta only equals a floor-pixel delta at zoom 1.
- **Background reference image**: positioned via a computed fit rectangle
  (`computeBackgroundImageFit()`,
  `src/features/map-editor/core/lib/backgroundImageFit.ts`) driven by
  `backgroundImageFit` (`fill`/`cover`/`contain`, CSS-`object-fit`-style),
  plus stored offset/scale/rotation/opacity fields, entirely independent of
  the map object/node coordinate system layered on top of it.
- **Pan/zoom**: the editor supports **pan and wheel/button zoom, desktop
  only** (`useCanvasViewport.ts`, `editorViewportPan`/`editorViewportZoom`
  in `createEditorViewportSlice.ts`) — drag to pan, mouse wheel to zoom
  anchored at the cursor, plus explicit zoom-in/zoom-out/fit-to-view
  buttons (`EditorZoomControls.tsx`) in the toolbar. It fits the floor to
  the viewport on first load and re-fits whenever the floor's own
  dimensions change (a floor switch, or the reference-image upload
  auto-sizing the canvas — see the Floor image/map upload note in Section
  8). No pinch/touch gesture handling, since the editor is desktop-only
  already (`EditorDesktopOnlyNotice`). The **public viewer** has a
  separate, more elaborate custom implementation additionally supporting
  pinch-to-zoom and a mobile zoom profile
  (`useMapViewerViewportGestures.ts`), writing transforms directly to the
  DOM per-frame for performance. **These two pan/zoom systems are not
  shared code** — verified no imports exist between the two feature
  folders; each is separately hand-rolled (no pan/zoom library like
  `d3-zoom` or `react-zoom-pan-pinch` is a dependency), though the editor's
  clamp/fit math (`lib/canvasViewport.ts`) mirrors the viewer's
  (`lib/mapViewerViewport.ts`) formulas rather than reusing them directly.
- **State persistence**: the editor holds all changes in a Zustand store
  entirely client-side; nothing is written to the database until the
  explicit Save button is pressed (no autosave — Section 8 has the full
  save sequence).

---

# 7. PATHFINDING / NAVIGATION ENGINE

### Non-technical explanation

Once a visitor picks a start and an end, the app looks at the whole network
of dots-and-lines (nodes and edges) for the building and finds the shortest
real path through it — like finding the fastest route through a maze where
some paths are longer than others. If the path needs to go up or down a
floor, that's just another line in the network with its own "cost," plus a
small extra penalty added specifically so the app doesn't pick a route that
needlessly bounces up to another floor and back down when a same-floor walk
would actually be shorter.

### Technical explanation

- **Node**: `ViewerMapNode` — `id`, `floorId`, `buildingId`, optional
  `objectId` (back-reference to the room it belongs to, if any), `role`
  (`entrance | exit | hallway_point | stairs_entry | elevator_entry |
  escalator_entry | shelf_access`), position/geometry fields,
  `isAccessible`.
- **Edge**: `ViewerPathEdge` — `id`, `floorId`, `buildingId`, `fromNodeId`,
  `toNodeId`, `type` (`walkway | stairs | elevator | escalator | ramp`),
  `distanceMeters`, `bidirectional`, `isAccessible`.
- **Algorithm**: **Dijkstra's algorithm**, implemented in
  `src/features/navigation/lib/dijkstra.ts` (`findShortestPath`). It is a
  textbook O(V²) implementation (linear scan for the minimum-distance
  unvisited node each iteration), **not** a priority-queue/heap-optimized
  version, and **not** A* (no heuristic) or BFS (edges are weighted, so BFS
  wouldn't be correct here). Given this app's per-building graph sizes
  (tens to low hundreds of nodes per floor set, not tens of thousands),
  Dijkstra without a heap is a reasonable, simple choice — appropriate for
  the actual scale, not a performance concern at this size.
- **Weight calculation** (`src/features/navigation/lib/graph.ts`,
  `buildRouteGraph`): weight = `edge.distanceMeters`, **plus a fixed 12-metre
  penalty if the edge crosses floors** (`FLOOR_CHANGE_PENALTY_METERS = 12`,
  `src/features/navigation/constants/routing.constants.ts`). This penalty
  exists specifically to stop the search from taking a cheap-looking
  cross-floor "shortcut" that bounces through another floor and back —
  confirmed by a dedicated test case with exactly that scenario.
- **Directed vs. bidirectional**: an edge always adds a forward adjacency
  entry (`fromNodeId → toNodeId`); the reverse entry is added **only if**
  `edge.bidirectional === true`. A one-way edge is genuinely one-way in the
  graph (verified by a test asserting the reverse direction returns `null`).
- **Accessible-only filtering**: a full exclusion, not a soft penalty. When
  the toggle is on, any node with `isAccessible: false` is never even added
  to the graph's adjacency map, and any edge that is itself inaccessible
  (or whose endpoints are inaccessible) is skipped before being added —
  confirmed by a test where turning the toggle on changes the total route
  distance because the shorter path's only route is now structurally
  unavailable.
- **Room → routable node**: a room (`MapObject`) becomes searchable via
  `isSearchable`, but only becomes an actual routable *destination* if some
  `MapNode` has `objectId` pointing back to it
  (`findNodeIdForObject`/`filterRouteCandidates`,
  `src/features/navigation/lib/`). A room with no linked node is excluded
  from search suggestions entirely, so a visitor can never pick a dead-end.
- **No route exists**: `findShortestPath` returns `null` (not an empty
  array, not a thrown error). The UI (`RoutePanel`, `RouteStatusIndicator`)
  shows "No route found between these points" (or the accessible-specific
  variant) whenever `route` is falsy.
- **Multi-floor spanning**: there is no special "connector" edge type at
  the routing-graph level — a `PathEdge` whose two nodes simply happen to
  be on different floors *is* the cross-floor connection; `buildRouteGraph`
  treats it like any other edge except for adding the floor-change penalty.
  The distinct "connector" concept (`stairs_entry`/`elevator_entry`/
  `escalator_entry` node roles) lives in the **editor**, which is how those
  edges get created in the first place (Floor-links extension).
- **Turning a path into per-floor segments**: `splitRouteByFloor`
  (`src/features/navigation/lib/routeSegments.ts`) walks the path's node
  list, starting a new `RouteFloorSegment` every time consecutive nodes'
  `floorId` differs, recording which connector type (`enterViaEdgeType`)
  was used to enter each new segment — this drives the "Continue via
  stairs/elevator" `FloorHopIndicator` UI directly.
- **Caching**: none beyond React's own `useMemo` — the adjacency graph is
  memoized on `[nodes, edges, accessibleOnly]` (deliberately *not*
  re-keyed on origin/destination), and the computed route is a separate
  memo keyed on `[graph, origin, destination]`. No cross-session cache, no
  server-side route cache.

### Step-by-step example route (illustrative, based on the real mechanism)

```
Entrance (floor 1) --walkway 12m--> Hallway junction
    --walkway 6m--> Stairs-entry (floor 1)
        [cross-floor edge, stairs, 6m + 12m penalty = 18m weighted]
    --> Stairs-entry (floor 2) --walkway 8m--> Room 204 (destination)

totalDistanceMeters (real, unpenalized) = 12 + 6 + 6 + 8 = 32
(the 12m penalty affects which route Dijkstra picks, but does not
inflate the reported totalDistanceMeters itself — verified: the penalty
is only added into the search's internal weight, not into the real-world
distance field the algorithm returns)
```

No performance benchmarks exist in the repo — none are claimed here.

---

# 8. MAP EDITOR / ADMIN MAPPING WORKFLOW

1. **Building creation** — dashboard form, name required.
2. **Floor creation** — name, level; dimensions default to 1200×800px,
   `metersPerPixel` defaults to 0.05. `width`/`height` can be changed later
   via the dashboard's floor-settings form, or by dragging the canvas's own
   bottom-right resize handle in the editor (`FloorResizeHandle`,
   grid-snapped, select mode only) — neither path rescales already-placed
   objects/nodes/edges, so both warn (a tooltip, in the handle's case) once
   the floor has anything on it.
3. **Floor image/map upload** — `FloorReferencePanel`, direct-to-R2 client
   upload, then position/scale/rotate/opacity/lock/visibility controls, all
   client-side only until Save. If the floor has no objects/nodes/edges
   placed yet, uploading (or replacing) the image also resizes the floor's
   own `width`/`height` to match the image's natural pixel size, so `fill`
   fit shows it undistorted with no manual math — skipped once anything is
   placed, since resizing never rescales existing entities' `x`/`y`.
4. **Location placement** — toolbox category → **double-click** empty
   canvas (not drag-and-drop) → object placed at a 20px-grid-snapped
   position with type-specific default size.
5. **Node placement** — either automatic (Smart Builder, on by default,
   creates a node the moment an eligible object type is created — rules:
   `room/door/exit → entrance`, `stairs → stairs_entry`, `elevator →
   elevator_entry`, `escalator → escalator_entry`, `shelf/section →
   shelf_access`; `wall/hallway/washroom/poi/aisle` never get an
   auto-node) or manual (switch to "node" mode, click canvas).
6. **Path/edge creation** — automatic (Smart Builder's auto-connect finds
   the nearest hallway object within 120px and stitches the new node into
   the hallway's existing node chain, real geometry — axis projection,
   tolerance-based reuse, not a stub) or manual (click one node, then
   another, in "path" mode).
7. **Inter-floor connections** — Floor-links panel, shown only when a
   selected node's role is a connector role; pick a same-role node on
   another floor of the same building from a dropdown; edge type and a
   *default estimated* distance (elevator 3m, escalator 4m, stairs 6m — not
   measured, since the two nodes are on different floors with no shared
   coordinate space) are set automatically.
8. **Editing/deleting** — drag/resize/rotate via native pointer handlers,
   snapped to grid; delete via the object/node/edge inspector panel.
9. **Validation** — **no client- or server-side geometric bounds checking**
   (an object can be placed outside the floor's own width/height with
   nothing stopping it — confirmed absent). Server-side validation that
   *does* exist: Payload field `required` constraints, and dedicated
   `beforeValidate` hooks asserting a floor/parentObject/node/edge's
   relationships all belong to the same `building` as the record being
   saved (referential-integrity checks, not geometric ones).
10. **Saving** — **explicit Save button only, no autosave.** Every local
    edit just flips an in-memory `_dirty` flag. On Save: floor fields first
    (if dirty), then objects, then nodes, then edges — in that order,
    because nodes may reference objects and edges require real database IDs
    for their nodes. Temporary client-side IDs are swapped for real Payload
    IDs mid-sequence.
11. **Publishing** — **not from the editor at all.** A `Switch` on the
    building's dashboard page toggles a floor's `status` between
    `draft`/`published`.
12. **What public users receive** — the public viewer's data loader filters
    `where: { status: { equals: "published" } }` on `floors` first, and
    only then queries objects/nodes/edges scoped to that already-filtered
    floor-ID list — so draft floor content is excluded structurally (it
    never enters the filter), not by a second access check on each
    content collection.

**Interesting UX decision worth noting**: Smart Builder is real, automated,
geometry-aware logic (nearest-hallway detection, axis projection, node
chain stitching) — not a marketing name for a simple auto-fill. It's also
fully re-runnable after the fact ("Generate missing nodes," "Auto-connect")
rather than being a one-shot action only available at creation time.

---

# 9. DATABASE / DATA MODEL

- **Database technology**: dual-adapter, environment-selected. `@payloadcms/
  db-sqlite` (Drizzle-based) is the **default** if `DATABASE_ENGINE` is
  unset; `@payloadcms/db-mongodb` is used if `DATABASE_ENGINE=mongo`. Both
  are real dependencies in `package.json`; the choice is a single env var,
  not a code branch per collection (`src/plugins/database/database.ts`).
- **ORM/ODM**: Payload CMS's own Local API sits in front of whichever
  database adapter is active — the application code never talks to
  SQL/Mongo directly.
- **Collections** (exact list from `src/collections/index.ts`): `admins`,
  `users`, `organizations`, `buildings`, `invitations`, `media`, `floors`,
  `map-objects`, `map-nodes`, `path-edges`. (A `SearchableItems.ts` file
  exists but is empty and unregistered — not a real collection; searchability
  is just the `isSearchable` boolean on `map-objects`.)
- **Key fields per collection** — see Section 4/6/7 for the fields that
  matter functionally; full field-by-field detail is in
  `docs/project/SCHEMA.md` (verified accurate against the collection source
  files at the time of this report, notwithstanding the project owner's
  caution that the doc may drift).
- **Design decisions worth calling out**:
  - `logoUrl`/`avatarUrl` are **denormalized** copies of the related
    `media` doc's `url`, kept in sync by a `beforeValidate` hook, so reads
    never need to populate the `media` relation (works around a documented
    Payload populate-restriction bug).
  - `floorCount` on `Buildings` is a denormalized, hook-maintained cache —
    explicitly documented as *not* authoritative, always derivable from
    `floors.building`.
  - Every map-content collection (`floors`, `map-objects`, `map-nodes`,
    `path-edges`) carries its **own** `building` relationship field, not
    just a transitive one through `floor` — specifically so access control
    can filter each collection directly without an extra join.
  - `User → Organization` is many-to-one (not many-to-many) by deliberate
    design: `users.email` is globally unique (Payload's auth requirement),
    and each user document has exactly one `organization` field — a person
    needing access to two organizations needs two separate accounts with
    two different emails, not two relationships from one account.
  - `invitations.update`/`delete` access is `noOne` — an invitation is
    architecturally immutable except through the dedicated invite/resend/
    revoke/accept application code, never edited directly.

### Text diagram (matches the actual relationship fields found in code)

```
Organization
  ├─< User (users.organization → organizations, required; many users : 1 org)
  ├─< Building (buildings.organization → organizations, required)
  ├─< Invitation (invitations.organization → organizations, required)
  └── (Media: organizations.logo → media, one optional logo)

User
  ├── buildings (hasMany → buildings; only meaningful for role "member")
  ├── avatar (→ media)
  └─< Invitation (invitations.invitedBy → users, required)

Building
  ├─< Floor (floors.building → buildings, required)
  └── logo (→ media)

Floor
  ├─< MapObject (map-objects.floor → floors, required)
  ├─< MapNode (map-nodes.floor → floors, required)
  ├─< PathEdge (path-edges.floor → floors, required — the edge's "origin" floor;
  │             the edge's two nodes can still belong to different floors)
  └── backgroundImage (→ media)

MapObject
  ├─< MapObject (parentObject, self-relation — nesting, e.g. a shelf inside a section)
  └─< MapNode (map-nodes.object → map-objects, optional back-reference)

MapNode
  └─< PathEdge (fromNode / toNode, both required)

Media  — a leaf collection, only ever pointed to (never points out)
  referenced by: organizations.logo, buildings.logo, users.avatar, floors.backgroundImage

Admin — fully isolated; no relationship to/from any organizational or map data.
```

---

# 10. BACKEND / SERVER ARCHITECTURE

- **Framework**: Next.js 16 (App Router), backed by Payload CMS 3 as the
  data/auth/admin layer, both running as one deployable application (a
  "modular monolith" per the project's own architecture doc, not separate
  services).
- **Request flow — three distinct, deliberately-separated paths**
  (verified against `docs/technical/APPLICATION_ARCHITECTURE.md` and spot
  checked against real action/adapter files):
  1. **Client-triggered writes**: Component → `'use server'` action (in
     `actions/server/`) → a **port** (interface function) → a **Payload
     adapter** (the actual `payload.update`/`create`/`delete` call) →
     Payload Local API → collection access control → database.
  2. **Client-triggered reads**: Hook → `actions/client/` → `services/
     client/` → the shared Payload **REST SDK** → Payload's REST API
     (real access-control enforcement, since Local API's `overrideAccess`
     doesn't apply here).
  3. **Server-rendered reads**: a Server Component calls a `services/
     server/*` function directly (no action wrapper, since no client/server
     boundary is crossed) → Payload Local API → database.
- **Validation**: Zod schemas per feature (e.g.
  `src/features/invitations/validations/`), checked in the server action
  before calling the port.
- **Authorization**: enforced at the Payload **collection access-control**
  layer (`src/collections/access/index.ts`) via `overrideAccess: false` +
  the real authenticated `user` object on nearly every mutation that
  touches another party's data — verified directly for role changes,
  blocking, and building deletion (Section 12). A small number of
  deliberate `overrideAccess: true` exceptions exist (e.g. invitation
  status flips after an already-scoped read, signup's initial
  org+building+user creation) and are explicitly commented as such in code.
- **Error handling**: a shared `tryCatchResponse` wrapper
  (`src/lib/responses/trycatch-response.ts`) used by every adapter, and a
  `TResponse<T>` envelope (`errorResponse`/`successResponse`) every server
  action returns — one consistent shape components branch on.
- **Caching/revalidation**: `revalidatePath` calls exist in dashboard
  mutation actions (targeting dashboard paths only). Per this session's own
  `docs/technical/CACHING_AND_RENDERING_STRATEGY.md`, **no public page
  currently revalidates on data change** — public pages stay fresh only
  because they're forced fully dynamic (`force-dynamic`, or an inherent
  dynamic API like `searchParams`), not because of any cache-invalidation
  wiring. This is a documented, deliberate finding from this repo, not
  external speculation.
- **Uploads**: the one architectural exception to the port/adapter path —
  file uploads go **directly from the browser to Cloudflare R2**, bypassing
  the Next.js server entirely for the actual file bytes (only a small
  "get a signed URL" / "save the record" round trip goes through the normal
  API). See Section 13.
- **Important backend operations, technically**: the Dijkstra pathfinding
  build (Section 7, purely client-side actually — computed in the browser
  from server-loaded data, not a server operation); the multi-phase editor
  save sequence (Section 8); the invitation token lifecycle (Section 12);
  the media-cleanup hooks (Section 13).

### Named architecture patterns — Vertical Slice + Ports & Adapters (Hexagonal), with an honest caveat

The user asked specifically whether this codebase follows Vertical Slice
Architecture, Ports & Adapters, and Hexagonal Architecture. It's a
reasonable question, and the honest answer has two layers with different
strength of evidence.

**Vertical Slice Architecture — directly evidenced, not a stretch.** The
project is organized by feature, not by technical layer: `src/features/
<name>/` (e.g. `navigation`, `map-editor/core`, `invitations`,
`user-management`) each carry their *own* `constants/`, `validations/`,
`types/`, `services/{server,client}`, `actions/{server,client}`, `store/`,
`lib/`, `hooks/`, and `components/` — confirmed as a mandatory, enforced
convention in `CLAUDE.md`/`AGENTS.md` ("Put feature code under
`src/features/<name>/` using the standard sub-folders... Don't invent new
top-level folders"). There is no app-wide `controllers/`, `services/`, or
`models/` split cutting horizontally across every feature — each vertical
slice is close to self-contained, which is the defining trait of Vertical
Slice Architecture (as opposed to N-tier/layered architecture).

**Ports & Adapters — real, but with one caveat worth stating precisely.**
Within each slice, the documented request flow (Section 10 above, and
confirmed against real files) is: Server Action → **Port** (an interface
function the feature defines) → **Adapter** (the concrete Payload-backed
implementation of that interface) → Payload Local API. This is the
textbook shape of Ports & Adapters: the action/business-logic layer depends
on an abstract interface (`ports.ts`), not directly on the concrete
infrastructure call. **The caveat**: at this app-code layer, only one
concrete adapter implementation exists per port (always Payload) — nothing
in the reviewed code demonstrates a *second* implementation actually
swapped in (e.g., a mock or alternate backend standing in for the Payload
adapter in production). So it's accurate to say the codebase is built
**"hexagonal in shape and discipline"** at this layer (a real, enforced
interface boundary, one-directional dependency toward infrastructure,
consistently applied — see `src/features/map-editor/core/actions/server/`
split into `floor-actions.ts`/`object-actions.ts`/`node-actions.ts`/
`edge-actions.ts` as the reference example the team's own docs cite), but
it would overclaim to say the app demonstrates adapter-swapping at this
layer, since no second adapter exists to swap to.
**Where genuine, demonstrated adapter-swapping *does* exist** is one level
down, at the framework layer: Payload's own database adapter interface has
**two real, concrete, environment-selected implementations** —
`@payloadcms/db-sqlite` and `@payloadcms/db-mongodb`, chosen by a single
`DATABASE_ENGINE` env var (Section 9, Section 21) — which *is* a literal,
working instance of the Ports & Adapters pattern with actual swapped
infrastructure, just owned by Payload/the database layer rather than by the
app's own feature code.

**Net assessment**: this is fair to describe as "vertical-slice-organized,
with a ports-and-adapters discipline applied within each slice, and one
concrete, demonstrated hexagonal adapter-swap at the database layer" — a
more precise and defensible claim than a bare "hexagonal architecture,"
which would imply adapter-swapping evidence this app-code layer doesn't
actually show.

---

# 11. FRONTEND ARCHITECTURE

- **Framework**: Next.js 16 App Router, React 19, TypeScript 5 (`strict:
  true`).
- **Routing**: file-system routing under `src/app/(frontend)/`, split into
  route groups: `(public)/(viewers)` (home, buildings directory, map,
  about, terms, privacy, qr resolver), `(public)/(organization)` (org
  marketing pages), `(auth)` (signin/signup/verify/reset/invite), and
  `(private)` (dashboard + editor, gated by `src/proxy.ts` as a fast UX
  redirect plus a Server Component layout check as the real boundary —
  Section 12).
- **Server vs. client components**: pages are thin Server Components that
  load data and render one feature "shell" component; interactive pieces
  (forms, the map canvas, the editor) are client components. This
  separation is a stated project convention
  (`docs/project/PROJECT_STRUCTURE.md`), consistently followed in the code
  reviewed.
- **Major layouts**: `(private)` dashboard layout renders a collapsible
  sidebar + topbar shell around every dashboard page; the editor route has
  no such chrome (full-screen canvas app); public pages share a
  `SiteHeader`/`PublicSiteFooter`.
- **State management**: **Zustand**, one root store composed of feature
  slices (editor object/node/edge slices, navigation slice, map-viewer
  viewport slice, an isolated QR-viewer viewport slice, a signup-flow
  slice). The navigation slice deliberately stores only *intent*
  (origin/destination/accessibility); the graph and computed route are
  derived via memoized pure functions, not stored.
- **Forms**: `@tanstack/react-form` + Zod validation.
- **Reusable UI**: shadcn-pattern components built on Base UI primitives
  (`@base-ui/react`), Tailwind CSS v4 utility classes, `lucide-react` icons.
- **Responsiveness**: extensively hand-tuned this session — phone-specific
  visibility toggles, a custom `FloorWheel` picker component shared between
  the navigation floor-select and the route's multi-floor stepper.
- **Theme**: `next-themes`-driven light/dark, entirely token-based (CSS
  custom properties in `global.css`), including a *separate* palette
  namespace just for the map canvas (`--map-viewer-*`) so map colors can be
  tuned independently of the app's own UI chrome.
- **Loading/error states**: `loading.tsx` Suspense fallbacks per route
  group (added this session), toast notifications via `sonner`, an
  editor-specific full-screen loading/error state (`MapEditorShell`), a
  route-progress bar (`nextjs-toploader`).

### Module decoupling: how features interact through the shared store

The user specifically asked whether this report covered how modules stay
decoupled and interact via the store — the earlier draft didn't, so this is
new. The project's own `docs/technical/SIMPLE_FEATURE_ARCHITECTURE.md`
documents this explicitly with a module-awareness diagram, and it was
cross-checked against `src/store/index.ts` directly.

**The mechanism**: `src/store/index.ts` composes one root Zustand store
(`useAppStore`) out of nine feature-owned slice creators — `createEditorSlice`,
`createObjectSlice`, `createNodeSlice`, `createEdgeSlice` (map-editor core),
`createSmartBuilderSlice`, `createNavigationSlice`, `createSignupFlowSlice`,
`createMapViewerViewportSlice`, `createQrViewerViewportSlice` — spread
together into one `create<AppStore>()` call. Each slice file lives inside
its *owning* feature folder (e.g. `createNavigationSlice` in
`src/features/navigation/store/`), not in a shared root-level store folder
— the composition point (`src/store/index.ts`) is the only file that needs
to know all the slices exist; no feature needs to import another feature's
slice file directly to use its data. Components across different features
all read/write through the same `useAppStore` selector hook, which is how
(for example) Smart Builder and Floor-links — both editor *extensions* —
can add generated nodes/edges into the Map Editor Core's own state without
reaching into the editor core's internals: they call the same store actions
the editor core itself would call.

**Concrete example of the payoff**: Smart Builder doesn't persist through a
separate database path or maintain its own copy of the map — it writes
generated nodes/edges into the *same* editor-core store slices, so the
editor's normal, single Save button/sequence (Section 8) persists
Smart-Builder-generated data with zero Smart-Builder-specific save code.
That's the store doing real decoupling work, not just being a convenient
global variable.

**Where the decoupling is honestly incomplete — the project's own docs say
so, and this report repeats that faithfully rather than smoothing it
over**: `SIMPLE_FEATURE_ARCHITECTURE.md` explicitly documents two cases of
*two-way* module awareness, i.e. real coupling that goes both directions
instead of cleanly one way:
- **Map editor core ↔ Floor-links**: the editor core renders `FloorLinkPanel`
  inside its own object/node inspectors (core → floor-links), while
  floor-links imports the editor core's types and edge actions to do its
  job (floor-links → core).
- **Map viewer ↔ Navigation**: `MapViewerShell` imports navigation's
  components and hooks directly (viewer → navigation), while navigation
  imports the map-viewer's types, constants, and viewport contracts
  (navigation → viewer).

Both are still mediated through the shared store rather than reaching into
each other's component internals, but the *type/contract* awareness is
bidirectional, not the clean one-way "extension depends on core, core never
depends on extension" shape the rest of the codebase mostly follows (e.g.
Email genuinely doesn't need to know about the dashboard, editor, viewer,
or navigation at all — a real one-way case). This nuance is worth stating
plainly in a technical Q&A during the demo rather than claiming perfect
decoupling everywhere: the store is the real decoupling mechanism for
*data*, but two extension/host pairs still share type-level knowledge in
both directions.

---

# 12. AUTHENTICATION AND AUTHORIZATION

- **Provider**: Payload CMS's own built-in auth — cookie/JWT session
  (`tokenExpiration: 30 days`, `sameSite: "Lax"`, `secure` only in
  production), across **two separate auth collections**: `admins`
  (platform team) and `users` (organization accounts). No custom auth
  library, no NextAuth/Clerk/etc.
- **Password hashing**: done entirely by Payload internally — no
  bcrypt/argon2/scrypt code exists anywhere in this repo's own source;
  passwords are handed to Payload's Local API as plaintext at the API
  boundary and Payload hashes them.
- **Login**: `payload.login()`/Payload's `login()` helper from
  `@payloadcms/next/auth`.
- **Signup**: creates an Organization, a Building, and the `owner` user
  together in one adapter call, with rollback-on-failure (deletes the
  organization/building if user creation fails partway through).
- **Email verification**: Payload's built-in `auth.verify` flow — required
  for self-signup; **skipped** for invited users (their account is created
  with `_verified: true` directly at acceptance, since clicking the unique
  invite link already proved email ownership).
- **Password reset**: Payload's built-in `forgotPassword`/`resetPassword`
  Local API methods — token generation, expiry, and re-hashing are all
  Payload-internal, not custom code. The action layer always returns a
  generic success response regardless of whether the email exists (no
  user-enumeration leak at that layer).
- **Self-service password change**: verifies the current password by
  attempting a real `payload.login()` with it first, then updates via
  `overrideAccess: false` with the real user — and **cannot structurally
  target another account**: the adapter function's signature has no
  `targetUserId` parameter at all. This is explicitly documented in an
  in-code comment as a deliberate decision: an admin-set-password variant
  was considered and rejected as "a silent account-takeover vector with no
  notification or re-auth step."
- **Middleware/protected routes — two layers (correction from an earlier
  pass of this report)**: Next.js 16 renamed the middleware convention from
  `middleware.ts` to **`proxy.ts`**, and this project has one: `src/
  proxy.ts`. It matches `/dashboard/:path*`, `/editor/:path*`, and the auth
  pages, and redirects an anonymous request away from a private route
  purely based on whether the `payload-token` cookie is *present* (it also
  redirects an already-authenticated visitor away from an auth page, by
  calling `/api/users/me` to confirm the cookie is actually valid for that
  direction only). The project's own `docs/security/SecurityPlan.md` is
  explicit that this is a **UX convenience, not the authorization
  boundary** — presence-only checking means it is not, by itself, real
  auth enforcement. The authoritative check is a second, independent
  layer: `src/app/(frontend)/(private)/layout.tsx`, an async Server
  Component that calls `getCurrentUser()` (a real session verification)
  and redirects to `/signin` if it fails, before rendering anything nested
  under it. Any Server Action or Route Handler outside that route tree
  still relies on Payload's own collection access rules underneath (which,
  per the next point, they consistently do) — `proxy.ts`'s redirect is a
  fast early exit, not a substitute for that.
- **Organization authorization / ownership checks**: enforced by Payload
  collection **access functions**, not by ad hoc checks scattered through
  the UI or action layer. Verified directly for three sensitive
  operations: changing another user's role, blocking a user, and (the
  absence of a custom) building-delete action — in every case, the server
  action itself does little more than confirm the caller is logged in, and
  the real authorization decision happens inside Payload's `access` rules
  via `overrideAccess: false` with the real `user` object. A dedicated
  test file, `src/collections/access/__tests__/access.test.ts`, unit-tests
  these access functions independently of any UI.
- **Server-side vs. UI-only — explicit finding**: permissions in this app
  are **enforced server-side**, confirmed by code reading, not just hidden
  behind disabled buttons. No gap was found in the sample checked.
- **Invitation/member onboarding**: see Section 4/8 for the flow; Section
  19 covers the token security specifics.
- **Blocking**: a `beforeLogin` collection hook (`blockLoginHook`) rejects
  sign-in for a blocked user, but does **not** force-invalidate an
  already-active session — a currently-signed-in user who gets blocked
  keeps their session until it naturally expires or they log out. This is
  an observed gap, not a designed feature.

---

# 13. FILE / MEDIA STORAGE

- **Provider**: **Cloudflare R2** (S3-compatible object storage), wired via
  the generic `@payloadcms/storage-s3` plugin (R2 has no Payload-specific
  adapter; it's used through the S3-compatible API). Live bucket name and
  custom CDN domain are documented in `docs/technical/MEDIA_STORAGE.md` —
  not repeated here as they're effectively environment/deployment detail,
  not product functionality.
- **What gets uploaded**: organization logo, building logo, user avatar,
  and a floor's background/reference image — exactly four upload-enabled
  relationship fields across the whole schema (`Organizations.logo`,
  `Buildings.logo`, `Users.avatar`, `Floors.backgroundImage`).
- **Upload process**: **direct browser-to-R2** ("client uploads" — a
  Payload/S3-plugin feature), not proxied through the Next.js server: get a
  signed URL → `PUT` the file straight to R2 from the browser → `POST` just
  the metadata to Payload. This exists specifically to avoid the small
  request-body size limit on the app's own server function (documented
  reasoning in `docs/technical/MEDIA_STORAGE.md`).
- **Deletion / cleanup**: a shared `afterChange` hook
  (`createCleanupReplacedMediaHook`) fires on `Organizations`, `Buildings`,
  `Users`, and `Floors` — whenever the tracked relation field's value
  changes (replaced or cleared), it deletes the *previous* `media` document
  with `overrideAccess: true`, which cascades (via the storage plugin's own
  `afterDelete` hook) to deleting the real file in R2. No upload flow leaks
  a replaced file.
- **File references in the DB**: the `media` relationship field itself,
  plus a **denormalized** plain-text `...Url` field (`logoUrl`,
  `avatarUrl`) kept in sync by a separate `beforeValidate` hook, so reads
  never need to populate the `media` relation.
- **Public/private access**: `Media.access.read` is fully public
  (`() => true`) — any uploaded file's URL is publicly fetchable if known.
  `create` requires being logged in.
- **Image optimization**: deliberately **not** run through Next.js's
  `/_next/image` optimizer for any R2-hosted media (every such `<Image>`
  sets `unoptimized` explicitly) — a documented decision to avoid adding
  back an extra server-function hop the direct-upload approach was built to
  avoid. Local static assets (e.g. the brand icon) *do* still get Next's
  normal image optimization.
- **Validation**: a single central file-size limit, **5MB**, enforced in
  both the Payload config and the signed-URL step. **No server-side
  MIME-type allowlist exists** — file-type restriction is only a client-side
  `accept="image/*"` hint on the file input, not enforced by the backend.
  This is a real, verified gap, not an assumption.
- **Security restrictions**: upload requires authentication; nothing
  beyond that (no scanning, no server-side type verification) was found.

---

# 14. SEARCH / DISCOVERY

- **What's searchable**: buildings (by name, on the public directory) and
  rooms/objects within a floor (by name/label, filtered to
  `isSearchable: true`, `src/features/navigation/lib/filterRouteCandidates.ts`).
- **Where it happens**: entirely **client-side**, in-memory substring
  filtering over data already loaded for that page — no dedicated search
  index, no server-side search endpoint, no external search service
  (Algolia, Elasticsearch, etc.).
- **Filtering**: case-insensitive substring match against `name`/`label`;
  results capped to a small max count (`MAX_CANDIDATES = 5` for route
  search suggestions).
- **Categories**: buildings can be filtered by organization on the public
  directory (a set of clickable organization avatar tiles); rooms have no
  category-based filter, only name search.
- **Ranking**: none beyond match order — no relevance scoring.
- **Performance considerations**: fine at the scale a single building's
  floor data represents (dozens to low hundreds of objects); would not
  scale to a full-text/fuzzy search product without real backend search
  infrastructure, which doesn't exist here.

---

# 15. PUBLIC MAP PUBLISHING

- **What determines visibility**: purely the `status` field on `Floors`
  (`draft`/`published`). There is no separate building-level or
  organization-level visibility flag — a building with zero published
  floors simply shows no floors publicly (it can still appear in the
  building directory if it has any floor at all, published or not — the
  directory groups by building from the `floors` query, so a
  building with only draft floors would not appear, since the directory's
  own query is *already* filtered to published floors).
- **Enforcement point**: the `Floors` collection's own `access.read` rule —
  an authenticated request uses the normal building-scoped access check;
  an **unauthenticated** request is hard-restricted to `{ status: {
  equals: "published" } }` at the collection level. Downstream collections
  (`map-objects`/`map-nodes`/`path-edges`) have no `status` field of their
  own — they inherit visibility purely by whether their `floor` ID made it
  into the already-published-filtered floor-ID list the loader queried.
- **No slug system**: buildings/floors are addressed by their database ID
  in the URL (`/map/{floorId}`), not a custom human-readable slug.
- **SEO**: `robots.txt` (disallows dashboard/editor/admin/api and
  token-gated auth pages) and `sitemap.xml` (lists static public pages plus
  every published floor's map URL, revalidating hourly) — both added this
  session, dynamically generated from the same public data source the
  home/buildings pages use.
- **Server rendering**: public pages are rendered server-side (Server
  Components calling the same public, session-free data loaders).
- **Metadata/Open Graph**: standard Next.js `<Metadata>` exports per page
  (title/description); an `opengraph-image.png`/`twitter-image.png` exist
  at the app root as static Open Graph assets. No per-building/per-floor
  dynamic Open Graph image generation was found.

---

# 16. UI / UX DESIGN

- **Overall visual design**: a green-leaning brand palette (deliberately
  tuned this session, both the base UI and a wider, higher-contrast palette
  specifically for the map canvas so rooms read clearly against the floor/
  hallway background), consistent light/dark support throughout.
- **Dashboard vs. visitor experience**: distinctly different chrome — the
  dashboard has a persistent sidebar/topbar app shell; the public viewer is
  a focused, near-full-screen map experience with a floating toolbar/search
  bar instead of a sidebar (the sidebar variant exists in code but is
  currently disabled in favor of the floating bar).
- **Mobile usage**: heavily tuned — hero text/illustration hidden on phone,
  a custom wheel-style floor picker for touch, a bottom-hinged drawer for
  the route search UI, responsive grid layouts throughout the dashboard and
  public directory.
- **Map interaction**: pan and zoom everywhere; the public viewer
  additionally supports pinch-to-zoom and a mobile zoom profile, which the
  desktop-only editor doesn't need (see Section 6).
- **Dark/light theme**: yes, `next-themes`, token-driven.
- **Loading states**: `loading.tsx` Suspense fallbacks per major route
  group, plus a dedicated full-screen loading/error state inside the map
  editor.
- **Dialogs/drawers**: shadcn/Base UI `Dialog` used for QR sticker
  generation, team invitations, confirmations (block/remove a user);
  `MapSelectionBar`'s search is a bottom-hinged drawer, not a modal.
- **Notifications**: `sonner` toasts for action results (invite sent,
  password changed, errors, etc.).
- **Accessibility features**: an "accessible-only routing" toggle is a
  real, structural product feature (not just a UI label — Section 7);
  beyond that, no dedicated screen-reader/ARIA audit evidence was found in
  the repo (some `aria-label`s exist on interactive controls, but no
  systematic accessibility testing/tooling was identified).
- **Empty states**: dedicated empty-state components exist (e.g. "No
  public buildings yet" on the directory, "No matching buildings" for a
  search with no results).
- **Confirmation flows**: `AlertDialog`-based confirmations for destructive
  actions (blocking/removing a user).
- **Error handling**: generic, non-leaking error copy (a past bug fix
  specifically replaced a message that leaked the backend's name to
  visitors, per the changelog).

### Most visually impressive screens for a showcase video

1. The map editor itself (drag/place objects, watch Smart Builder generate
   nodes automatically) — visually demonstrates real product depth.
2. The public map viewer with a multi-floor route drawn and a "continue via
   elevator" prompt firing — the single clearest "this actually works" moment.
3. The QR sticker generation dialog (Download/Print) — tangible,
   easy-to-grasp real-world payoff.
4. The role-grouped team directory + invite flow — shows the multi-tenant/
   collaboration angle quickly.

---

# 17. TECH STACK

| Category | Technology | Notes |
|---|---|---|
| Framework | Next.js 16.2.6 (App Router, Turbopack) | |
| Language | TypeScript 5, `strict: true` | |
| UI library | React 19.2.4 | |
| Styling | Tailwind CSS v4 | |
| Component primitives | `@base-ui/react` (Base UI) + a shadcn-pattern component layer | |
| Icons | `lucide-react` | |
| State management | Zustand 5 | client-side only, no server-state library (no React Query/SWR) |
| Forms | `@tanstack/react-form` | |
| Validation | Zod 4 | |
| Backend/CMS | Payload CMS 3.85.1 | provides auth, admin panel, REST + GraphQL APIs, access control |
| Database | SQLite (`@payloadcms/db-sqlite`, local dev default) or MongoDB (`@payloadcms/db-mongodb`, production via MongoDB Atlas) | env-selected via `DATABASE_ENGINE` |
| Hosting | Vercel (app + SSR) + Cloudflare (CDN/DNS, in front of Vercel) | confirmed production stack, per `docs/security/SecurityPlan.md` |
| Authentication | Payload's built-in auth (two collections: `admins`, `users`) | cookie/JWT session |
| Object storage | Cloudflare R2 via `@payloadcms/storage-s3` | falls back to local disk if R2 env vars are missing |
| Email | Resend (`@payloadcms/email-resend`) + `react-email` templates | |
| QR generation | `qrcode` | client-side generation |
| Testing | Vitest 3 + `@testing-library/react` + `jsdom` | **no E2E framework** (no Playwright/Cypress) |
| Linting | ESLint 9 (flat config, `eslint-config-next`) | |
| Toasts | `sonner` | |
| Route progress bar | `nextjs-toploader` | |
| GraphQL | `graphql` (auto-exposed by Payload) | not used by the app's own frontend, framework-provided |

---

# 18. SYSTEM ARCHITECTURE

```
Visitor / Organization staff browser
            |
            v
      Next.js Application  (one deployable app — a "modular monolith")
            |
   -----------------------------------------------
   |                    |                        |
Public routes      Private routes           Payload Admin/REST/GraphQL
(no auth)          (src/proxy.ts: cookie-    (/admin, /api/*)
                    presence redirect, UX
                    layer only, then
                    (private)/layout.tsx:
                    real getCurrentUser()
                    check)
   |                    |                        |
   v                    v                        v
Server-side reads   Server actions -> ports -> Payload adapters
(direct loader           |
 calls)                  v
   |                Payload Local API  <---------+
   |                      |
   +----------------------+
                           v
                 Collection access control
                 (src/collections/access)
                           |
                           v
     SQLite (local dev)  <--- DATABASE_ENGINE ---> MongoDB Atlas (production)
                           |
                           v
              Cloudflare R2 (media, direct browser upload)
              Resend (transactional email)
```

Production infrastructure, confirmed: **Vercel** hosts the app itself
(build/deploy, SSR, TLS termination, edge network), **Cloudflare** sits in
front of Vercel as CDN/DNS and also hosts object storage for uploaded
media, and **MongoDB Atlas** is the production database (`DATABASE_ENGINE=
mongo`) — local development instead defaults to SQLite. Deployment is via
Vercel's native GitHub integration (auto-build/deploy on push) plus GitHub
Actions for test/lint CI, which is why no `vercel.json` or Dockerfile
exists in the repo — Vercel's zero-config Next.js detection doesn't need
one. See Section 21 for the full picture.

### Admin editing a map

```
Editor page (Server Component)
  -> getFloorEditorData (server loader) -> Payload Local API -> DB
  -> hands initial data to MapEditorShell (client)
  -> every user edit updates a Zustand store slice in-memory (_dirty: true)
  -> "Save" button -> useSaveEditorChanges
       -> floor action -> floor port -> floor adapter -> Payload -> DB
       -> object actions (parallel) -> ... -> DB   (temp IDs -> real IDs)
       -> node actions (parallel, using real object IDs) -> ... -> DB
       -> edge actions (parallel, using real node IDs) -> ... -> DB
  -> store cleared to "not dirty"
```

### Visitor requesting a route

```
/map/[floorId] (Server Component)
  -> getMapViewerData (server loader, public-safe: overrideAccess: true
     but explicitly filtered to status: "published") -> Payload -> DB
  -> normalized floors/objects/nodes/edges handed to MapViewerShell (client)
Visitor picks origin + destination (client interaction only, no request)
  -> useRoute: buildRouteGraph (client, pure function, from already-loaded data)
  -> findShortestPath (Dijkstra, client, pure function)
  -> splitRouteByFloor (client, pure function)
  -> route drawn on canvas; FloorHopIndicator shown if multi-floor
```

**Key point verified from code**: route calculation is **entirely
client-side** — no server round trip happens per route request. The server
is only involved once, up front, to load the floor's full object/node/edge
data.

---

# 19. SECURITY

**This section now incorporates `docs/security/SecurityPlan.md`**, a formal
STRIDE-based threat model and findings/remediation log the team produced by
reading the actual codebase (not a generic checklist). It names concrete
threats (T1–T12), findings (F1–F12), and a remediation roadmap with
severities and owners. Every finding below was **independently re-verified
against the current source files** for this report, not trusted as current
from the plan document alone.

> **Correction to an earlier pass of this report**: an earlier revision of
> this section claimed T1/F1 (the plan's single highest-rated risk, cross-
> tenant map-data tampering) had been fully fixed. That was wrong — checking
> deeper found it is only **half-fixed and still practically exploitable**.
> The collection-level `access` rules were added (confirmed), which closes
> the raw REST/GraphQL attack path. But the app's own map-editor server
> actions — the real `/editor/{floorId}` page any signed-in user actually
> uses — still bypass access control entirely, which is the more serious
> half since it doesn't require crafting API requests. See the finding
> below; this has also been corrected in `SecurityPlan.md` itself.

### Critical open finding (found while preparing this report, not by the original plan)

- **Cross-tenant map-data tampering through the real editor UI is still
  live.** `src/features/map-editor/core/services/server/floor-pl.adapter.ts`
  calls Payload with `overrideAccess: true` explicitly; `object-pl.adapter.ts`,
  `node-pl.adapter.ts`, and `edge-pl.adapter.ts` omit `overrideAccess`
  entirely, which Payload's Local API defaults to `true` — same effect. None
  of the paired server actions (`floor-actions.ts`, `object-actions.ts`,
  `node-actions.ts`, `edge-actions.ts`) check that the record being edited
  belongs to the caller's organization before forwarding the client-supplied
  id straight through. Net effect: any signed-up user (trivial via public
  signup, any organization) who knows or guesses a floor ID can open
  `/editor/{floorId}` and fully view/edit/delete another organization's
  floor plan, rooms, navigation nodes, and path edges — through the actual
  product, not a crafted API call. This should be treated as the single
  highest-priority fix in the codebase, ahead of anything else in this
  section.

### Security actually implemented

- Server-side authorization on every mutation checked **outside the
  map-editor's own core actions** (see the critical open finding above for
  the one confirmed exception), enforced by Payload's collection
  access-control layer with the real authenticated user
  (`overrideAccess: false`) — not just UI-hidden buttons.
- **Collection-level access rules for map data were added and are correctly
  scoped** (SecurityPlan.md T1/F1's first half): `Floors`, `MapNodes`,
  `MapObjects`, `PathEdges` each now define `access: { read: access.
  buildingContentRead, create: access.buildingContentCreate, update/delete:
  access.buildingContentUpdateDelete }` — this closes the raw REST/GraphQL
  version of the attack (confirmed: an anonymous or cross-org request via
  the API is correctly rejected). It does **not** close the app's own
  editor UI path — see the critical open finding above.
- `Media` `create` is now explicitly gated to `access.isLoggedIn`
  (SecurityPlan.md F2, first half only) — but `update`/`delete` still have
  no explicit access block (falls back to Payload's default: any logged-in
  user, not org-scoped), and there is still no MIME-type/size allowlist —
  see below.
- Self-escalation and self-blocking are structurally blocked (field-level
  access denies a user from setting `role`/`buildings`/`blocked` on their
  own record, even if they're an owner/manager).
- Password change is structurally self-only (no target-user parameter
  exists in the function signature at all) and requires re-proving the
  current password via a real login attempt first.
- Invitation tokens: sha256-hashed at rest (raw token only ever sent in the
  email), single-use (status flips atomically with account creation),
  7-day expiry, and the invited email/role/org/buildings are read from the
  server-side invitation record, never trusted from the acceptance form.
- Login blocking (`blocked` field) enforced server-side via a `beforeLogin`
  hook, independent of the UI.
- Cookie session config: `SameSite=Lax`, `Secure` in production, httpOnly.
- File-size limit enforced on uploads (5MB).
- Two-layer route gating for `/dashboard` and `/editor`: `src/proxy.ts`
  (Next.js 16's renamed middleware convention) does a fast cookie-presence
  redirect, backed by the real check in `(private)/layout.tsx`
  (`getCurrentUser()`) — see Section 12 for the detail and why the plan
  document is careful to call the proxy layer "UX, not the boundary."
- TLS: Vercel terminates TLS for the app; Cloudflare sits in front of it as
  CDN/DNS, so there are two hops, not one — the plan flags that Cloudflare's
  SSL/TLS mode must be "Full (strict)" (not "Flexible") so the
  Cloudflare→Vercel hop is encrypted too, not just the client→Cloudflare
  hop (SecurityPlan.md F11 — configuration to verify, not app code).
- Encryption at rest is satisfied by the managed platforms (MongoDB Atlas,
  Cloudflare storage both encrypt at rest by default) — no app-level work
  needed (SecurityPlan.md F9).
- A dedicated unit-test suite exercises the access-control functions
  directly (`src/collections/access/__tests__/access.test.ts`).

### Security partially implemented / notable gaps (cross-checked against SecurityPlan.md's own findings, not just re-derived)

- **Rate limiting is a deliberately scoped, documented gap, not an
  oversight** — SecurityPlan.md F3 splits it in two: a login-lockout fix
  (`auth: { maxLoginAttempts, lockTime }`, a native Payload option) is
  logged as **"planned"**, but confirmed **still not present** in the
  current `Users.ts` auth config as of this report. `/forgot-password`
  throttling and broader volumetric DDoS protection beyond Cloudflare's
  edge defaults are logged as a **consciously accepted risk with no fix
  planned** — reasoning given: Cloudflare-in-front-of-Vercel already
  absorbs large-scale traffic floods at the edge for free, Payload has no
  built-in throttle for arbitrary endpoints, and building custom
  app-layer throttling doesn't gate a safe demo of a project with no real
  user base at risk. The plan states this "would be the first thing added"
  if the project continued past the capstone.
- **No server-side file-type/size allowlist on uploads** — SecurityPlan.md
  F2's second half; confirmed still open (no `mimeTypes` config found on
  `Media`'s `upload` block). Only a client-side `accept=` hint restricts
  file types today; nothing stops a non-image file being uploaded via a
  direct API call.
- **No CSRF protection code** — no token generation/validation found
  anywhere; not named as a distinct finding in SecurityPlan.md, confirmed
  independently by direct search.
- **No security headers configured** — `next.config.ts` sets no CSP,
  `X-Frame-Options`, HSTS, or any other header; whatever Vercel/Cloudflare
  provide by default is all that exists. Not named as a distinct finding in
  SecurityPlan.md either.
- **`PAYLOAD_SECRET`/`DATABASE_URL` silently default to an empty string if
  unset** (SecurityPlan.md F4) rather than failing to boot — a misconfigured
  deploy could silently start with a blank secret instead of refusing to
  start.
- **Minimum password length (8 characters) computes to ~52 bits of
  theoretical entropy** — "Weak" on the rubric scale the plan uses, not
  "Strong" (60+ bits) (SecurityPlan.md F6, low severity, deferred, not
  accepted — a one-line fix tracked for later, not disputed).
- **Blocking a user doesn't invalidate an already-active session** — only
  blocks *future* logins. Not named as a distinct SecurityPlan.md finding;
  confirmed independently.
- **`src/proxy.ts`'s redirect only checks cookie presence, not validity,
  for the private-route case** — by the plan's own explicit framing, this
  is a UX convenience, and the real boundary is the layout-level session
  check plus collection access control underneath (see Section 12).

### Findings the team explicitly accepted as low-priority risk, with reasoning (not gaps left unconsidered)

- **Cross-tenant read on `organizations`** (SecurityPlan.md F5) — any
  logged-in user can read every organization's `name`/`type`. Accepted
  because neither field is confidential and the product is a
  directory/navigation platform where seeing other participating
  organizations matches the intended experience; the plan itself notes
  this would be revisited if the schema ever grew genuinely sensitive
  fields (its own example: "billing info").
- **MongoDB Atlas network access list open to `0.0.0.0/0`**
  (SecurityPlan.md F10) — accepted because Vercel serverless functions have
  no static outbound IP, so IP allowlisting isn't practical without paid
  tooling; the real protection (Atlas credentials + enforced TLS) holds
  regardless.

### Security improvements recommended

SecurityPlan.md's own remediation roadmap (§7) already prioritizes most of
these with owners and target milestones — cite that document directly if
asked "what's the plan," rather than treating this as a fresh outside
suggestion list:
- Ship the still-open half of F3: `auth: { maxLoginAttempts: 5, lockTime:
  10 * 60 * 1000 }` on `Users.ts` (logged as "planned," not yet present).
- Ship the still-open half of F2: a `mimeTypes` allowlist + max size on
  `Media`'s `upload` config.
- Fail startup loudly instead of silently defaulting to `""` for
  `PAYLOAD_SECRET`/`DATABASE_URL` (F4) via the existing `requireEnv()`
  helper (`src/lib/env.ts`).
- Verify Cloudflare's SSL/TLS mode is "Full (strict)" with HSTS enabled
  (F11), and that the Cloudflare storage bucket's write/list permissions
  are correctly restricted (F12) — infrastructure configuration checks, not
  code changes.
- Raise the minimum password length from 8 to 10 characters (F6, deferred
  but not disputed).
- Beyond the plan's own list: add basic security headers (CSP at minimum)
  in `next.config.ts`, add CSRF protection, and consider forcing session
  invalidation when a user is blocked — none of these are named as distinct
  findings in SecurityPlan.md, so treat them as this report's own
  reasonable suggestions, not the team's documented plan.

---

# 20. TESTING AND QUALITY

- **Unit/component tests**: Vitest + `@testing-library/react` + `jsdom`.
  **75 test files** total, roughly: 20 component tests, 22 pure-logic
  (`lib/`) tests, 8 Zustand store tests, 7 hook tests, 2 explicit
  server-action test files.
- **Feature coverage — has tests**: `auth`, `buildings`, `dashboard`,
  `map-viewer` (16 files — the most heavily tested area), `navigation` (10
  files — includes the Dijkstra/graph/accessible-routing tests), `organization`,
  `profile`, `qr-codes`, `user-management`, `viewer`, and the map editor's
  `core` and `floor-links` subfolders.
- **Feature coverage — no tests found at all**: `email`, `invitations`,
  `organization-settings`, and the map editor's `smart-builder` subfolder
  (despite Smart Builder being one of the more algorithmically interesting
  pieces of the product — a real, verified gap).
- **Integration tests**: none distinct from the above — the "server-action"
  tests mock the port layer rather than hitting a real database, so they're
  closer to unit tests of the action's own logic than true integration
  tests.
- **End-to-end tests**: **none.** No Playwright, no Cypress, no config file
  or `e2e` directory anywhere in the repo — confirmed by direct search, not
  assumed absent.
- **Type checking**: TypeScript `strict: true` (`tsconfig.json`).
- **Linting**: ESLint 9, flat config, `eslint-config-next`.
- **CI**: two GitHub Actions workflows — one runs the Vitest suite, one
  runs ESLint, both on push/PR to `main`/`prev`/`dev`. **No deploy workflow
  exists in CI.**

No test-coverage percentage is claimed anywhere in the repo, and none is
invented here.

---

# 21. DEPLOYMENT / INFRASTRUCTURE

- **Hosting platform — confirmed** (this report's earlier draft
  under-claimed this as an inference; the project owner has since
  confirmed it directly, and `docs/security/SecurityPlan.md` independently
  documents the same stack in detail): production runs on **Vercel**
  (hosting, SSR + Partial Prerendering, TLS termination, edge network),
  with **Cloudflare** in front of it as CDN/DNS (and separately, as covered
  in Section 13, as the object-storage provider for uploaded media), and
  **MongoDB Atlas** as the managed production database
  (`DATABASE_ENGINE=mongo`). Local development instead defaults to SQLite
  and local-disk media storage — the dual-adapter design (Section 9) exists
  specifically so the same codebase runs cheaply/offline in dev and on the
  managed production stack without code changes.
- **CI/CD — confirmed**: GitHub Actions runs the two existing workflows
  (`test.yml` for Vitest, `lint.yml` for ESLint) on push/PR; deployment
  itself is handled by **Vercel's native GitHub integration**, which
  auto-builds and deploys on push using Vercel's zero-config Next.js
  detection. This is exactly why no `vercel.json` or Dockerfile exists in
  the repo — Vercel doesn't need one for a standard Next.js app, and the
  GitHub Actions workflows handle test/lint gating rather than the deploy
  step itself.
- **Environment variable categories** (names only, verified from
  `process.env` usage — no values read or included):
  - `PAYLOAD_SECRET` — Payload's session/token signing secret. Per
    SecurityPlan.md F4, this currently falls back to an empty string if
    unset rather than failing startup — a known, documented gap (Section
    19), not something to read as "the secret is optional."
  - `DATABASE_URL`, `DATABASE_ENGINE` (`sql`/`mongo`), `DATABASE_LOGGER`.
    In production `DATABASE_URL` is a MongoDB Atlas connection string.
  - `RESEND_API_KEY`, `RESEND_FROM_ADDRESS`, `RESEND_FROM_NAME`.
  - `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL`,
    `R2_ENDPOINT` (all optional as a group — falls back to local disk if
    any are missing).
  - `NEXT_PUBLIC_SERVER_URL` — used to build absolute links in emails and
    QR codes.
  - `NODE_ENV`, `VERCEL_ENV` — environment flags.
  - Separate `.env.local`/`.env.preview`/`.env.production` files exist for
    the demo-seed scripts, matching Vercel's own Production/Preview/
    Development environment split — SecurityPlan.md specifically calls out
    that secrets should be scoped per Vercel environment so a Preview
    deploy never receives production database credentials.
- **Build settings**: standard `next build`; `next.config.ts` sets no
  custom `images.remotePatterns` (deliberate — R2 images are always
  `unoptimized`), one legacy redirect (`/venues` → `/buildings`), and a
  Turbopack root path. No custom headers, no experimental flags.
- **Logging/monitoring**: no dedicated logging/monitoring/error-tracking
  service (e.g. Sentry) integration was found in the codebase.

---

# 22. TECHNICALLY INTERESTING PARTS

Ranked, most interesting first — every item here was verified to actually
exist in the code, not aspirational.

1. **Multi-floor Dijkstra pathfinding with a floor-change penalty.** A real
   weighted-graph shortest-path implementation with a deliberate,
   test-verified anti-shortcut penalty for crossing floors. Strong,
   demonstrable talking point.
2. **Smart Builder's automatic node/edge generation.** Genuine geometry —
   nearest-hallway detection within a radius, axis projection onto a
   hallway's centerline, tolerance-based node reuse, orthogonal path
   expansion for the manual hallway tool. Not a simple auto-fill; real
   spatial reasoning.
3. **Accessible-only routing as a structural graph filter**, not a UI
   label — inaccessible nodes/edges are excluded from the graph itself
   before the search even runs.
4. **The dual visibility model separating "what's drawn" (MapObjects) from
   "what's walkable" (MapNodes/PathEdges).** This is the core modeling
   decision that makes real routing possible at all, and it's consistently
   applied (every map-content collection independently carries its own
   `building` scope for access control, not just a derived one).
5. **QR sticker resilience via a resolver route.** The sticker encodes a
   stable `/qr/{objectId}` URL, not a floor URL directly, specifically so a
   room moving floors doesn't invalidate a printed sticker — a real
   design decision with a clear technical reason, verified in code and docs.
6. **Server-side, access-function-enforced multi-tenant authorization**,
   including self-escalation and self-blocking prevention at the
   field-access level, with a dedicated unit-test suite proving it
   independently of the UI.
7. **Direct browser-to-object-storage uploads** with automatic cleanup of
   replaced files (no orphaned media), working around a documented
   platform request-size limitation.
8. **The editor's dual coordinate system** — a fixed floor-pixel canvas for
   authoring, plus an independent `metersPerPixel` scale used only for
   real-world distance output, with two entirely separate hand-rolled
   pan/zoom implementations (editor: pan + wheel/button zoom, desktop only;
   viewer: full gesture support including pinch) deliberately not sharing
   code.
9. **Role-based access control implemented as reusable, composable Payload
   access functions** (`accessibleBuildingIds`, `buildingContentRead/
   Create/UpdateDelete`, etc.) rather than duplicated checks scattered
   across every action.
10. **Dual-database-adapter support** (SQLite in dev, MongoDB Atlas in
    production, one env var) — a genuine architectural flexibility point,
    and, per Section 10's architecture discussion, the one place in the
    codebase where Ports & Adapters shows actual demonstrated
    adapter-swapping, not just the interface shape.
11. **A formal STRIDE-based security threat model was conducted against
    this specific codebase — genuinely strong process evidence, but its
    highest-rated finding is only half-fixed, not fully closed.**
    `docs/security/SecurityPlan.md` names concrete threats (T1–T12) and
    findings (F1–F12) with severities, owners, and a remediation roadmap —
    not a generic checklist. Its single highest-rated risk (T1/F1, rated
    9/9): any authenticated user from any organization could read/write/
    delete any other organization's map data. The collection-level half is
    fixed — `Floors`/`MapNodes`/`MapObjects`/`PathEdges` now scope every
    operation via real `access` rules, closing the raw REST/GraphQL attack
    path. **But the app's own map-editor server actions still bypass this
    entirely** (`floor-pl.adapter.ts` sets `overrideAccess: true`
    explicitly; `object-pl.adapter.ts`/`node-pl.adapter.ts`/
    `edge-pl.adapter.ts` omit it, which defaults to the same bypass; no
    server action checks record ownership) — meaning the real `/editor/
    {floorId}` page still lets any signed-up user tamper with another
    organization's map data today. Section 19 has the full detail. Frame
    this honestly if it comes up: strong security process (a real threat
    model, one gap already closed), with one concrete, named, still-open
    critical item — not "we found and fixed everything."

All eleven are worth mentioning in a capstone presentation; 1-6 are the
strongest demo material, and 11 is worth raising proactively in a technical
Q&A specifically because naming a known, still-open critical issue
yourselves is stronger than having it discovered.

---

# 23. PROJECT COMPLEXITY

Evidence-based, not asserted:

- **Graph/pathfinding logic**: a real weighted-graph shortest-path engine
  with directionality, accessibility filtering, and cross-floor penalties
  (Section 7) — this alone puts the project well past CRUD-app territory.
- **Geometry/coordinates**: a floor-pixel coordinate system, background-image
  fit/transform math, grid-snapping, and Smart Builder's axis-projection/
  nearest-neighbor logic (Section 6/8).
- **Interactive UI**: a hand-built canvas editor (place/drag/resize/rotate,
  custom pan) and a separately hand-built pan/pinch/zoom map viewer — two
  non-trivial custom interaction systems, not off-the-shelf libraries.
- **Multi-tenant organization management**: real row-level and field-level
  access control scoped by organization and by building assignment, with
  three distinct roles and enforcement verified server-side.
- **Authentication/authorization**: two separate auth collections, a full
  email-verification/password-reset/invitation-token lifecycle, and
  deliberately-hardened self-service password change.
- **Nested/relational data**: a 10-collection schema with self-relations
  (object nesting), cross-collection referential-integrity hooks, and
  denormalized caches kept in sync by hooks.
- **File storage**: direct-to-cloud uploads with automatic orphan cleanup.
- **Complex client state**: a multi-slice Zustand store, with the
  navigation slice deliberately storing only intent and deriving
  everything else via memoization to avoid stale-state bugs.
- **Public/private view split**: genuinely different data-visibility rules
  (draft vs. published) enforced at the collection level, not just hidden
  in the UI.
- **Deployment**: dual-database-adapter support, environment-specific
  media-storage prefixing, direct-to-storage upload architecture working
  around a real platform constraint.

---

# 24. CURRENT LIMITATIONS

### Known implementation limitations

- No object/node placement bounds-checking (an object can be placed
  outside its floor's own canvas with nothing preventing it).
- No autosave in the editor — losing the tab without pressing Save loses
  unsaved work.
- Cross-floor connector distances are estimated defaults (elevator 3m,
  escalator 4m, stairs 6m), not measured — routing "meters" across a floor
  change are approximate by design.
- Blocking a user does not invalidate their already-active session.

### Missing product features (documented as not-yet-built in the repo's own docs)

- Turn-by-turn text directions ("turn left," "continue straight") — spec'd
  in `docs/technical/HOW_DIRECTIONS_WORK.md`, not implemented.
- Voice guidance (Web Speech API) — same doc, not implemented.
- "Share my current route" button for a visitor (as opposed to the admin's
  QR sticker generator, which *is* built) — explicitly flagged as the one
  undone piece in `docs/technical/QR_WAYFINDING.md`.
- Live indoor positioning of any kind (GPS/beacon/Wi-Fi/NFC) — explicitly
  documented as a known, structural limitation, not a bug.
- Bulk QR-code generation (all rooms at once) — flagged as a possible
  future addition, not built.
- QR-scan analytics — flagged as easy to add later, not built.

### Possible scalability concerns

- Dijkstra is an unoptimized O(V²) implementation — fine at this product's
  actual per-building graph size, would need a priority-queue version for
  much larger graphs (no evidence this has been a real problem; noted as a
  characteristic, not a bug).
- Client-side substring search has no real indexing — fine at current data
  volumes, wouldn't scale to a very large multi-building search product
  without backend search infrastructure.

### UX limitations

- No bounds/geometry validation in the editor can let staff create a
  visually broken floor with nothing warning them.
- No forced re-authentication or notification when an account is blocked
  mid-session.

### Technical debt (self-documented in `APPLICATION_ARCHITECTURE.md`'s own
"Current implementation notes" section — the project's own maintainers
flag these, not an external critique)

- The dashboard's server-rendered loader calls Payload directly instead of
  going through a dedicated read port.
- The viewer-directory and map-viewer loaders are server-only functions
  using the Payload Local API directly rather than the fuller port pattern.
- The `/editor` floor-list index route queries Payload directly from the
  route itself.
- Some map-loading queries use fixed limits rather than retrieving every
  pagination page.
- No rate limiting, CSRF protection, or security headers anywhere in
  application code (Section 19).
- Several features (`email`, `invitations`, `organization-settings`,
  `smart-builder`) have no automated test coverage at all.

---

# 25. FUTURE WORK

Everything below is tagged by evidence tier — **documented** (an explicit
TODO/design doc/threat-model line exists in the repo), **documented
(passing mention only)** (the repo mentions it, but only as a hypothetical
example or in-passing remark, not a planned item — flagged separately so it
isn't mistaken for a roadmap commitment), or **inference** (a reasonable
extension this report is suggesting, with no repo evidence either way).
Nothing here is claimed as an official roadmap unless marked "documented."

### Documented — a real design or plan exists in the repo

- **Turn-by-turn text instructions + voice guidance** — full design already
  written in `docs/technical/HOW_DIRECTIONS_WORK.md`, listing the exact
  remaining steps: angle-based turn detection, instruction text generation,
  an instruction-list UI, Web Speech API integration, manual step
  advancement.
- **"Share my route" button for visitors** — designed in `docs/technical/
  QR_WAYFINDING.md`, including the exact URL contract to reuse; just not
  built.
- **Bulk QR-code generation for a whole building** — flagged as a deferred
  "maybe" in `docs/technical/QR_WAYFINDING.md`.
- **QR-scan analytics** — flagged as cheap to add later since the resolver
  already sees every scan, same doc.
- **Live indoor positioning** via QR-code checkpoints, Bluetooth beacons,
  Wi-Fi positioning, or NFC tags — documented as the acknowledged gap
  behind "the app doesn't know where the user is," named as *technologies
  that would close it*, not as a committed plan.
- **Rate limiting** — genuinely on the team's documented plan, not just an
  inferred gap: `docs/security/SecurityPlan.md` F3 logs a login-lockout fix
  (`maxLoginAttempts`/`lockTime`) as **"planned"** (confirmed not yet
  shipped as of this report), and separately names `/forgot-password`
  throttling plus broader DDoS mitigation as **"the first thing added if
  the project continued past the capstone."** See Section 19 for the full,
  nuanced picture — this isn't a flat gap, it's a reasoned, scoped
  decision.
- **Server-side upload file-type/size allowlist** — SecurityPlan.md F2,
  logged and scoped (`mimeTypes` + max size on `Media`'s `upload` config),
  confirmed not yet shipped.
- **Fail-loud startup instead of silently defaulting secrets to `""`** —
  SecurityPlan.md F4, a named, scoped fix using the existing `requireEnv()`
  helper.
- **Raise minimum password length from 8 to 10 characters** —
  SecurityPlan.md F6, explicitly deferred (not accepted) to a later sprint.
- **Test coverage for `email`, `invitations`, `organization-settings`, and
  `smart-builder`** — not itself named in a roadmap doc, but the project's
  own `CLAUDE.md`/`AGENTS.md` conventions require tests for new work, and
  `docs/CHANGE_LOG.md` records dedicated backlog issues opened for
  unit-testing gaps under a tracked milestone — treat the *practice* of
  tracking test debt as documented, even though these four specific
  features aren't individually named in that backlog.

### Documented, but only as a passing/hypothetical mention — do not present as a roadmap item

- **"AI map integration"** — the *only* place anything AI-related appears
  in the repo is one cell of a table in `docs/security/SecurityPlan.md`'s
  input-validation section, used purely as a hypothetical example of when
  to re-check for command-injection risk: "Re-check whenever a feature
  (e.g. future AI blueprint import) shells out to an external tool." This
  is not a planned feature, a design doc, or a roadmap line — it's a
  security reviewer's illustrative example. If this comes up in the demo,
  say plainly that AI-assisted map/blueprint import was named once, in
  passing, as a hypothetical in a security document — not that it's
  planned.
- **Billing** — the only mention is SecurityPlan.md F5, passingly noting
  that a decision to allow cross-org reads of `organizations.name`/`type`
  "would be revisited if the `organizations` collection ever grows fields
  with real sensitivity (billing info, internal contacts, etc.)." That's a
  hypothetical example inside a risk-acceptance justification, not a
  statement that billing is planned.

### Inference — reasonable extensions with no repo evidence either way

- **Soft deletion for buildings and floors** — nothing in the schema or
  code suggests this exists or is planned (both collections use Payload's
  default hard delete). A reasonable extension given the map/graph data a
  deleted building leaves behind (orphaned floors/objects/nodes/edges) is
  worth reasoning about, but this is this report's own suggestion, not
  something found in the repo.
- **Bot/form protection (e.g. Cloudflare Turnstile, reCAPTCHA)** on public
  forms like signup — not mentioned anywhere in the docs or code. Worth
  noting as a natural fit *given* Cloudflare is already in the production
  stack (Section 21) as CDN/DNS, which is exactly where Turnstile would
  plug in with minimal new infrastructure — but this is this report's
  inference from the existing stack, not a documented plan.
- **Cloudflare Image Resizing/Transformations** for uploaded media — the
  app already deliberately skips Next.js's own image optimizer for R2
  images (Section 13, a documented current decision, not a gap), and
  Cloudflare is already the CDN in front of the app in production — using
  Cloudflare's own image transformation product instead would be a natural
  next step that reuses infrastructure already in place, but it isn't
  mentioned anywhere in the repo as planned.
- **Configurable map theming per organization** (e.g. letting an org pick
  their own map color scheme, distinct from the app's own light/dark
  theme) — not mentioned anywhere; a reasonable product extension given the
  map viewer already has its own separate `--map-viewer-*` token namespace
  (Section 11) that a per-org override could plausibly build on, but that's
  this report's inference about *how* it could be built, not evidence it's
  planned.
- **Google OAuth / third-party sign-in** — the app only has Payload's own
  email/password auth today (Section 12); nothing in the repo suggests
  OAuth is planned. A reasonable extension for reducing signup friction,
  but purely this report's suggestion.
- **Billing/subscriptions as an actual product feature** (beyond the
  passing mention above) — no payment provider, pricing model, or
  subscription-related field exists anywhere in the schema or code. Purely
  a hypothetical for if the product moved toward being commercialized.
- **Route/graph performance optimization** (a heap-based Dijkstra) if
  graphs grow much larger.
- **Larger-scale/backend search** if the number of buildings/rooms grows
  well beyond what client-side substring filtering comfortably handles.
- **Map versioning / draft-vs-published history**, **localization**,
  **emergency routing** — none of these appear anywhere in the repo's own
  docs or code; if raised in a presentation, they should be framed purely
  as ideas for where the product *could* go, not anything hinted at by the
  implementation.

---

# 26. SHOWCASE-WORTHY FEATURES

Ranked for a non-technical audience, roughly in "explains value fastest"
order.

1. **Visitor searches a room and gets a route drawn on the map.** The
   single clearest "this is the product" moment. Non-technical narration.
   ~30-40s.
2. **Route crosses floors, "continue via elevator" prompt appears, floor
   switches.** Demonstrates the multi-floor capability immediately after
   #1. Non-technical. ~20-30s.
3. **Scan a QR sticker → land directly on directions from that room.**
   Tangible, phone-in-hand demo moment; easy for anyone to grasp instantly.
   Non-technical. ~20s.
4. **The map editor: place a room with one double-click, watch a node
   appear automatically (Smart Builder).** Shows the admin side is easy to
   use, not just powerful. Light technical framing ("the map builds its
   own walking network as you draw"). ~30-40s.
5. **Toggle "accessible only" and watch the route change.** A quick,
   meaningful feature that visibly changes behavior on screen. Non-technical.
   ~15-20s.
6. **Generate + download/print a QR sticker from the dashboard.** Closes
   the loop from #3 — shows where that sticker actually comes from.
   Non-technical. ~20s.
7. **Invite a teammate by email, they land in a specific role with
   specific building access.** Demonstrates the multi-person/organization
   angle. Non-technical. ~20-30s.
8. **Building/floor directory search on the public homepage.** Simple,
   fast, sets the scene before diving into one building. Non-technical.
   ~15s.
9. **Light/dark theme toggle.** Small, cheap polish beat, good as a quick
   cutaway, not a centerpiece. ~5-10s.
10. **Floor-links panel connecting a stairs node between two floors.**
    More technical, better suited to a technical-audience segment than the
    general promo. ~20-30s if included at all.

---

# 27. RECOMMENDED 5-MINUTE PRODUCT DEMO FLOW

A connected story: an organization publishes a building, then a visitor
uses it.

| Time | Action | Screen | Audience sees | Takeaway |
|---|---|---|---|---|
| 0:00-0:30 | Open the dashboard, show an already-set-up building with a couple of floors | `/dashboard/buildings/[id]` | A real building with floors listed, one published, one draft | "Organizations manage their own buildings here" |
| 0:30-1:30 | Open the floor editor, double-click to place a room, show a node appear automatically | `/editor/[floorId]` | A room object appears; a node pops up near it without manual placement | "The map isn't just a picture — it builds a walkable network as you go" |
| 1:30-2:00 | Connect that floor's elevator node to the floor above via Floor-links panel | Editor, node inspector | Dropdown showing the matching elevator node on another floor, link created | "Floors connect to each other for routing" |
| 2:00-2:15 | Toggle the floor to Published | Building dashboard page | The switch flips, floor now live | "One toggle makes it public" |
| 2:15-2:30 | Generate a QR sticker for a room | Dashboard QR viewer/dialog | QR code image, Download/Print buttons | "Every room can get a physical sticker" |
| 2:30-3:00 | Switch to the public site, land on the home page, search for the building | `/`, `/buildings` | Search box, building card | "Now the visitor side" |
| 3:00-3:30 | Open the building's map, search for a destination room | `/map/[floorId]` | Search results, room selected as destination | "Visitor searches where they want to go" |
| 3:30-4:00 | Route draws on screen; show the accessible-only toggle changing the route | Map viewer | Line on the map, route updates when toggled | "Real computed routing, with accessibility support" |
| 4:00-4:30 | Route crosses to another floor; floor-hop prompt appears; advance | Map viewer | "Continue via elevator to Floor 2" prompt, floor switches | "Multi-floor navigation, the hard part, just works" |
| 4:30-5:00 | Quick QR scan simulation: open `/qr/{objectId}` link, land pre-routed from that room | Phone/browser, map viewer | Viewer opens with origin already set | "Ties back to the sticker from earlier — full loop closed" |

---

# 28. RECOMMENDED 5-MINUTE SHOWCASE/PROMO EXPLANATION

Storytelling structure, not a script.

1. **What problem exists?** (visuals: stock/real-world footage of someone
   looking lost/confused in a large building, or a photo of a confusing
   static directory board) — a few seconds establishing the universal
   "I can't find this room" feeling.
2. **What is Wayfinder?** (visuals: simple animated text + a clean product
   screenshot of the home page) — one sentence, plain language, from
   Section 1.
3. **Who is it for?** (visuals: quick text callouts — hospital, university,
   mall, office — matching the actual `Organization.type` options in the
   data model, not invented examples) — grounds it in something concrete
   without overclaiming a customer base that doesn't exist yet.
4. **How does it solve the problem?** (visuals: real app footage — search
   → route → floor change, the same beats as the product demo, compressed) —
   the core value loop, shown, not described.
5. **What are its strongest capabilities?** (visuals: a simple diagram —
   Building → Floor → Rooms → Route, or reuse the text diagram style from
   Section 9) — multi-floor routing, accessible routing, QR stickers,
   organization self-management, presented as short callouts, not a
   feature dump.
6. **What is technically interesting?** (visuals: a simplified graph
   diagram — dots and lines with a highlighted shortest path) — briefly,
   for the technical portion of the audience: "a real routing algorithm,
   not just a static picture," without going deep into Dijkstra by name
   unless the audience is technical.
7. **What could it become?** (visuals: animated text only, no footage of
   things that don't exist) — mention turn-by-turn directions and QR-based
   wayfinding extensions as *documented* next steps (Section 25), framed
   honestly as "what's next," not "what it already does."

Keep actual application footage for points 4-6 (the parts that need proof);
keep stock/illustrative visuals and animated text for points 1, 3, and 7
(the parts that are scene-setting or forward-looking). Avoid marketing
superlatives — the product's real, verified capabilities (Section 22) are
strong enough on their own.

---

# 29. SCREEN / PAGE INVENTORY

Grouped by area, from `src/constants/routes/index.ts` and the actual route
files.

### Public

| Route | Purpose | Showcase? |
|---|---|---|
| `/` | Home — search/browse buildings | Yes |
| `/buildings` (+ `?view=recent`) | Full building directory | Maybe (brief) |
| `/map` | Bare map index (no floor selected) | No |
| `/map/[floorId]` | The public floor viewer + routing | **Yes — centerpiece** |
| `/qr/[objectId]` | QR sticker resolver → redirects into `/map` | Yes (brief, ties the loop) |
| `/about` | Visitor-facing "how it works" page | Maybe |
| `/organization` | Marketing page for prospective organizations | Maybe |
| `/organization/about` | "About Wayfinder" for organizations | No |
| `/organization/contact` | Direct email contact for prospective/current organizations | No |
| `/terms`, `/privacy` | Legal pages | No |

### Authentication

| Route | Purpose | Showcase? |
|---|---|---|
| `/signin`, `/signup` | Login / account+org creation | Maybe (brief) |
| `/forgot-password`, `/reset-password` | Password recovery | No |
| `/check-email`, `/verify-email` | Email verification flow | No |
| `/pending-approval` | Shown after sign-in while a newly signed-up organization awaits platform-admin approval | No |
| `/invite` | Accept a teammate invitation | Yes (brief, shows the invite loop) |
| `/register-organization` | (Public-side entry point into signup) | Maybe |

### Dashboard (private)

| Route | Purpose | Showcase? |
|---|---|---|
| `/dashboard` | Role-aware overview | Yes (brief opening shot) |
| `/dashboard/buildings`, `/dashboard/buildings/[id]` | Building management, floor list | Yes |
| `/dashboard/buildings/[id]/floors/[id]/qr-codes` | QR sticker generator | Yes |
| `/dashboard/organization` | Organization settings | No |
| `/dashboard/users`, `/dashboard/users/[id]` | Team management | Yes (brief) |
| `/dashboard/profile` | Own profile/password | No |

### Other

| Route | Purpose | Showcase? |
|---|---|---|
| `/editor/[floorId]` | The map editor | **Yes — centerpiece** |
| `/admin` | Payload's generic admin panel | No (not custom product UI) |

---

# 30. IMPORTANT TERMINOLOGY

The project's actual terms, verified from the schema/code — use these
consistently, not generic equivalents.

- **Organization** — the tenant/account that signs up; owns buildings and
  users. Has a `type` (hospital, university, mall, office, airport,
  library, other).
- **Building** — a physical structure belonging to one organization; has
  name, address, contact info, logo.
- **Floor** — one level of a building; has its own pixel-space
  `width`/`height`, a `metersPerPixel` scale, and a `status`
  (`draft`/`published`).
- **Map object** (internal name `MapObject`/`map-objects`) — a drawn,
  visible element on a floor: `room, wall, door, hallway, stairs, elevator,
  escalator, washroom, exit, poi, aisle, shelf, section`.
- **Map node** (internal name `MapNode`/`map-nodes`) — an invisible,
  routable point in the navigation graph; has a `role` (`entrance, exit,
  hallway_point, stairs_entry, elevator_entry, escalator_entry,
  shelf_access`).
- **Path edge** (internal name `PathEdge`/`path-edges`) — a weighted
  connection between two nodes; has a `type` (`walkway, stairs, elevator,
  escalator, ramp`), `distanceMeters`, and `bidirectional`.
- **Route** — the calculated shortest path between an origin and
  destination node.
- **Segment** — the portion of a route that lies on one single floor.
- **User** — an organization account with a `role`.
- **Role** — `owner`, `manager`, or `member` (organization-scoped); a
  separate `admins` collection exists for platform staff and is not called
  a "role" on the `users` schema.
- **Invitation** — a pending/accepted/revoked record representing an
  email-based offer to join an organization with a specific role.
- **Member** (as a role) — an organization user scoped to only their
  explicitly assigned buildings.
- **Smart Builder** — the editor's automated node/edge generation feature.
- **Floor-links** — the editor's cross-floor connector-linking feature.
- **Accessible-only** — the routing toggle that excludes non-accessible
  nodes/edges from the graph.
- **Media** — the shared upload collection backing logos, avatars, and
  floor background images.

---

# 31. SOURCE-OF-TRUTH FACT SHEET

```
PROJECT: Wayfinder — an indoor mapping and navigation platform.
PURPOSE: Let organizations publish structured, searchable, routable indoor
         maps of their buildings; let visitors search a destination and
         get a calculated route, including across floors.
PRIMARY USERS: Public visitors (no account) searching for a room/destination
         inside a published building.
ORGANIZATION USERS: Organization accounts with role owner, manager, or
         member, managing buildings/floors/maps/team from a private
         dashboard and a visual floor editor.
CORE PROBLEM: Large indoor spaces are hard to navigate with static
         signage/maps; no built-in way to search-and-route indoors.
CORE SOLUTION: A structured per-floor data model (visible objects +
         a separate routable graph of nodes/edges) plus a real shortest-
         path algorithm, exposed through a public search-and-route viewer
         and an admin-facing visual editor.

FRONTEND: Next.js 16 (App Router) + React 19 + TypeScript (strict) +
         Tailwind CSS v4 + Base UI/shadcn-pattern components + Zustand.
         Organized as vertical slices per feature (src/features/<name>/),
         each with its own ports (interfaces) and Payload-backed adapters —
         see Section 10 for the precise, non-overclaimed framing of this as
         "hexagonal in shape," and Section 11 for how the shared Zustand
         store is the actual decoupling mechanism between features.
BACKEND: Payload CMS 3 (Local API + REST + GraphQL), Next.js Server Actions,
         a ports/adapters layering convention per vertical slice.
DATABASE: SQLite in local development (default); MongoDB Atlas in
         production, environment-selected via DATABASE_ENGINE. This is the
         one place in the codebase with a real, demonstrated
         adapter-swap (two live implementations of Payload's DB-adapter
         interface), not just the interface shape.
AUTH: Payload's built-in cookie/JWT auth, two separate collections
         (admins, users). Route gating is two-layered: src/proxy.ts
         (Next.js 16's renamed middleware convention — cookie-presence
         redirect, UX only) plus (private)/layout.tsx (the real
         getCurrentUser() check).
STORAGE: Cloudflare R2 (S3-compatible), direct browser-to-storage uploads.
HOSTING: Confirmed (not inferred): Vercel (hosting, SSR + Partial
         Prerendering, TLS termination, edge network) + Cloudflare
         (CDN/DNS in front of Vercel, also the object-storage provider) +
         MongoDB Atlas (managed production database). CI/CD: GitHub
         Actions for test/lint, Vercel's native GitHub integration for
         build/deploy — which is why no vercel.json/Dockerfile exists in
         the repo.

CORE ENTITIES: Organization, Building, Floor, MapObject, MapNode, PathEdge,
         User, Invitation, Media, Admin.
CORE FEATURES: Building/floor directory + search, public multi-floor
         routing with accessibility filtering, visual floor editor with
         automated (Smart Builder) and manual node/edge authoring,
         cross-floor connector linking, QR sticker generation + resilient
         scan resolver, role-based team management with email invitations,
         self-service account/password management.

PATHFINDING ALGORITHM: Dijkstra's algorithm (textbook O(V²), not
         heap-optimized), with a fixed penalty added to cross-floor edge
         weights to discourage unnecessary floor-hopping.
MULTI-FLOOR SUPPORT: Yes — path edges can span two floors (stairs/elevator/
         escalator/ramp), routes are split into per-floor segments with a
         "continue via X" UI prompt.
MAP EDITOR: Yes — double-click-to-place objects (13 types), manual or
         Smart-Builder-automated node/edge authoring, explicit Save (no
         autosave), publish toggle lives on the dashboard, not the editor.
PUBLIC MAPS: Visibility gated purely by a floor's own status field
         (draft/published), enforced at the collection access-control
         layer for unauthenticated requests.
ROLE SYSTEM: owner / manager / member (organization-scoped) + a separate
         admins platform-staff collection; enforced server-side via
         Payload access functions, verified not to be UI-only.

TOP 5 TECHNICAL ACHIEVEMENTS:
  1. Multi-floor Dijkstra routing with a floor-change penalty.
  2. Smart Builder's real geometric auto-node/auto-connect logic.
  3. Structural (graph-level) accessible-only routing filter.
  4. Server-enforced, field-level multi-tenant RBAC with self-escalation
     prevention.
  5. QR sticker resilience via a stable resolver route, surviving a room's
     floor changing after the sticker was printed.
  (Also strong: a formal STRIDE threat model was run against this exact
  codebase, and its top-rated finding — cross-tenant map-data tampering —
  was found and subsequently fixed. See Section 19/22.)

TOP 5 USER-FACING FEATURES:
  1. Search-and-route indoor navigation with floor switching.
  2. Visual floor editor with automated graph generation.
  3. QR sticker generation and scanning.
  4. Email-based team invitations with role/building scoping.
  5. Organization self-service building/floor publishing.

CURRENT LIMITATIONS: No turn-by-turn text/voice guidance (spec'd, not
         built); no live indoor positioning (deliberate, documented gap);
         no route-share button for visitors (admin QR generation is built,
         guest sharing is not); login-lockout rate limiting is planned but
         not yet shipped, and broader throttling/DDoS mitigation is a
         consciously accepted, deferred risk (not an oversight — see
         Section 19); no CSRF protection or security headers; no E2E
         tests; several features have zero automated test coverage (email,
         invitations, organization-settings, smart-builder); no editor
         bounds validation; no autosave.

FUTURE OPPORTUNITIES: Turn-by-turn instructions + voice guidance
         (documented design exists), visitor route-sharing (documented
         design exists), live positioning via QR checkpoints/beacons/
         Wi-Fi/NFC (documented as the named gap), bulk QR generation, QR
         scan analytics, expanded test coverage, the still-open half of
         SecurityPlan.md's F2/F3/F4/F6 (upload validation, login lockout,
         fail-loud secrets, longer minimum password). Reasonable but
         unconfirmed extensions this report suggests rather than the repo
         documents: soft deletion for buildings/floors, bot/form
         protection (Cloudflare Turnstile fits the existing stack),
         Cloudflare image transformation for uploaded media, per-org map
         theming, Google OAuth, and billing/subscriptions if the product
         were ever commercialized. "AI map/blueprint import" appears
         exactly once in the repo, as a hypothetical example in a security
         doc — not a planned feature; don't present it as one.
```

---

# 32. CLAIM SAFETY CHECK

## SAFE TO CLAIM

- Multi-floor, weighted shortest-path routing using Dijkstra's algorithm.
- Accessible-only routing structurally excludes non-accessible nodes/edges
  from the graph.
- A visual, drag/double-click floor editor exists with 13 distinct object
  types.
- Smart Builder automatically generates navigation nodes and connects them
  to the hallway network as objects are created.
- Floor-to-floor connections (stairs/elevator/escalator) are supported and
  factored into routing.
- QR code stickers can be generated per room, downloaded, and printed, and
  the scan link survives the room later moving to a different floor.
- Role-based access control (owner/manager/member) is enforced
  server-side, not just hidden in the UI.
- Email-based team invitations exist, with hashed single-use tokens and
  the invitee always choosing their own password.
- Self-service password change requires re-proving the current password
  and can never target another account.
- Published/draft floor status genuinely gates what an unauthenticated
  visitor can see.
- The app supports both SQLite (dev) and MongoDB Atlas (production) as its
  database, environment-selected.
- File uploads go directly from the browser to Cloudflare R2.
- **Hosting is Vercel, with Cloudflare as CDN/DNS/media storage in front of
  it, and MongoDB Atlas as the production database** — confirmed directly
  by the project owner and independently corroborated by `docs/security/
  SecurityPlan.md`'s own infrastructure description. No longer "claim with
  care" as of this revision.
- **A formal STRIDE-based security threat model exists for this codebase**
  (`docs/security/SecurityPlan.md`) — safe to claim the process exists. Its
  highest-severity finding is only **half-fixed**, not fully resolved — see
  DO NOT CLAIM below; don't claim it as closed.
- CI runs via GitHub Actions (test + lint); deployment is via Vercel's
  GitHub integration.
- The codebase is organized as vertical slices per feature, each following
  a ports-and-adapters convention (Server Action → Port → Payload Adapter).

## CLAIM WITH CARE

- Exact test coverage breadth — 75 test files exist and cover most major
  features, but coverage is uneven (some features have none); avoid a
  blanket "well-tested" claim without qualifying which parts.
- Any specific performance/scale claim (route computation speed, how many
  buildings/rooms it "can handle") — no benchmarks exist in the repo.
- "Accessibility-friendly app" as a general claim — the *routing* toggle is
  real and structural, but no broader accessibility (screen-reader/WCAG)
  audit evidence was found; don't extend the claim beyond the routing
  feature itself.
- **"Hexagonal architecture"** as a bare, unqualified claim — the app-code
  ports/adapters layer is real in shape and discipline but has only one
  concrete adapter per port (Payload), so it doesn't demonstrate
  adapter-swapping at that layer. The *database* layer does demonstrate
  real swapping (SQLite/MongoDB). Say "ports-and-adapters discipline,
  demonstrated adapter-swap at the database layer" rather than a bare
  "hexagonal" claim, if precision matters to the audience.
- **"Rate limiting isn't implemented"** as a bare claim — true today, but
  incomplete: it's a named, reasoned, partially-planned item in the team's
  own security plan (login-lockout "planned," broader throttling
  "consciously accepted risk, first thing added post-capstone"), not an
  oversight nobody considered. Prefer the fuller framing from Section 19 if
  asked about it directly.

## DO NOT CLAIM

- **That cross-tenant map-data tampering is fixed.** It is only half-fixed:
  the collection-level `access` rules are real and close the raw REST/
  GraphQL attack path, but the app's own `/editor/{floorId}` page still
  lets any authenticated user from any organization view/edit/delete
  another organization's floor plan, rooms, nodes, and path edges, because
  `floor-pl.adapter.ts`/`object-pl.adapter.ts`/`node-pl.adapter.ts`/
  `edge-pl.adapter.ts` bypass Payload access control (`overrideAccess:
  true`, explicit or by omission-default) with no ownership check in the
  server actions calling them. This is a live, currently exploitable
  finding through the real product UI — see Section 19. Do not present the
  security-engineering story as "we found a critical issue and fixed it";
  the accurate framing is "we found it, fixed half, and the other half
  (the more important half) is still open and known."
- Turn-by-turn spoken/written directions ("turn left," voice guidance) —
  not implemented, only designed.
- Live indoor positioning / real-time location tracking — explicitly not
  implemented, a documented and deliberate current gap.
- A visitor-facing "share my route" button — not implemented (only the
  admin-side QR sticker generator is real).
- Any specific real-world customer, deployment, or organization currently
  using the product — nothing in the repo evidences this; the seeded demo
  data (fictional "Northstar Medical Centre," "Harbourfront Galleria") is
  clearly sample/demo data, not real customers.
- CSRF protection or security headers exist — verified absent from
  application code.
- Any test-coverage percentage — none is computed or claimed in the repo;
  don't invent one.
- Bulk QR generation or QR-scan analytics — both explicitly flagged in the
  repo's own docs as not built.
- **"AI map/blueprint import" as a planned or in-progress feature** — it
  appears exactly once in the repo, as a hypothetical example inside a
  security document's input-validation table, not a design doc or roadmap
  item.
- **Billing/subscriptions as a planned feature** — the only mention is a
  passing hypothetical inside a risk-acceptance justification, not a
  roadmap commitment.
- That the login-lockout rate-limiting fix has shipped — it's logged as
  "planned" in the team's own plan and confirmed still absent from
  `Users.ts`'s auth config as of this report.

---

# 33. FILES YOU INSPECTED

This report was built from directly reading the following (not an
exhaustive list of every file touched, but the ones that materially
informed the report):

**Collections & access control**: `src/collections/index.ts`,
`Admins.ts`, `Users.ts`, `Organizations.ts`, `Buildings.ts`,
`Invitations.ts`, `Media.ts`, `map/Floors.ts`, `map/MapObjects.ts`,
`map/MapNodes.ts`, `map/PathEdges.ts`, `map/validateBuildingRelationships.ts`,
`access/index.ts`, `constants/roles.ts`, `hooks/syncMediaUrl.ts`,
`hooks/cleanupReplacedMedia.ts`, `hooks/blockLogin.ts`,
`access/__tests__/access.test.ts`.

**Pathfinding/navigation**: `src/features/navigation/lib/dijkstra.ts`,
`graph.ts`, `routeSegments.ts`, `findNodeForObject.ts`,
`filterRouteCandidates.ts`, `types/navigation.types.ts`,
`constants/routing.constants.ts`, `store/createNavigationSlice.ts`,
`hooks/useRoute.ts`, `hooks/useApplyRouteFromUrl.ts`, plus their
`__tests__` (`dijkstra.test.ts`, `graph.test.ts`, `routeSegments.test.ts`).

**Map editor**: `src/features/map-editor/core/components/MapCanvas.tsx`,
`CreateObjectsPanel.tsx`, `hooks/useCanvasPointer.ts`, `useObjectDrag.ts`,
`useCanvasViewport.ts`, `useBackgroundImageDrag.ts`, `useSaveEditorChanges.ts`,
`lib/canvas.ts`, `lib/canvasViewport.ts`, `lib/backgroundImageFit.ts`,
`lib/distance.ts`, `lib/objectDefaults.ts`, `types/editor.types.ts`;
`smart-builder/lib/smartObjectBuilder.ts`, `autoConnect.ts`,
`pathBuilder.ts`, `objectNodeRules.ts`;
`floor-links/lib/crossFloorConnect.ts`, `hooks/useLinkableNodes.ts`,
`useCrossFloorLinks.ts`; `FloorReferencePanel.tsx`.

**Auth/security**: `src/features/auth/services/server/auth-pl.adapter.ts`,
`auth.ports.ts`, `actions/server/*`; `src/features/invitations/lib/
invite-token.ts`, `services/server/invitation-manage-pl.adapter.ts`,
`invitation-accept-pl.adapter.ts`; `src/app/(frontend)/(private)/layout.tsx`;
`src/proxy.ts`; `src/features/user-management/actions/server/*`,
`services/server/user-management-pl.adapter.ts`;
`docs/security/SecurityPlan.md` (full read, cross-checked findings against
current source rather than trusted as current on its own — this surfaced a
real, still-open critical gap: T1/F1's collection-access half is fixed, but
the map-editor's own server actions/adapters
(`floor-pl.adapter.ts`/`object-pl.adapter.ts`/`node-pl.adapter.ts`/
`edge-pl.adapter.ts`) still bypass access control entirely, confirmed by
reading those files directly; `SecurityPlan.md` itself has been corrected
to reflect this); `docs/security/RBAC.md`.

**Storage/deployment**: `src/plugins/storage/storage.ts`, `storage.env.ts`,
`storage.constants.ts`; `src/plugins/database/database.ts`, `database.env.ts`;
`next.config.ts`; `package.json`; `vitest.config.mts`; `eslint.config.mjs`;
`tsconfig.json`; `.github/workflows/test.yml`, `lint.yml`; `scripts/
seed-demo.ts`.

**Architecture/store**: `src/store/index.ts`, `src/store/types.ts`;
`docs/technical/SIMPLE_FEATURE_ARCHITECTURE.md` (full read — module
awareness diagram and shared-store composition, including its own honest
documentation of two-way coupling between Map editor core/Floor-links and
Map viewer/Navigation); `docs/project/PROJECT_STRUCTURE.md`;
`CLAUDE.md`/`AGENTS.md` (project-root convention files, full read).

**Viewer/public app**: `src/features/viewer/services/
getPublicLandingData.ts`; `src/features/map-viewer/services/server/
getMapViewerData.ts`; route files under `src/app/(frontend)/(public)/`.

**Project documentation cross-checked against code** (used as corroborating
evidence, not trusted blindly): `docs/technical/APPLICATION_ARCHITECTURE.md`,
`docs/project/SCHEMA.md`, `docs/security/RBAC.md`,
`docs/technical/USER_INVITATIONS.md`, `docs/technical/QR_WAYFINDING.md`,
`docs/technical/HOW_DIRECTIONS_WORK.md`, `docs/technical/MEDIA_STORAGE.md`,
`docs/technical/DASHBOARD_QR_VIEWER.md`, `docs/technical/
CACHING_AND_RENDERING_STRATEGY.md`.

**Constants/config**: `src/constants/routes/index.ts`, `src/constants/
media.ts`, `src/constants/brand.ts`.

Excluded from inspection per your instructions: `node_modules/`, `.next/`,
generated Payload type files, and other build artifacts.
