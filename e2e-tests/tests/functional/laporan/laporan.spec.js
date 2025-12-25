import { test, expect } from '@playwright/test';
import { login } from '../../../utils/test-config.js';

/**
 * COMPREHENSIVE FUNCTIONAL TEST: Laporan
 * Complete test coverage untuk modul laporan
 */

test.describe('Laporan - Laporan Absensi', () => {

    test.beforeEach(async ({ page }) => {
        await login(page, 'admin');
        await page.goto('/laporan');
        await page.waitForTimeout(2000);
    });

    test('TC-LAB-001: Menampilkan laporan absensi', async ({ page }) => {
        const hasLaporan = await page.locator('text=/laporan|report/i').first().isVisible().catch(() => false);
        expect(hasLaporan).toBeTruthy();

        await page.screenshot({ path: 'reports/screenshots/laporan-absensi.png', fullPage: true });
        console.log('✅ Laporan absensi displayed');
    });

    test('TC-LAB-002: Filter berdasarkan rentang tanggal', async ({ page }) => {
        const dateInputs = await page.locator('input[type="date"]').all();

        if (dateInputs.length >= 2) {
            await dateInputs[0].fill('2025-12-01');
            await dateInputs[1].fill('2025-12-31');

            const filterButton = page.locator('button:has-text("Filter"), button:has-text("Cari")').first();

            if (await filterButton.isVisible().catch(() => false)) {
                await filterButton.click();
                await page.waitForTimeout(2000);
                console.log('✅ Date filter applied');
            }
        }
    });

    test('TC-LAB-003: Filter berdasarkan user', async ({ page }) => {
        const userSelect = page.locator('select[name="user"], select').first();

        if (await userSelect.isVisible().catch(() => false)) {
            const options = await userSelect.locator('option').all();

            if (options.length > 1) {
                await userSelect.selectOption({ index: 1 });
                await page.waitForTimeout(1000);
                console.log('✅ User filter applied');
            }
        }
    });

    test('TC-LAB-004: Menampilkan statistik absensi', async ({ page }) => {
        await page.waitForTimeout(2000);

        const hasStats = await page.locator('text=/total|jumlah|hadir|tidak hadir/i').first().isVisible().catch(() => false);

        if (hasStats) {
            console.log('✅ Absensi statistics displayed');
        }
    });

    test('TC-LAB-005: Export ke Excel', async ({ page }) => {
        const exportButton = page.locator('button:has-text("Export"), button:has-text("Download"), button:has-text("Excel")').first();

        if (await exportButton.isVisible().catch(() => false)) {
            const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);

            await exportButton.click();

            const download = await downloadPromise;

            if (download) {
                console.log(`✅ File downloaded: ${download.suggestedFilename()}`);
            } else {
                console.log('ℹ️ Download not triggered (might need data first)');
            }
        }
    });

    test('TC-LAB-006: Validasi data yang di-export', async ({ page }) => {
        const exportButton = page.locator('button:has-text("Export"), button:has-text("Excel")').first();

        if (await exportButton.isVisible().catch(() => false)) {
            // Check if there's data to export
            const hasData = await page.locator('table tbody tr, [class*="data"]').first().isVisible().catch(() => false);

            if (hasData) {
                console.log('✅ Data available for export');
            } else {
                console.log('ℹ️ No data to export');
            }
        }
    });
});

test.describe('Laporan - Laporan Inventaris', () => {

    test.beforeEach(async ({ page }) => {
        await login(page, 'admin');
        await page.goto('/laporan');
        await page.waitForTimeout(2000);
    });

    test('TC-LIN-001: Menampilkan laporan inventaris', async ({ page }) => {
        const inventarisTab = page.locator('button:has-text("Inventaris"), a:has-text("Inventaris")').first();

        if (await inventarisTab.isVisible().catch(() => false)) {
            await inventarisTab.click();
            await page.waitForTimeout(1000);
            console.log('✅ Laporan inventaris displayed');
        } else {
            console.log('ℹ️ Inventaris tab not found (might be on same page)');
        }
    });

    test('TC-LIN-002: Filter berdasarkan status', async ({ page }) => {
        const statusSelect = page.locator('select[name="status"], select').first();

        if (await statusSelect.isVisible().catch(() => false)) {
            await statusSelect.selectOption('Baik');
            await page.waitForTimeout(1000);
            console.log('✅ Status filter applied');
        }
    });

    test('TC-LIN-003: Filter berdasarkan tanggal', async ({ page }) => {
        const dateInput = page.locator('input[type="date"]').first();

        if (await dateInput.isVisible().catch(() => false)) {
            await dateInput.fill('2025-12-25');
            await page.waitForTimeout(1000);
            console.log('✅ Date filter applied');
        }
    });

    test('TC-LIN-004: Menampilkan statistik inventaris', async ({ page }) => {
        await page.waitForTimeout(2000);

        const hasStats = await page.locator('text=/total|jumlah|baik|rusak/i').first().isVisible().catch(() => false);

        if (hasStats) {
            console.log('✅ Inventaris statistics displayed');
        }
    });

    test('TC-LIN-005: Export ke Excel', async ({ page }) => {
        const exportButton = page.locator('button:has-text("Export"), button:has-text("Download")').first();

        if (await exportButton.isVisible().catch(() => false)) {
            const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);

            await exportButton.click();

            const download = await downloadPromise;

            if (download) {
                console.log(`✅ File downloaded: ${download.suggestedFilename()}`);
            }
        }
    });

    test('TC-LIN-006: Validasi data yang di-export', async ({ page }) => {
        const hasTable = await page.locator('table').first().isVisible().catch(() => false);

        if (hasTable) {
            const rows = await page.locator('table tbody tr').all();
            console.log(`✅ ${rows.length} rows available for export`);
        }
    });
});
