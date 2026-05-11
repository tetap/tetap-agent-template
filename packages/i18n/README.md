# @tetap/i18n

`@tetap/i18n` 是站点、前端和后端共享多语言包，负责 locale resources、translation core、React provider、site translator 和 Node request locale helper。

## Architecture Links

- [packages/i18n Architecture](../../docs/Logical%20Architecture%20Diagram/packages-i18n.md)
- [I18n Rules](../../README.md#i18n-rules)

## Public Entrypoints

| Export                      | Purpose                                   |
| --------------------------- | ----------------------------------------- |
| `@tetap/i18n`               | Legacy full translator, resources, types. |
| `@tetap/i18n/public`        | Public web translator and provider.       |
| `@tetap/i18n/admin`         | Admin web translator and provider.        |
| `@tetap/i18n/site`          | VitePress site translator.                |
| `@tetap/i18n/backend`       | Public backend response translator.       |
| `@tetap/i18n/backend-admin` | Backend-admin response translator.        |
| `@tetap/i18n/node`          | Node request locale helper.               |
| `@tetap/i18n/locales`       | Locale constants and message key types.   |

## Rules

- Add user-facing copy to `zh-CN.ts` first。
- Keep every locale file in the same key structure。
- Use interpolation; do not concatenate translated fragments。
- Backend errors and UI labels must both resolve through this package。
- Apps must import only their scoped entrypoint; run `pnpm i18n:boundaries:check` after changing imports。

## Scripts

```sh
pnpm --filter @tetap/i18n type-check
pnpm --filter @tetap/i18n lint
pnpm --filter @tetap/i18n build
```
