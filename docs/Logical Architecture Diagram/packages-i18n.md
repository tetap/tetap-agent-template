# packages/i18n Architecture

## 定位

`@tetap/i18n` 是站点、前端和后端共享多语言包，负责 locale resources、翻译核心、scoped React provider、site translator 和 Node request locale helper。任何用户可见文案都必须从这里输出，并且 apps 只能导入自己允许的 scope。

## 公开入口

| Export                      | Purpose                                           |
| --------------------------- | ------------------------------------------------- |
| `@tetap/i18n`               | `createAppI18n`、resources、types、core helpers。 |
| `@tetap/i18n/react`         | `I18nProvider`、React context types。             |
| `@tetap/i18n/public`        | public web safe messages and provider。           |
| `@tetap/i18n/admin`         | admin web safe messages and provider。            |
| `@tetap/i18n/site`          | VitePress site safe messages。                    |
| `@tetap/i18n/backend`       | public backend response messages。                |
| `@tetap/i18n/backend-admin` | backend-admin response messages。                 |
| `@tetap/i18n/node`          | Accept-Language parsing、request locale helper。  |
| `@tetap/i18n/locales`       | locale constants、message key types。             |

## 关键 helper

| Helper                                                        | Purpose                                                 |
| ------------------------------------------------------------- | ------------------------------------------------------- |
| `createI18n` / `createAppI18n`                                | Core translator factory and full-app legacy translator. |
| `createPublicI18n` / `PublicI18nProvider`                     | Public web scoped translator and React provider.        |
| `createAdminI18n` / `AdminI18nProvider`                       | Admin web scoped translator and React provider.         |
| `createSiteI18n`                                              | VitePress site scoped translator.                       |
| `createBackendI18n` / `createBackendAdminI18n`                | Backend response translators scoped by service.         |
| `parseAcceptLanguage` / `resolveLocale` / `createRequestI18n` | Node request locale resolving helpers.                  |

## 内部结构

| Path                   | Responsibility                                 |
| ---------------------- | ---------------------------------------------- |
| `src/core.ts`          | translate、interpolate、locale normalization。 |
| `src/locales/zh-CN.ts` | 默认首写 locale。                              |
| `src/locales/en-US.ts` | 与 `zh-CN` 同结构的英文资源。                  |
| `src/react.ts`         | React provider/context。                       |
| `src/site.ts`          | VitePress site scoped translator。             |
| `src/node.ts`          | Node request locale resolving。                |
| `src/types.ts`         | dot-path keys、translation tree types。        |

## 文案流程

1. 先在 `zh-CN.ts` 添加完整句子 key。
2. 在其他 locale 文件保持相同 key 结构。
3. Public UI 使用 `@tetap/i18n/public` 和 `usePublicT`。
4. Admin UI 使用 `@tetap/i18n/admin` 和 `useAdminT`。
5. VitePress 宣传站使用 `@tetap/i18n/site`。
6. Backend response 使用 `@tetap/i18n/backend` 或 `@tetap/i18n/backend-admin`。
7. Backend request locale resolving 可以使用 `@tetap/i18n/node`。
8. 测试中不要发明硬编码文案；从 i18n 或 API 输出断言。

## 禁止

- 在 UI 组件、页面、service、error handler 中硬编码用户可见文案。
- 拼接翻译片段组成句子。
- 只改某一个 locale 导致 key 结构不一致。
- 导入不属于当前 workspace 的 i18n scope。

## 影响测试

- 文案影响 UI 时运行 Browser Mode 测试。
- 文案影响 API response 时运行 smoke 测试。
- 当前 affected map 将 `packages/i18n/**` 映射到 site i18n unit、browser 和 smoke。
- 修改 scope 后运行 `pnpm i18n:boundaries:check`。
