import { test, expect } from '@playwright/test';

test.describe('1. Authentication, Session & Logout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept uncaught page errors
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        // Ignore known harmless network sync notices
        if (!msg.text().includes('Cloud Sync') && !msg.text().includes('favicon')) {
          console.log(`[Browser Console Error]: ${msg.text()}`);
        }
      }
    });
  });

  test('should display login page with branding and offline access button', async ({ page }) => {
    await page.goto('/');

    // Check title / brand
    await expect(page).toHaveTitle(/Velto/i);

    // Check offline login button exists
    const offlineBtn = page.getByRole('button', { name: /Buka Langsung Mode Offline/i });
    await expect(offlineBtn).toBeVisible();

    // Verify no blank white screen
    const rootHtml = await page.locator('#root').innerHTML();
    expect(rootHtml.length).toBeGreaterThan(100);
  });

  test('should login via offline mode, persist session on reload, and logout successfully', async ({ page }) => {
    await page.goto('/');

    // Click offline direct button
    const offlineBtn = page.getByRole('button', { name: /Buka Langsung Mode Offline/i });
    await offlineBtn.click();

    // Verify navigation into the application
    await expect(page.getByRole('button', { name: /Buka Langsung Mode Offline/i })).not.toBeVisible();

    // Verify session persistence after browser reload (Requirement 13)
    await page.reload();
    await expect(page.getByRole('button', { name: /Buka Langsung Mode Offline/i })).not.toBeVisible();

    // Handle logout confirmation dialog automatically
    page.on('dialog', (dialog) => dialog.accept());

    // Navigate to Settings to perform logout
    const settingsBtn = page.getByRole('button', { name: /Settings/i }).first();
    await settingsBtn.click();

    // Find and click "Keluar Akun" button (available in sidebar and settings)
    const logoutBtn = page.getByRole('button', { name: /Keluar Akun/i }).first();
    await logoutBtn.scrollIntoViewIfNeeded();
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click();

    // Verify returned to LoginPage
    await expect(page.getByRole('button', { name: /Buka Langsung Mode Offline/i })).toBeVisible();
  });
});
