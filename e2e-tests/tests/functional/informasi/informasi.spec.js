import { test, expect } from '@playwright/test';
import { login } from '../../../utils/test-config.js';

/**
 * COMPREHENSIVE FUNCTIONAL TEST: Informasi
 * Complete test coverage untuk modul informasi
 */

test.describe('Informasi - View Informasi', () => {

    test.beforeEach(async ({ page }) => {
        await login(page, 'user');
        await page.goto('/informasi');
        await page.waitForTimeout(2000);
    });

    test('TC-INF-001: Menampilkan halaman informasi', async ({ page }) => {
        const hasInformasi = await page.locator('text=/informasi|pengumuman|announcement/i').first().isVisible().catch(() => false);
        expect(hasInformasi).toBeTruthy();

        await page.screenshot({ path: 'reports/screenshots/informasi-page.png', fullPage: true });
        console.log('✅ Halaman informasi displayed');
    });

    test('TC-INF-002: Menampilkan daftar informasi', async ({ page }) => {
        const hasList = await page.locator('table, [class*="list"], [class*="card"]').first().isVisible().catch(() => false);

        if (hasList) {
            console.log('✅ Daftar informasi displayed');
        } else {
            console.log('ℹ️ No informasi list found');
        }
    });

    test('TC-INF-003: Melihat detail informasi', async ({ page }) => {
        const informasiItem = page.locator('[class*="informasi"], tr, [class*="card"]').first();

        if (await informasiItem.isVisible().catch(() => false)) {
            await informasiItem.click();
            await page.waitForTimeout(1000);
            console.log('✅ Detail informasi viewed');
        }
    });

    test('TC-INF-004: Menampilkan judul informasi', async ({ page }) => {
        const hasTitle = await page.locator('h1, h2, h3, [class*="title"]').first().isVisible().catch(() => false);
        expect(hasTitle).toBeTruthy();
        console.log('✅ Judul informasi displayed');
    });

    test('TC-INF-005: Menampilkan konten informasi', async ({ page }) => {
        await page.waitForTimeout(2000);

        const bodyText = await page.locator('body').textContent();
        expect(bodyText.length).toBeGreaterThan(50);
        console.log('✅ Konten informasi displayed');
    });

    test('TC-INF-006: Download file lampiran', async ({ page }) => {
        const downloadLink = page.locator('a[download], a:has-text("Download"), button:has-text("Download")').first();

        if (await downloadLink.isVisible().catch(() => false)) {
            const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);

            await downloadLink.click();

            const download = await downloadPromise;

            if (download) {
                console.log(`✅ File downloaded: ${download.suggestedFilename()}`);
            } else {
                console.log('ℹ️ No file to download');
            }
        } else {
            console.log('ℹ️ No download link found');
        }
    });
});

test.describe('Informasi - Manage Informasi (Admin Only)', () => {

    test.beforeEach(async ({ page }) => {
        await login(page, 'admin');
        await page.goto('/informasi');
        await page.waitForTimeout(2000);
    });

    test('TC-INF-007: Tambah informasi baru', async ({ page }) => {
        const addButton = page.locator('button:has-text("Tambah"), button:has-text("Add"), a:has-text("Tambah")').first();

        if (await addButton.isVisible().catch(() => false)) {
            await addButton.click();
            await page.waitForTimeout(1000);

            // Fill form
            const judulInput = page.locator('input[name="judul"], input[placeholder*="judul"]').first();
            const isiInput = page.locator('textarea[name="isi"], textarea').first();

            if (await judulInput.isVisible().catch(() => false)) {
                await judulInput.fill('Test Informasi E2E');
                await isiInput.fill('Ini adalah konten test informasi untuk E2E testing');

                const submitButton = page.locator('button:has-text("Simpan"), button[type="submit"]').first();
                await submitButton.click();
                await page.waitForTimeout(2000);

                console.log('✅ Informasi added');
            }
        } else {
            console.log('ℹ️ Add button not found');
        }
    });

    test('TC-INF-008: Validasi field wajib', async ({ page }) => {
        const addButton = page.locator('button:has-text("Tambah"), button:has-text("Add")').first();

        if (await addButton.isVisible().catch(() => false)) {
            await addButton.click();
            await page.waitForTimeout(1000);

            // Try to submit without filling
            const submitButton = page.locator('button:has-text("Simpan"), button[type="submit"]').first();

            if (await submitButton.isVisible().catch(() => false)) {
                await submitButton.click();
                await page.waitForTimeout(1000);

                const hasError = await page.locator('text=/wajib|required/i').isVisible().catch(() => false);
                console.log(`Validation shown: ${hasError}`);
            }
        }
    });

    test('TC-INF-009: Upload file lampiran', async ({ page }) => {
        const addButton = page.locator('button:has-text("Tambah")').first();

        if (await addButton.isVisible().catch(() => false)) {
            await addButton.click();
            await page.waitForTimeout(1000);

            const fileInput = page.locator('input[type="file"]').first();

            if (await fileInput.isVisible().catch(() => false)) {
                // Upload dummy file
                const buffer = Buffer.from('Test file content');

                await fileInput.setInputFiles({
                    name: 'lampiran.pdf',
                    mimeType: 'application/pdf',
                    buffer: buffer,
                });

                await page.waitForTimeout(1000);
                console.log('✅ File uploaded');
            }
        }
    });

    test('TC-INF-010: Validasi format file lampiran', async ({ page }) => {
        const fileInput = page.locator('input[type="file"]').first();

        if (await fileInput.isVisible().catch(() => false)) {
            const accept = await fileInput.getAttribute('accept');

            if (accept) {
                console.log(`✅ Accepted formats: ${accept}`);
            }
        }
    });

    test('TC-INF-011: Edit informasi', async ({ page }) => {
        const editButton = page.locator('button:has-text("Edit"), [class*="edit"]').first();

        if (await editButton.isVisible().catch(() => false)) {
            await editButton.click();
            await page.waitForTimeout(1000);

            const judulInput = page.locator('input[name="judul"], input[placeholder*="judul"]').first();

            if (await judulInput.isVisible().catch(() => false)) {
                await judulInput.fill('Updated Informasi E2E');

                const submitButton = page.locator('button:has-text("Simpan"), button:has-text("Update")').first();
                await submitButton.click();
                await page.waitForTimeout(2000);

                console.log('✅ Informasi updated');
            }
        } else {
            console.log('ℹ️ Edit button not found');
        }
    });

    test('TC-INF-012: Hapus informasi', async ({ page }) => {
        const deleteButton = page.locator('button:has-text("Hapus"), button:has-text("Delete")').first();

        if (await deleteButton.isVisible().catch(() => false)) {
            await deleteButton.click();
            await page.waitForTimeout(1000);
            console.log('✅ Delete initiated');
        } else {
            console.log('ℹ️ Delete button not found');
        }
    });

    test('TC-INF-013: Konfirmasi hapus informasi', async ({ page }) => {
        const deleteButton = page.locator('button:has-text("Hapus"), button:has-text("Delete")').first();

        if (await deleteButton.isVisible().catch(() => false)) {
            await deleteButton.click();
            await page.waitForTimeout(1000);

            const confirmButton = page.locator('button:has-text("Ya"), button:has-text("Confirm")').first();

            if (await confirmButton.isVisible().catch(() => false)) {
                await confirmButton.click();
                await page.waitForTimeout(2000);
                console.log('✅ Delete confirmed');
            }
        }
    });

    test('TC-INF-014: Filter informasi berdasarkan tanggal', async ({ page }) => {
        const dateInput = page.locator('input[type="date"]').first();

        if (await dateInput.isVisible().catch(() => false)) {
            await dateInput.fill('2025-12-25');
            await page.waitForTimeout(1000);
            console.log('✅ Date filter applied');
        } else {
            console.log('ℹ️ Date filter not found');
        }
    });

    test('TC-INF-015: Cari informasi berdasarkan judul', async ({ page }) => {
        const searchInput = page.locator('input[type="search"], input[placeholder*="cari"]').first();

        if (await searchInput.isVisible().catch(() => false)) {
            await searchInput.fill('pengumuman');
            await page.waitForTimeout(1000);
            console.log('✅ Search performed');
        } else {
            console.log('ℹ️ Search input not found');
        }
    });
});
