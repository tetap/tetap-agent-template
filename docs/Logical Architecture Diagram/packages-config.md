# packages/config Architecture

## 定位

`@tetap/config` 是全仓库唯一的配置入口，负责 env 文件目录、env parser、typed runtime config、Node/Vite helper 和共享 Tailwind config。

## 公开入口

| Export                             | Purpose                                               |
| ---------------------------------- | ----------------------------------------------------- |
| `@tetap/config`                    | env 路径、`readAppEnv`、`AppEnv` 类型。               |
| `@tetap/config/node`               | `loadConfigEnv`、`getAppEnv` 等 Node runtime helper。 |
| `@tetap/config/vite`               | Vite apps 使用的 `configEnvDir`。                     |
| `@tetap/config/tailwind.config.ts` | 共享 Tailwind 基础配置。                              |
| `@tetap/config/env`                | 统一 env 模板和 env 文件目录。                        |

## 关键 helper

| Helper                                                          | Purpose                                              |
| --------------------------------------------------------------- | ---------------------------------------------------- |
| `loadConfigEnv`                                                 | 加载 base、mode-specific 和可选 local env 文件。     |
| `getAppEnv` / `readAppEnv`                                      | 从 `process.env` 或指定 source 解析 typed `AppEnv`。 |
| `configEnvDir`                                                  | 浏览器 apps 共享的 Vite `envDir`。                   |
| `configBaseEnvFile` / `configLocalEnvFile` / `getConfigEnvFile` | env 文件路径解析 helper。                            |

## 内部结构

| Path           | Responsibility                                |
| -------------- | --------------------------------------------- |
| `src/env.ts`   | env schema/default/parser 和 typed `AppEnv`。 |
| `src/node.ts`  | Node.js env loading 和 typed getter。         |
| `src/vite.ts`  | Vite env dir helper。                         |
| `src/paths.ts` | workspace/config 路径 helper。                |
| `env/*`        | env 模板和本地 env 文件位置。                 |

## 使用规则

- Vite app 使用 `configEnvDir`，不要自行决定 envDir。
- Node service 先调用 `loadConfigEnv`，再读取 typed env。
- 不要在 `apps/*` 或其他 `packages/*` 新增本地 `.env`。
- 新增 env key 时同步更新 parser、类型、默认值、README 和 env 模板。

## 影响测试

- 修改 `packages/config/**` 后运行 `pnpm test:unit:target -- config-env` 或 `pnpm test:affected`。
- 修改影响 runtime startup 的 env key 时补充 smoke 测试。
