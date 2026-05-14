import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { getGitChangedFiles } from '../../scripts/run-targeted-tests.ts';
import { groupSelectionsByType, selectAffectedTests, selectTargets } from '../support/test-selection.js';

const tempRepos: string[] = [];

const createTempGitRepo = () => {
  const repoRoot = mkdtempSync(join(tmpdir(), 'tetap-affected-'));
  tempRepos.push(repoRoot);
  execFileSync('git', ['init'], { cwd: repoRoot, stdio: 'ignore' });
  return repoRoot;
};

afterEach(() => {
  for (const repoRoot of tempRepos.splice(0)) {
    rmSync(repoRoot, { force: true, recursive: true });
  }
});

describe('targeted test selection', () => {
  it('resolves module aliases to concrete unit test files', () => {
    expect(selectTargets('unit', ['schema'])).toMatchObject({
      selected: [{ type: 'unit', path: 'src/unit/schema-response.unit.test.ts' }],
      unknown: [],
    });

    expect(selectTargets('unit', ['site-i18n'])).toMatchObject({
      selected: [{ type: 'unit', path: 'src/unit/i18n-site.unit.test.ts' }],
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

  it('detects untracked repository files when the runner cwd is the test package', () => {
    const repoRoot = createTempGitRepo();
    const packageCwd = join(repoRoot, 'test/automation');
    const untrackedFile = join(repoRoot, 'packages/config/src/env.ts');

    mkdirSync(packageCwd, { recursive: true });
    mkdirSync(join(repoRoot, 'packages/config/src'), { recursive: true });
    writeFileSync(untrackedFile, 'export const env = {};\n');

    expect(getGitChangedFiles(undefined, packageCwd)).toContain('packages/config/src/env.ts');
  });
});
