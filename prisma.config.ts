import { defineConfig } from 'prisma/config';
import path from 'node:path';

export default defineConfig({
  earlyAccess: true,
  schema: path.join('prisma', 'schema.prisma'),
  migrate: {
    async getEnv() {
      return {
        DATABASE_URL: process.env.DATABASE_URL ?? '',
      };
    },
  },
});
