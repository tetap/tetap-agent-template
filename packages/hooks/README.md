# @tetap/hooks

`@tetap/hooks` 是唯一 custom React hooks 仓库，集中管理可复用 hooks、scoped i18n hook、admin session store 和 React Hook Form + Zod helper。

## Architecture Links

- [packages/hooks Architecture](../../docs/Logical%20Architecture%20Diagram/packages-hooks.md)
- [Hooks Rules](../../README.md#hooks-rules)

## Public Entrypoints

| Export                                                     | Purpose                                                              |
| ---------------------------------------------------------- | -------------------------------------------------------------------- |
| `@tetap/hooks`                                             | Main barrel.                                                         |
| `@tetap/hooks/store`                                       | Store hooks barrel.                                                  |
| `@tetap/hooks/form`                                        | Zod form helper.                                                     |
| `useAdminSessionStore`                                     | zustand admin session store.                                         |
| `useAdminThemeStore`                                       | zustand admin theme preference store.                                |
| `useAdminThemeEffect`                                      | Applies admin light/dark/system theme to `document.documentElement`. |
| `useAdminT` / `useAdminI18n`                               | Admin scoped i18n hooks.                                             |
| `usePublicT` / `usePublicI18n`                             | Public scoped i18n hooks.                                            |
| `useIsMobile`                                              | shared responsive media-query hook.                                  |
| `useDisclosure`                                            | Open/close/toggle helper for dialogs, sheets, and popovers.          |
| `useIsMounted`                                             | Mounted-state ref for async React safety checks.                     |
| `useToast` / `toast`                                       | shadcn toast state helper consumed by shared UI toaster components.  |
| `useZodForm`                                               | React Hook Form wrapper wired to a Zod resolver.                     |
| `getUserTimeZone` / `getUserLocale` / `formatUserDateTime` | Locale-aware date/time helpers for admin activity and session UI.    |

## Rules

- New hooks must live in `packages/hooks/src/store`。
- Do not create app-local `hooks` directories。
- Run `pnpm hooks:check` after adding or moving hooks。

## Current Store Hooks

- `useAdminSessionStore` owns admin auth tokens, user context, capabilities, and dynamic menu state.
  - Store actions: `setUser`, `setAccessToken`, `setCapabilities`, `setMenus`, `setContext`, `resetAccessToken`, `reset`, `can`, and `isAuthenticated`.
- `useAdminThemeStore` owns the admin theme mode (`light`, `dark`, `system`).
  - Store action: `setTheme`, persisted in `localStorage` under `tetap-admin-theme`.
- `useAdminThemeEffect` applies the selected theme and listens to system color-scheme changes.
- `useAdminT` / `usePublicT` expose scoped translation helpers without leaking locale modules across apps.
- `useToast` and `toast` provide the shared toast state/action API while UI rendering stays in `@tetap/ui`.
- `useZodForm` accepts any compatible Zod schema and returns `UseFormReturn` with the resolver already configured.
- `getUserTimeZone`, `getUserLocale`, and `formatUserDateTime` centralize browser locale/date formatting with cached
  `Intl.DateTimeFormat` instances.

## Scripts

```sh
pnpm --filter @tetap/hooks type-check
pnpm --filter @tetap/hooks lint
pnpm --filter @tetap/hooks build
pnpm hooks:check
```
