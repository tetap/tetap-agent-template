# @tetap/prisma

`@tetap/prisma` 是 Prisma schema 和数据库脚本包，集中管理 schema 拆分规则、client generation、schema validation 和 DB 操作。

## Architecture Links

- [packages/prisma Architecture](../../docs/Logical%20Architecture%20Diagram/packages-prisma.md)
- [Database Rules](../../README.md#database-规则)

## Rules

- `schema/schema.prisma` contains datasource/generator only。
- One Prisma model per dedicated `.prisma` file。
- Do not introduce alternate ORMs or app-local SQL schema files。
- DB commands must be called through root scripts。

## Scripts

```sh
pnpm db:schema:check
pnpm db:generate
pnpm db:validate
pnpm db:push
pnpm db:studio
pnpm --filter @tetap/prisma type-check
pnpm --filter @tetap/prisma lint
```
