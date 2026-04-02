import { test as setup, expect } from '@playwright/test';

import { STORAGE_STATE } from '../playwright.config';

import { login } from './helpers/auth';

const TEST_USER = {
  firstName: 'E2E',
  lastName: 'Tester',
  email: `e2e-${Date.now().toString(36)}@test.app`,
  password: 'Password@123!',
};

setup('register and authenticate shared test user', async ({ page }) => {
  await page.goto('/register');

  await page.locator('#firstName').fill(TEST_USER.firstName);
  await page.locator('#lastName').fill(TEST_USER.lastName);
  await page.locator('#email').fill(TEST_USER.email);
  await page.locator('#password').fill(TEST_USER.password);

  await page.getByRole('button', { name: 'Submit' }).click();

  await expect(page).toHaveURL('/login', { timeout: 15_000 });

  await login(page, TEST_USER);

  await page.context().storageState({ path: STORAGE_STATE });
});

export { TEST_USER };
