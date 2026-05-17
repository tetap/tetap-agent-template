# Web Promo Page Simplification Todolist

Status: Closed
Created: 2026-05-17
Closed: 2026-05-17
Task: Confirm the removed `apps/site` and GitHub Pages setup stay absent, then keep `apps/web` as a simple promotional page with small memoized components.

## Execution Plan

- [x] Inspect current `apps/site`, GitHub Pages, workspace, i18n, and documentation references.
- [x] Split the `apps/web` promotional home page into focused memoized page components.
- [x] Keep all public copy in `@tetap/i18n/public` and avoid app-local UI systems.
- [x] Update nearby web/test documentation and Browser Mode coverage as needed.
- [x] Run targeted validation, React Doctor, and final quality gates.
- [x] Close this todolist with validation commands and results.

## Closure Notes

Closed after confirming `apps/site` is absent, `.github/workflows` only contains `quality-gates.yml`, and active package,
app, workflow, README, architecture, and test paths have no `apps/site`, `@tetap/i18n/site`, GitHub Pages, `pages.yml`, or
`gh-pages` references.

Validation passed:

- `pnpm --filter web type-check`
- `pnpm --filter web lint`
- `pnpm --filter @tetap/test-automation type-check`
- `pnpm --filter @tetap/test-automation lint`
- `pnpm test:browser:target -- web-home` (1 test)
- `pnpm lint:fix`
- `pnpm format:fix`
- `pnpm check` (26 unit tests)
- `npx -y react-doctor@latest . --verbose --diff` (changed root files 100/100; `@tetap/ui` 100/100; existing
  `@tetap/i18n` barrel-import warnings remain outside this task)
- `pnpm test:affected` (3 browser files, 24 tests)
- `pnpm test:browser` (3 browser files, 24 tests)
- `pnpm test:smoke` (3 smoke files, 3 tests)
- `pnpm --filter @tetap/test-automation build` (3 smoke files, 3 tests)
- `pnpm --filter web build`
- `pnpm lint`
- `pnpm format`
- `git diff --check`
