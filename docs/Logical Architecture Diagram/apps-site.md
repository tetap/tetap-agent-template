# apps/site Architecture

## 定位

`apps/site` 是 VitePress 静态宣传站，用于承载官网首页、项目宣传页和后续文档入口。它不是公共业务 Web runtime；业务页面仍属于 `apps/web`，后台管理页面仍属于 `apps/web-admin`。

## 参考来源

- Reference site: [Anime.js homepage](https://animejs.com/)。
- Adopted patterns: dark kinetic canvas, sticky top navigation, large product headline, install-command chip, animated geometric demos, feature gallery, and dense technical CTA sections。
- Additional motion pattern: continuous scroll storytelling that changes chapter state while geometric loops keep moving in the stage。
- Rejected patterns: copied Anime.js content/assets, app-local reusable UI primitives, business CSS outside the VitePress theme boundary, and hardcoded user-facing copy。

## 职责

- 运行 VitePress dev/build/preview。
- 组合静态宣传页和文档入口页面。
- 实现用于项目宣传的连续滚动叙事页面动效。
- 在 `src/.vitepress/theme` 内维护 VitePress custom theme runtime CSS。
- 只通过 `@tetap/i18n/site` 获取宣传站用户可见文案。
- 通过 VitePress build 输出静态站点到 `apps/site/dist`。
- 通过 `.github/workflows/pages.yml` 将 `apps/site/dist` 发布到 GitHub Pages。

## 服务边界

| Workspace        | Owns                                            | Must Not Own                                                    |
| ---------------- | ----------------------------------------------- | --------------------------------------------------------------- |
| `apps/site`      | VitePress promotional/docs site runtime.        | Public business app pages, admin pages, shared UI primitives.   |
| `apps/web`       | Public React runtime and user-facing app pages. | Marketing/docs site runtime or admin pages.                     |
| `apps/web-admin` | Admin React runtime and admin pages.            | Public marketing/product pages or backend admin services.       |
| `packages/i18n`  | Site copy resources and `@tetap/i18n/site`.     | VitePress layout, page composition, or static-site theme rules. |

## 内部结构

| Path                            | Responsibility                                      |
| ------------------------------- | --------------------------------------------------- |
| `src/index.md`                  | VitePress homepage entry and component mount。      |
| `src/.vitepress/config.mts`     | Site config、localized title/description and nav。  |
| `src/.vitepress/theme/index.ts` | VitePress theme extension and global style import。 |
| `src/.vitepress/theme/*.vue`    | Vue page composition for static marketing pages。   |
| `src/.vitepress/theme/*.css`    | Site-only VitePress theme runtime CSS。             |
| `src/public/.nojekyll`          | Disable Jekyll processing on GitHub Pages。         |

## 允许

- 使用 VitePress、Vue SFC 和 VitePress custom theme 组合静态宣传页。
- 在 `src/.vitepress/theme` 中维护该站点必须的 theme CSS。
- 从 `@tetap/i18n/site` 读取宣传站文案。
- 通过 CSS keyframes 和轻量 Vue state 实现静态站点动效。
- 使用 `prefers-reduced-motion` 对持续动画降级。

## 禁止

- 创建 app-local `components/ui`、`components.json` 或跨 app 复用的 UI system。
- 创建 app-local React hooks 或把共享 hooks 放入站点。
- 硬编码用户可见文案；新增站点文案先改 `packages/i18n/src/locales/zh-CN.ts`，再同步其他 locale。
- 读取 env、定义 schema、实现 IAM/数据库/后端逻辑。
- 将公共业务页面或后台管理页面放入 `apps/site`。

## 扩展步骤

1. 新增站点文案到 `@tetap/i18n/site` scope。
2. 在 `apps/site/src` 新增 VitePress markdown entry 或 theme component。
3. 将页面样式限制在 `src/.vitepress/theme`。
4. 更新 `test/automation/src/support/test-selection.ts` 的 affected mapping。
5. 运行 `pnpm test:unit:target -- i18n-site` 和 `pnpm --filter site build`。

## 动效策略

- `TetapLanding.vue` 只读取滚动进度并切换当前章节，不拦截浏览器原生滚动。
- 连续 marquee、orbit 和 path 动效由 `styles.css` 的 CSS keyframes 驱动。
- 移动端改为普通垂直堆叠，桌面端使用 sticky stage 展示持续滚动叙事。
- 降低动态偏好开启时，持续动画会关闭，文案和章节仍保持可读。

## GitHub Pages

- GitHub repository settings must use **Pages → Build and deployment → Source: GitHub Actions**。
- The workflow builds `@tetap/i18n` first, then runs `pnpm --filter site build` and deploys `apps/site/dist` with the official Pages artifact/deploy actions。
- VitePress `base` resolves to `/<repo>/` on GitHub Actions for project pages. Use `TETAP_SITE_BASE` to override this when publishing through a custom domain。

## 常用命令

```sh
pnpm --filter site dev
pnpm --filter site type-check
pnpm --filter site lint
pnpm --filter site build
pnpm --filter site preview
pnpm test:unit:target -- i18n-site
```
