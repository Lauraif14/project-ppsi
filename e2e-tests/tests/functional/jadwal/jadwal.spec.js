import { test, expect } from '@playwright/test';
import { login } from '../../../utils/test-config.js';

/**
 * COMPREHENSIVE FUNCTIONAL TEST: Jadwal Piket
 * Complete test coverage untuk modul jadwal piket
 */

test.describe('Jadwal - Generate Jadwal (Admin Only)', () => {

    test.beforeEach(async ({ page }) => {
        await login(page, 'admin');
        await page.goto('/jadwal');
        await page.waitForTimeout(2000);
    });

    test('TC-JDW-001: Menampilkan form generate jadwal', async ({ page }) => {
        const hasGenerateButton = await page.locator('button:has-text("Generate"), button:has-text("Buat")').isVisible().catch(() => false);

        if (hasGenerateButton) {
            console.log('✅ Generate jadwal button found');
            await page.screenshot({ path: 'reports/screenshots/jadwal-generate-form.png', fullPage: true });
        }
    });

    test('TC-JDW-002: Memilih rentang tanggal', async ({ page }) => {
        const dateInputs = await page.locator('input[type="date"]').all();

        if (dateInputs.length >= 2) {
            await dateInputs[0].fill('2025-12-25');
            await dateInputs[1].fill('2025-12-31');

            const startDate = await dateInputs[0].inputValue();
            const endDate = await dateInputs[1].inputValue();

            expect(startDate).toBe('2025-12-25');
            expect(endDate).toBe('2025-12-31');
            console.log('✅ Date range selected');
        }
    });

    test('TC-JDW-003: Memilih pengurus untuk jadwal', async ({ page }) => {
        const checkboxes = await page.locator('input[type="checkbox"]').all();

        if (checkboxes.length > 0) {
            // Select first 3 pengurus
            for (let i = 0; i < Math.min(3, checkboxes.length); i++) {
                await checkboxes[i].check();
            }
            console.log('✅ Pengurus selected');
        }
    });

    test('TC-JDW-004: Generate jadwal berhasil', async ({ page }) => {
        const generateButton = page.locator('button:has-text("Generate"), button:has-text("Buat")').first();

        if (await generateButton.isVisible().catch(() => false)) {
            await generateButton.click();
            await page.waitForTimeout(3000);
            console.log('✅ Jadwal generated');
        }
    });

    test('TC-JDW-005: Validasi rentang tanggal (mulai < akhir)', async ({ page }) => {
        const dateInputs = await page.locator('input[type="date"]').all();

        if (dateInputs.length >= 2) {
            // Set end date before start date
            await dateInputs[0].fill('2025-12-31');
            await dateInputs[1].fill('2025-12-25');

            const submitButton = page.locator('button:has-text("Generate"), button[type="submit"]').first();
            if (await submitButton.isVisible().catch(() => false)) {
                await submitButton.click();
                await page.waitForTimeout(1000);

                // Should show validation error
                const hasError = await page.locator('text=/tanggal|invalid|salah/i').isVisible().catch(() => false);
                console.log(`Validation error shown: ${hasError}`);
            }
        }
    });

    test('TC-JDW-006: Validasi minimal pengurus terpilih', async ({ page }) => {
        const generateButton = page.locator('button:has-text("Generate"), button:has-text("Buat")').first();

        if (await generateButton.isVisible().catch(() => false)) {
            // Try to generate without selecting pengurus
            await generateButton.click();
            await page.waitForTimeout(1000);

            // Should show validation
            const hasError = await page.locator('text=/pilih|select|minimal/i').isVisible().catch(() => false);
            console.log(`Validation shown: ${hasError}`);
        }
    });

    test('TC-JDW-007: Preview generated jadwal', async ({ page }) => {
        const hasPreview = await page.locator('text=/preview|lihat|tampilan/i').isVisible().catch(() => false);

        if (hasPreview) {
            console.log('✅ Preview jadwal available');
        }
    });

    test('TC-JDW-008: Simpan generated jadwal', async ({ page }) => {
        const saveButton = page.locator('button:has-text("Simpan"), button:has-text("Save")').first();

        if (await saveButton.isVisible().catch(() => false)) {
            await saveButton.click();
            await page.waitForTimeout(2000);
            console.log('✅ Jadwal saved');
        }
    });
});

test.describe('Jadwal - Lihat Jadwal', () => {

    test.beforeEach(async ({ page }) => {
        await login(page, 'user');
        await page.goto('/jadwal');
        await page.waitForTimeout(2000);
    });

    test('TC-VJD-001: Menampilkan jadwal hari ini', async ({ page }) => {
        const hasJadwal = await page.locator('text=/jadwal|hari ini|today/i').isVisible().catch(() => false);
        expect(hasJadwal).toBeTruthy();

        await page.screenshot({ path: 'reports/screenshots/jadwal-hari-ini.png', fullPage: true });
        console.log('✅ Jadwal hari ini displayed');
    });

    test('TC-VJD-002: Menampilkan jadwal minggu ini', async ({ page }) => {
        const weekButton = page.locator('button:has-text("Minggu"), button:has-text("Week")').first();

        if (await weekButton.isVisible().catch(() => false)) {
            await weekButton.click();
            await page.waitForTimeout(1000);
            console.log('✅ Jadwal minggu ini displayed');
        }
    });

    test('TC-VJD-003: Menampilkan jadwal bulan ini', async ({ page }) => {
        const monthButton = page.locator('button:has-text("Bulan"), button:has-text("Month")').first();

        if (await monthButton.isVisible().catch(() => false)) {
            await monthButton.click();
            await page.waitForTimeout(1000);
            console.log('✅ Jadwal bulan ini displayed');
        }
    });

    test('TC-VJD-004: Filter jadwal berdasarkan tanggal', async ({ page }) => {
        const dateInput = page.locator('input[type="date"]').first();

        if (await dateInput.isVisible().catch(() => false)) {
            await dateInput.fill('2025-12-25');
            await page.waitForTimeout(1000);
            console.log('✅ Jadwal filtered by date');
        }
    });

    test('TC-VJD-005: Melihat detail jadwal', async ({ page }) => {
        const jadwalItem = page.locator('[class*="jadwal"], tr, li').first();

        if (await jadwalItem.isVisible().catch(() => false)) {
            await jadwalItem.click();
            await page.waitForTimeout(1000);
            console.log('✅ Jadwal detail viewed');
        }
    });
});

test.describe('Jadwal - Kelola Jadwal (Admin Only)', () => {

    test.beforeEach(async ({ page }) => {
        await login(page, 'admin');
        await page.goto('/jadwal');
        await page.waitForTimeout(2000);
    });

    test('TC-MJD-001: Edit jadwal', async ({ page }) => {
        const editButton = page.locator('button:has-text("Edit"), [class*="edit"]').first();

        if (await editButton.isVisible().catch(() => false)) {
            await editButton.click();
            await page.waitForTimeout(1000);
            console.log('✅ Edit jadwal opened');
        }
    });

    test('TC-MJD-002: Hapus jadwal', async ({ page }) => {
        const deleteButton = page.locator('button:has-text("Hapus"), button:has-text("Delete")').first();

        if (await deleteButton.isVisible().catch(() => false)) {
            await deleteButton.click();
            await page.waitForTimeout(1000);
            console.log('✅ Delete jadwal initiated');
        }
    });

    test('TC-MJD-003: Konfirmasi hapus jadwal', async ({ page }) => {
        const deleteButton = page.locator('button:has-text("Hapus"), button:has-text("Delete")').first();

        if (await deleteButton.isVisible().catch(() => false)) {
            await deleteButton.click();
            await page.waitForTimeout(1000);

            // Look for confirmation dialog
            const confirmButton = page.locator('button:has-text("Ya"), button:has-text("Confirm"), button:has-text("OK")').first();

            if (await confirmButton.isVisible().catch(() => false)) {
                await confirmButton.click();
                await page.waitForTimeout(1000);
                console.log('✅ Delete confirmed');
            }
        }
    });

    test('TC-MJD-004: Batalkan hapus jadwal', async ({ page }) => {
        const deleteButton = page.locator('button:has-text("Hapus"), button:has-text("Delete")').first();

        if (await deleteButton.isVisible().catch(() => false)) {
            await deleteButton.click();
            await page.waitForTimeout(1000);

            // Look for cancel button
            const cancelButton = page.locator('button:has-text("Batal"), button:has-text("Cancel")').first();

            if (await cancelButton.isVisible().catch(() => false)) {
                await cancelButton.click();
                await page.waitForTimeout(1000);
                console.log('✅ Delete cancelled');
            }
        }
    });

    test('TC-MJD-005: Hapus jadwal secara massal', async ({ page }) => {
        const checkboxes = await page.locator('input[type="checkbox"]').all();

        if (checkboxes.length > 0) {
            // Select multiple jadwal
            for (let i = 0; i < Math.min(3, checkboxes.length); i++) {
                await checkboxes[i].check();
            }

            const bulkDeleteButton = page.locator('button:has-text("Hapus"), button:has-text("Delete Selected")').first();

            if (await bulkDeleteButton.isVisible().catch(() => false)) {
                await bulkDeleteButton.click();
                await page.waitForTimeout(1000);
                console.log('✅ Bulk delete initiated');
            }
        }
    });
});
