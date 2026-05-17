# apps/web-admin

`apps/web-admin` 是后台管理专用 React + Vite 浏览器应用。它负责后台管理页面 runtime、React Router 和页面组合；后台管理接口只面向 `apps/backend-admin`，共享 UI、hooks、i18n、schema、config 均从 workspace packages 引入。

## Architecture Links

- [Root README](../../README.md)
- [Agent Operating Guide](../../AGENTS.md)
- [apps/web-admin Architecture](../../docs/Logical%20Architecture%20Diagram/apps-web-admin.md)
- [Workspace Boundaries](../../docs/Logical%20Architecture%20Diagram/01-workspace-boundaries.md)

## Owns

- Admin React app mount。
- Admin router and page composition。
- Admin browser-only runtime integration。
- Importing `@tetap/ui/styles.css` once at entrypoint。
- Admin UI functional coverage through Vitest Browser Mode。

## Must Not Own

- App-local shadcn/ui components or `components.json`。
- App-local custom hooks。
- Hardcoded user-facing copy。
- Feature-level CSS or bespoke styling system。
- Public user-facing API integration that belongs to `apps/web` + `apps/backend`。
- Local env loading policy。

## Internal Structure

| Path                  | Responsibility                                                                                                                                     |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/main.tsx`        | React mount, providers, shared UI stylesheet import.                                                                                               |
| `src/App.tsx`         | App-level providers, document metadata side effects, and `RouterProvider` mount.                                                                   |
| `src/router`          | Admin router definitions, route guards, route fallback UI, and route-level lazy page declarations.                                                 |
| `src/layout`          | shadcn-admin adapted shell, dynamic sidebar, header, command search, theme switch, and user menu composition.                                      |
| `src/pages/auth`      | Sign-in and OTP pages backed by real backend-admin auth APIs and zustand session state.                                                            |
| `src/pages/iam.tsx`   | IAM management page orchestration wired to backend-admin users, roles, permissions, menus, sessions, policies, fields, and operation logs.         |
| `src/pages/iam/*`     | Focused IAM modules: form controls, role pickers, resource sections, confirmation actions, operation-log tables, and local type/transform helpers. |
| `src/pages/dashboard` | Control-console dashboard using lightweight backend-admin metrics plus paged operation activity.                                                   |
| `vite.config.ts`      | Vite plugin setup and `@tetap/config/vite` env dir.                                                                                                |
| `tsconfig*.json`      | Admin web TypeScript configs without deprecated `baseUrl`.                                                                                         |

## Reference Adaptation

This app references [satnaing/shadcn-admin](https://github.com/satnaing/shadcn-admin) for authenticated layout, sidebar navigation, command search, auth pages, theme controls, KPI cards, tabs, and security/activity panels. It does not copy that repo's app-local UI system; all primitives come from `@tetap/ui`, session/theme state comes from `@tetap/hooks`, and form/API contracts come from `@tetap/schema`.

## Admin Behavior

- Login uses real `backend-admin` APIs. Admin accounts are created by authorized administrators, not public registration.
- Sidebar menus come from backend IAM dynamic menus. Dashboard is the top-level home route.
- Route pages are lazy-loaded through `src/router` so the authenticated shell, IAM pages, dashboard, auth pages, and state pages ship as separate production chunks.
- The dashboard calls `/iam/overview` for metrics only; feature pages and activity panels fetch their own scoped APIs.
- IAM create flows open dialogs from action buttons; oversized dialogs and pickers are scrollable.
- Delete and force-offline actions require a confirmation dialog before writing to backend-admin.
- Field permissions and dynamic policies use table layouts with explicit headers and support create/edit dialogs backed by real APIs.
- Operation-log search uses `InputGroup` for the icon/input pair plus a separate submit `Button`; typing alone does not refresh data.
- IAM form controls include helper descriptions so each input explains what it changes.
- Enum inputs such as permission type, field permission type, policy effect, and data scope use `Select`.
- Role, permission, menu parent, and department selections use searchable paged pickers instead of raw ID inputs.
- Online users mean real frontend user sessions only. Admin login sessions and seeded demo sessions are not shown or kicked from this UI.
- Save and error feedback uses `toast` from `@tetap/ui/sonner`; backend-admin error messages are surfaced instead of being collapsed into generic failure text.

## Current Pages

| Route                   | Page                                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------------------ |
| `/sign-in`              | Admin sign-in only; no social login, registration, forgot-password, or public self-service account creation. |
| `/otp`                  | Admin OTP form shell backed by shared auth schemas.                                                          |
| `/`                     | Dashboard/control console with IAM metrics and operation activity.                                           |
| `/system/user`          | Admin-user management backed by `GET/POST/PATCH/DELETE /iam/users`.                                          |
| `/system/role`          | Role/data-scope management backed by role APIs.                                                              |
| `/system/permission`    | Permission-code management with enum `Select` for permission type.                                           |
| `/system/menu`          | Tree menu management with searchable parent picker.                                                          |
| `/system/field`         | Field hide/mask/readonly/readwrite rules.                                                                    |
| `/system/policy`        | Dynamic ABAC/PBAC policy rules.                                                                              |
| `/system/session`       | Frontend online sessions and forced-offline actions only.                                                    |
| `/system/operation-log` | Paged, searchable, timezone-formatted operation logs from backend-admin lifecycle and IAM service events.    |

## Scripts

```sh
pnpm --filter web-admin dev
pnpm --filter web-admin type-check
pnpm --filter web-admin lint
pnpm --filter web-admin build
pnpm --filter web-admin preview
```

## Validation

- Admin dashboard behavior: `pnpm test:browser:target -- web-admin-dashboard`。
- UI primitives: `pnpm test:browser:target -- ui-components`。
- Full handoff: `pnpm check`。
