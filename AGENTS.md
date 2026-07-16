# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Commit workflow

Whenever the user asks to commit changes:

1. Stage and commit the requested code changes.
2. Keep commits atomic — each commit should contain only one related set of changes. Even if the user's request is as simple as "commit," check whether the pending changes span multiple unrelated pieces of work; if so, split them into separate commits instead of combining everything into one.
3. Add notable user-facing changes to the `[Unreleased]` section of `docs/CHANGELOG.md`.
4. Do not bump the version in `package.json` for normal commits.
5. Only bump the version when the user explicitly asks to create or prepare a release.
6. During a release:

   * Use the semantic version bump requested by the user.
   * If no bump type is provided, default to patch.
   * Move the relevant entries from `[Unreleased]` into a new release section.
   * Keep the changelog version, release date, Git tag, and `package.json` version synchronized.
   * Commit the release changes together.
7. Whenever the user asks to commit, verify that `shellRevision` in `src/features/offline/service-worker/pre-cache/index.ts` (which mirrors `package.json`'s version) reflects a version bump if this commit changes build output that will be deployed. Since normal commits don't bump `package.json`'s version (rule 4), flag to the user if the pending changes look deploy-bound and no version bump is staged — see `docs/OFFLINE_CACHING.md`.

## Commit message format

Use this format for commit messages:

```
<type>(optional-scope): <short description>

[optional body]

[optional footer]
```

## Proxy documentation

Whenever `src/proxy.ts` or its authentication, routing, redirect, cookie, token, or preferred-language behavior changes, update `docs/PROXY_AUTH.md` in the same change.

## Authentication documentation

When authentication-related behavior or implementation changes, ask the user whether they want `docs/AUTHENTICATION.md` updated. Do not update that document automatically.


## UI implementation

- Prefer the project's installed shadcn components and existing shared components instead of building equivalent UI primitives from scratch.
- Before creating a UI component, check the shadcn registry for an available equivalent. If it exists but is not installed in the project, install and use it.
- Reuse the app's theme tokens and semantic color classes. Do not hardcode colors when an appropriate theme token exists.
- Keep Tailwind usage minimal: add only the classes required to achieve the requested layout, state, and responsive behavior.
- Reuse existing variants, utilities, and component APIs before introducing custom styling or duplicated abstractions.
