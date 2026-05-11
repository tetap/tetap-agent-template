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

| Path                  | Responsibility                                                                                      |
| --------------------- | --------------------------------------------------------------------------------------------------- |
| `src/main.tsx`        | React mount, providers, shared UI stylesheet import.                                                |
| `src/App.tsx`         | Admin protected router, auth routes, and app-level composition.                                     |
| `src/layout`          | shadcn-admin adapted shell, sidebar, header, search, and profile composition.                       |
| `src/pages/auth`      | Sign-in, sign-up, forgot-password, and OTP pages backed by `@tetap/schema` + zustand session state. |
| `src/pages/iam.tsx`   | IAM management overview wired to backend-admin auth/IAM APIs.                                       |
| `src/pages/dashboard` | Admin dashboard page composition with shared packages.                                              |
| `vite.config.ts`      | Vite plugin setup and `@tetap/config/vite` env dir.                                                 |
| `tsconfig*.json`      | Admin web TypeScript configs without deprecated `baseUrl`.                                          |

## Reference Adaptation

This app references [satnaing/shadcn-admin](https://github.com/satnaing/shadcn-admin) for authenticated layout, sidebar navigation, team/profile dropdowns, command search, auth pages, KPI cards, tabs, and security/activity panels. It does not copy that repo's app-local UI system; all primitives come from `@tetap/ui`, session state comes from `@tetap/hooks`, and form contracts come from `@tetap/schema`.

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
