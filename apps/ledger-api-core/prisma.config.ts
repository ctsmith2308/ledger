import { defineConfig } from 'prisma/config';

/**
 * !IMPORTANT
 * Since the .env file is at the legder/ root directory to target the .env,
 * whenever the prisma commands are run dotenvx is applying the top-level .env
 * to point to the DATABASE_URL:
 * "prisma:migrate": "dotenvx run -f ../../.env -- npx prisma migrate dev",
 * "prisma:generate": "dotenvx run -f ../../.env -- npx prisma generate",
 * "prisma:studio": "dotenvx run -f ../../.env -- npx prisma studio"
 */

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env['DATABASE_URL'],
  },
});
