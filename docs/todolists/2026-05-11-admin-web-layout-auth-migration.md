# Admin Web Layout Auth Migration Todolist

Status: Closed
Created: 2026-05-11
Task: Extend `apps/web-admin` from a simple dashboard into a minimal shadcn-admin adapted shell with layout, auth pages, and zustand-backed admin session state.

## Execution Plan

- [x] Create this execution plan before editing code.
- [x] Inspect shadcn-admin layout, auth, and zustand patterns.
- [x] Add required shadcn/ui primitives to `packages/ui`.
- [x] Add centralized zustand admin session store in `@tetap/hooks`.
- [x] Add admin auth schemas in `@tetap/schema`.
- [x] Implement web-admin layout, navigation, profile, and auth pages.
- [x] Update i18n copy, docs, and browser tests.
- [x] Run formatting and relevant validation.
- [x] Close this todolist with validation results.

## Closure Notes

Closed: 2026-05-11

Validation passed:

- `pnpm check`
- `pnpm test:browser`
- `pnpm test:smoke`
- `pnpm lint`
- `pnpm format`
- Targeted during implementation: `pnpm test:unit:target -- schema-response`, `pnpm test:browser:target -- web-admin-dashboard`, `pnpm test:browser:target -- ui-components`, `pnpm --filter web-admin build`

Notes:

- `web-admin` now has shadcn-admin adapted layout/auth/profile/search/sidebar patterns.
- Shared UI primitives, admin auth schema, and centralized zustand admin session store are wired through workspace packages.
- Vite build reports a chunk-size warning for the admin bundle; build succeeds.
