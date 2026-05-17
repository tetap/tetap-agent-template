# @tetap/i18n

`@tetap/i18n` 是前端和后端共享多语言包，负责 locale resources、translation core、React provider 和 Node request locale helper。

## Architecture Links

- [packages/i18n Architecture](../../docs/Logical%20Architecture%20Diagram/packages-i18n.md)
- [I18n Rules](../../README.md#i18n-rules)

## Public Entrypoints

| Export                      | Purpose                                                          |
| --------------------------- | ---------------------------------------------------------------- |
| `@tetap/i18n`               | Translation core, full app translator, resources, shared types.  |
| `@tetap/i18n/react`         | Legacy full-app React provider/context for non-scoped consumers. |
| `@tetap/i18n/public`        | Public web translator, resources, types, React provider/context. |
| `@tetap/i18n/admin`         | Admin web translator, resources, types, React provider/context.  |
| `@tetap/i18n/backend`       | Public backend response translator, resources, and key types.    |
| `@tetap/i18n/backend-admin` | Backend-admin response translator, resources, and key types.     |
| `@tetap/i18n/node`          | Node request locale resolution and request translator helpers.   |
| `@tetap/i18n/locales`       | Locale constants and full message key types.                     |

## Current Helpers

| Helper / Type                                       | Purpose                                                                  |
| --------------------------------------------------- | ------------------------------------------------------------------------ |
| `createI18n`                                        | Create a typed translator from a locale resource map.                    |
| `createAppI18n`                                     | Create the full legacy app translator from all locale resources.         |
| `createPublicI18n` / `PublicI18nProvider`           | Public web translator and React provider limited to public keys.         |
| `createAdminI18n` / `AdminI18nProvider`             | Admin web translator and React provider limited to admin keys.           |
| `createBackendI18n`                                 | Public backend translator limited to backend response keys.              |
| `createBackendAdminI18n`                            | Backend-admin translator limited to admin API response keys.             |
| `parseAcceptLanguage` / `resolveLocale`             | Parse request language headers by quality and choose a supported locale. |
| `createNodeI18n` / `createRequestI18n`              | Build request-aware Node translators.                                    |
| `normalizeLocale`, `getMessageByKey`, `interpolate` | Core locale normalization, key lookup, and interpolation utilities.      |

## Rules

- Add user-facing copy to `zh-CN.ts` first。
- Keep every locale file in the same key structure。
- Use interpolation; do not concatenate translated fragments。
- Backend errors and UI labels must both resolve through this package。
- Apps must import only their scoped entrypoint; run `pnpm i18n:boundaries:check` after changing imports。

## Scope Isolation

| Consumer             | Allowed Entry               | Notes                              |
| -------------------- | --------------------------- | ---------------------------------- |
| `apps/web`           | `@tetap/i18n/public`        | Public browser UI copy only.       |
| `apps/web-admin`     | `@tetap/i18n/admin`         | Admin browser UI copy only.        |
| `apps/backend`       | `@tetap/i18n/backend`       | Public API response messages only. |
| `apps/backend-admin` | `@tetap/i18n/backend-admin` | Admin API response messages only.  |

Do not import the root `@tetap/i18n` resource in apps. The scoped entrypoints prevent public, admin, backend, and backend-admin modules from reading each other's message keys.

## Scripts

```sh
pnpm --filter @tetap/i18n type-check
pnpm --filter @tetap/i18n lint
pnpm --filter @tetap/i18n build
```
