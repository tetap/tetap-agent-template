import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  groupSelectionsByType,
  isTestType,
  selectAffectedTests,
  selectTargets,
  testTargets,
  testTypes,
  type TestType,
} from '../src/support/test-selection.js';

const testConfigs = {
  unit: 'vitest.config.ts',
  browser: 'vitest.browser.config.ts',
  smoke: 'vitest.config.ts',
} as const satisfies Record<TestType, string>;

type ParsedArgs = {
  readonly base?: string;
  readonly list: boolean;
  readonly namePattern?: string;
  readonly positionals: readonly string[];
};

export const parseArgs = (rawArgs: readonly string[]): ParsedArgs => {
  const positionals: string[] = [];
  let base: string | undefined;
  let list = false;
  let namePattern: string | undefined;

  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];

    if (arg === '--') {
      continue;
    }

    if (arg === '--list') {
      list = true;
      continue;
    }

    if (arg === '--base') {
      base = rawArgs[index + 1];
      index += 1;
      continue;
    }

    if (arg.startsWith('--base=')) {
      base = arg.slice('--base='.length);
      continue;
    }

    if (arg === '--name' || arg === '-t' || arg === '--testNamePattern') {
      namePattern = rawArgs[index + 1];
      index += 1;
      continue;
    }

    if (arg.startsWith('--name=')) {
      namePattern = arg.slice('--name='.length);
      continue;
    }

    if (arg.startsWith('--testNamePattern=')) {
      namePattern = arg.slice('--testNamePattern='.length);
      continue;
    }

    positionals.push(arg);
  }

  return { base, list, namePattern, positionals };
};

const printUsage = () => {
  console.log(`Targeted Vitest runner

Usage:
  pnpm test:target -- <unit|browser|smoke> <target...> [--name <pattern>]
  pnpm test:unit:target -- <target...> [--name <pattern>]
  pnpm test:browser:target -- <target...> [--name <pattern>]
  pnpm test:smoke:target -- <target...> [--name <pattern>]
  pnpm test:affected [--base <git-ref>] [changed-file...]
  pnpm test:target -- --list

Targets:
${testTypes.map(type => `  ${type}: ${testTargets[type].map(target => target.id).join(', ')}`).join('\n')}`);
};

const runCommand = (args: readonly string[]) => {
  const result = spawnSync('pnpm', ['exec', 'vitest', 'run', ...args], {
    stdio: 'inherit',
  });

  return result.status ?? 1;
};

export const getGitRoot = (cwd = process.cwd()) => {
  const result = spawnSync('git', ['rev-parse', '--show-toplevel'], {
    cwd,
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    return cwd;
  }

  return result.stdout.trim() || cwd;
};

export const getGitChangedFiles = (base?: string, cwd = process.cwd()) => {
  const gitRoot = getGitRoot(cwd);
  const commands = base
    ? [['diff', '--name-only', '--diff-filter=ACMR', `${base}...HEAD`]]
    : [
        ['diff', '--name-only', '--diff-filter=ACMR'],
        ['diff', '--cached', '--name-only', '--diff-filter=ACMR'],
        ['ls-files', '--others', '--exclude-standard'],
      ];
  const files = new Set<string>();

  for (const args of commands) {
    const result = spawnSync('git', args, {
      cwd: gitRoot,
      encoding: 'utf8',
    });

    if (result.status !== 0) {
      continue;
    }

    result.stdout
      .split('\n')
      .map(file => file.trim())
      .filter(Boolean)
      .forEach(file => files.add(file));
  }

  return [...files];
};

const runTypeTargets = (type: TestType, targets: readonly string[], namePattern?: string) => {
  if (targets.length === 0) {
    console.error(`Missing ${type} target. Use --list to see available targets.`);
    return 1;
  }

  const { selected, unknown } = selectTargets(type, targets);

  if (unknown.length > 0) {
    console.error(`Unknown ${type} target(s): ${unknown.join(', ')}`);
    console.error(`Available ${type} targets: ${testTargets[type].map(target => target.id).join(', ')}`);
    return 1;
  }

  const args = ['--config', testConfigs[type], ...selected.map(selection => selection.path)];

  if (namePattern) {
    args.push('--testNamePattern', namePattern);
  }

  return runCommand(args);
};

const runAffectedTargets = (changedFiles: readonly string[], base?: string, namePattern?: string) => {
  const files = changedFiles.length > 0 ? changedFiles : getGitChangedFiles(base);

  if (files.length === 0) {
    console.log('No changed files detected; targeted tests were skipped.');
    return 0;
  }

  const selections = selectAffectedTests(files);

  if (selections.length === 0) {
    console.log(
      'No mapped tests found for changed files; add or update the impact map before relying on targeted tests.',
    );
    return 0;
  }

  const groups = groupSelectionsByType(selections);

  for (const type of testTypes) {
    const paths = groups[type];

    if (paths.length === 0) {
      continue;
    }

    console.log(`Running ${type} targeted tests: ${paths.join(', ')}`);
    const args = ['--config', testConfigs[type], ...paths];

    if (namePattern) {
      args.push('--testNamePattern', namePattern);
    }

    const status = runCommand(args);

    if (status !== 0) {
      return status;
    }
  }

  return 0;
};

export const main = () => {
  const parsedArgs = parseArgs(process.argv.slice(2));
  const [modeOrType, ...targets] = parsedArgs.positionals;

  if (parsedArgs.list || !modeOrType) {
    printUsage();
    return parsedArgs.list ? 0 : 1;
  }

  if (modeOrType === 'affected' || modeOrType === 'changed') {
    return runAffectedTargets(targets, parsedArgs.base, parsedArgs.namePattern);
  }

  if (!isTestType(modeOrType)) {
    console.error(`Unknown test type: ${modeOrType}`);
    printUsage();
    return 1;
  }

  for (const target of targets) {
    const resolvedTarget = resolve(target);

    if (target.includes('/') && !existsSync(resolvedTarget) && !existsSync(resolve(process.cwd(), target))) {
      console.error(`Target path does not exist: ${target}`);
      return 1;
    }
  }

  return runTypeTargets(modeOrType, targets, parsedArgs.namePattern);
};

const entrypoint = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : undefined;

if (entrypoint === import.meta.url) {
  process.exitCode = main();
}
