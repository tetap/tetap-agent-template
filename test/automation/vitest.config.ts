import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const packageRoot = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(packageRoot, '../..');

const workspaceAliases = [
  { find: /^@tetap\/config$/, replacement: resolve(workspaceRoot, 'packages/config/src/index.ts') },
  { find: /^@tetap\/config\/node$/, replacement: resolve(workspaceRoot, 'packages/config/src/node.ts') },
  { find: /^@tetap\/i18n$/, replacement: resolve(workspaceRoot, 'packages/i18n/src/index.ts') },
  { find: /^@tetap\/i18n\/node$/, replacement: resolve(workspaceRoot, 'packages/i18n/src/node.ts') },
  { find: /^@tetap\/i18n\/locales$/, replacement: resolve(workspaceRoot, 'packages/i18n/src/locales/index.ts') },
  { find: /^@tetap\/i18n\/site$/, replacement: resolve(workspaceRoot, 'packages/i18n/src/site.ts') },
  { find: /^@tetap\/schema$/, replacement: resolve(workspaceRoot, 'packages/schema/src/index.ts') },
  { find: /^@tetap\/schema\/backend$/, replacement: resolve(workspaceRoot, 'packages/schema/src/backend.ts') },
];

export default defineConfig({
  resolve: {
    alias: workspaceAliases,
  },
  test: {
    clearMocks: true,
    environment: 'node',
    globals: false,
    include: ['src/**/*.test.ts'],
    passWithNoTests: false,
    restoreMocks: true,
  },
});
