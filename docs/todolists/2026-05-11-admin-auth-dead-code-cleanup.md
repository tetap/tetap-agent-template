# Admin Auth Dead Code Cleanup Todolist

Status: Closed
Created: 2026-05-11
Task: Remove unreachable admin self-service auth pages, contracts, and locale keys after restricting admin login to administrator-created accounts.

## Execution Plan

- [x] Delete unreachable sign-up and forgot-password page files from `apps/web-admin`.
- [x] Remove unused self-service admin auth schemas and exports from `@tetap/schema`.
- [x] Remove unused scoped admin locale keys for sign-up, forgot password, social providers, and legal login copy.
- [x] Update tests and architecture docs to reflect password login plus admin-created accounts only.
- [x] Run focused validation, format/lint, full quality gates, then close this todolist.

## Closure Notes

- Focused type checks passed:
  - `pnpm --filter @tetap/schema type-check`
  - `pnpm --filter @tetap/i18n type-check`
  - `pnpm --filter web-admin type-check`
  - `pnpm --filter @tetap/test-automation type-check`
- Focused tests passed:
  - `pnpm test:unit:target -- schema-response`
  - `pnpm test:browser:target -- web-admin-dashboard`
- Final gates passed:
  - `pnpm format:fix`
  - `pnpm lint:fix`
  - `pnpm check`
