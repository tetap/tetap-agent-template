import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { configEnvDir } from '@tetap/config/vite';

// https://vite.dev/config/
export default defineConfig({
  envDir: configEnvDir,
  plugins: [react(), tailwindcss()],
});
