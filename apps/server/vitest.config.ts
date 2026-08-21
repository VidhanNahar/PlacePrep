import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  root: path.resolve(__dirname),
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 10000,
    include: ['src/**/*.{test,spec}.ts'],
  },
  resolve: {
    alias: {
      '@placeprep/shared': path.resolve(__dirname, '../../packages/shared/src'),
    },
  },
});
