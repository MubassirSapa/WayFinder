# Changelog

## [Unreleased]

### Added
- Added single-floor pathfinding: the public map viewer can now compute and render a shortest-path route between a "Start here" origin (or a default entrance) and a searched destination, with an accessible-only routing toggle. New `src/features/navigation/` feature slice (Dijkstra over the existing `MapNode`/`PathEdge` graph); see `docs/technical/NAVIGATION.md`.
- Added multi-floor route following in the viewer: the active floor is now client state (instant switching, no page reload), and a "Continue via stairs/elevator to Floor N" indicator appears mid-route, advancing the floor and reframing the camera on that floor's portion of the route.
- Redesigned the "Get directions" search into From/To fields that search every floor in the building (not just the active one), each result tagged with its floor name, plus a clickable floor breadcrumb showing the full route path for multi-floor routes.
- Added a "Floor Links" tool to the map editor for pairing a stairs/elevator/escalator node with its counterpart on another floor, creating the cross-floor `PathEdge`s the pathfinder needs. New `src/features/map-editor/floor-links/` feature slice, no schema change required; see `docs/technical/FLOOR_LINKS_EDITOR.md`. The panel groups link targets by floor and shows existing links for the selected node inline to avoid duplicates.
- Added "Escalator" as a third connector type alongside stairs and elevator: new `MapObjects`/`MapNodes`/`PathEdges` select option, its own color/icon in both the editor and public map viewer, and support throughout pathfinding and floor-linking.
- Moved the Floor Links tool from a static left-sidebar panel into the right-hand Inspector, appearing contextually when a stairs/elevator/escalator node **or its object** is selected (previously only the node worked) — and it no longer asks you to re-pick the connector type, since the selected node's role already determines it.

### Changed
- Node labels on the map editor canvas are now hidden by default and only appear on hover or while the node is selected, instead of every node's label being permanently rendered (with dozens of nodes on a floor, that was mostly visual noise). The label field itself is unchanged — still set and stored the same way, just not drawn on the canvas at all times.
- New objects placed from the toolbox are now numbered per type instead of all sharing one generic name — e.g. `Room 1`, `Room 2`, `Door 1` — instead of every placed object being named `New Room`/`New Door` until manually renamed. Computed entirely from objects already loaded in the editor's local state (a simple count), so it adds no server round trip or database query.
- Reworked the map editor's left panel: the "Add to Map" object list is now grouped into collapsible categories (Structure, Connectors, Wayfinding & Amenities, Retail & Storage) via an accordion, and the Reference/Automation tools below it collapse by default instead of always taking up scroll space. Panel copy was also reworded to be less jargon-heavy (e.g. "Objects" → "Add to Map").
- Removed the toolbar's "Object" mode toggle — it was ~95% identical to "Select & Move" (both let you drag/rotate/resize existing objects) and was never actually needed manually, since picking an item from the "Add to Map" panel already switches into placement mode automatically. Also fixed the overlap itself: "Select & Move" now exclusively handles moving/inspecting what's already on the map, while placement mode (still reachable via the toolbox) no longer lets you drag existing objects or nodes, so nothing gets bumped by accident while you're placing something new. Toolbar buttons now show a hover tooltip explaining what each mode actually does.

### Fixed
- Fixed a public map viewer bug where searching "Get directions" for a room with no navigation node yet would silently do nothing when clicked — no error, no feedback, the field just stayed empty. Such rooms no longer appear as search results at all, since picking one could never have worked.
- Fixed the map viewer's zoom (scroll/pinch) also triggering the browser's own page zoom at the same time. React attaches wheel listeners as passive by default, which was silently blocking `preventDefault()`; the zoom handler is now a real non-passive native listener, so only the map zooms.
- Fixed truncated room names in the "Get directions" From/To suggestion dropdown — the floor name was squeezed onto the same line as the room name, cutting long names short. Floor name now sits on its own line below.

### Changed (public map viewer)
- Node labels on the public map are now hidden by default and shown on hover, same reasoning and fix as the editor canvas.
- Floor and Places are now collapsible accordion sections in the sidebar (closed by default), matching the pattern used for the map editor's left panel, instead of two lists that were always fully expanded.
- The floor-crossing route breadcrumb was redesigned from a row of small pills into a numbered vertical stepper, with an icon showing how you get from one floor to the next (stairs/elevator/escalator) and a clear "You're here" marker on the active step.
- Clicking an object directly on the map now shows an inline "Start here" / "Route here" bar over the canvas itself, so setting an origin or destination no longer requires scrolling to the sidebar's Selection card.

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