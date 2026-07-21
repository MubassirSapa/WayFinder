# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Commit workflow

Whenever the user asks to commit changes:

1. Stage and commit the requested code changes.
2. Keep commits atomic — each commit should contain only one related set of changes. Even if the user's request is as simple as "commit," check whether the pending changes span multiple unrelated pieces of work; if so, split them into separate commits instead of combining everything into one.
3. Add notable user-facing changes to the `[Unreleased]` section of `docs/CHANGE_LOG.md`.
4. Do not bump the version in `package.json` for normal commits.
5. Only bump the version when the user explicitly asks to create or prepare a release.
6. During a release:

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
  (`constants/`, `validations/`, `types/`, `services/`, `server-actions/`, `store/`,
  `lib/`, `hooks/`, `components/`, optionally `pages/`). Don't invent new top-level
  folders or names for these concepts.
- The `'use server'` folder is always named `server-actions/` — never `actions/`.
- `types/` is always a folder, never a flat `types.ts` at the feature root.
- Split a `server-actions/`, `services/`, or `lib/` file by sub-domain as soon as it
  stops being a single responsibility, independent of line count — see
  `src/features/map-editor/core/server-actions/` (split into `floor-actions.ts`,
  `object-actions.ts`, `node-actions.ts`, `edge-actions.ts`) as the reference example.
- Root-level `src/lib`, `src/store`, `src/constants`, `src/validations` are for
  code genuinely shared across features only. Feature-specific code belongs inside
  that feature's folder, not at the root.

## UI implementation

- Prefer the project's installed shadcn components and existing shared components instead of building equivalent UI primitives from scratch.
- Before creating a UI component, check the shadcn registry for an available equivalent. If it exists but is not installed in the project, install and use it.
- Reuse the app's theme tokens and semantic color classes. Do not hardcode colors when an appropriate theme token exists.
- Keep Tailwind usage minimal: add only the classes required to achieve the requested layout, state, and responsive behavior.
- Reuse existing variants, utilities, and component APIs before introducing custom styling or duplicated abstractions.
