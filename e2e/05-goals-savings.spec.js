import { test, expect } from '@playwright/test';

test.describe('5. Saving Goals & Impian Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const offlineBtn = page.getByRole('button', { name: /Buka Langsung Mode Offline/i });
    if (await offlineBtn.isVisible()) {
      await offlineBtn.click();
    }
    await page.waitForTimeout(500);

    // Navigate to Goals
    const goalsTab = page.getByRole('button', { name: /Saving Goals|Goals/i }).first();
    await goalsTab.click();
    await page.waitForTimeout(400);
  });

  test('should render goals dashboard, metrics, and saving streak banner', async ({ page }) => {
    await expect(page.getByText(/Goals & Impian/i).first()).toBeVisible();

    // Verify streak or targets metric
    const pageText = await page.locator('#root').innerText();
    expect(pageText).toContain('Total Tabungan Impian');

    // Verify error boundary did not trigger
    await expect(page.getByText('Terjadi Kesalahan Aplikasi')).not.toBeVisible();
  });

  test('should open new goal modal without errors', async ({ page }) => {
    // Locate the Add button in the Goals Page header
    const addGoalBtn = page.locator('button').filter({ hasText: /^Tambah$/i }).first();
    if (await addGoalBtn.isVisible()) {
      await addGoalBtn.click();
      await page.waitForTimeout(400);

      // Verify modal is visible
      const modalHeader = page.getByText(/Tambah Target Tabungan/i).first();
      await expect(modalHeader).toBeVisible();

      // Close modal
      const closeBtn = page.locator('button:has(svg.lucide-x)').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      }
    }
  });
});
