/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from '@vitejs/plugin-react';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';
import path from "path";

export default defineConfig({
  plugins: [react(), viteCommonjs()],
  base: './',
  build: {
    outDir: "build"
  },
  resolve: {
    tsconfigPaths: true,
    alias: {
      'react-is': path.resolve(__dirname, 'test/react-is-shim.mjs'),
    },
  },
  server: {
    port: 3000,
    strictPort: true
  },
  worker: {
    format: 'es',
  },
  optimizeDeps: {
    exclude: ['@cornerstonejs/dicom-image-loader'],
    include: ['dicom-parser'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './test/setup.js',
    css: true,
    server: {
      deps: {
        inline: [/@mui/, 'react-is'],
      },
    },
  },
});