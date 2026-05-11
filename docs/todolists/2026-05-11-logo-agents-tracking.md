# Logo And Agents Tracking Todolist

Status: Closed
Created: 2026-05-11
Closed: 2026-05-11
Task: Replace the project logo with the user-provided SVG, include `.agents` skills files in git tracking, and split multilingual README content into separate files.

## Execution Plan

- [x] Create this execution plan before editing code.
- [x] Inspect current logo assets, `.agents` files, and ignore rules.
- [x] Replace static SVG logo assets and the shared `TetapLogo` React component.
- [x] Remove `.agents/` and `skills-lock.json` from `.gitignore`.
- [x] Split README into English root plus Chinese, Korean, and Japanese files.
- [x] Update documentation links for the new README anchors.
- [x] Run formatting/type checks.
- [x] Commit and push changes to `origin/master`.

## Validation

```sh
pnpm format:fix
pnpm --filter @tetap/ui type-check
pnpm --filter web-admin type-check
pnpm i18n:boundaries:check
pnpm format
```

## Closure Notes

Replaced the project SVG logo with the user-provided black monogram mark in `docs/assets`, `packages/ui/src/assets`, and the shared `TetapLogo` React component. Removed `.agents/` and `skills-lock.json` from `.gitignore` so local agent skills can be tracked. Split README content into English root `README.md` plus `README.zh-CN.md`, `README.ko-KR.md`, and `README.ja-JP.md`; updated AGENTS and package README rule links to the correct language-specific anchors.

Validation completed:

```sh
pnpm format:fix
pnpm --filter @tetap/ui type-check
pnpm --filter web-admin type-check
pnpm i18n:boundaries:check
pnpm format
```
