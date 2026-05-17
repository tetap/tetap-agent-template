# IAM Remaining Sections Extraction Todolist

Status: Closed
Created: 2026-05-17
Closed: 2026-05-17
Task: Continue shrinking `apps/web-admin/src/pages/iam.tsx` by extracting roles, field permissions, policies, and local IAM helper logic into focused modules.

## Execution Plan

- [x] Inspect current role, field-permission, policy, and helper dependencies.
- [x] Extract shared IAM page helper types and transforms used by child modules.
- [x] Extract role management section and role dialogs into focused memoized modules.
- [x] Extract field-permission and policy sections into focused memoized modules.
- [x] Rewire `iam.tsx`, memoize page entry components, and stabilize component-local callbacks.
- [x] Sync web-admin README and architecture docs.
- [x] Run format, lint, type-check, Browser Mode, React Doctor, affected/check/smoke validation.
- [x] Close this todolist with validation commands and results.

## Closure Notes

Closed after extracting the remaining large IAM page sections into focused memoized modules, moving shared IAM page
types/helpers beside those modules, and updating web-admin documentation. `apps/web-admin/src/pages/iam.tsx` is now
1,107 lines, with roles, field permissions, and policies imported from dedicated section files.

Validation passed:

- `pnpm --filter web-admin type-check`
- `pnpm --filter web-admin lint`
- `pnpm lint:fix`
- `pnpm format:fix`
- `pnpm check`
- `pnpm test:affected`
- `pnpm test:browser`
- `pnpm test:smoke`
- `pnpm --filter @tetap/test-automation build`
- `pnpm lint`
- `pnpm format`
- `git diff --check`
- `npx -y react-doctor@latest . --verbose --diff`

React Doctor reported `100 / 100` for the current IAM diff. Package-wide hooks/i18n/ui warnings remain pre-existing
follow-ups outside this extraction.
