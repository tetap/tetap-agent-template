# Admin Auth Real API Todolist

Status: Closed
Created: 2026-05-11
Task: Remove `web-admin` local mock authentication/menu behavior and require real `backend-admin` authentication, capabilities, and menu data for admin sessions.

## Execution Plan

- [x] Confirm current login path and demo backend-admin credentials.
- [x] Remove local mock session fallback from `apps/web-admin`.
- [x] Show a user-facing login failure state from admin i18n when the backend login fails.
- [x] Persist backend-provided capabilities and menus in admin session state.
- [x] Refresh protected admin context through `/auth/me`.
- [x] Render sidebar/search menus from backend-provided menu data instead of static local nav data.
- [x] Gate IAM UI actions by backend-provided capabilities.
- [x] Route users, roles, permissions, menus, policies, sessions, and operation-log pages to real backend-admin IAM data.
- [x] Update Browser Mode sign-in test to mock the backend-admin API response instead of relying on fallback auth.
- [x] Run focused validation and close this todolist.

## Validation

```sh
pnpm --filter web-admin type-check
pnpm --filter @tetap/hooks type-check
pnpm --filter @tetap/iam type-check
pnpm --filter @tetap/test-automation type-check
pnpm i18n:boundaries:check
pnpm test:browser:target -- web-admin-dashboard
pnpm check
```

## Closure Notes

Closed: 2026-05-11

- Removed local admin auth/menu fallback behavior and require backend-admin login/bootstrap data.
- Persisted backend capabilities and menu tree in the admin session store.
- Routed user, role, permission, menu, field policy, dynamic policy, sessions, and operation-log views to real IAM overview data.
- Replaced static admin sidebar/search navigation with backend menu rendering.
- Replaced admin placeholder routes with state pages for 401/403/404/500.
- Dashboard metrics and activity now load from backend-admin IAM overview instead of local static values.

Validation completed:

```sh
pnpm --filter web-admin type-check
pnpm --filter @tetap/hooks type-check
pnpm --filter @tetap/iam type-check
pnpm --filter @tetap/test-automation type-check
pnpm i18n:boundaries:check
pnpm test:browser:target -- web-admin-dashboard
pnpm lint:fix
pnpm format:fix
pnpm check
pnpm test:browser:target -- web-admin-dashboard
```
