# @tetap/schema

`@tetap/schema` 是 Zod 契约包，集中管理前后端 request、response、entity 和 form schema。

## Architecture Links

- [packages/schema Architecture](../../docs/Logical%20Architecture%20Diagram/packages-schema.md)
- [Schema Rules](../../README.md#schema-rules)

## Public Entrypoints

| Export                     | Purpose                                                                             |
| -------------------------- | ----------------------------------------------------------------------------------- |
| `@tetap/schema`            | Common schema helpers and root exports.                                             |
| `@tetap/schema/backend`    | Backend response schemas.                                                           |
| `@tetap/schema/iam`        | IAM auth, CRUD, role, permission, menu, policy, session, and operation-log schemas. |
| `@tetap/schema/form`       | Form helper exports.                                                                |
| `@tetap/schema/user`       | User entity/mutation schemas.                                                       |
| `@tetap/schema/admin-auth` | Admin sign-in, OTP, and session-user schemas.                                       |

## Common Helpers

| Export                                                                                                                               | Purpose                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| `z`                                                                                                                                  | Zod v3 re-export for consistent schema authorship.        |
| `createApiResponseSchema` / `createApiSuccessSchema` / `createApiFailureSchema`                                                      | Unified `{ code, message, data }` API response factories. |
| `apiCodeSchema`, `apiMessageSchema`, `apiErrorSchema`, `emptyObjectSchema`, `idSchema`, `isoDatetimeSchema`, `paginationInputSchema` | Shared primitive response/input contracts.                |
| `parseFormValues` / `safeParseFormValues`                                                                                            | Form parsing helpers for frontend form integration.       |

## Rules

- Define contracts here before frontend/backend feature code uses them。
- Backend services parse request and validate response with these schemas。
- Frontend forms validate before submit。
- Do not duplicate ad-hoc Zod schemas in apps。

## Current IAM Contracts

| Schema / Type                    | Purpose                                                                                                |
| -------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `iamLoginRequestSchema`          | Admin login payload with device and remember-me defaults.                                              |
| `iamBootstrapDataSchema`         | Current admin user, roles, capabilities, menus, data and field policy context.                         |
| `iamOverviewDataSchema`          | Lightweight admin dashboard metrics only; resource lists and logs use their own paged/list APIs.       |
| `iamCreate*RequestSchema`        | Strict mutation contracts for users, roles, permissions, menus, field permissions, and policies.       |
| `iamUpdate*RequestSchema`        | Strict partial update contracts for users, roles, permissions, menus, field permissions, and policies. |
| `iam*MutationResponseSchema`     | Mutation response schemas for users, roles, permissions, menus, field permissions, and policies.       |
| `iamSessionSchema`               | Frontend online-session rows visible to admin users.                                                   |
| `iamSessionRevokeResponseSchema` | Forced-offline response containing revoked frontend sessions.                                          |
| `operationLogSchema`             | Operation logs with operator, item, detail, time, IP, resource, and result.                            |
| `iamOperationLogsDataSchema`     | Paged operation-log list with search, sort, total, and total-pages metadata.                           |
| `permissionTypeSchema`           | `MENU`, `API`, `BUTTON`, `FIELD`, `DATA` enum.                                                         |
| `fieldPermissionTypeSchema`      | `HIDE`, `MASK`, `READONLY`, `READWRITE` enum.                                                          |
| `dataScopeTypeSchema`            | `ALL`, `DEPT`, `DEPT_AND_CHILD`, `SELF`, `CUSTOM` enum.                                                |
| `*IdParamsSchema`                | Route params for user, role, permission, menu, field-permission, policy, and session ids.              |

## Scripts

```sh
pnpm --filter @tetap/schema type-check
pnpm --filter @tetap/schema lint
pnpm --filter @tetap/schema build
pnpm test:unit:target -- schema-response
```
