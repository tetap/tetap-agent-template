# @tetap/hooks

`@tetap/hooks` 是唯一 custom React hooks 仓库，集中管理可复用 hooks、scoped i18n hook、admin session store 和 React Hook Form + Zod helper。

## Architecture Links

- [packages/hooks Architecture](../../docs/Logical%20Architecture%20Diagram/packages-hooks.md)
- [Hooks Rules](../../README.md#hooks-规则)

## Public Entrypoints

| Export                         | Purpose                             |
| ------------------------------ | ----------------------------------- |
| `@tetap/hooks`                 | Main barrel.                        |
| `@tetap/hooks/store`           | Store hooks barrel.                 |
| `@tetap/hooks/form`            | Zod form helper.                    |
| `useAdminSessionStore`         | zustand admin session store.        |
| `useAdminT` / `useAdminI18n`   | Admin scoped i18n hooks.            |
| `usePublicT` / `usePublicI18n` | Public scoped i18n hooks.           |
| `useIsMobile`                  | shared responsive media-query hook. |

## Rules

- New hooks must live in `packages/hooks/src/store`。
- Do not create app-local `hooks` directories。
- Run `pnpm hooks:check` after adding or moving hooks。

## Scripts

```sh
pnpm --filter @tetap/hooks type-check
pnpm --filter @tetap/hooks lint
pnpm --filter @tetap/hooks build
pnpm hooks:check
```
