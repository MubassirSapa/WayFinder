# Changelog

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