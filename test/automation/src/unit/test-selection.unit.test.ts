import { describe, expect, it } from 'vitest';
import { groupSelectionsByType, selectAffectedTests, selectTargets } from '../support/test-selection.js';

describe('targeted test selection', () => {
  it('resolves module aliases to concrete unit test files', () => {
    expect(selectTargets('unit', ['schema'])).toMatchObject({
      selected: [{ type: 'unit', path: 'src/unit/schema-response.unit.test.ts' }],
      unknown: [],
    });
  });

  it('maps changed source files to affected test modules', () => {
    const selections = selectAffectedTests([
      'packages/config/src/env.ts',
      'packages/ui/src/components/ui/button.tsx',
      'apps/backend/src/routes/health.ts',
      'apps/backend-admin/src/routes/health.ts',
      'apps/web-admin/src/pages/dashboard.tsx',
    ]);

    expect(groupSelectionsByType(selections)).toEqual({
      browser: ['src/browser/ui-components.browser.test.tsx', 'src/browser/web-admin-dashboard.browser.test.tsx'],
      smoke: [
        'src/smoke/backend-health.smoke.test.ts',
        'src/smoke/backend-admin-health.smoke.test.ts',
        'src/smoke/backend-admin-iam.smoke.test.ts',
      ],
      unit: ['src/unit/config-env.unit.test.ts', 'src/unit/backend-security.unit.test.ts'],
    });
  });

  it('keeps direct test file changes scoped to that test file', () => {
    expect(selectAffectedTests(['test/automation/src/smoke/backend-health.smoke.test.ts'])).toEqual([
      { type: 'smoke', path: 'src/smoke/backend-health.smoke.test.ts' },
    ]);
  });
});
