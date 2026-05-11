# @tetap/config

`@tetap/config` 是统一配置包，负责 env 目录、env parser、typed runtime config、Node/Vite helper 和共享 Tailwind config。

## Architecture Links

- [packages/config Architecture](../../docs/Logical%20Architecture%20Diagram/packages-config.md)
- [Config Rules](../../README.md#config-rules)

## Public Entrypoints

| Export                             | Purpose                                  |
| ---------------------------------- | ---------------------------------------- |
| `@tetap/config`                    | env paths, `readAppEnv`, `AppEnv` types. |
| `@tetap/config/node`               | Node env loading and typed getter.       |
| `@tetap/config/vite`               | Vite env dir helper.                     |
| `@tetap/config/tailwind.config.ts` | Shared Tailwind config.                  |
| `@tetap/config/env`                | Unified env directory.                   |

## Rules

- All env files live under `packages/config/env`。
- Apps and packages must not create local `.env` files。
- New env keys require parser, type, template, docs, and tests updates。

## Scripts

```sh
pnpm --filter @tetap/config type-check
pnpm --filter @tetap/config lint
pnpm --filter @tetap/config build
pnpm test:unit:target -- config-env
```
