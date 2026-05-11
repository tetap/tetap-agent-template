# Admin IAM Dialog Toast Cleanup Todolist

Status: Closed
Created: 2026-05-11
Closed: 2026-05-11
Task: Convert admin IAM create forms to dialog-triggered actions, replace inline save/error notices with UI toasts, remove unused IAM overview navigation, remove upgrade/billing menu items, restore normal dashboard navigation/settings/theme behavior, and replace audit logs with operation logs.

## Execution Plan

- [x] Confirm current IAM page, menu, i18n, and shared UI toast availability.
- [x] Add or expose shared UI toast support if missing.
- [x] Convert IAM create forms for users, permissions, menus, field permissions, and policies into button-triggered dialogs.
- [x] Replace IAM inline success/error blocks with toast notifications and remove the black IAM badge styling.
- [x] Remove unused IAM overview route/menu entry and remove upgrade/billing profile menu entries.
- [x] Remove the sidebar group title, restore dashboard as a top-level home menu, and remove the broken IAM overview submenu.
- [x] Port shadcn-admin-style theme switch, config drawer, and settings pages within current package boundaries.
- [x] Replace audit log naming with operation logs and ensure backend operations record operator, action, detail, time, and IP.
- [x] Split admin/frontend user session visibility so online users only includes frontend users.
- [x] Replace raw ID entry for IAM relations with Select or searchable paged pickers where the UI asks users to choose existing records.
- [x] Refresh README/AGENTS/package docs and add README sync memory for future agents.
- [x] Run focused validation, format/lint, full quality gates, then close this todolist.

## Closure Notes

- Implemented Sonner toast feedback, shared Select, dialog-based IAM create flows, searchable paged pickers, operation logs, frontend-only online sessions, settings/theme controls, and documentation refresh.
- Removed team switching, upgrade/billing profile entries, IAM overview route/menu clutter, old audit-log naming, and stale team i18n files.
- Validation passed:
  - `pnpm db:schema:check`
  - `pnpm db:validate`
  - `pnpm lint:fix`
  - `pnpm format:fix`
  - `pnpm format`
  - `pnpm check`
  - `pnpm test:smoke`
  - `pnpm test:browser:target -- web-admin-dashboard`
  - `pnpm test:unit:target -- iam-engine`
  - `pnpm test:unit:target -- schema-response`
  - `pnpm test:unit:target -- i18n-site`
- User-perspective Playwright review passed against temporary local `backend-admin` and `web-admin` servers: login, dashboard, system user/role/permission/menu pages, security field/policy/operation-log/online-user pages, settings appearance, removed social/register/forgot links, removed team/upgrade/billing/backend-menu text, create dialogs, enum select, menu parent searchable picker, operation-log columns, and console-error check.
