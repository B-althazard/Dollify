import { execSync } from 'node:child_process';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vitest/config';

function getAppVersion() {
  try {
    return execSync('git rev-parse --short HEAD', {
      encoding: 'utf8',
    }).trim();
  } catch {
    return 'dev';
  }
}

export default defineConfig({
  base: '/Dollify/',
  define: {
    __APP_VERSION__: JSON.stringify(getAppVersion()),
  },
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-dialog', 'motion'],
          state: ['zustand', 'zod'],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
});
