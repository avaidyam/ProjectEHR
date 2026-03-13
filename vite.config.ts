import { defineConfig } from "vite";
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "build"
  },
  resolve: {
    tsconfigPaths: true
  },
  server: {
    port: 3000,
    strictPort: true
  }
});