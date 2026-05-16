import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

const packageRoot = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(packageRoot, '../..');

const workspaceAliases = [
  { find: /^@tetap\/i18n$/, replacement: resolve(workspaceRoot, 'packages/i18n/src/index.ts') },
  { find: /^@tetap\/i18n\/react$/, replacement: resolve(workspaceRoot, 'packages/i18n/src/react.ts') },
  { find: /^@tetap\/i18n\/public$/, replacement: resolve(workspaceRoot, 'packages/i18n/src/public.ts') },
  { find: /^@tetap\/i18n\/admin$/, replacement: resolve(workspaceRoot, 'packages/i18n/src/admin.ts') },
  { find: /^@tetap\/hooks$/, replacement: resolve(workspaceRoot, 'packages/hooks/src/index.ts') },
  { find: /^@tetap\/schema$/, replacement: resolve(workspaceRoot, 'packages/schema/src/index.ts') },
  { find: /^@tetap\/ui$/, replacement: resolve(workspaceRoot, 'packages/ui/src/index.ts') },
];

export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: workspaceAliases,
  },
  optimizeDeps: {
    include: [
      '@hookform/resolvers/zod',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-separator',
      '@radix-ui/react-slot',
      '@radix-ui/react-tabs',
      'class-variance-authority',
      'clsx',
      'react-hook-form',
      'react-router',
      'tailwind-merge',
      'vitest-browser-react',
      'zod',
    ],
  },
  test: {
    browser: {
      enabled: true,
      headless: true,
      instances: [{ browser: 'chromium' }],
      provider: playwright(),
    },
    clearMocks: true,
    include: ['src/browser/**/*.browser.test.tsx'],
    passWithNoTests: false,
    restoreMocks: true,
  },
});
