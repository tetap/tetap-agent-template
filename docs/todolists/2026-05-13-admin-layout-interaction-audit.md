# 2026-05-13 Admin Layout Interaction Audit

- [x] Contain admin layout overflow so the content region scrolls instead of the body.
- [x] Fix dashboard cards and activity rows for narrow viewports.
- [x] Add responsive table wrappers for IAM pages and dialogs.
- [x] Add visible loading/disabled feedback to refresh, search, submit, delete, and revoke actions.
- [x] Diagnose field permission creation failure and permission operation failures.
- [x] Ensure super administrators receive all effective permissions.
- [x] Add or run automated admin page checks across desktop, tablet, and mobile viewport widths.
- [x] Run formatting, type checks, React Doctor, and relevant targeted tests.
- [x] Record validation commands and results before closing.

## Validation

- `pnpm format:fix` passed.
- `pnpm lint:fix` passed.
- `pnpm check` passed.
- `pnpm test:browser` passed: 2 files, 22 tests.
- `pnpm test:smoke` passed: 3 files, 3 tests.
- `ADMIN_AUDIT_BASE_URL=http://127.0.0.1:5174 ADMIN_AUDIT_PASSWORD=... pnpm --filter @tetap/test-automation audit:admin-responsive` passed for desktop `1440x900`, tablet `1024x768`, and mobile `390x844`.
- `npx -y react-doctor@latest . --verbose --diff` passed with a 93/100 root score, `@tetap/hooks` 100/100, `@tetap/i18n` 99/100, and `@tetap/ui` 99/100.
- `rg -n "mock|demo|fake|placeholder|ENABLE_DEMO_SEED|createDemoIamData" apps packages test docs` found no runtime mock/demo IAM data; remaining runtime hits are UI placeholders, and test hits are isolated automation fixtures.

## Remaining Optimization Notes

- Vite still reports a `web-admin` production JavaScript chunk above 500 kB. This is a performance/code-splitting optimization, not a correctness blocker.
- React Doctor still flags existing shadcn-style `forwardRef` usage in shared UI components and IAM page decomposition opportunities. These should be handled as a separate structural refactor.
