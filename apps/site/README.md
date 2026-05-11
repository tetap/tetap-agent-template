# apps/site

`apps/site` 是 VitePress 静态宣传站。它负责官网/文档首页 runtime、VitePress custom theme 和页面组合；宣传站文案通过 `@tetap/i18n/site` 维护。

## Architecture Links

- [Root README](../../README.md)
- [Agent Operating Guide](../../AGENTS.md)
- [apps/site Architecture](../../docs/Logical%20Architecture%20Diagram/apps-site.md)
- [Workspace Boundaries](../../docs/Logical%20Architecture%20Diagram/01-workspace-boundaries.md)

## Owns

- VitePress runtime and static-site build。
- Marketing/documentation homepage composition。
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

## Scripts

```sh
pnpm --filter site dev
pnpm --filter site type-check
pnpm --filter site lint
pnpm --filter site build
pnpm --filter site preview
```

## Validation

- Copy/i18n: `pnpm test:unit:target -- i18n-site`。
- Site build: `pnpm --filter site build`。
- Full handoff: `pnpm check`。
