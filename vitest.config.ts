import { defineConfig } from 'vitest/config';
import path from 'path';

const config = defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/__spec__/**/*.spec.ts'],
    exclude: ['node_modules', '.next'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@generated-prisma': path.resolve(__dirname, 'prisma/generated/prisma'),
    },
  },
});

export default config;
