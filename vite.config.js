import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative asset paths, so the build works under /cluster-placement/ on GitHub Pages.
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  test: {
    // UI tests opt into jsdom with a `// @vitest-environment jsdom` comment.
    environment: 'node',
    include: ['src/**/*.test.{js,jsx}'],
  },
});
