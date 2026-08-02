# Changelog

## [Unreleased]

## [0.1.5] - 2026-08-02

### Fixed
- Tightened the floor navigator's visual rhythm: both arrow buttons now use equal 40px hit areas, the center selector has a fixed 64px width, and the island uses compact symmetric padding instead of stretching its middle control at viewport-based breakpoints.
- Reworked responsive map overlays into separate collision zones: the room-selection bar now sits close to the top, floor and zoom controls share a gap-enforced bottom-corner grid, route cards sit in their own row above those islands, and the mobile-sidebar clearance remains active through the correct `md` breakpoint.
- Fixed the map canvas route-floor selector overlapping its trigger on wide screens instead of opening below it.
- Fixed dragging to pan the map viewer not working when the gesture started on an object (room, hallway, connector, etc.) instead of empty canvas, on both mouse and touch. Objects now track their own drag distance and forward pan deltas once past the existing drag threshold, while still keeping native click/tap-to-select fully reliable.
- Fixed the map viewer occasionally locking onto a wrong zoom level for the rest of the session (most noticeable on a mobile hard reload). A 0×0 viewport measurement — possible on the very first layout read, before hydration settles — was being treated as real and used to compute the default view; later, correctly-sized measurements only re-clamp the existing zoom rather than recomputing it, so the bogus value never corrected itself.

### Added
- Added a persistent canvas floor navigator for free exploration outside an active multi-floor route. Its responsive floating island provides one-tap previous/next floor controls plus a bounded, scrollable all-floors selector with 44px mobile targets, floor levels, route-independent labels, disabled boundary states, and keyboard navigation.
- Added a route-connector highlight to the map viewer: the specific stairs/elevator/escalator a multi-floor route continues through on the active floor now gets a route-colored outline on its object shape and a pulsing beacon ring on its marker, so it's obvious at a glance which connector to use when a floor has more than one. An explicit selection still visually takes priority over the highlight.

### Changed
- Kept the map-view Reset action visible in the compact mobile zoom island; only the less essential Grid control and numeric zoom percentage remain hidden at the narrowest breakpoint.
- Reorganized canvas controls into separate bottom-corner islands: floor navigation is docked flush bottom-left and zoom controls bottom-right in a collision-aware grid. Very narrow screens retain a clean horizontal floor control and show only essential zoom buttons; secondary zoom controls and the live percentage appear as space increases.
- Simplified the closed canvas floor navigator to show only the active floor name; level and position details remain in its accessible label and expanded floor list.
- Removed the duplicate floor selector from the map viewer page header. The header now provides read-only building and floor context, while all interactive floor switching lives in the canvas floor navigator.
- Replaced the map canvas's unbounded route breadcrumb with a responsive floor-route selector. The compact floating trigger shows the active floor and route position, while its keyboard-accessible popup lists connector context and caps its height at approximately six floors before scrolling, preventing long routes from covering the map on mobile or desktop.
- Replaced the hand-built demo seed blueprints with production-style exported map fixtures covering five floors, 107 objects, 163 nodes, and 178 source edges. The idempotent seeder now remaps exported relationship IDs when importing, assigns sequential floor levels, fills in missing connector objects and nodes, and links every adjacent floor with stairs, elevator, and escalator edges for repeatable multi-floor tests.
- Stopped the map viewer's whole page from re-rendering on every pan/zoom tick. Viewport state (pan, zoom, dragging) now lives in a dedicated store slice that only `MapViewerCanvas` subscribes to, instead of component-local state owned by the page shell; an active drag/pinch/wheel gesture writes the transform straight to the DOM via a ref and only syncs the store at most once per animation frame, so panning and zooming are now effectively free for the rest of the page (sidebar, header, toolbar).
- Memoized `MapViewerSvg` so `MapViewerCanvas`'s own pan/zoom-driven re-renders no longer re-run the `.map()` over every room, hallway, and connector on the active floor — none of its props depend on pan/zoom, so panning now costs nothing proportional to floor size.
- Stopped selecting an object from re-rendering the map viewer's header and toolbar. `selectedObjectId` lives in `MapViewerShell`, so setting it re-renders the whole page; `MapViewerPageHeader` and `MapViewerToolbar` are now memoized, and the handlers `MapViewerShell` passes them (`changeZoom`, `resetView`, `focusWorldBounds`, floor/segment navigation, grid toggle) are stable across renders that don't actually change floor, zoom, or route state, so both bail out on a plain selection click.
- Stopped `useRoute` from rebuilding the whole building's routing graph every time the origin or destination changes. The graph (adjacency built from every floor's nodes/edges) is now its own memo keyed only on the data and the accessible-only toggle; picking a different destination (or origin) reuses it and only reruns the shortest-path search.
- Changed the map viewer's initial view to start zoomed out enough to show the whole floor, centered in the viewport, instead of zoomed in and offset toward the top-left corner.

## [0.1.4] - 2026-07-31

### Fixed
- Preserved Payload document IDs in their native SQL or MongoDB form instead of coercing route and relationship IDs with `Number(...)`, preventing Mongo ObjectId values from becoming `NaN` in production.

## [0.1.3] - 2026-07-31

### Changed
- Separated Payload administrators into their own `admins` authentication collection. Organization accounts remain in `users` with application-level `admin` / `user` roles, while Payload Admin authenticates exclusively against `admins` and does not trust the application role.
- Added a ten-second countdown to the check-email screen, after which users who verified on another device can open the sign-in page directly.

## [0.1.2] - 2026-07-31

### Added
- Added an environment-selected Payload database plugin. `DATABASE_ENGINE=sql` uses SQLite, while `DATABASE_ENGINE=mongo` uses MongoDB; both require `DATABASE_URL` and invalid configuration now fails at startup.

### Changed
- Temporarily hid the editor reference-image tools in production while keeping them available in development and test environments.

## [0.1.1] - 2026-07-31

### Added
- Added an idempotent `npm run demo:seed` workflow that creates two verified demo administrators, separate hospital and retail organizations, and seven purpose-built multi-floor maps with realistic room geometry, distinct corridor topologies, searchable destinations, accessible routing, and linked stairs, elevators, and escalators. Demo credentials and floor coverage are documented under `docs/demo/`.
- Added a public viewer About page at `/about` and simplified the public feature names to `viewer` and `organization`.
- Added a separate public organization experience at `/organization`, with its About content at `/organization/about`, final page metadata, and focused coverage for organization navigation, footer links, and calls to action. Public routes are now grouped into `(viewers)` and `(organization)` segments without changing the existing viewer URLs. The viewer header no longer exposes authentication, and its footer contains one organization entry point.
- Added a responsive Popular Maps strip to the public viewer. It uses real grouped venue data, shows each building once, and routes multi-floor venues through the existing floor chooser.
- Added a dedicated searchable public venue directory at `/venues`. The viewer home keeps a four-venue preview, reuses the venue-card design for Recently Added, and opens every building's floors in a bounded dialog so long floor lists never resize the page.
- Added `nextjs-toploader` to show themed route progress for links and client-side navigation.
- Added a light/dark theme toggle (`next-themes`), with a `ModeToggle` control in the public site header, map viewer header, and editor toolbar. Introduced proper semantic `:root`/`.dark` color tokens (editor surfaces, 404 page, info/success/warning) instead of the app being force-locked to a hardcoded `dark` class.
- Added single-floor pathfinding: the public map viewer can now compute and render a shortest-path route between a "Start here" origin (or a default entrance) and a searched destination, with an accessible-only routing toggle. New `src/features/navigation/` feature slice (Dijkstra over the existing `MapNode`/`PathEdge` graph); see `docs/technical/NAVIGATION.md`.
- Added multi-floor route following in the viewer: the active floor is now client state (instant switching, no page reload), and a "Continue via stairs/elevator to Floor N" indicator appears mid-route, advancing the floor and reframing the camera on that floor's portion of the route.
- Redesigned the "Get directions" search into From/To fields that search every floor in the building (not just the active one), each result tagged with its floor name, plus a clickable floor breadcrumb showing the full route path for multi-floor routes.
- Added a "Floor Links" tool to the map editor for pairing a stairs/elevator/escalator node with its counterpart on another floor, creating the cross-floor `PathEdge`s the pathfinder needs. New `src/features/map-editor/floor-links/` feature slice, no schema change required; see `docs/technical/FLOOR_LINKS_EDITOR.md`. The panel groups link targets by floor and shows existing links for the selected node inline to avoid duplicates.
- Added "Escalator" as a third connector type alongside stairs and elevator: new `MapObjects`/`MapNodes`/`PathEdges` select option, its own color/icon in both the editor and public map viewer, and support throughout pathfinding and floor-linking.
- Moved the Floor Links tool from a static left-sidebar panel into the right-hand Inspector, appearing contextually when a stairs/elevator/escalator node **or its object** is selected (previously only the node worked) — and it no longer asks you to re-pick the connector type, since the selected node's role already determines it.
- Added a "double press" gesture on stairs/elevator/escalator connectors — both the small map marker and its larger object shape — that jumps straight to the linked floor, with a short "Tap again for {floor}" hint shown after the first press. Previously the only way to follow a connector was via an active multi-floor route's floor-hop indicator; the marker itself wasn't clickable at all, and the object shape (a much easier target than the ~10px marker) wasn't wired up either.
- Added a `Building > Floor` breadcrumb to the site header, replacing the flat floor badge; the floor segment is a dropdown that switches floors directly from the header.
- Added a route breadcrumb to the map canvas's own toolbar: when the active route crosses floors, it replaces the plain floor-name label with a clickable `Floor A > Floor B` trail (each non-active segment jumps to it), giving the same floor-hopping access the sidebar's route stepper has without needing to open it.

### Changed
- Merged the map editor's "Select & Move" and object-placement modes into one: picking an item in the "Add to Map" panel no longer switches into a separate mode that blocks dragging. You can now move/resize/rotate existing objects and double-click to place new ones without switching anything, and this is the default mode. Toolbar label updated to "Select & Place" to match.
- Node labels on the map editor canvas are now hidden by default and only appear on hover or while the node is selected, instead of every node's label being permanently rendered (with dozens of nodes on a floor, that was mostly visual noise). The label field itself is unchanged — still set and stored the same way, just not drawn on the canvas at all times.
- New objects placed from the toolbox are now numbered per type instead of all sharing one generic name — e.g. `Room 1`, `Room 2`, `Door 1` — instead of every placed object being named `New Room`/`New Door` until manually renamed. Computed entirely from objects already loaded in the editor's local state (a simple count), so it adds no server round trip or database query.
- Reworked the map editor's left panel: the "Add to Map" object list is now grouped into collapsible categories (Structure, Connectors, Wayfinding & Amenities, Retail & Storage) via an accordion, and the Reference/Automation tools below it collapse by default instead of always taking up scroll space. Panel copy was also reworded to be less jargon-heavy (e.g. "Objects" → "Add to Map").
- Removed the toolbar's "Object" mode toggle — it was ~95% identical to "Select & Move" (both let you drag/rotate/resize existing objects) and was never actually needed manually, since picking an item from the "Add to Map" panel already switches into placement mode automatically. Also fixed the overlap itself: "Select & Move" now exclusively handles moving/inspecting what's already on the map, while placement mode (still reachable via the toolbox) no longer lets you drag existing objects or nodes, so nothing gets bumped by accident while you're placing something new. Toolbar buttons now show a hover tooltip explaining what each mode actually does.
- Consolidated the app's Zustand stores — the wayfinding origin/destination/route state and the auth signup flow, previously each their own standalone `create()` store — into the same single slice-composed store already used by the map editor (`useAppStore`), instead of three separate stores.

### Fixed
- Fixed the public homepage and map viewer header showing a reformatted placeholder like "Building 1" instead of the venue's real Organization name. `buildingId` is a synthetic `"building-" + Organization.id` string with no real "building" collection behind it; both now resolve and display the actual `Organization.name`, falling back to the old formatted placeholder only when it can't be resolved (e.g. no organization assigned).
- Fixed dragging an object in the map editor also panning the whole canvas underneath it. The canvas's click-and-drag panning (added for the editor) listens on `pointerdown`, while object dragging used the older `onMouseDown`; `pointerdown` and `mousedown` are separate native events, so stopping propagation on the object's mouse handler never stopped the pointerdown that fires first and starts a pan. Objects (and non-draggable nodes) now stop the pointerdown too.
- Fixed double-click/double-tap object placement silently doing nothing on trackpad input. The pan handler was capturing the pointer on every press, not just real drags; a captured pointer causes the browser to retarget the compatibility click/dblclick events it synthesizes from touch/trackpad taps to the capturing element instead of whatever was actually under the tap. Capture is now deferred until the drag threshold is actually crossed.
- Fixed a public map viewer bug where searching "Get directions" for a room with no navigation node yet would silently do nothing when clicked — no error, no feedback, the field just stayed empty. Such rooms no longer appear as search results at all, since picking one could never have worked.
- Fixed the map viewer's zoom (scroll/pinch) also triggering the browser's own page zoom at the same time. React attaches wheel listeners as passive by default, which was silently blocking `preventDefault()`; the zoom handler is now a real non-passive native listener, so only the map zooms.
- Fixed truncated room names in the "Get directions" From/To suggestion dropdown — the floor name was squeezed onto the same line as the room name, cutting long names short. Floor name now sits on its own line below.
- Fixed objects on the public map being effectively unclickable on trackpads: pressing a room also reached the map's own pan-drag handler (nothing stopped that pointerdown from bubbling up from the object to the SVG), so any tiny amount of pointer movement between press and release — near-unavoidable on a trackpad — crossed the drag threshold and silently suppressed the click as "that was a pan, not a click."
- Fixed the public map viewer at `/map/[floorId]` listing every published floor across every building/organization on a single floor's page, instead of only the floors belonging to that floor's own building. The floors query had no `buildingId` scoping at all.
- Fixed a hydration mismatch on the theme toggle button: its `aria-label`/`title` depended on the resolved theme, which differs between the server render (no theme context yet) and the client's first paint before `next-themes` settles, causing a React hydration warning. The label is now a neutral "Toggle theme" until mounted, then flips to the theme-specific text.
- Fixed a cross-floor route sometimes revisiting the same floor twice, non-consecutively (e.g. "Ground → 1st → Ground → 2nd"). Stairs/elevator/escalator edges had small flat distances regardless of the floor's actual size, so the shortest-path search could legitimately treat bouncing through another floor and back as "cheaper" than a longer same-floor walk. Crossing a floor now carries an added distance penalty representing real-world effort, so the search only leaves a floor when it's actually worth it.
- Fixed the map viewer's active floor and the active route segment drifting out of sync. Switching floors via the header dropdown or double-clicking a canvas connector updated only the displayed floor, not which route segment was "active" — so an already-found route would stop being drawn, and the header, in-canvas breadcrumb, and route panel could each disagree about the current floor. All floor-changing entry points (header, sidebar, canvas connector jump, route panel row, floor-hop button) now read and write the same state.

### Changed (public map viewer)
- Node labels on the public map are now hidden by default and shown on hover, same reasoning and fix as the editor canvas.
- Floor and Places are now collapsible accordion sections in the sidebar (closed by default), matching the pattern used for the map editor's left panel, instead of two lists that were always fully expanded.
- The floor-crossing route breadcrumb was redesigned from a row of small pills into a numbered vertical stepper, with an icon showing how you get from one floor to the next (stairs/elevator/escalator) and a clear "You're here" marker on the active step.
- Clicking an object directly on the map now shows an inline "Start here" / "Route here" bar over the canvas itself, so setting an origin or destination no longer requires scrolling to the sidebar's Selection card.
- The map editor canvas now supports click-and-drag panning, replacing scroll-to-pan (native browser scrollbars) — the canvas area no longer scrolls at all; empty-canvas drags pan the floor plan instead, and existing object/node dragging is unaffected since it already claims the pointer event first.
- Fixed both the editor and the public viewer so the page itself no longer scrolls at the desktop breakpoint — only the sidebar (and, in the editor, the object toolbox / inspector) scrolls internally, while the map area stays fixed in place. The viewer previously had no cap on total page height, so on a tall enough sidebar the whole page — map included — would scroll. Mobile/tablet keep the existing stacked, page-scrolling layout, since a phone screen doesn't have room for both a fixed map and an independently scrolling sidebar.
- The public map viewer's header now shows the Wayfinder brand mark (icon + wordmark, linking home), reusing the same `WayfinderBrand` component the marketing site's header already uses, instead of no branding at all next to the building/floor name.
- The route line on the map now has a "marching ants" flow animation toward the destination and an arrowhead at the destination end, instead of a static dashed line, so the direction of travel is obvious at a glance.
- Clicking an object on the map (or in the Places list) now sets it as the route origin automatically when no starting point has been chosen yet, instead of requiring an explicit "Start here" tap for the common first click. Once an origin exists, further clicks just select/inspect as before — you can still change it explicitly.
- Reworked the map viewer's two-column layout breakpoint from `lg` (1024px) to `md` (768px), so tablet-width screens now get the side-by-side sidebar+map layout instead of an oversized single-column stack. Bumped the search input and header's floor-switcher to full touch-target size on mobile, matching the size the toolbar's zoom/grid buttons already use.

## 2026-06-11

### Added
- Added `docs/QA.md`: testing strategy document covering testing goals, planned types of testing (Vitest unit/integration, Cypress E2E), and Pull Request quality rules with the `main`/`prev`/`dev` branching strategy.
- Added `.github/workflows/test.yml`: CI workflow that runs `npm test` on every push and Pull Request (tests to be implemented with Vitest).
- Added CI workflow screenshot under `docs/images/`.
- Created unit-testing backlog issues [#28](https://github.com/SED800/indoor_map/issues/28), [#29](https://github.com/SED800/indoor_map/issues/29), [#30](https://github.com/SED800/indoor_map/issues/30) under Milestone 4.1.

### Changed
- Enabled the `push` trigger in `.github/workflows/lint.yml` so linting runs on pushes as well as Pull Requests.

### Fixed
- Fixed all ESLint errors and warnings in the map editor: replaced `any` types with proper Payload/editor types in server actions and inspector components, and removed unused variables in store slices, `canvas.ts`, and view components.

## 2026-05-21

### Changed
- Updated the README file with the initial project information and setup details. [#1](https://github.com/SED800/Customer/pull/5)
