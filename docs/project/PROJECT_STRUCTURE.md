# Project Structure & Code Splitting

This document is the source of truth for how code is organized in `indoor_map`. The
goal is a codebase that stays easy to navigate and extend as it grows: every file has
one clear job, every feature looks the same on disk, and nobody has to guess where a
new piece of code belongs.

## High-level layout

```
src/
  app/            Next.js routes only. Thin — no business logic.
  features/       One folder per feature. All feature logic lives here.
  components/     Cross-feature shared UI (ui/ = shadcn primitives, shared/ = app components).
  collections/    Payload CMS collection schemas (the data model).
  plugins/        Payload plugin configuration.
  lib/            App-wide, feature-agnostic helpers (env, Payload client, generic response types).
  store/          Root Zustand store — composes feature slices, nothing feature-specific.
  constants/      App-wide constants (brand, routes).
  validations/    Shared, reusable zod building blocks used across multiple features.
```

Rule of thumb: if code is specific to one feature, it belongs in
`src/features/<feature>/...`, not in a root-level folder. Root-level `lib`,
`store`, `constants`, and `validations` are for things genuinely shared across
features (e.g. `@/constants/routes`, `@/lib/responses`).

## Routes stay thin

A file under `src/app` should only:

1. Set `metadata`.
2. Call one data loader from the relevant feature.
3. Render one feature component (a "Shell", "Section", or page component).

No data-shaping, no business logic, no direct Payload calls in `src/app`. Example:

```ts
// src/app/(frontend)/(private)/dashboard/page.tsx
export default async function DashboardPage() {
  const data = await getDashboardData();
  return <DashboardShell data={data} />;
}
```

If a route file is doing more than that, the extra logic belongs in the feature's
`lib/`, `services/`, or `actions/`.

## Feature folder structure

Every feature lives at `src/features/<feature-name>/` and is a self-contained
vertical slice. Use these sub-folders — and only these — as needed:

| Folder | Purpose |
| --- | --- |
| `constants/` | Feature-specific constants (labels, config, defaults). |
| `validations/` | zod schemas for the feature's inputs. |
| `types/` | TypeScript types for the feature. **Always a folder** (`types/index.ts` or split into multiple files), never a flat `types.ts` at the feature root. |
| `services/server/` | Business logic and data access via the **Local API** (`getPayload()`). Ports + adapters: `*.ports.ts` (the public interface), `*-pl.adapter.ts` (the Payload-specific implementation, marked `server-only`), and `*.types.ts` when the port's DTOs aren't already covered by `types/`. Adapters return a `TResponse<T>` via `tryCatchResponse` — never throw. Used by `actions/server/`, and called **directly** (no action wrapper) by Server Components/routes that need a server-only read — e.g. `getDashboardData`, `getFloorEditorData`. See `src/features/auth/services/server/`, `dashboard/services/server/`, `map-editor/core/services/server/` (split per entity: `floor`, `object`, `node`, `edge`). |
| `services/client/` | Reads triggered from client components, via the shared Payload **REST API SDK** client (`src/lib/payload-sdk.ts`, `@payloadcms/sdk`) — never the Local API. Still wrapped in `tryCatchResponse`/`TResponse<T>`. Only exists when a feature genuinely has client-triggered reads — see `map-editor/floor-links/services/client/`. Because this goes over real HTTP, it is subject to the collection's actual `access` control (unlike the Local API's `overrideAccess: true`) — a collection must have correct `access` rules before anything reads it through here. |
| `actions/server/` | Thin `'use server'` entry points for client-triggered **mutations only** — create/update/delete, form submissions, file uploads. They call `services/server/`, handle auth checks, and call `revalidatePath`. **Never used for reads.** Never named `server-actions/` or bare `actions/` — always `actions/server/`. |
| `actions/client/` | Plain functions (no `'use server'`) for client-triggered **reads** — what hooks/components actually import. They call `services/client/`. A component must never import the Payload SDK or a service directly; it goes through here. See `map-editor/floor-links/actions/client/`. |
| `store/` | Zustand slices — the feature's client-side state and the actions components dispatch directly (no server round-trip). |
| `lib/` | Pure, stateless helper functions (formatting, math, transforms). |
| `hooks/` | Client-side React hooks. |
| `components/` | Feature UI. Split further into `forms/`, `sections/`, `containers/`, `fields/` when a component naturally decomposes that way (see `src/features/auth/pages/*/forms` and `sections`). |
| `pages/` | Only when a feature spans multiple routes (e.g. `auth` has 7 pages, `viewer` has 4). Each `pages/<page-name>/` groups that page's own `forms/`/`sections/`. A single-route feature (e.g. `dashboard`, `map-editor`, `map-viewer`) skips `pages/` and just exposes one `components/<Feature>Shell.tsx`. |
| `__tests__/unit/...` | Co-located tests, mirroring the source subfolder being tested (e.g. `__tests__/unit/lib/`, `__tests__/unit/store/`). |

**The read/write, client/server rule:**

- A **mutation** triggered by a client event (button click, form submit) always
  goes `component → actions/server/*` (`'use server'`) `→ services/server/*` (Local
  API). Never a read.
- A **read needed only at server-render time** (inside a Server Component) is
  called **directly** from `services/server/*` — no action wrapper at all, since no
  client/server boundary is being crossed. `getDashboardData`,
  `getMapViewerData`, `getPublicLandingData`, and `getFloorEditorData` all work this
  way.
- A **read triggered from a client component** (e.g. a `'use client'` hook that
  fetches on mount) goes `component → actions/client/*` (plain function)
  `→ services/client/*` → the shared `payloadSdk` (`src/lib/payload-sdk.ts`) → the
  real REST API. Never the Local API, and never a `'use server'` action.
- **No component ever imports the Payload SDK, `getPayload`, or a service
  directly.** Always through an `actions/` file (client or server).

Not every feature needs every folder. `actions/server/` + `services/server/`
(mutations) exist in `auth`, `buildings`, `invitations`,
`organization-settings`, `profile`, `user-management`, and `map-editor/core`.
Only `map-editor/floor-links` has client-triggered reads, so it's the only
feature with `actions/client/` + `services/client/` (it has no mutations of
its own, so no `server/` side at all). `dashboard`, `map-viewer`, and
`qr-codes` have `services/server/` only — reads with no mutations, so no
`actions/` folder at all. `email` and `viewer` currently deviate from the
convention: they have neither an `actions/` folder nor a `services/server/`
split, just plain functions directly under a flat `services/` — worth
aligning to `services/server/` the next time either is touched, but not
urgent on its own. What must stay consistent across all features is the
**naming** of whichever folders they do have.

## Splitting files: the rule

Split an `actions/`, `services/`, or `lib/` file by sub-domain as soon as it stops
being a single responsibility — regardless of line count. If a file's exports cover
more than one entity or concern (e.g. floor CRUD *and* object CRUD *and* node CRUD),
it should be split into one file per entity/concern.

Reference example: `src/features/map-editor/core/actions/server/` is split into
`floor-actions.ts`, `object-actions.ts`, `node-actions.ts`, and `edge-actions.ts` —
mirroring the feature's own Zustand store, which is already split into
`createEditorSlice`, `createObjectSlice`, `createNodeSlice`, and `createEdgeSlice`
(and `services/server/` is split the same way). When a hook or component needs
several of them together (see `core/hooks/useSaveEditorChanges.ts`), it simply
imports from each file — that's normal and preferable to re-merging them into one
large file.

## Collection access control (required for `services/client/`)

Payload's Local API (`overrideAccess: true`, used throughout `services/server/`)
bypasses collection `access` rules entirely — the app enforces its own checks. The
REST API (what `services/client/`'s `payloadSdk` calls, and what Payload's
catch-all route at `src/app/(payload)/api/[...slug]/route.ts` exposes to the
public internet regardless of what this app's own code does) always enforces the
collection's real `access` config. **A collection with no `access` block defaults
to open to everyone, every operation.** Before adding any `services/client/` code
against a collection, confirm it has explicit, correct `access` rules — see
`src/collections/map/Floors.ts` (published-only for anonymous, everything for
`req.user`) and `MapObjects.ts`/`MapNodes.ts`/`PathEdges.ts` (`access.isLoggedIn`)
for the pattern.

## Things that were fixed to match this convention

These are real inconsistencies/issues found in an audit of the codebase, not
hypothetical examples — call them out if you see them recur:

- `map-editor/core` and `map-editor/floor-links` used to have a folder named
  `actions/` holding `'use server'` files, while `auth` and `dashboard` used
  `server-actions/` for the same thing. Both were later unified into the
  `actions/{server,client}` + `services/{server,client}` convention described above.
- `map-editor/core/server-actions` used to be a single 485-line
  `floorEditorActions.ts` covering floor, object, node, and edge CRUD. Split by
  sub-domain as described above.
- `map-editor/core` and `map-editor/floor-links` called `getPayload(...)` directly
  from their action files instead of going through a `services/` layer like `auth`
  and `dashboard`. Added `services/server/` (ports + Payload adapters,
  `TResponse`-based) for both, split per entity to match the actions split.
- `getFloorEditorData` was wrapped as a `'use server'` action even though only the
  editor's Server Component ever called it (never a client component) — moved to
  a plain `services/server/floor.ports.ts` export, called directly from
  `editor/[floorId]/page.tsx`.
- `map-editor/floor-links`' two reads (`listLinkableNodes`, `listCrossFloorLinks`)
  were the only functions in the app actually invoked from client-side hooks while
  disguised as server actions. Converted to `actions/client/` +
  `services/client/`, backed by the Payload REST SDK instead of the Local API.
- `Floors`/`MapObjects`/`MapNodes`/`PathEdges` had **no `access` block at all**,
  meaning their REST endpoints were open to everyone (read and write) regardless of
  the app's own auth checks. Fixed as part of enabling `services/client/` safely
  (see above).
- `viewer` kept its types in a flat `types.ts` while every other feature
  used a `types/` folder. Converted to `types/index.ts` (no import changes needed —
  TypeScript resolves `.../types` to `.../types/index.ts` either way).
