import { defineConfig, devices } from '@playwright/test';
import path from 'path';

const baseURL = 'http://localhost:3000';

const STORAGE_STATE = path.resolve(__dirname, 'e2e/.auth/session.json');

const config = defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? 'github' : 'list',

  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'db-setup',
      testMatch: /global-setup\.ts/,
    },
    {
      name: 'auth-setup',
      testMatch: /auth-setup\.ts/,
      dependencies: ['db-setup'],
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: STORAGE_STATE,
      },
      dependencies: ['auth-setup'],
      testIgnore: /auth-setup\.ts|global-setup\.ts/,
    },
  ],

  webServer: {
    command: 'dotenvx run -f .env.test -- npm run dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});

export { STORAGE_STATE };
export default config;
