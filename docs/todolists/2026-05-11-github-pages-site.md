# GitHub Pages And Scroll Story Site Todolist

Status: Closed
Created: 2026-05-11
Closed: 2026-05-11
Task: Add GitHub Pages deployment and an Anime.js-inspired continuous scroll story for the existing VitePress promotional site.

## Execution Plan

- [x] Inspect current site package and deployment context.
- [x] Configure VitePress for GitHub Pages project base path.
- [x] Add GitHub Pages workflow for `apps/site`.
- [x] Add localized continuous scroll story copy.
- [x] Implement the continuous scroll animation section in the existing landing page.
- [x] Update site deployment and animation documentation.
- [x] Run validation, close this todolist, commit, and push.

## Closure Notes

Implemented the existing `apps/site` VitePress promotional page update with a continuous scroll story section, site-scoped
i18n copy, GitHub Pages workflow, Pages base-path handling, `.nojekyll`, and updated site architecture docs.

Validation passed:

- `pnpm --filter site type-check`
- `pnpm --filter site lint`
- `pnpm test:unit:target -- i18n-site`
- `pnpm --filter site build`
- `pnpm lint:fix`
- `pnpm format:fix`
- `pnpm check`
- `pnpm test:affected`
- Playwright viewport checks at 390x844, 768x900, and 1440x1000 confirmed the scroll story exists, active chapters change
  with scroll progress, the desktop sticky stage remains pinned, no horizontal overflow is present, and
  `prefers-reduced-motion` disables continuous animation.
