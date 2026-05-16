import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, normalize, relative, sep } from 'node:path';

const rules = [
  {
    root: 'apps/web/src',
    allowed: new Set(['@tetap/i18n/public']),
    message: 'apps/web may only import @tetap/i18n/public.',
  },
  {
    root: 'apps/web-admin/src',
    allowed: new Set(['@tetap/i18n/admin']),
    message: 'apps/web-admin may only import @tetap/i18n/admin.',
  },
  {
    root: 'apps/backend/src',
    allowed: new Set(['@tetap/i18n/backend', '@tetap/i18n/node', '@tetap/i18n/locales']),
    message: 'apps/backend may only import backend-safe i18n entrypoints.',
  },
  {
    root: 'apps/backend-admin/src',
    allowed: new Set(['@tetap/i18n/backend-admin', '@tetap/i18n/node', '@tetap/i18n/locales']),
    message: 'apps/backend-admin may only import backend-admin-safe i18n entrypoints.',
  },
];

const ignoredDirectories = new Set(['dist', 'node_modules', '.turbo']);
const importPattern = /from\s+['"](@tetap\/i18n(?:\/[^'"]*)?)['"]|import\s+['"](@tetap\/i18n(?:\/[^'"]*)?)['"]/g;
const errors = [];

const walk = directory => {
  if (!existsSync(directory)) {
    return [];
  }

  return readdirSync(directory).flatMap(entry => {
    const path = join(directory, entry);
    const stats = statSync(path);

    if (stats.isDirectory()) {
      return ignoredDirectories.has(entry) ? [] : walk(path);
    }

    return stats.isFile() && /\.(ts|tsx|mts|cts|vue)$/.test(entry) ? [path] : [];
  });
};

const normalizePath = path => normalize(path).split(sep).join('/');

for (const rule of rules) {
  for (const file of walk(rule.root)) {
    const source = readFileSync(file, 'utf8');

    for (const match of source.matchAll(importPattern)) {
      const specifier = match[1] ?? match[2];

      if (!rule.allowed.has(specifier)) {
        errors.push(`${normalizePath(relative(process.cwd(), file))}: ${rule.message} Found ${specifier}.`);
      }
    }
  }
}

if (errors.length > 0) {
  console.error('I18n boundary check failed:');
  console.error(errors.map(error => `- ${error}`).join('\n'));
  process.exit(1);
}
