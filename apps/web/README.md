# apps/web

`apps/web` 是 React + Vite 浏览器应用。它负责浏览器 runtime、React Router、页面组合和 app shell；共享 UI、hooks、i18n、schema、config 均从 workspace packages 引入。

## Architecture Links

- [Root README](../../README.md)
- [Agent Operating Guide](../../AGENTS.md)
- [apps/web Architecture](../../docs/Logical%20Architecture%20Diagram/apps-web.md)
- [Workspace Boundaries](../../docs/Logical%20Architecture%20Diagram/01-workspace-boundaries.md)

## Owns

- React app mount。
- Router and page composition。
- Browser-only runtime integration。
- Importing `@tetap/ui/styles.css` once at entrypoint。

## Must Not Own

- App-local shadcn/ui components or `components.json`。
- App-local custom hooks。
- Hardcoded user-facing copy。
- Feature-level CSS or bespoke styling system。
- Local env loading policy。

## Internal Structure

| Path                 | Responsibility                                                     |
| -------------------- | ------------------------------------------------------------------ |
| `src/main.tsx`       | React mount, providers, shared UI stylesheet import.               |
| `src/App.tsx`        | Router and app-level composition.                                  |
| `src/pages/home.tsx` | Public promotional page shell.                                     |
| `src/pages/home/*`   | Focused promotional page sections and page-local card composition. |
| `src/pages/*`        | Page composition with shared packages.                             |
| `vite.config.ts`     | Vite plugin setup and `@tetap/config/vite` env dir.                |

## Scripts

```sh
pnpm --filter web dev
pnpm --filter web type-check
pnpm --filter web lint
pnpm --filter web build
pnpm --filter web preview
```

## Validation

- Public page behavior: `pnpm test:browser:target -- web-home` or `pnpm test:browser`。
- Full handoff: `pnpm check`。
