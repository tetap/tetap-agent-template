# @tetap/ui

`@tetap/ui` 是共享 shadcn/ui 组件库和设计系统 runtime CSS。`apps/web` 和 `apps/web-admin` 只消费这里的组件，不创建本地 UI 系统。

## Architecture Links

- [packages/ui Architecture](../../docs/Logical%20Architecture%20Diagram/packages-ui.md)
- [UI Rules](../../README.md#ui-rules)

## Public Entrypoints

| Export                     | Purpose                          |
| -------------------------- | -------------------------------- |
| `@tetap/ui`                | Main component barrel.           |
| `@tetap/ui/brand-logo`     | TETAP SVG brand logo component.  |
| `@tetap/ui/styles.css`     | Tailwind + shadcn theme runtime. |
| `@tetap/ui/button`         | Button direct export.            |
| `@tetap/ui/card`           | Card direct export.              |
| `@tetap/ui/badge`          | Badge direct export.             |
| `@tetap/ui/separator`      | Separator direct export.         |
| `@tetap/ui/tabs`           | Tabs direct export.              |
| `@tetap/ui/sidebar`        | Sidebar shell primitives.        |
| `@tetap/ui/field`          | Form field layout primitives.    |
| `@tetap/ui/dialog`         | Dialog primitives.               |
| `@tetap/ui/dropdown-menu`  | Dropdown menu primitives.        |
| `@tetap/ui/password-input` | Shared password input.           |

## Rules

- Add shared UI primitives here, not in apps。
- Use shadcn/ui MCP, shadcn CLI, or shadcn skill before hand-writing primitives。
- Do not put feature copy or page-specific styling in this package。
- UI behavior changes require Browser Mode test consideration。

## Scripts

```sh
pnpm --filter @tetap/ui type-check
pnpm --filter @tetap/ui lint
pnpm --filter @tetap/ui build
pnpm test:browser:target -- ui-components
pnpm test:browser:target -- web-admin-dashboard
```
