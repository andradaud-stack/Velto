import { test, expect } from '@playwright/test';

test.describe('6. Parfum FIFO Business Module & Calculation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const offlineBtn = page.getByRole('button', { name: /Buka Langsung Mode Offline/i });
    if (await offlineBtn.isVisible()) {
      await offlineBtn.click();
    }
    await page.waitForTimeout(500);

    // Navigate to Parfum using visible navigation button
    const parfumTab = page.locator('button:visible').filter({ hasText: /Parfum/i }).first();
    await parfumTab.click();
    await page.waitForTimeout(400);
  });

  test('should render parfum dashboard without white screen and display sub-tabs', async ({ page }) => {
    // Verify header in visible view
    await expect(page.locator('h1:visible', { hasText: /Parfum FIFO/i })).toBeVisible();

    // Verify sub-tabs: Dashboard, Restock, Penjualan in the sub-tab switcher
    const switcher = page.locator('div.rounded-2xl.bg-\\[\\#F4F2FA\\]');
    await expect(switcher.locator('button', { hasText: /Dashboard/i })).toBeVisible();
    await expect(switcher.locator('button', { hasText: /Restock/i })).toBeVisible();
    await expect(switcher.locator('button', { hasText: /Penjualan/i })).toBeVisible();

    // Verify no white screen
    const pageText = await page.locator('#root').innerText();
    expect(pageText.length).toBeGreaterThan(50);
    await expect(page.getByText('Terjadi Kesalahan Aplikasi')).not.toBeVisible();
  });

  test('should switch between Restock and Penjualan sub-tabs and verify modal triggers', async ({ page }) => {
    const switcher = page.locator('div.rounded-2xl.bg-\\[\\#F4F2FA\\]');

    // Switch to Restock tab
    const restockTab = switcher.locator('button', { hasText: /Restock/i });
    await restockTab.click();
    await page.waitForTimeout(400);

    // Verify Restock view has Add Batch Restock button
    await expect(page.getByRole('button', { name: /Tambah Batch Restock/i })).toBeVisible();

    // Switch to Penjualan tab
    const penjualanTab = switcher.locator('button', { hasText: /Penjualan/i });
    await penjualanTab.click();
    await page.waitForTimeout(400);

    // Verify Penjualan view has Add Sale button
    await expect(page.getByRole('button', { name: /Catat Penjualan Baru/i })).toBeVisible();
  });
});
