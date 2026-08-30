import { fileURLToPath } from 'url';
import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Point straight at the shared package's TS source so Vite/Rollup treats it
      // as native ESM (its build output is CommonJS for the Node server, whose
      // barrel `export *` re-exports Rollup's cjs interop can't statically analyze).
      '@tibia-idle/shared': path.resolve(dirname, '../shared/src/index.ts'),
    },
  },
  server: {
    port: 5173,
  },
});
