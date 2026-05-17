# Web Admin Unused Settings Cleanup Todolist

Status: Closed
Created: 2026-05-17
Closed: 2026-05-17
Task: Remove unused `web-admin` settings/profile/config/top-nav surfaces that are not connected to current routes or dynamic menus, and align documentation with the real admin page set.

## Execution Plan

- [x] Inspect current routes, lazy pages, sidebar menus, settings files, docs, i18n keys, and React Doctor dead-code findings.
- [x] Delete unused settings/profile/config/top-nav source files and stale settings-only locale keys.
- [x] Update web-admin README, architecture docs, package metadata, and test docs to match the current routed admin surface.
- [x] Run targeted web-admin/i18n validation, React Doctor diff, affected/browser tests, and final gates.
- [x] Close this todolist with validation commands and results.

## Closure Notes

Removed unused, unrouted `web-admin` settings/profile/config/top-nav surfaces:

- `apps/web-admin/src/pages/settings.tsx`
- `apps/web-admin/src/layout/config-drawer.tsx`
- `apps/web-admin/src/layout/profile-dropdown.tsx`
- `apps/web-admin/src/layout/top-nav.tsx`

Removed settings-only locale keys that were used only by those files while keeping active theme-switch labels under `webAdmin.settings.theme.*`. Updated `apps/web-admin/package.json`, `apps/web-admin/README.md`, `docs/Logical Architecture Diagram/apps-web-admin.md`, and `test/automation/README.md` so they describe the current routed admin surface instead of the removed settings/profile surfaces.

Validation passed:

- `pnpm --filter web-admin type-check`.
- `pnpm --filter web-admin lint`.
- `pnpm --filter @tetap/i18n type-check`.
- `pnpm --filter @tetap/i18n lint`.
- `npx -y react-doctor@latest . --verbose --diff` reported `100/100` for changed files and no issues.
- `pnpm test:browser:target -- web-admin-dashboard` passed, 21 tests.
- `pnpm test:affected` passed: 3 i18n unit tests, 24 browser tests, and 2 smoke tests.
- `pnpm --filter web-admin build`.
- `pnpm lint:fix`.
- `pnpm format:fix`.
- `pnpm check` passed, including 26 unit tests.
- `pnpm test:browser` passed, 24 browser tests.
- `pnpm test:smoke` passed, 3 smoke tests.
- `pnpm --filter @tetap/test-automation build` passed, 3 smoke tests.
- `pnpm lint`.
- `pnpm format`.
- `git diff --check`.

Full React Doctor snapshot after cleanup: repository score `92/100` with 93 remaining issues across 47 files. The four `web-admin` unused-file findings removed in this batch are gone; remaining `knip/files` findings are shared `@tetap/ui` shadcn primitives that remain available as library source.
