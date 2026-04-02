import { test, expect } from '@playwright/test';

import { login } from './helpers/auth';

// Auth tests manage their own sessions — don't use shared storageState
// because logout/delete destroy the cookie.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('auth flows', () => {
  test('login with demo user and reach overview', async ({ page }) => {
    await login(page);

    await expect(
      page.getByRole('heading', { name: /welcome back/i }),
    ).toBeVisible();
  });

  test('logout redirects to login', async ({ page }) => {
    await login(page);

    await page.goto('/settings');

    await page.getByRole('button', { name: 'Log out' }).click();

    await expect(page).toHaveURL('/login');
  });
});
