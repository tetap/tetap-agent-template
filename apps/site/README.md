# apps/site

`apps/site` 是 VitePress 静态宣传站。它负责官网/文档首页 runtime、VitePress custom theme 和页面组合；宣传站文案通过 `@tetap/i18n/site` 维护。
首页采用克制的技术文档型 landing 视觉，并通过连续滚动叙事动画展示 TETAP 的 workspace 边界、共享契约、质量门禁和发布链路。

## Architecture Links

- [Root README](../../README.md)
- [Agent Operating Guide](../../AGENTS.md)
- [apps/site Architecture](../../docs/Logical%20Architecture%20Diagram/apps-site.md)
- [Workspace Boundaries](../../docs/Logical%20Architecture%20Diagram/01-workspace-boundaries.md)

## Owns

- VitePress runtime and static-site build。
- Marketing/documentation homepage composition。
- Continuous scroll storytelling animation for project promotion。
- VitePress theme CSS under `src/.vitepress/theme`。
- Importing site copy from `@tetap/i18n/site`。

## Must Not Own

- App-local reusable UI primitives or `components/ui`。
- React hooks, schema definitions, IAM algorithms, database access, or env policy。
- Public app pages that belong in `apps/web`。
- Admin pages that belong in `apps/web-admin`。

## Internal Structure

| Path                            | Responsibility                              |
| ------------------------------- | ------------------------------------------- |
| `src/index.md`                  | VitePress homepage entry。                  |
| `src/.vitepress/config.mts`     | VitePress site config and localized meta。  |
| `src/.vitepress/theme/index.ts` | VitePress custom theme registration。       |
| `src/.vitepress/theme/*.vue`    | Static-site page composition components。   |
| `src/.vitepress/theme/*.css`    | VitePress theme runtime CSS for this site。 |
| `src/public/.nojekyll`          | Disable Jekyll processing on GitHub Pages。 |

## Scripts

```sh
pnpm --filter site dev
pnpm --filter site type-check
pnpm --filter site lint
pnpm --filter site build
pnpm --filter site preview
```

## GitHub Pages Deployment

The site deploys through [GitHub Actions](../../.github/workflows/pages.yml) when `master` receives changes under
`apps/site`, `packages/i18n`, or package lock/config files.

GitHub repository settings must use **Pages → Build and deployment → Source: GitHub Actions**.

For the `tetap/tetap-agent-template` project page, the VitePress `base` is resolved to `/tetap-agent-template/` in
GitHub Actions. Set `TETAP_SITE_BASE=/` in the workflow or repository variables if the site later moves to a custom
domain.

## Motion Design

- The landing page uses scroll progress to switch story chapters and update the architecture stage.
- Continuous marquee, orbit, and path animations are implemented with theme-local CSS keyframes.
- `prefers-reduced-motion` disables continuous animation while preserving readable content and page navigation.

## Validation

- Copy/i18n: `pnpm test:unit:target -- i18n-site`。
- Site build: `pnpm --filter site build`。
- Full handoff: `pnpm check`。
