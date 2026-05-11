# @tetap/schema

`@tetap/schema` 是 Zod 契约包，集中管理前后端 request、response、entity 和 form schema。

## Architecture Links

- [packages/schema Architecture](../../docs/Logical%20Architecture%20Diagram/packages-schema.md)
- [Schema Rules](../../README.md#schema-规则)

## Public Entrypoints

| Export                     | Purpose                                   |
| -------------------------- | ----------------------------------------- |
| `@tetap/schema`            | Common schema helpers and root exports.   |
| `@tetap/schema/backend`    | Backend response schemas.                 |
| `@tetap/schema/iam`        | IAM auth, policy, session, audit schemas. |
| `@tetap/schema/form`       | Form helper exports.                      |
| `@tetap/schema/user`       | User entity/mutation schemas.             |
| `@tetap/schema/admin-auth` | Admin auth/session schemas.               |

## Rules

- Define contracts here before frontend/backend feature code uses them。
- Backend services parse request and validate response with these schemas。
- Frontend forms validate before submit。
- Do not duplicate ad-hoc Zod schemas in apps。

## Scripts

```sh
pnpm --filter @tetap/schema type-check
pnpm --filter @tetap/schema lint
pnpm --filter @tetap/schema build
pnpm test:unit:target -- schema-response
```
