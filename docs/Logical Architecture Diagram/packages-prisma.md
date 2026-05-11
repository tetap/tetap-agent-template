# packages/prisma Architecture

## 定位

`@tetap/prisma` 是数据库 schema 和 Prisma Client 生成入口。它集中管理 Prisma schema 拆分规则、schema validation、client generation 和 DB 操作命令。

## 内部结构

| Path                                 | Responsibility                                               |
| ------------------------------------ | ------------------------------------------------------------ |
| `schema/schema.prisma`               | datasource/generator only，不允许 model。                    |
| `schema/*.prisma`                    | 每个 Prisma model 一个独立文件。                             |
| `scripts/check-schema-structure.mjs` | 检查 schema 拆分规则。                                       |
| `index.js` / `index.d.ts`            | package entrypoint placeholder / generated client boundary。 |

## 命令

| Command                | Purpose                       |
| ---------------------- | ----------------------------- |
| `pnpm db:schema:check` | 检查 Prisma schema 文件结构。 |
| `pnpm db:generate`     | 生成 Prisma Client。          |
| `pnpm db:validate`     | 校验 Prisma schema。          |
| `pnpm db:push`         | 推送 schema 到数据库。        |
| `pnpm db:studio`       | 打开 Prisma Studio。          |

## 规则

- `schema.prisma` 只能包含 datasource/generator。
- 每个 model 独立文件，不要多个 model 放同一个 `.prisma`。
- 不引入其他 ORM 或 app-local SQL schema。
- 后端需要持久化时通过 shared Prisma boundary 消费，不绕过 `@tetap/prisma`。
- env 来源仍然使用 `packages/config/env`。
- IAM model 包括前台 user、admin user、role、permission、menu、policy、field permission、前台 session、admin session、token blacklist、department 和 operation log。

## 影响测试

- schema 结构改动后运行 `pnpm db:schema:check`、`pnpm db:validate`。
- backend runtime 受影响时补充 smoke 测试并运行 `pnpm test:smoke`。
