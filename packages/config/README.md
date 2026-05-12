# @tetap/config

`@tetap/config` 是统一配置包，负责 env 目录、env parser、typed runtime config、Node/Vite helper 和共享 Tailwind config。

## Architecture Links

- [packages/config Architecture](../../docs/Logical%20Architecture%20Diagram/packages-config.md)
- [Config Rules](../../README.md#config-rules)

## Public Entrypoints

| Export                             | Purpose                                          |
| ---------------------------------- | ------------------------------------------------ |
| `@tetap/config`                    | env paths, `readAppEnv`, `AppEnv` types.         |
| `@tetap/config/node`               | Node env loading, typed getter, env-dir helpers. |
| `@tetap/config/vite`               | Vite `envDir` helper.                            |
| `@tetap/config/tailwind.config.ts` | Shared Tailwind config.                          |
| `@tetap/config/env`                | Unified env directory.                           |

## Public Helpers

| Helper / Type          | Purpose                                                                  |
| ---------------------- | ------------------------------------------------------------------------ |
| `loadConfigEnv`        | Load `.env`, mode-specific env, and optional `.env.local` for Node apps. |
| `getAppEnv`            | Read typed runtime config from `process.env` after loading env files.    |
| `readAppEnv`           | Parse and validate typed runtime env values from any source object.      |
| `configEnvDir`         | Shared Vite `envDir` value for browser apps.                             |
| `configBaseEnvFile`    | Absolute path to the base `packages/config/env/.env`.                    |
| `configLocalEnvFile`   | Absolute path to optional `packages/config/env/.env.local`.              |
| `getConfigEnvFile`     | Resolve mode-specific env file such as `.env.development`.               |
| `AppEnv` / `EnvSource` | Typed runtime config and input source types.                             |

## Current Env Shape

`AppEnv` currently includes service ports, database, optional Redis, CORS origins, body/rate limits, app secrets, auth token TTLs, AES keys, and skipped route patterns:

`NODE_ENV`, `HOST`, `PORT`, `BACKEND_ADMIN_HOST`, `BACKEND_ADMIN_PORT`, `DATABASE_URL`, `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_KEY_PREFIX`, `CORS_ORIGINS`, `BODY_LIMIT_BYTES`, `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW`, `APP_ID`, `APP_SECRET`, `AUTH_SECRET`, `REFRESH_AUTH_SECRET`, `AUTH_SALT`, `AUTH_ACCESS_TOKEN_TTL_SECONDS`, `AUTH_REFRESH_TOKEN_TTL_SECONDS`, `AES_SECRET_KEY`, `AES_IV`, and `SKIP_ROUTES`.

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
