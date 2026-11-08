import { test, expect } from '@playwright/test';

test.describe('2. Navigation & Responsive Layout Transitions', () => {
  test.beforeEach(async ({ page }) => {
    // Start session in offline mode
    await page.goto('/');
    const offlineBtn = page.getByRole('button', { name: /Buka Langsung Mode Offline/i });
    if (await offlineBtn.isVisible()) {
      await offlineBtn.click();
    }
    await page.waitForTimeout(500);
  });

  test('should navigate across all 6 main tabs without any white screens', async ({ page }) => {
    const tabPatterns = [
      /Kantong Aset|Wallets/i,
      /Parfum FIFO|Parfum/i,
      /Saving Goals|Goals/i,
      /Riwayat Mutasi|Mutasi/i,
      /Settings/i
    ];

    for (const pattern of tabPatterns) {
      // Find button in desktop sidebar or mobile bottom nav
      const tabBtn = page.getByRole('button', { name: pattern }).first();
      await tabBtn.click();
      await page.waitForTimeout(300);

      // Verify no blank screen (#root has children and is not empty)
      const content = await page.locator('#root').innerText();
      expect(content.length).toBeGreaterThan(20);

      // Verify error boundary did not catch a crash
      await expect(page.getByText('Terjadi Kesalahan Aplikasi')).not.toBeVisible();
    }
  });

  test('should resize between desktop and mobile viewports seamlessly without React hook errors', async ({ page }) => {
    // Desktop Viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(300);
    const desktopRoot = await page.locator('#root').innerHTML();
    expect(desktopRoot.length).toBeGreaterThan(100);

    // Tablet Viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(300);

    // Mobile Viewport
    await page.setViewportSize({ width: 393, height: 851 });
    await page.waitForTimeout(300);
    const mobileRoot = await page.locator('#root').innerHTML();
    expect(mobileRoot.length).toBeGreaterThan(100);

    // Back to Desktop
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(300);

    // Verify error boundary did not trigger
    await expect(page.getByText('Terjadi Kesalahan Aplikasi')).not.toBeVisible();
  });
});
