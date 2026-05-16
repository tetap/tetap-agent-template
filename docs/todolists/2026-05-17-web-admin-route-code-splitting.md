# Web Admin Route Code Splitting Todolist

Status: Closed
Created: 2026-05-17
Closed: 2026-05-17
Task: Reduce the `web-admin` initial production bundle by lazy-loading route pages while preserving admin route behavior and validation gates.

## Execution Plan

- [x] Inspect `apps/web-admin` routing, architecture docs, and React Doctor workflow.
- [x] Lazy-load admin route pages through `src/router` without changing permissions or route paths.
- [x] Split route lazy components, route fallback, and guards out of `App.tsx`.
- [x] Record frontend composition memory to keep large local component groups out of app entry components.
- [x] Update nearby README and architecture docs to describe route-level code splitting.
- [x] Run formatting, targeted tests, build, React Doctor, and final gates.
- [x] Close this todolist with validation commands and results.

## Closure Notes

Implementation:

- `App.tsx` now only owns app-level providers, document metadata side effects, and `RouterProvider`.
- Admin route definitions, route guards, lazy page declarations, and loading fallback are split into `apps/web-admin/src/router/*`.
- `web-admin` production entry JS is `222.78 kB` gzip `68.51 kB`; prior build emitted one `750.00 kB` JS entry and a large chunk warning.
- React Doctor root diff score: `100 / 100`; workspace-wide package warnings in `packages/ui`, `packages/hooks`, and `packages/i18n` are pre-existing and outside this route-splitting scope.

Validation completed:

- `pnpm --filter web-admin type-check` passed.
- `pnpm --filter web-admin lint` passed.
- `pnpm --filter web-admin build` passed.
- `pnpm test:browser:target -- web-admin-dashboard` passed.
- `pnpm test:affected` passed and selected `src/browser/web-admin-dashboard.browser.test.tsx`.
- `npx -y react-doctor@latest . --verbose --diff` passed with root diff score `100 / 100`.
- `pnpm lint:fix` passed.
- `pnpm format:fix` passed.
- `pnpm check` passed.
- `pnpm test:browser` passed.
- `pnpm lint` passed.
- `pnpm format` passed.
- `git diff --check` passed.
