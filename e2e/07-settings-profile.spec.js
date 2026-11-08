import { test, expect } from '@playwright/test';

test.describe('7. Settings & Profile Configuration Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const offlineBtn = page.getByRole('button', { name: /Buka Langsung Mode Offline/i });
    if (await offlineBtn.isVisible()) {
      await offlineBtn.click();
    }
    await page.waitForTimeout(500);

    // Navigate to Settings
    const settingsTab = page.getByRole('button', { name: /Settings/i }).first();
    await settingsTab.click();
    await page.waitForTimeout(400);
  });

  test('should render settings page, integration cards, and user profile', async ({ page }) => {
    // Header check
    await expect(page.getByText(/Pengaturan & Sistem/i).first()).toBeVisible();

    // Google spreadsheet integration card
    await expect(page.getByText(/Google Spreadsheet Cloud Sync/i)).toBeVisible();

    // Real-Time WhatsApp card (regex matches 'Notifikasi Otomatis WhatsApp Bot')
    await expect(page.getByText(/WhatsApp Bot/i).first()).toBeVisible();

    // Biometric option
    await expect(page.getByText(/Biometrik untuk Login/i)).toBeVisible();

    // Logout button
    await expect(page.getByRole('button', { name: /Keluar Akun/i }).first()).toBeVisible();

    // Verify error boundary did not trigger
    await expect(page.getByText('Terjadi Kesalahan Aplikasi')).not.toBeVisible();
  });

  test('should open Profile Edit Modal without errors', async ({ page }) => {
    // Click edit profile icon / button
    const editProfileBtn = page.locator('button:has(svg.lucide-edit-3), button:has(svg.lucide-pencil)').first();
    if (await editProfileBtn.isVisible()) {
      await editProfileBtn.click();
      await page.waitForTimeout(400);

      // Verify Profile modal title
      await expect(page.getByText(/Edit Profil Pengguna/i)).toBeVisible();

      // Close modal
      const closeBtn = page.locator('button:has(svg.lucide-x)').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      }
    }
  });
});
