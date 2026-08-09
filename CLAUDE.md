# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Commit workflow

Whenever the user asks to commit changes:

1. Stage and commit the requested code changes.
2. Keep commits atomic — each commit should contain only one related set of changes. Even if the user's request is as simple as "commit," check whether the pending changes span multiple unrelated pieces of work; if so, split them into separate commits instead of combining everything into one.
3. Do not add a `Co-Authored-By` trailer (or any other AI-attribution trailer) to commit messages.
4. Add notable user-facing changes to the `[Unreleased]` section of `docs/CHANGE_LOG.md`.
5. Do not bump the version in `package.json` for normal commits.
6. Only bump the version when the user explicitly asks to create or prepare a release.
7. During a release:

   * Use the semantic version bump requested by the user.
   * If no bump type is provided, default to patch.
   * Move the relevant entries from `[Unreleased]` into a new release section.
   * Keep the changelog version, release date, Git tag, and `package.json` version synchronized.
   * Commit the release changes together.

## Commit message format

Use this format for commit messages:

```
<type>(optional-scope): <short description>

[optional body]

[optional footer]
```

## Documentation maintenance

Documentation is part of the implementation and must be updated in the same
change as the code it describes:

- When a Payload collection is added, removed, renamed, or changed, update
  `docs/project/SCHEMA.md`. This includes fields, relationships, required or
  optional status, enum values, access-relevant structure, and registered
  collections. Remove stale schema entries as well as adding new ones.
- When a feature, module, architecture-significant component, port, adapter,
  action, service, store slice, external integration, or communication path is
  added, removed, renamed, or changes responsibility, update the relevant
  Mermaid diagrams and explanations in
  `docs/technical/APPLICATION_ARCHITECTURE.md`.
- When behavior, workflows, persistence, map loading, navigation, editor
  extensions, APIs, configuration, or developer conventions change, update the
  relevant files under `docs/`, including the README or changelog when
  applicable. Do not leave documentation describing behavior that no longer
  exists.
- Keep diagrams at the correct level of abstraction: add a UI component to an
  architecture diagram when it introduces or changes a meaningful module
  boundary or communication path, not for a purely presentational leaf
  refactor.
- Validate edited Markdown and Mermaid syntax, and ensure names and dependency
  directions match the current code before considering the task complete.

## Project structure & code splitting

Full convention: `docs/project/PROJECT_STRUCTURE.md`. Follow it for every change,
not just new features:

- Keep `src/app` routes thin: set metadata, call one feature data loader, render one
  feature component. No business logic or direct Payload calls in `src/app`.
- Put feature code under `src/features/<name>/` using the standard sub-folders
  (`constants/`, `validations/`, `types/`, `services/{server,client}`,
  `actions/{server,client}`, `store/`, `lib/`, `hooks/`, `components/`, optionally
  `pages/`). Don't invent new top-level folders or names for these concepts.
- **`actions/server/` (`'use server'`) is for client-triggered mutations only —
  never reads.** Never named `server-actions/` or bare `actions/`.
- **A read needed only inside a Server Component calls `services/server/*`
  directly — no action wrapper**, since no client/server boundary is crossed (e.g.
  `getDashboardData`, `getFloorEditorData`).
- **A read triggered from a client component goes through `actions/client/*` →
  `services/client/*`**, which calls the shared Payload REST SDK client
  (`src/lib/payload-sdk.ts`) — never the Local API, never a server action. Only
  create this pair when a feature actually has a client-triggered read (most don't).
- **No component ever imports the Payload SDK, `getPayload`, or a service directly**
  — always through an `actions/` file.
- Adding `services/client/` code against a collection requires that collection to
  have correct `access` rules first — REST requests (what the SDK uses) enforce
  real access control, unlike the Local API's `overrideAccess: true`. A collection
  with no `access` block defaults to open to everyone, every operation.
- `types/` is always a folder, never a flat `types.ts` at the feature root.
- Split an `actions/`, `services/`, or `lib/` file by sub-domain as soon as it
  stops being a single responsibility, independent of line count — see
  `src/features/map-editor/core/actions/server/` (split into `floor-actions.ts`,
  `object-actions.ts`, `node-actions.ts`, `edge-actions.ts`) as the reference example.
- Root-level `src/lib`, `src/store`, `src/constants`, `src/validations` are for
  code genuinely shared across features only. Feature-specific code belongs inside
  that feature's folder, not at the root.
- **Every adapter function wraps its body in `tryCatchResponse`** (`src/lib/responses/trycatch-response.ts`)
  and every `actions/server/*` mutation returns `errorResponse`/`successResponse`
  (`src/lib/responses/app-response.ts`) — the `TResponse<T>` envelope is the one
  shape a component ever needs to branch on (`if (!result?.isSuccess) ...`). A
  `ports.ts` file that just forwards an adapter's already-enveloped result doesn't
  need to re-wrap it. The only sanctioned exceptions are reads with no failure UI
  to show (`getDashboardData`, `getMapViewerData`, `getTopbarUser` — documented in
  `docs/technical/APPLICATION_ARCHITECTURE.md`'s "Current implementation notes")
  and actions with nothing to report (`logoutAction` just redirects). Don't add a
  new exception without documenting it there too.

## Payload typing

- Always derive collection documents, relationship values, operation data, and
  IDs from Payload's generated types or exported utility types. Do not recreate
  Payload collection shapes by hand when an authoritative Payload type exists.
- In particular, never hardcode an ID as `number` or `string`. Use the generated
  collection `id` type or Payload's `DefaultDocumentIDType`, and keep IDs returned
  by the Local API unchanged. Payload and the active database adapter own ID
  generation, validation, and relationship compatibility.
- Seed and migration scripts must build relationships from IDs returned by
  Payload operations. Do not infer, synthesize, parse, or coerce adapter-specific
  IDs inside a seed script.
- **Pass `select` on every `payload.find`/`findByID` call, trimmed to the fields
  the caller actually reads** — don't let a full document come back just because
  `select` was left off. An existence/count-only check (only `.totalDocs` or
  `.docs[i].id` is read) passes `select: {}, depth: 0`, same as
  `accessibleBuildingIds` in `src/collections/access/index.ts`. A read used to
  populate an edit form (e.g. `getFloorForEditAdapter`) is the one legitimate case
  for fetching the full document — most fields really do get used.

## Comments

- Default to no comments — well-named identifiers should carry the meaning.
- Add one only when the WHY is non-obvious: a hidden constraint, a subtle invariant, a workaround for a specific bug, or behavior that would surprise a reader.
- A comment directly above a function/export is a single-line `/** ... */` doc string, not a multi-line `//` block.
- Never explain WHAT the code does, reference the current task/fix/PR, or write multi-paragraph explanations.

## UI implementation

- Prefer clear, reusable components instead of writing one large file. Keep each component focused, easy to understand, and maintainable.
- Prefer the project's installed shadcn components and existing shared components instead of building equivalent UI primitives from scratch.
- Before creating a UI component, check the shadcn registry for an available equivalent. If it exists but is not installed in the project, install and use it.
- Use theme tokens only — never a hardcoded color (hex/rgb/oklch literal, or an arbitrary Tailwind value) in component code. Every color a component needs must resolve to a CSS variable/semantic class defined in `src/app/(frontend)/global.css` (`--background`, `--editor-*`, `--map-viewer-*`, etc.).
- If no existing token fits, add a new one to `global.css` (light and dark, plus `.map-viewer-theme` if it's a map-viewer color) and use that — don't hardcode a one-off value as a workaround.
- Keep Tailwind usage minimal: add only the classes required to achieve the requested layout, state, and responsive behavior.
- Reuse existing variants, utilities, and component APIs before introducing custom styling or duplicated abstractions.

## Testing

- Add or update unit tests whenever practical for new features, behavior changes, and bug fixes — a fix with no regression test is easy to silently break again later.
- Match the existing patterns: pure logic (`lib/`, `hooks/`) gets plain Vitest tests next to the sibling `lib`/`hooks` test folders; components get React Testing Library tests under that feature's `__tests__/unit/components/` using `render`/`fireEvent`/`screen` (see `src/features/map-viewer/__tests__/unit/components/MapViewerSvg.test.tsx` for a pointer-event drag-vs-click example, including the jsdom pointer-capture polyfill it needs).
- Before considering a change complete, run `npx tsc --noEmit`, `npx eslint src`, and `npx vitest run`.
