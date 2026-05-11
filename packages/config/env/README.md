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
