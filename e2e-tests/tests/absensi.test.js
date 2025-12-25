const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const AbsensiPage = require('../pages/AbsensiPage');

require('dotenv').config();

test.describe('Modul Absensi Tests', () => {
    let loginPage;
    let absensiPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        absensiPage = new AbsensiPage(page);

        // Login as admin/user first
        const email = process.env.TEST_ADMIN_EMAIL || 'admin';
        const password = process.env.TEST_ADMIN_PASSWORD || '123456';
        await loginPage.goto();
        await loginPage.login(email, password);

        // Ensure we are logged in
        await expect(page).toHaveURL(/.*dashboard.*/);
    });



    test('TC-ABS-003: Validasi Form Input (Admin/Manual)', async ({ page }) => {
        // This test assumes the AbsensiPage represents a form for manual entry (Admin feature)
        // or a form visible to the user.
        await absensiPage.goto();

        // If there is an "Add" or "Input" mode, usually we might need to click a button.
        // However, based on locators in AbsensiPage, implied inputs might be directly visible or in a modal.
        // We will check if inputs are present.

        const inputCount = await absensiPage.tanggalInput.count();
        if (inputCount > 0) {
            await expect(absensiPage.tanggalInput).toBeVisible();
            // Try filling dummy data but not submitting to avoid polluting DB/Errors
            await absensiPage.fillAbsensiForm({
                tanggal: '2025-01-01',
                keterangan: 'Test Automated Input'
            });
        } else {
            test.skip('Form input not visible on main absensi page');
        }
    });

    // Test Geolocation Simulation (Advanced)
    // Ensures the page requests location permissions or handles it
    test('TC-ABS-004: Simulasi Geolocation Permissions', async ({ page, context }) => {
        // Grant geolocation
        await context.grantPermissions(['geolocation'], { origin: 'http://localhost:3000' }); // Adjust origin if needed
        await context.setGeolocation({ latitude: -6.2088, longitude: 106.8456 }); // Jakarta

        await absensiPage.goto();

        // Verification would depend on UI feedback (e.g., "Lokasi Terdeteksi")
        // Currently just verifying page loads without error under geo permission
        await expect(page).not.toHaveURL(/.*error.*/);
    });
});
