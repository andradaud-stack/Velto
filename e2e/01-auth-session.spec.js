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

  test('should display login page with branding and login form', async ({ page }) => {
    await page.goto('/');

    // Check title / brand
    await expect(page).toHaveTitle(/Velto/i);

    // Verify form elements exist
    await expect(page.getByPlaceholder(/Email Address/i)).toBeVisible();
    await expect(page.getByPlaceholder(/Password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Login/i })).toBeVisible();

    // Verify no blank white screen
    const rootHtml = await page.locator('#root').innerHTML();
    expect(rootHtml.length).toBeGreaterThan(100);
  });

  test('should login via session persistence, survive reload, and logout successfully', async ({ page }) => {
    // Seed authenticated session
    await page.addInitScript(() => {
      localStorage.setItem('velto_cloud_session', JSON.stringify({
        token: 'e2e_test_token',
        user: {
          id: 'owner_andra',
          email: 'andrasyahdand@gmail.com',
          name: 'Andra Syahdan Daud',
          role: 'owner'
        }
      }));
    });

    await page.goto('/');

    // Verify navigation into the application
    await expect(page.getByRole('button', { name: /Login/i })).not.toBeVisible();
    await expect(page.locator('#root')).toBeVisible();

    // Verify session persistence after browser reload (Requirement 13)
    await page.reload();
    await expect(page.getByRole('button', { name: /Login/i })).not.toBeVisible();

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
    await expect(page.getByRole('button', { name: /Login/i })).toBeVisible();
  });
});
