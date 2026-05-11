export const testTypes = ['unit', 'browser', 'smoke'] as const;

export type TestType = (typeof testTypes)[number];

export type TestTarget = {
  readonly id: string;
  readonly aliases: readonly string[];
  readonly path: string;
};

export type TestSelection = {
  readonly type: TestType;
  readonly path: string;
};

export type ImpactRule = {
  readonly prefixes: readonly string[];
  readonly selections: readonly TestSelection[];
};

export const testTargets: Record<TestType, readonly TestTarget[]> = {
  unit: [
    {
      id: 'config-env',
      aliases: ['config', 'env'],
      path: 'src/unit/config-env.unit.test.ts',
    },
    {
      id: 'schema-response',
      aliases: ['schema', 'response', 'backend-schema'],
      path: 'src/unit/schema-response.unit.test.ts',
    },
    {
      id: 'iam-engine',
      aliases: ['iam', 'authz', 'permission'],
      path: 'src/unit/iam-engine.unit.test.ts',
    },
    {
      id: 'backend-security',
      aliases: ['security', 'ssrf', 'upload'],
      path: 'src/unit/backend-security.unit.test.ts',
    },
    {
      id: 'test-selection',
      aliases: ['affected-tests', 'targeted-tests'],
      path: 'src/unit/test-selection.unit.test.ts',
    },
  ],
  browser: [
    {
      id: 'ui-components',
      aliases: ['ui', 'components', 'shadcn'],
      path: 'src/browser/ui-components.browser.test.tsx',
    },
    {
      id: 'web-admin-dashboard',
      aliases: ['web-admin', 'admin-web', 'admin-dashboard'],
      path: 'src/browser/web-admin-dashboard.browser.test.tsx',
    },
  ],
  smoke: [
    {
      id: 'backend-health',
      aliases: ['backend', 'health', 'api-health'],
      path: 'src/smoke/backend-health.smoke.test.ts',
    },
    {
      id: 'backend-admin-health',
      aliases: ['backend-admin', 'admin', 'admin-health'],
      path: 'src/smoke/backend-admin-health.smoke.test.ts',
    },
    {
      id: 'backend-admin-iam',
      aliases: ['admin-iam', 'iam-api', 'auth-api'],
      path: 'src/smoke/backend-admin-iam.smoke.test.ts',
    },
  ],
};

export const impactRules: readonly ImpactRule[] = [
  {
    prefixes: ['packages/config/'],
    selections: [{ type: 'unit', path: 'src/unit/config-env.unit.test.ts' }],
  },
  {
    prefixes: ['packages/schema/'],
    selections: [
      { type: 'unit', path: 'src/unit/schema-response.unit.test.ts' },
      { type: 'unit', path: 'src/unit/iam-engine.unit.test.ts' },
      { type: 'smoke', path: 'src/smoke/backend-health.smoke.test.ts' },
      { type: 'smoke', path: 'src/smoke/backend-admin-iam.smoke.test.ts' },
    ],
  },
  {
    prefixes: ['packages/iam/'],
    selections: [
      { type: 'unit', path: 'src/unit/iam-engine.unit.test.ts' },
      { type: 'smoke', path: 'src/smoke/backend-admin-iam.smoke.test.ts' },
    ],
  },
  {
    prefixes: ['apps/backend/'],
    selections: [
      { type: 'unit', path: 'src/unit/backend-security.unit.test.ts' },
      { type: 'smoke', path: 'src/smoke/backend-health.smoke.test.ts' },
    ],
  },
  {
    prefixes: ['apps/backend-admin/'],
    selections: [
      { type: 'unit', path: 'src/unit/backend-security.unit.test.ts' },
      { type: 'smoke', path: 'src/smoke/backend-admin-health.smoke.test.ts' },
      { type: 'smoke', path: 'src/smoke/backend-admin-iam.smoke.test.ts' },
    ],
  },
  {
    prefixes: ['packages/prisma/'],
    selections: [
      { type: 'smoke', path: 'src/smoke/backend-health.smoke.test.ts' },
      { type: 'smoke', path: 'src/smoke/backend-admin-health.smoke.test.ts' },
      { type: 'smoke', path: 'src/smoke/backend-admin-iam.smoke.test.ts' },
    ],
  },
  {
    prefixes: ['apps/web/'],
    selections: [{ type: 'browser', path: 'src/browser/ui-components.browser.test.tsx' }],
  },
  {
    prefixes: ['apps/web-admin/'],
    selections: [{ type: 'browser', path: 'src/browser/web-admin-dashboard.browser.test.tsx' }],
  },
  {
    prefixes: ['packages/hooks/', 'packages/ui/'],
    selections: [
      { type: 'browser', path: 'src/browser/ui-components.browser.test.tsx' },
      { type: 'browser', path: 'src/browser/web-admin-dashboard.browser.test.tsx' },
    ],
  },
  {
    prefixes: ['packages/i18n/'],
    selections: [
      { type: 'browser', path: 'src/browser/ui-components.browser.test.tsx' },
      { type: 'browser', path: 'src/browser/web-admin-dashboard.browser.test.tsx' },
      { type: 'smoke', path: 'src/smoke/backend-health.smoke.test.ts' },
      { type: 'smoke', path: 'src/smoke/backend-admin-health.smoke.test.ts' },
    ],
  },
];

export const normalizePath = (filePath: string) => filePath.trim().replace(/\\/g, '/').replace(/^\.\//, '');

export const isTestType = (value: string): value is TestType => testTypes.includes(value as TestType);

const toSelectionKey = (selection: TestSelection) => `${selection.type}:${selection.path}`;

export const uniqueSelections = (selections: readonly TestSelection[]) => {
  const seen = new Set<string>();

  return selections.filter(selection => {
    const key = toSelectionKey(selection);

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

const testPathMatchers: readonly { readonly type: TestType; readonly prefix: string; readonly suffix: string }[] = [
  { type: 'unit', prefix: 'src/unit/', suffix: '.unit.test.ts' },
  { type: 'unit', prefix: 'test/automation/src/unit/', suffix: '.unit.test.ts' },
  { type: 'browser', prefix: 'src/browser/', suffix: '.browser.test.tsx' },
  { type: 'browser', prefix: 'test/automation/src/browser/', suffix: '.browser.test.tsx' },
  { type: 'smoke', prefix: 'src/smoke/', suffix: '.smoke.test.ts' },
  { type: 'smoke', prefix: 'test/automation/src/smoke/', suffix: '.smoke.test.ts' },
];

export const getDirectTestSelection = (filePath: string): TestSelection | undefined => {
  const normalizedPath = normalizePath(filePath);
  const matcher = testPathMatchers.find(
    item => normalizedPath.startsWith(item.prefix) && normalizedPath.endsWith(item.suffix),
  );

  if (!matcher) {
    return undefined;
  }

  return {
    type: matcher.type,
    path: normalizedPath.replace(/^test\/automation\//, ''),
  };
};

export const selectTargets = (type: TestType, targetNames: readonly string[]) => {
  const targets = testTargets[type];
  const selected: TestSelection[] = [];
  const unknown: string[] = [];

  for (const targetName of targetNames) {
    const normalizedTarget = normalizePath(targetName);
    const directSelection = getDirectTestSelection(normalizedTarget);

    if (directSelection?.type === type) {
      selected.push(directSelection);
      continue;
    }

    const matchedTargets = targets.filter(
      target =>
        target.id === normalizedTarget ||
        target.aliases.includes(normalizedTarget) ||
        target.path === normalizedTarget ||
        target.path.includes(normalizedTarget),
    );

    if (matchedTargets.length === 0) {
      unknown.push(targetName);
      continue;
    }

    selected.push(...matchedTargets.map(target => ({ type, path: target.path })));
  }

  return {
    selected: uniqueSelections(selected),
    unknown,
  };
};

export const selectAffectedTests = (changedFiles: readonly string[]) => {
  const selections: TestSelection[] = [];

  for (const changedFile of changedFiles) {
    const normalizedPath = normalizePath(changedFile);
    const directSelection = getDirectTestSelection(normalizedPath);

    if (directSelection) {
      selections.push(directSelection);
      continue;
    }

    const matchedRules = impactRules.filter(rule => rule.prefixes.some(prefix => normalizedPath.startsWith(prefix)));
    selections.push(...matchedRules.flatMap(rule => rule.selections));
  }

  return uniqueSelections(selections);
};

export const groupSelectionsByType = (selections: readonly TestSelection[]) =>
  testTypes.reduce<Record<TestType, string[]>>(
    (groups, type) => ({
      ...groups,
      [type]: selections.filter(selection => selection.type === type).map(selection => selection.path),
    }),
    {
      browser: [],
      smoke: [],
      unit: [],
    },
  );
