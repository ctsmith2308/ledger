import { test, expect } from '@playwright/test';

test.describe('profile update', () => {
  test('update profile name via settings', async ({ page }) => {
    await page.goto('/settings');

    // Open edit dialog
    await page.getByRole('button', { name: 'Edit' }).first().click();

    // Wait for dialog to open
    await expect(
      page.getByRole('heading', { name: 'Edit profile' }),
    ).toBeVisible();

    const firstNameInput = page.locator('#firstName');
    await firstNameInput.clear();
    await firstNameInput.fill('Updated');

    const lastNameInput = page.locator('#lastName');
    await lastNameInput.clear();
    await lastNameInput.fill('Name');

    await page.getByRole('button', { name: 'Save changes' }).click();

    // Wait for confirmation dialog
    await expect(
      page.getByRole('heading', { name: 'Confirm changes' }),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Confirm' }).click();

    // Wait for page to refresh with updated data
    await expect(page.locator('input[value="Updated"]')).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.locator('input[value="Name"]')).toBeVisible();
  });
});
