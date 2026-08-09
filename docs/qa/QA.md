# Quality Assurance & Testing Strategy

**Project:** Indoor Map: Interactive Indoor Navigation & Map Editor
**Stack:** Next.js (App Router), Payload CMS, SQLite, Zustand, TypeScript

This document describes the testing and quality assurance strategy for our CAPSTONE project: an indoor navigation platform where administrators build floor maps using a visual **Map Editor** (map objects, navigation nodes, and path edges), and customers search for locations and receive walking directions inside a building.

---

## A. Testing Goals

### Why Testing Is Important for This Project

Our application is composed of several tightly coupled systems: a visual map editor, a Payload CMS backend with a relational map schema (Floors → MapObjects → MapNodes → PathEdges), an authentication system, and a customer-facing navigation/search experience. A defect in any one layer silently breaks the layers above it. For example, a single corrupted path edge can make an entire floor un-navigable for customers, even though the editor "looks" fine.

Testing is important for this project because:

- **Map data is interconnected.** Nodes, edges, and objects reference each other. Creating, updating, or deleting one entity must keep every related entity consistent (e.g., deleting a node must also remove its connected path edges). Manual clicking around the editor cannot reliably catch these relationship bugs.
- **The editor and the viewer are separate consumers of the same data.** A change that works in the editor may still produce data the customer navigation view cannot render or route on. Automated tests verify the *data contract* between them.
- **The team works in parallel on separate branches.** Authentication, the map editor, and the customer pages are developed simultaneously. Tests and CI prevent one member's merge from regressing another member's feature.
- **It prevents the app from breaking while working as a group.** With multiple people pushing code to the same repository, it is easy for one change to unknowingly break a teammate's work. Automated tests run on every push and pull request act as a safety net: a breaking change is caught by CI *before* it reaches `main`, instead of being discovered later when the app stops working for everyone.
- **Refactoring confidence.** The editor store (Zustand slices), normalization helpers, and server actions are refactored frequently. A test suite lets us refactor without fear of silent breakage.

### Risks the Team Is Attempting to Reduce

| Risk | Description | Impact |
| --- | --- | --- |
| **Map data corruption** | Orphaned path edges pointing to deleted nodes, nodes linked to deleted map objects, or floors referencing missing entities | Navigation produces wrong/no routes; editor crashes when loading a floor |
| **Authentication failures** | Users unable to log in, sessions not persisting, or unauthorized users reaching the admin Map Editor | Admin tools exposed publicly, or legitimate admins locked out |
| **Map Editor API / server action failures** | `createMapObject`, `updateMapNode`, `deletePathEdge`, etc. failing or silently saving wrong values (e.g., coordinates, floor IDs) | Hours of an admin's map-drawing work lost or saved incorrectly |
| **Incorrect calculations** | Wrong distance-between-nodes math, incorrect grid snapping, or bad coordinate transforms in the SVG canvas | Path distances mislead users; objects placed at wrong positions |
| **Regression during merges** | New branches (auth, editor, customer pages) breaking previously working features | Broken `main` branch, blocked teammates |
| **Security vulnerabilities** | Unprotected Payload REST/GraphQL endpoints, missing access control on collections, exposed secrets | Anyone could modify a building's map or read user data |
| **Frontend/backend contract drift** | Payload schema changes (e.g., renamed fields) not reflected in editor types and normalizers | Runtime errors in the editor; blank canvas for customers |

### Most Critical Failure Types

Ranked by severity for our project:

1. **Authentication and access-control failures.** The Map Editor is an administrative tool. If access control fails, any visitor could edit or delete a building's entire map. If login breaks, no admin can maintain maps at all. This is our highest-priority failure class.
2. **Map data corruption.** Corrupted relationships (e.g., an edge whose `fromNode` no longer exists) are the worst kind of bug because they are *persistent*: they remain in the database and keep breaking the app even after the buggy code is fixed.
3. **Map Editor save/load (API) failures.** A failed or partial save destroys real admin work. Save operations must either fully succeed or fail loudly, never silently drop changes.
4. **Incorrect routing and distance calculations.** Customers receiving a wrong route or wrong distance defeats the core purpose of an indoor navigation app, even though the system "works" technically.
5. **UI rendering failures.** A canvas that fails to render nodes/edges/objects makes the editor unusable, though this is recoverable (no data is lost).

These priorities drive the rest of this document: we invest the most automated-testing effort where failures are persistent or destructive (data integrity, auth, server actions), and rely on lighter-weight manual/visual verification where failures are obvious and recoverable (UI appearance).

---

## B. Planned Types of Testing

**Tooling summary:** [Vitest](https://vitest.dev/) for unit and integration testing, [Cypress](https://www.cypress.io/) for end-to-end testing, and ESLint for static analysis.

### 1. Smoke Testing (Manual Verification)

Some behavior is visual and is verified manually after every significant merge to `main`, since automated tests cannot judge whether the map "looks right."

| # | Scenario | How It Is Verified |
| --- | --- | --- |
| S1 | App starts and main pages load | Run the app, open the customer page, admin panel, and Map Editor |
| S2 | Map Editor renders a floor correctly | Open a floor, confirm grid, objects, nodes, and edges appear in correct positions |
| S3 | Drawing tools feel correct | Place an object, drag it, snap to grid, rotate it; confirm it behaves naturally |
| S4 | Visual styling and layout | Check inspector panels, toolbox, and toolbar for broken layout or unreadable text |
| S5 | Login flow works end to end | Log in as an admin, confirm redirect to admin tools and session persistence |

### 2. Unit Testing (Vitest)

Unit tests target pure logic with no network or database access. These are the fastest tests and run on every push and pull request.

**Framework:** Vitest. **Coverage goal:** minimum 70% line coverage on the targeted modules below.

| # | Module / Function | Scenario |
| --- | --- | --- |
| U1 | `lib/distance.ts` | Distance between two points is calculated correctly (including zero distance and negative coordinates) |
| U2 | `lib/canvas.ts` (`snapToGrid`) | Values snap to the nearest grid step; midpoints round consistently |
| U3 | `lib/normalizeEditorData.ts` | Payload documents are normalized into editor entities; missing optional fields get safe defaults |
| U4 | Store: `createNodeSlice` | Removing a node also removes its connected path edges and clears selection |
| U5 | Store: `createObjectSlice` | Removing an object unlinks its nodes instead of orphaning them |
| U6 | Store: `createEdgeSlice` | Adding/updating an edge marks it dirty; removing a selected edge clears the selection |
| U7 | `lib/objectDefaults.ts` | Each toolbox object type produces valid default dimensions and labels |
| U8 | Auth validation schemas (`src/features/auth/validations/`) | Input validation: empty email, invalid email format, short passwords are rejected |

### 3. Integration Testing (Vitest)

Integration tests verify that separate layers work together, primarily the Map Editor server actions talking to the Payload CMS + SQLite database (using a disposable test database).

| # | Layers Under Test | Scenario |
| --- | --- | --- |
| I1 | Server actions + Database | `createMapObject` persists a document that can be read back with identical values |
| I2 | Server actions + Database | `updateMapNode` changes only the provided fields and leaves others untouched |
| I3 | Server actions + Database | `deletePathEdge` removes the edge; deleting a node does not leave orphaned edges |
| I4 | Normalizers + Payload schema | A document created through Payload normalizes into a valid editor entity (contract test against schema drift) |
| I5 | Auth + Database | Registering/logging in a user creates a session; wrong credentials are rejected |
| I6 | Access control + API | Payload collection endpoints reject unauthenticated write requests |

### 4. End-to-End Testing (Cypress)

E2E tests run the real app in a browser and simulate complete user workflows from start to finish.

| # | Workflow | Scenario |
| --- | --- | --- |
| E1 | Admin login | Visit login page, enter valid credentials, land on admin tools; invalid credentials show an error |
| E2 | Build a map | Log in, open a floor in the Map Editor, place an object, add two nodes, connect them with a path edge, save, reload, and confirm everything persisted |
| E3 | Edit and delete | Select an existing object, change its name/position in the inspector, save; delete a node and confirm its edges disappear |
| E4 | Customer search | Visit the customer page, search for a location, and confirm the correct result and floor are shown |
| E5 | Unauthorized access | Visit the Map Editor URL while logged out and confirm redirect to login |

### 5. Performance / Load Testing

Performance testing is scoped to the areas most likely to become bottlenecks. This is a lower priority than correctness testing and is planned for later in the semester.

| # | Concern | Scenario |
| --- | --- | --- |
| P1 | Large floor rendering | Load a floor with 500+ objects/nodes/edges and confirm the editor canvas stays responsive while panning and dragging |
| P2 | Save operation size | Save a floor with a large number of dirty entities and measure total save time |
| P3 | Database query load | Measure floor-load API response time as the number of map entities grows |
| P4 | Customer search latency | Confirm search returns results quickly with a fully populated building |

### 6. Security Testing

| # | Concern | Scenario |
| --- | --- | --- |
| SE1 | Access control | All map-editing endpoints and admin pages reject unauthenticated and non-admin users |
| SE2 | Authentication weaknesses | Passwords are never stored or logged in plain text; sessions expire correctly |
| SE3 | Injection / unsafe input | Object names, labels, and search queries containing HTML/script or SQL-like input are stored and rendered safely |
| SE4 | Secret exposure | `.env` files and Payload secrets are git-ignored and never committed; no API keys appear in client-side code |
| SE5 | API surface | Payload REST/GraphQL endpoints that are not needed publicly are restricted through collection access rules |

---

## C. Pull Request Quality Rules

### Branching Strategy

The repository uses three long-lived branches:

| Branch | Purpose |
| --- | --- |
| `main` | Stable, production-ready code. Only receives merges from `prev` |
| `prev` | Staging (preview) branch where completed features are combined and verified together before release |
| `dev` | Active development branch. Feature branches are created from and merged back into `dev` |

Flow: `feature branch` → `dev` → `prev` → `main`. Each promotion happens through a Pull Request.

### Rules

1. **No direct pushes to `main`, `prev`, or `dev`.** Every change goes through a Pull Request from a feature branch.
2. **CI must pass before merging.** All automated checks (tests and ESLint) must succeed; a red pipeline blocks the merge.
3. **At least one review required.** Another team member must review and approve the PR before it is merged.
4. **PRs stay small and focused.** One feature or fix per PR, with a clear title and a short description of what changed and why.
5. **Author responsibility.** The PR author fixes failing checks and addresses review comments before requesting a re-review.
6. **Up to date with the target branch.** Merge conflicts are resolved by the author before the PR is approved.

---

## CI/CD Workflow (GitHub Actions)

Our CI pipeline lives in `/.github/workflows/` and runs automatically on every push and every Pull Request targeting `main`, `prev`, or `dev`. It consists of two workflows: `lint.yml`, which checks out the repository, installs dependencies, and runs ESLint; and `test.yml`, which runs the Vitest unit test suite (`npm test -- --run`).
