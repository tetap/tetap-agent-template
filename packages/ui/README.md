# @tetap/ui

`@tetap/ui` 是共享 shadcn/ui 组件库和设计系统 runtime CSS。`apps/web` 和 `apps/web-admin` 只消费这里的组件，不创建本地 UI 系统。

## Architecture Links

- [packages/ui Architecture](../../docs/Logical%20Architecture%20Diagram/packages-ui.md)
- [UI Rules](../../README.md#ui-rules)

## Public Entrypoints

| Export                     | Purpose                                        |
| -------------------------- | ---------------------------------------------- |
| `@tetap/ui`                | Main component barrel.                         |
| `@tetap/ui/brand-logo`     | TETAP SVG brand logo component.                |
| `@tetap/ui/styles.css`     | Tailwind + shadcn theme runtime.               |
| `@tetap/ui/alert`          | Alert direct export.                           |
| `@tetap/ui/avatar`         | Avatar direct export.                          |
| `@tetap/ui/badge`          | Badge direct export.                           |
| `@tetap/ui/button`         | Button direct export.                          |
| `@tetap/ui/card`           | Card direct export.                            |
| `@tetap/ui/checkbox`       | Checkbox direct export.                        |
| `@tetap/ui/collapsible`    | Collapsible direct export.                     |
| `@tetap/ui/command`        | Command palette direct export.                 |
| `@tetap/ui/dialog`         | Dialog primitives.                             |
| `@tetap/ui/dropdown-menu`  | Dropdown menu primitives.                      |
| `@tetap/ui/field`          | Form field layout primitives.                  |
| `@tetap/ui/input`          | Input direct export.                           |
| `@tetap/ui/input-group`    | Input group primitives for embedded addons.    |
| `@tetap/ui/label`          | Label direct export.                           |
| `@tetap/ui/password-input` | Shared password input.                         |
| `@tetap/ui/scroll-area`    | ScrollArea and ScrollBar direct export.        |
| `@tetap/ui/select`         | Radix Select primitives for enum-only choices. |
| `@tetap/ui/separator`      | Separator direct export.                       |
| `@tetap/ui/sheet`          | Sheet/drawer direct export.                    |
| `@tetap/ui/sidebar`        | Sidebar shell primitives.                      |
| `@tetap/ui/skeleton`       | Skeleton loading direct export.                |
| `@tetap/ui/sonner`         | Sonner `Toaster` and `toast` feedback API.     |
| `@tetap/ui/tabs`           | Tabs direct export.                            |
| `@tetap/ui/table`          | Table primitives direct export.                |
| `@tetap/ui/tooltip`        | Tooltip primitives direct export.              |

## Current Shared Primitives

The main `@tetap/ui` barrel exports brand logo, layout, overlay, feedback, form, navigation, and data-display primitives:

`Alert`, `Avatar`, `Badge`, `Button`, `Card`, `Checkbox`, `Collapsible`, `Command`, `Dialog`, `DropdownMenu`, `Field`, `Input`, `InputGroup`, `Label`, `PasswordInput`, `ScrollArea`, `Select`, `Separator`, `Sheet`, `Sidebar`, `Skeleton`, `Table`, `Tabs`, `Tooltip`, `Toaster`, and `toast`.

Use `Select` for fixed enum fields such as permission type, field permission type, policy effect, and data scope. Use `toast` from `@tetap/ui` for save/error feedback instead of page-local alert state.

Use `InputGroup` for compact search and filter controls that need embedded icons or addons; keep the actual submit action as an explicit `Button` when the search should not run on every keystroke.

`DialogContent` is constrained to the viewport and scrolls internally, so large create/edit forms should stay in dialogs instead of overflowing the document body.

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
