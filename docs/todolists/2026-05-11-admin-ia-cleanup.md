# Admin Information Architecture Cleanup Todolist

Status: Closed
Created: 2026-05-11
Task: Rework `apps/web-admin` into a normal backend administration console with clear menus, dedicated resource pages, and no demo-style mixed modules.

## Execution Plan

- [x] Replace demo dashboard navigation/actions with real admin overview and module shortcuts.
- [x] Split visible IAM UI into dedicated pages for users, roles, permissions, menus, field permissions, policies, sessions, and operation logs.
- [x] Rebuild backend-provided demo menu tree into normal admin groups and routes.
- [x] Use table-style admin lists for resource management where appropriate.
- [x] Update admin i18n copy and Browser Mode tests for the cleaned information architecture.
- [x] Rework role management to match the RuoYi `/system/role` workflow: query form, toolbar, selection, permission grant, data scope, and assigned users using real IAM APIs.
- [x] Run focused validation, format/lint, and close this todolist.

## Closure Notes

Completed admin information architecture cleanup and RuoYi-style role management workflow.

Validation:

- `pnpm --filter @tetap/ui type-check`
- `pnpm --filter web-admin type-check`
- `pnpm --filter @tetap/iam type-check`
- `pnpm --filter @tetap/test-automation type-check`
- `pnpm i18n:boundaries:check`
- `pnpm test:browser:target -- web-admin-dashboard`
- `pnpm lint:fix`
- `pnpm format:fix`
- `pnpm check`
- `pnpm test:smoke`
