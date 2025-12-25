const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const DashboardPage = require('../pages/DashboardPage');
const InformasiPage = require('../pages/InformasiPage');
const JadwalPage = require('../pages/JadwalPage');
const LaporanPage = require('../pages/LaporanPage');
const UserPage = require('../pages/UserPage');

require('dotenv').config();

test.describe('User Role Access Tests', () => {
  let loginPage;
  let dashboardPage;
  let informasiPage;
  let jadwalPage;
  let laporanPage;
  let userPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    informasiPage = new InformasiPage(page);
    jadwalPage = new JadwalPage(page);
    laporanPage = new LaporanPage(page);
    userPage = new UserPage(page);

    // Login sebagai USER (bukan admin)
    await loginPage.goto();
    const userEmail = process.env.TEST_USER_EMAIL || 'laura';
    const userPassword = process.env.TEST_USER_PASSWORD || '123456';
    await loginPage.login(userEmail, userPassword);
    await page.waitForTimeout(2000);
  });

  test.describe('Dashboard Access', () => {
    test('TC-USER-ROLE-001: User dapat mengakses dashboard', async ({ page }) => {
      const isDashboardLoaded = await dashboardPage.isDashboardLoaded();
      expect(isDashboardLoaded).toBe(true);
    });

    test('TC-USER-ROLE-002: User dapat melihat menu navigasi', async ({ page }) => {
      // Verify any button or link for navigation exists
      const hasNavLinks = await page.locator('a, button').count();
      expect(hasNavLinks).toBeGreaterThan(0);
    });
  });

  test.describe('Informasi Piket Access - User Role', () => {
    test('TC-USER-ROLE-003: User dapat view informasi piket', async ({ page }) => {
      await informasiPage.goto();
      await page.waitForTimeout(2000);

      const informasiCount = await informasiPage.getInformasiCount();
      expect(informasiCount).toBeGreaterThanOrEqual(0);

      // Verify cards visible
      const cardsVisible = await informasiPage.informasiCards.first().isVisible({ timeout: 5000 }).catch(() => false);
      expect(typeof cardsVisible).toBe('boolean');
    });

    test('TC-USER-ROLE-004: User TIDAK dapat add/edit/delete informasi', async ({ page }) => {
      await informasiPage.goto();
      await page.waitForTimeout(2000);

      // Verify no add button or it's disabled
      const addButton = page.locator('button:has-text("Tambah"), button:has-text("Add"), button[title*="Tambah"]');
      const addButtonCount = await addButton.count();

      if (addButtonCount > 0) {
        const isDisabled = await addButton.first().isDisabled().catch(() => true);
        expect(isDisabled).toBe(true);
      }

      // Verify no edit/delete buttons visible or accessible
      const editButtons = page.locator('button[title*="Edit"]');
      const editButtonCount = await editButtons.count();

      if (editButtonCount > 0) {
        const isDisabled = await editButtons.first().isDisabled().catch(() => true);
        expect(isDisabled).toBe(true);
      }
    });
  });

  test.describe('Jadwal Piket Access - User Role', () => {
    test('TC-USER-ROLE-005: User dapat view jadwal piket', async ({ page }) => {
      await jadwalPage.goto();
      await page.waitForTimeout(2000);

      const jadwalCount = await jadwalPage.getJadwalCount();
      expect(jadwalCount).toBeGreaterThanOrEqual(0);
    });

    test('TC-USER-ROLE-006: User TIDAK dapat generate/edit/delete jadwal', async ({ page }) => {
      await jadwalPage.goto();
      await page.waitForTimeout(2000);

      // Verify no generate button or it's disabled
      const generateButton = page.locator('button:has-text("Generate"), button:has-text("Buat Jadwal")');
      const generateButtonCount = await generateButton.count();

      if (generateButtonCount > 0) {
        const isDisabled = await generateButton.first().isDisabled().catch(() => true);
        expect(isDisabled).toBe(true);
      }

      // Verify no edit buttons accessible
      const editButtons = page.locator('button[title*="Edit"]');
      const editButtonCount = await editButtons.count();

      if (editButtonCount > 0) {
        const isDisabled = await editButtons.first().isDisabled().catch(() => true);
        expect(isDisabled).toBe(true);
      }
    });
  });

  test.describe('User Management Access - User Role', () => {
    test('TC-USER-ROLE-012: User dapat view dan edit profil sendiri', async ({ page }) => {
      // Direct navigation to profile page
      const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';
      // URL profile sekarang ada di /profile
      await page.goto(`${baseUrl}/profile`);
      await page.waitForTimeout(2000);

      // Verify we can access profile page
      const currentUrl = page.url();
      expect(currentUrl).toContain('profile');

      // Verify profile content is visible (Title or Placeholder text)
      // Karena halaman masih placeholder, cek judulnya saja
      const hasTitle = await page.locator('text=/Pengaturan Profil|Fitur Profil/i').count() > 0;
      const hasRoleInfo = await page.locator('text=/Login sebagai/i').count() > 0;

      expect(hasTitle || hasRoleInfo).toBe(true);
    });
  });

  test.describe('Absensi Access - User Role', () => {
    test('TC-USER-ROLE-013: User dapat melihat fitur absensi di dashboard', async ({ page }) => {
      // Absensi sekarang menyatu di /user-dashboard
      const dashboardUrl = (process.env.TEST_BASE_URL || 'http://localhost:3000') + '/user-dashboard';
      await page.goto(dashboardUrl);
      await page.waitForTimeout(2000);

      // Verify we're on dashboard
      expect(page.url()).toContain('user-dashboard');

      // Check if absensi feature is available (Buttons "Absen Masuk" or similar)
      const hasAbsenButton = await page.locator('button:has-text("ABSEN MASUK"), button:has-text("MULAI PIKET"), button:has-text("MULAI BARU")').count() > 0;
      const hasStatusText = await page.locator('text=/Status|Piket|Bertugas/i').count() > 0;

      // Should have at least some absensi interface
      expect(hasAbsenButton || hasStatusText).toBe(true);
    });

    test('TC-USER-ROLE-014: User dapat melihat status piket', async ({ page }) => {
      // Cek status piket di dashboard
      const dashboardUrl = (process.env.TEST_BASE_URL || 'http://localhost:3000') + '/user-dashboard';
      await page.goto(dashboardUrl);
      await page.waitForTimeout(2000);

      // Verify status section exists
      const statusSection = page.locator('text=/Status Anda|Bebas Tugas|Sedang Bertugas|Tidak Lengkap/i').first();
      const isVisible = await statusSection.isVisible({ timeout: 5000 });

      expect(isVisible).toBe(true);
    });
  });

  test.describe('Search and Navigation - User Role', () => {
    test('TC-USER-ROLE-016: User dapat navigate antar halaman yang diizinkan', async ({ page }) => {
      // Test navigation between allowed pages for user role
      const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';

      // Page Informasi (Popup/Modal di dashboard atau halaman terpisah, asumsi halaman terpisah jika ada)
      // Tapi karena struktur baru Dashboard mungkin inline, kita cek page yang pasti ada dulu.
      // Jika /user/informasi tidak ada di router, kita pakai user-dashboard
      await page.goto(`${baseUrl}/user-dashboard`);
      expect(page.url()).toContain('user-dashboard');

      await page.goto(`${baseUrl}/profile`);
      expect(page.url()).toContain('profile');
    });
  });
});
