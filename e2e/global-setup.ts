import { test as setup } from '@playwright/test';
import { execSync } from 'child_process';

setup('seed test database', () => {
  execSync('dotenvx run -f .env.test -- npx prisma migrate deploy', {
    stdio: 'inherit',
  });

  execSync('dotenvx run -f .env.test -- npx tsx prisma/seed.ts', {
    stdio: 'inherit',
  });
});
