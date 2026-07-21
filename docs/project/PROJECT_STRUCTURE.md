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
`lib/`, `services/`, or `server-actions/`.

## Feature folder structure

Every feature lives at `src/features/<feature-name>/` and is a self-contained
vertical slice. Use these sub-folders — and only these — as needed:

| Folder | Purpose |
| --- | --- |
| `constants/` | Feature-specific constants (labels, config, defaults). |
| `validations/` | zod schemas for the feature's inputs. |
| `types/` | TypeScript types for the feature. **Always a folder** (`types/index.ts` or split into multiple files), never a flat `types.ts` at the feature root. |
| `services/` | Business logic and data access. Every feature with mutations or non-trivial reads routes them through here, split into `*.ports.ts` (the public interface), `*-pl.adapter.ts` (the Payload-specific implementation, marked `server-only`), and `*.types.ts` when the port's input/output DTOs aren't already covered by the feature's `types/`. Adapters return a `TResponse<T>` (`src/lib/responses/app-response.ts`) via `tryCatchResponse` — never throw. This makes the data layer swappable and keeps Payload details out of callers. See `src/features/auth/services/`, `src/features/dashboard/services/`, and `src/features/map-editor/core/services/` (split per entity: `floor`, `object`, `node`, `edge`). Callers that want throw/catch ergonomics instead of checking `.isSuccess` can unwrap with `assertSuccess` (`src/lib/responses/assert-success.ts`). |
| `server-actions/` | Thin `'use server'` entry points bound to forms/mutations. They validate input, call `services/` (or Payload directly for simple read/write features), handle auth checks, and call `revalidatePath`. **Never name this folder `actions/`** — `server-actions/` is the only name used across the codebase. |
| `store/` | Zustand slices — the feature's client-side state and the actions components dispatch directly (no server round-trip). This is what "client actions" means here. |
| `lib/` | Pure, stateless helper functions (formatting, math, transforms), and read-only data loaders (`getXData.ts`) called directly from Server Components/routes. |
| `hooks/` | Client-side React hooks. |
| `components/` | Feature UI. Split further into `forms/`, `sections/`, `containers/`, `fields/` when a component naturally decomposes that way (see `src/features/auth/pages/*/forms` and `sections`). |
| `pages/` | Only when a feature spans multiple routes (e.g. `auth` has 7 pages, `public-landing` has 3). Each `pages/<page-name>/` groups that page's own `forms/`/`sections/`. A single-route feature (e.g. `dashboard`, `map-editor`, `map-viewer`) skips `pages/` and just exposes one `components/<Feature>Shell.tsx`. |
| `__tests__/unit/...` | Co-located tests, mirroring the source subfolder being tested (e.g. `__tests__/unit/lib/`, `__tests__/unit/store/`). |

Not every feature needs every folder — `email` (templates, not pages/routes) and
`public-landing` (no mutations, so no ports/adapters) look different from `auth` for
good reason. What must stay consistent across all features is the **naming** of
whichever folders they do have.

## Splitting files: the rule

Split a `server-actions/`, `services/`, or `lib/` file by sub-domain as soon as it
stops being a single responsibility — regardless of line count. If a file's exports
cover more than one entity or concern (e.g. floor CRUD *and* object CRUD *and* node
CRUD), it should be split into one file per entity/concern.

Reference example: `src/features/map-editor/core/server-actions/` is split into
`floor-actions.ts`, `object-actions.ts`, `node-actions.ts`, and `edge-actions.ts` —
mirroring the feature's own Zustand store, which is already split into
`createEditorSlice`, `createObjectSlice`, `createNodeSlice`, and `createEdgeSlice`.
When a hook or component needs several of them together (see
`core/hooks/useSaveEditorChanges.ts`), it simply imports from each file — that's
normal and preferable to re-merging them into one large file.

## Things that were fixed to match this convention

These are real inconsistencies found in an audit of the codebase, not hypothetical
examples — call them out if you see them recur:

- `map-editor/core` and `map-editor/floor-links` used to have a folder named
  `actions/` holding `'use server'` files, while `auth` and `dashboard` used
  `server-actions/` for the same thing. Standardized on `server-actions/`.
- `map-editor/core/server-actions` used to be a single 485-line
  `floorEditorActions.ts` covering floor, object, node, and edge CRUD. Split by
  sub-domain as described above.
- `map-editor/core` and `map-editor/floor-links` called `getPayload(...)` directly
  from their `server-actions/` files instead of going through a `services/` layer
  like `auth` and `dashboard`. Added `services/` (ports + Payload adapters,
  `TResponse`-based) for both, split per entity to match the `server-actions/`
  split; `server-actions/` files are now thin wrappers over the ports.
- `public-landing` kept its types in a flat `types.ts` while every other feature
  used a `types/` folder. Converted to `types/index.ts` (no import changes needed —
  TypeScript resolves `.../types` to `.../types/index.ts` either way).
