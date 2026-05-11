# Shadcn Admin Visual Parity Todolist

Status: Closed
Created: 2026-05-11
Task: Re-check live `shadcn-admin` sign-in and dashboard pages, fix the remaining visual/structural gaps in `apps/web-admin`, and preserve shared package boundaries.

## Execution Plan

- [x] Capture and compare the live `https://shadcn-admin.netlify.app/sign-in` and `/` pages against local `web-admin`.
- [x] Fix shared sidebar layout tokens so inset content reserves the sidebar width under Tailwind v4.
- [x] Rebuild the admin auth layout and sign-in form to match the reference card width, centered brand header, forgot link position, divider, and provider buttons.
- [x] Tighten dashboard/sidebar/header details to match the reference page more closely.
- [x] Re-run focused screenshots and automated validation.
- [x] Close this todolist with validation results.

## Validation

```sh
pnpm --filter @tetap/ui type-check
pnpm --filter web-admin type-check
pnpm i18n:boundaries:check
pnpm test:browser:target -- web-admin-dashboard
pnpm check
```

## Closure Notes

Compared the live reference sign-in and dashboard pages with local screenshots. Fixed the Tailwind v4 sidebar width/token issue in `@tetap/ui`, rebuilt the auth layout/sign-in card, matched the dashboard header/sidebar/top nav/tab structure more closely, restored visible chart bars, and updated Browser Mode expectations.

Validation completed:

```sh
pnpm --filter @tetap/ui type-check
pnpm --filter web-admin type-check
pnpm i18n:boundaries:check
pnpm format:fix
pnpm lint:fix
pnpm test:browser:target -- web-admin-dashboard
pnpm check
pnpm test:browser:target -- web-admin-dashboard
```
