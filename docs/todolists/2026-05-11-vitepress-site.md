# VitePress Site Todolist

Status: Closed
Created: 2026-05-11
Closed: 2026-05-11
Task: Create a VitePress promotional app inspired by the Anime.js homepage.

## Execution Plan

- [x] Inspect repository workspace rules and reference materials.
- [x] Create `apps/site` as a VitePress workspace app.
- [x] Implement the Anime.js-inspired promotional homepage.
- [x] Update workspace documentation and affected-test mapping.
- [x] Run formatting, type/build validation, and close this todolist.

## Closure Notes

Created `apps/site` as a VitePress workspace app with an Anime.js-inspired dark promotional homepage, added
`@tetap/i18n/site`, updated workspace architecture docs and affected-test mapping, and ignored VitePress generated
cache.

Validation passed:

- `pnpm --filter @tetap/i18n type-check`
- `pnpm --filter site type-check`
- `pnpm test:unit:target -- i18n-site`
- `pnpm --filter site build`
- `pnpm lint:fix`
- `pnpm format:fix`
- `pnpm check`
- `pnpm lint`
- `pnpm format`
- `pnpm test:affected`
- Playwright viewport check for `1440x1000` and `390x844` at `http://127.0.0.1:5173/`
