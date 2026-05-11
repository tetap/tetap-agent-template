# packages/hooks Architecture

## 定位

`@tetap/hooks` 是唯一的 React custom hooks 仓库。它集中管理跨页面可复用 hooks、i18n access hook、zustand store hooks 和表单 helper。

## 公开入口

| Export               | Purpose                        |
| -------------------- | ------------------------------ |
| `@tetap/hooks`       | 主 barrel export。             |
| `@tetap/hooks/store` | hooks store 聚合入口。         |
| `@tetap/hooks/form`  | React Hook Form + Zod helper。 |

## 内部结构

| Path                             | Responsibility                                            |
| -------------------------------- | --------------------------------------------------------- |
| `src/store/use-disclosure.ts`    | disclosure/open state helper。                            |
| `src/store/use-i18n.ts`          | 读取 `@tetap/i18n/react` context。                        |
| `src/store/use-is-mounted.ts`    | mounted state helper。                                    |
| `src/store/use-is-mobile.ts`     | responsive media query helper used by shared sidebar。    |
| `src/store/use-admin-session.ts` | zustand-backed admin session store for `apps/web-admin`。 |
| `src/store/use-zod-form.ts`      | React Hook Form + Zod resolver helper。                   |
| `src/store/index.ts`             | store hooks export。                                      |
| `src/index.ts`                   | package public barrel。                                   |

## 规则

- 新增 custom hook 必须放在 `packages/hooks/src/store`。
- 不要在 apps 或其他 packages 创建 `hooks` 目录。
- 不要在 apps 中创建 `useSomething.ts(x)`。
- hooks 中的用户可见文案仍然来自 `@tetap/i18n`。
- 表单校验必须使用 `@tetap/schema`。

## 影响测试

- 新增或移动 hooks 后运行 `pnpm hooks:check`。
- UI 行为受影响时运行 `pnpm test:browser` 或 `pnpm test:affected`。
