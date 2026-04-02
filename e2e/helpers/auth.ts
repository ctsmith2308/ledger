import { type Page, expect } from '@playwright/test';

const DEMO_USER = {
  email: 'chris@ledger.app',
  password: 'Password@123!',
};

const login = async (
  page: Page,
  user: { email: string; password: string } = DEMO_USER,
) => {
  await page.goto('/login');

  await page.locator('#email').fill(user.email);
  await page.locator('#password').fill(user.password);

  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL('/overview');
};

export { login, DEMO_USER };
