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

## UI implementation

- Prefer the project's installed shadcn components and existing shared components instead of building equivalent UI primitives from scratch.
- Before creating a UI component, check the shadcn registry for an available equivalent. If it exists but is not installed in the project, install and use it.
- Use theme tokens only — never a hardcoded color (hex/rgb/oklch literal, or an arbitrary Tailwind value) in component code. Every color a component needs must resolve to a CSS variable/semantic class defined in `src/app/(frontend)/global.css` (`--background`, `--editor-*`, `--map-viewer-*`, etc.).
- If no existing token fits, add a new one to `global.css` (light and dark, plus `.map-viewer-theme` if it's a map-viewer color) and use that — don't hardcode a one-off value as a workaround.
- Keep Tailwind usage minimal: add only the classes required to achieve the requested layout, state, and responsive behavior.
- Reuse existing variants, utilities, and component APIs before introducing custom styling or duplicated abstractions.
