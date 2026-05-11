# Shadcn Admin UI Alignment Todolist

Status: Closed
Created: 2026-05-11
Task: Align `apps/web-admin` UI structure and visual behavior with `satnaing/shadcn-admin` while preserving repository boundaries, scoped i18n, and shared `@tetap/ui` usage.

## Execution Plan

- [x] Create this execution plan before editing code.
- [x] Inspect current `apps/web-admin` shell, sidebar, dashboard, IAM, and placeholder pages.
- [x] Clone and inspect `satnaing/shadcn-admin` reference layout and dashboard implementation.
- [x] Confirm installed shadcn/ui components and docs for sidebar, dropdown-menu, tabs, card, command, avatar, tooltip, separator, and badge.
- [x] Refactor admin shell to match shadcn-admin's `SidebarInset` + page-level `Header`/`Main` pattern.
- [x] Update sidebar team switcher, nav group, nav user, search, and header styling to match the reference behavior.
- [x] Rebuild dashboard and placeholder pages using shadcn-admin layout density and tabs/card grids.
- [x] Wrap IAM page in the aligned Header/Main layout without changing IAM data/API behavior.
- [x] Run targeted validation and close this todolist.

## Validation

```sh
pnpm format:fix
pnpm --filter @tetap/ui type-check
pnpm --filter web-admin type-check
pnpm i18n:boundaries:check
pnpm test:browser:target -- web-admin-dashboard
pnpm format
```

## Closure Notes

Aligned the admin shell and pages with `satnaing/shadcn-admin` structure: the shell owns sidebar context, pages own their header/main layout, dashboard uses dense tabs/card grids, IAM keeps existing API behavior, and Browser Mode tests render authenticated pages through the production shell context.

Validation completed:

```sh
pnpm --filter web-admin type-check
pnpm --filter @tetap/ui type-check
pnpm i18n:boundaries:check
pnpm test:browser:target -- web-admin-dashboard
pnpm lint:fix
pnpm format:fix
pnpm check
pnpm test:browser:target -- web-admin-dashboard
```
