import { test, expect } from '@playwright/test';

test.describe('4. Transactions Mutasi & CRUD Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const offlineBtn = page.getByRole('button', { name: /Buka Langsung Mode Offline/i });
    if (await offlineBtn.isVisible()) {
      await offlineBtn.click();
    }
    await page.waitForTimeout(500);

    // Navigate to Mutasi using visible navigation button
    const mutasiTab = page.getByRole('button', { name: /Riwayat Mutasi|Mutasi/i }).filter({ visible: true }).first();
    await mutasiTab.click();
    await page.waitForTimeout(400);
  });

  test('should display mutasi heading, search bar, and handle search queries', async ({ page }) => {
    await expect(page.getByText(/Riwayat Mutasi/i).filter({ visible: true }).first()).toBeVisible();

    const searchInput = page.getByPlaceholder(/Cari transaksi/i);
    await expect(searchInput).toBeVisible();

    // Type query
    await searchInput.fill('Kopi Santai E2E');
    await page.waitForTimeout(200);

    // Verify search doesn't crash or display white screen
    await expect(page.getByText('Terjadi Kesalahan Aplikasi')).not.toBeVisible();

    // Clear search
    await searchInput.fill('');
  });

  test('should create a test income transaction and render it in the list', async ({ page }) => {
    const addBtn = page.locator('button[title="Tambah Transaksi Manual"]').first();
    await expect(addBtn).toBeVisible();
    await addBtn.click();

    // Verify Transaction modal is opened
    await expect(page.getByText(/Catat Mutasi Keuangan/i)).toBeVisible();

    // Select Pemasukan (Income) in the form so it adds funds to the wallet
    const incomeBtn = page.locator('form').getByRole('button', { name: /Pemasukan/i });
    await incomeBtn.click();

    const titleInput = page.getByPlaceholder(/Contoh: Makan Siang/i);
    const amountInput = page.getByPlaceholder(/Contoh: 15000/i);

    const testTitle = `Gaji Freelance E2E ${Date.now()}`;
    await titleInput.fill(testTitle);
    await amountInput.fill('100000');

    // Submit form: button text is "Simpan Transaksi"
    const submitBtn = page.getByRole('button', { name: /Simpan Transaksi/i });
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();
    await page.waitForTimeout(800);

    // Verify modal closed
    await expect(page.getByText(/Catat Mutasi Keuangan/i)).not.toBeVisible();

    // Verify newly added transaction is visible in mutasi
    await expect(page.getByText(testTitle)).toBeVisible();
  });
});
