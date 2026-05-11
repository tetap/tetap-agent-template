# Smoke Test Design

## Purpose

Smoke tests verify that the built software can boot and exercise the most important runtime path before a build is considered successful.

## Current Smoke Coverage

| Smoke Test                                     | Scope                                                                                                          | Pass Criteria                                                                                                                                                                       |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/smoke/backend-health.smoke.test.ts`       | Boots the public Fastify app with test env and calls `GET /health` through Fastify inject.                     | Returns HTTP 200, `content-language`, unified `{ code, message, data }` body, success error code, localized message, and schema-valid health data.                                  |
| `src/smoke/backend-admin-health.smoke.test.ts` | Boots the admin Fastify app with test env and calls `GET /health` through Fastify inject.                      | Returns HTTP 200, `content-language`, unified `{ code, message, data }` body, success error code, localized admin health message, and schema-valid health data.                     |
| `src/smoke/backend-admin-iam.smoke.test.ts`    | Boots the admin Fastify app and exercises IAM auth, CRUD, protected delete, operation logs, frontend sessions. | Login succeeds, current-user and overview contracts validate, IAM mutations work, protected role deletion is rejected, operation logs are returned, forced offline returns `40101`. |

## Build Gate

The root build runs `turbo build`, and the `@tetap/test-automation` build script runs `pnpm test:smoke`. A production build is valid only when smoke tests pass. During development, use `pnpm test:smoke:target -- backend-health` or `pnpm test:affected` for scoped smoke validation before the final gate.

## Extension Rules

- Add or update smoke tests when a feature changes app startup, routing, middleware, auth, database connectivity, or critical user/API flows.
- Keep smoke tests small and representative; they should prove that the runtime boots and a critical path works.
- Validate smoke response bodies with `@tetap/schema`.
- Keep test copy assertions aligned with `@tetap/i18n` resources.
