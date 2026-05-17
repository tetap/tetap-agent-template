# packages/ui Architecture

## 定位

`@tetap/ui` 是共享 shadcn/ui 组件库、设计系统 runtime stylesheet 和品牌 SVG 资产入口。`apps/web` 和 `apps/web-admin` 只消费它，不在 app 内生成本地 UI 系统。

## 公开入口

| Export                     | Purpose                                               |
| -------------------------- | ----------------------------------------------------- |
| `@tetap/ui`                | 主组件 barrel。                                       |
| `@tetap/ui/brand-logo`     | TETAP SVG brand logo component。                      |
| `@tetap/ui/styles.css`     | Tailwind + shadcn theme runtime CSS。                 |
| `@tetap/ui/alert`          | Alert direct export。                                 |
| `@tetap/ui/avatar`         | Avatar direct export。                                |
| `@tetap/ui/badge`          | Badge direct export。                                 |
| `@tetap/ui/button`         | Button direct export。                                |
| `@tetap/ui/card`           | Card direct export。                                  |
| `@tetap/ui/checkbox`       | Checkbox direct export。                              |
| `@tetap/ui/collapsible`    | Collapsible direct export。                           |
| `@tetap/ui/command`        | Command palette direct export。                       |
| `@tetap/ui/dialog`         | Dialog direct export。                                |
| `@tetap/ui/dropdown-menu`  | Dropdown menu direct export。                         |
| `@tetap/ui/field`          | Field/form layout direct export。                     |
| `@tetap/ui/input`          | Input direct export。                                 |
| `@tetap/ui/input-group`    | Input group primitives for embedded addons。          |
| `@tetap/ui/label`          | Label direct export。                                 |
| `@tetap/ui/password-input` | Password input direct export。                        |
| `@tetap/ui/scroll-area`    | Scroll area direct export。                           |
| `@tetap/ui/select`         | Select direct export for enum-only controls。         |
| `@tetap/ui/separator`      | Separator direct export。                             |
| `@tetap/ui/sheet`          | Sheet/drawer direct export。                          |
| `@tetap/ui/sidebar`        | Sidebar direct export for admin shell composition。   |
| `@tetap/ui/skeleton`       | Skeleton direct export。                              |
| `@tetap/ui/sonner`         | Sonner `Toaster` and `toast` feedback direct export。 |
| `@tetap/ui/table`          | Table direct export。                                 |
| `@tetap/ui/tabs`           | Tabs direct export。                                  |
| `@tetap/ui/tooltip`        | Tooltip direct export。                               |

## 内部结构

| Path                     | Responsibility                                                           |
| ------------------------ | ------------------------------------------------------------------------ |
| `components.json`        | shadcn/ui package 配置。                                                 |
| `src/assets/*`           | Shared static brand assets such as the TETAP SVG logo。                  |
| `src/components/brand/*` | Shared brand presentation components。                                   |
| `src/components/ui/*`    | shadcn/ui source components, including sidebar/auth-support primitives。 |
| `src/lib/utils.ts`       | `cn` utility。                                                           |
| `src/styles.css`         | Tailwind import、theme tokens、base layer。                              |
| `tailwind.config.ts`     | shared UI Tailwind config。                                              |

## UI 获取流程

1. 优先通过 shadcn/ui MCP、shadcn CLI 或 shadcn skill 获取组件。
2. 组件放在 `packages/ui/src/components/ui`。
3. 更新 `src/index.ts` 或 direct export。
4. app 通过 `@tetap/ui` import。
5. UI interaction 变化时更新 Browser Mode 测试。

## 规则

- 不在 `apps/web` 或 `apps/web-admin` 创建 `components/ui`。
- 不写 feature-level CSS 或 bespoke component styles。
- 页面不创建本地 UI 系统；优先用现有 shadcn/ui 组件和 variants。
- 保存、错误等短反馈使用 `toast`；固定枚举使用 `Select`；搜索/过滤输入优先用 `InputGroup` 内嵌图标，显式提交时搭配独立 `Button`。
- `InputGroup` addon 可以将 pointer focus 交给组内 input；字段错误使用 `FieldError` 的 `role="alert"` 输出。
- React 19-ready primitives should prefer regular `ref` props and `React.memo` over generated `forwardRef` wrappers as components are migrated.
- 大型表单使用 `DialogContent` 的 viewport 内滚动能力，避免弹窗超出 body。
- 允许保留 shadcn/ui 生成的组件内部 class 和 design system runtime CSS。
- 新组件要检查 accessibility、exports、peer dependency 和 docs。

## 影响测试

- UI component behavior 变化运行 `pnpm test:browser:target -- ui-components`、`pnpm test:browser:target -- web-admin-dashboard` 或 `pnpm test:affected`。
- 新增 UI target 时更新 `test/automation/src/support/test-selection.ts`。
