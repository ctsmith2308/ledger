import { test, expect } from '@playwright/test';

test.describe('budgets CRUD', () => {
  test('create a budget', async ({ page }) => {
    await page.goto('/budgets');

    await page.getByRole('button', { name: 'New budget' }).click();

    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: /travel/i }).click();

    await page.locator('#monthlyLimit').fill('300');

    await page.getByRole('button', { name: 'Create budget' }).click();

    // Close the dialog then reload to see the new budget
    await page.getByRole('button', { name: 'Close' }).click();
    await page.reload();

    await expect(
      page.getByRole('button', { name: /travel/i }),
    ).toBeVisible();
  });

  test('edit a budget', async ({ page }) => {
    await page.goto('/budgets');

    // Expand the accordion to reveal Edit/Delete buttons
    await page.getByRole('button', { name: /travel/i }).click();

    await page.getByRole('button', { name: 'Edit' }).click();

    const limitInput = page.locator('input[type="number"]');
    await limitInput.clear();
    await limitInput.fill('500');

    await page.getByRole('button', { name: 'Save' }).click();

    // Verify the allocated amount updated
    await expect(page.getByText('Allocated')).toBeVisible();
    await expect(
      page.locator('text=$500.00').first(),
    ).toBeVisible();
  });

  test('delete a budget', async ({ page }) => {
    await page.goto('/budgets');

    await page.getByRole('button', { name: /travel/i }).click();

    await page.getByRole('button', { name: 'Delete' }).click();

    await expect(page.getByText('No budgets yet')).toBeVisible();
  });
});
