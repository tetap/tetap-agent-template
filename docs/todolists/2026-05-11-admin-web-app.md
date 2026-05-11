# Admin Web App Todolist

Status: Closed
Created: 2026-05-11
Task: Create a dedicated admin web app adapted to the current monorepo architecture, referencing https://github.com/satnaing/shadcn-admin.

## Execution Plan

- [x] Create this execution plan before editing code.
- [x] Inspect current web/ui/config/schema/i18n architecture.
- [x] Review shadcn-admin reference structure and patterns.
- [x] Create `apps/web-admin` with monorepo-compliant Vite React setup.
- [x] Reuse `packages/ui`, `@tetap/i18n`, and `@tetap/config` without app-local UI/CSS duplication.
- [x] Add admin routes, layout, localized dashboard copy, and README/architecture docs.
- [x] Add targeted smoke/browser coverage or mappings where needed.
- [x] Run formatting and relevant validation.
- [x] Close this todolist with validation results.

## Closure Notes

Closed: 2026-05-11

Validation passed:

- `pnpm install`
- `pnpm format:fix`
- `pnpm lint:fix`
- `pnpm --filter @tetap/ui type-check`
- `pnpm --filter @tetap/ui build`
- `pnpm --filter @tetap/i18n build`
- `pnpm --filter web-admin type-check`
- `pnpm --filter web-admin build`
- `pnpm --filter @tetap/test-automation type-check`
- `pnpm test:unit:target -- src/unit/test-selection.unit.test.ts`
- `pnpm test:browser:target -- web-admin-dashboard`
- `pnpm test:browser`
- `pnpm test:smoke`
- `pnpm check`
- `pnpm lint`
- `pnpm format`
