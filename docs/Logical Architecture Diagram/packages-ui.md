# packages/ui Architecture

## 定位

`@tetap/ui` 是共享 shadcn/ui 组件库和设计系统 runtime stylesheet。`apps/web` 和 `apps/web-admin` 只消费它，不在 app 内生成本地 UI 系统。

## 公开入口

| Export                     | Purpose                                             |
| -------------------------- | --------------------------------------------------- |
| `@tetap/ui`                | 主组件 barrel。                                     |
| `@tetap/ui/styles.css`     | Tailwind + shadcn theme runtime CSS。               |
| `@tetap/ui/button`         | Button direct export。                              |
| `@tetap/ui/card`           | Card direct export。                                |
| `@tetap/ui/badge`          | Badge direct export。                               |
| `@tetap/ui/separator`      | Separator direct export。                           |
| `@tetap/ui/tabs`           | Tabs direct export。                                |
| `@tetap/ui/sidebar`        | Sidebar direct export for admin shell composition。 |
| `@tetap/ui/dropdown-menu`  | Dropdown menu direct export。                       |
| `@tetap/ui/dialog`         | Dialog direct export。                              |
| `@tetap/ui/field`          | Field/form layout direct export。                   |
| `@tetap/ui/password-input` | Password input direct export。                      |

## 内部结构

| Path                  | Responsibility                                                           |
| --------------------- | ------------------------------------------------------------------------ |
| `components.json`     | shadcn/ui package 配置。                                                 |
| `src/components/ui/*` | shadcn/ui source components, including sidebar/auth-support primitives。 |
| `src/lib/utils.ts`    | `cn` utility。                                                           |
| `src/styles.css`      | Tailwind import、theme tokens、base layer。                              |
| `tailwind.config.ts`  | shared UI Tailwind config。                                              |

## UI 获取流程

1. 优先通过 shadcn/ui MCP、shadcn CLI 或 shadcn skill 获取组件。
2. 组件放在 `packages/ui/src/components/ui`。
3. 更新 `src/index.ts` 或 direct export。
4. app 通过 `@tetap/ui` import。
5. UI interaction 变化时更新 Browser Mode 测试。

## 规则

- 不在 `apps/web` 或 `apps/web-admin` 创建 `components/ui`。
- 不写 feature-level CSS 或 bespoke component styles。
- 页面不硬编码 utility class；优先用现有 shadcn/ui 组件和 variants。
- 允许保留 shadcn/ui 生成的组件内部 class 和 design system runtime CSS。
- 新组件要检查 accessibility、exports、peer dependency 和 docs。

## 影响测试

- UI component behavior 变化运行 `pnpm test:browser:target -- ui-components`、`pnpm test:browser:target -- web-admin-dashboard` 或 `pnpm test:affected`。
- 新增 UI target 时更新 `test/automation/src/support/test-selection.ts`。
