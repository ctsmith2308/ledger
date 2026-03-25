import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/tests/**/*.integration.spec.ts'],
    fileParallelism: false,
    setupFiles: ['src/tests/common/setup-db.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@generated-prisma': path.resolve(__dirname, 'prisma/generated/prisma'),
    },
  },
});
