# Environment Configuration

All frontend and backend packages must load environment variables from this package.

- Shared defaults live in `.env`.
- Mode-specific values live in `.env.development`, `.env.test`, and production examples.
- Required template secrets live in `.env`; `.env.local` is only an optional local override and is not required by default.
- Vite apps should set `envDir` from `@tetap/config/vite`.
- Node services should call `loadConfigEnv` from `@tetap/config/node` before reading env values.

## Service Ports

- `HOST` / `PORT` configure the public backend service.
- `BACKEND_ADMIN_HOST` / `BACKEND_ADMIN_PORT` configure the dedicated admin backend service.

## Security And Runtime Keys

- `CORS_ORIGINS`, `BODY_LIMIT_BYTES`, `RATE_LIMIT_MAX`, and `RATE_LIMIT_WINDOW` drive Fastify security defaults.
- `AUTH_SECRET`, `REFRESH_AUTH_SECRET`, `AUTH_SALT`, `AUTH_ACCESS_TOKEN_TTL_SECONDS`, and `AUTH_REFRESH_TOKEN_TTL_SECONDS` drive IAM JWT/session behavior.
- `APP_ID`, `APP_SECRET`, `AES_SECRET_KEY`, and `AES_IV` are required application secrets and must be replaced outside local templates.
- `SKIP_ROUTES` is a comma-separated list for explicitly skipped route patterns.

IAM data is not controlled by an env toggle. Backend runtimes read real persisted data through `@tetap/prisma`; initial admin users must be created by an explicit bootstrap/setup process.
