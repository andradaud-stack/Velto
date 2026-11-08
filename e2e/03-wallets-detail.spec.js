import { test, expect } from '@playwright/test';

test.describe('3. Wallets List & Detail Navigation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const offlineBtn = page.getByRole('button', { name: /Buka Langsung Mode Offline/i });
    if (await offlineBtn.isVisible()) {
      await offlineBtn.click();
    }
    await page.waitForTimeout(500);

    // Navigate to Wallets page using visible navigation button
    const walletsTab = page.getByRole('button', { name: /Kantong Aset|Wallets/i }).filter({ visible: true }).first();
    await walletsTab.click();
    await page.waitForTimeout(400);
  });

  test('should display wallets list and header information', async ({ page }) => {
    // Header should contain Kantong Aset in visible view
    await expect(page.getByText(/Kantong Aset/i).filter({ visible: true }).first()).toBeVisible();

    // Verify wallet cards exist (e.g. Jago, Mandiri, Cash, or DANA)
    const pageText = await page.locator('#root').innerText();
    const hasAnyKnownWallet = /Jago|Mandiri|Cash|DANA|Bibit|eMAS|Parfum/i.test(pageText);
    expect(hasAnyKnownWallet).toBeTruthy();
  });

  test('should open wallet detail view and navigate back correctly', async ({ page }) => {
    // Locate the first clickable wallet card
    const firstWalletCard = page.locator('div.cursor-pointer').filter({
      hasText: /Mandiri|Jago|Cash|DANA|Bibit|eMAS|Parfum/i,
      hasNotText: 'Tambah Kantong'
    }).first();

    if (await firstWalletCard.isVisible()) {
      await firstWalletCard.click();
      await page.waitForTimeout(500);

      // Verify wallet detail view elements: find visible back button
      const backBtn = page.getByRole('button', { name: 'Kembali', exact: true }).or(
        page.locator('button[title="Kembali"]:visible')
      ).first();
      await expect(backBtn).toBeVisible();

      // Click back
      await backBtn.click();
      await page.waitForTimeout(500);

      // Should return to Wallets list
      await expect(page.getByText(/Kantong Aset/i).filter({ visible: true }).first()).toBeVisible();
    }
  });
});
