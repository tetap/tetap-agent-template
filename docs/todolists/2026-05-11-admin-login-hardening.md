# Admin Login Hardening Todolist

Status: Closed
Created: 2026-05-11
Task: Remove public self-service and social-login affordances from the admin authentication surface.

## Execution Plan

- [x] Remove sign-up, forgot-password, social provider, and legal agreement links from the admin sign-in page.
- [x] Close public admin sign-up and forgot-password routes so accounts are only created by admins through user management.
- [x] Update scoped admin i18n copy and Browser Mode coverage.
- [x] Run focused validation and close this todolist.

## Closure Notes

Completed admin login hardening. Sign-in now only offers admin email/password authentication; `/sign-up` and `/forgot-password` redirect to `/sign-in`.

Validation:

- `pnpm --filter web-admin type-check`
- `pnpm --filter @tetap/i18n type-check`
- `pnpm --filter @tetap/test-automation type-check`
- `pnpm test:browser:target -- web-admin-dashboard`
- `pnpm lint:fix`
- `pnpm format:fix`
- `pnpm check`
