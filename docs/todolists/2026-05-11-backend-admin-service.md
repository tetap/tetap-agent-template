# Backend Admin Service Todolist

Status: Closed
Created: 2026-05-11
Task: Copy the existing backend app into a dedicated backend-admin service for all admin management APIs.

## Execution Plan

- [x] Create this execution plan before editing code.
- [x] Inspect current backend, schema, config, and docs.
- [x] Create `apps/backend-admin` from `apps/backend` with admin-specific naming.
- [x] Ensure backend-admin keeps route/service/schema/i18n rules.
- [x] Update workspace docs and architecture references.
- [x] Run formatting and relevant validation.
- [x] Close this todolist with validation results.

## Closure Notes

Closed: 2026-05-11

Validation passed:

- `pnpm install`
- `pnpm format:fix`
- `pnpm lint:fix`
- `pnpm backend:architecture:check`
- `pnpm --filter @tetap/config build`
- `pnpm --filter @tetap/i18n build`
- `pnpm --filter @tetap/schema build`
- `pnpm --filter backend-admin type-check`
- `pnpm --filter backend-admin build`
- `pnpm test:smoke:target -- backend-admin-health`
- `pnpm test:unit`
- `pnpm test:smoke`
- `pnpm check`
- `pnpm lint`
- `pnpm format`
