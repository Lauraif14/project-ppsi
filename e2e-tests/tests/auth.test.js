const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const DashboardPage = require('../pages/DashboardPage');

require('dotenv').config();

test.describe('Authentication Flow Tests', () => {
  let loginPage;
  let dashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    await loginPage.goto();
  });

  test.describe('Login Tests', () => {
    test('TC-AUTH-001: Login dengan kredensial admin yang valid', async ({ page }) => {
      const adminEmail = process.env.TEST_ADMIN_EMAIL || 'admin';
      const adminPassword = process.env.TEST_ADMIN_PASSWORD || '123456';

      await loginPage.login(adminEmail, adminPassword);
      
      const isLoggedIn = await loginPage.isLoggedIn();
      expect(isLoggedIn).toBe(true);
      
      const isDashboardLoaded = await dashboardPage.isDashboardLoaded();
      expect(isDashboardLoaded).toBe(true);
    });

    test('TC-AUTH-002: Login dengan kredensial user yang valid', async ({ page }) => {
      const userEmail = process.env.TEST_USER_EMAIL || 'laura';
      const userPassword = process.env.TEST_USER_PASSWORD || '123456';

      await loginPage.login(userEmail, userPassword);
      
      const isLoggedIn = await loginPage.isLoggedIn();
      expect(isLoggedIn).toBe(true);
    });

    test('TC-AUTH-003: Login dengan identifier yang salah', async ({ page }) => {
      await loginPage.login('wrongidentifier', 'password123');
      
      await page.waitForTimeout(2000);
      
      const isLoggedIn = await loginPage.isLoggedIn();
      expect(isLoggedIn).toBe(false);
    });

    test('TC-AUTH-004: Login dengan password yang salah', async ({ page }) => {
      const adminEmail = process.env.TEST_ADMIN_EMAIL || 'admin';
      
      await loginPage.login(adminEmail, 'wrongpassword');
      
      await page.waitForTimeout(2000);
      
      const isLoggedIn = await loginPage.isLoggedIn();
      expect(isLoggedIn).toBe(false);
    });

    test('TC-AUTH-005: Login dengan field kosong', async ({ page }) => {
      await loginPage.login('', '');
      
      await page.waitForTimeout(1000);
      
      const isLoggedIn = await loginPage.isLoggedIn();
      expect(isLoggedIn).toBe(false);
    });

    test('TC-AUTH-006: Login dengan identifier kosong', async ({ page }) => {
      await loginPage.login('', 'somepassword');
      
      await page.waitForTimeout(1000);
      
      const isLoggedIn = await loginPage.isLoggedIn();
      expect(isLoggedIn).toBe(false);
    });
  });

  test.describe('Logout Tests', () => {
    test('TC-AUTH-007: Logout dari aplikasi', async ({ page }) => {
      const adminEmail = process.env.TEST_ADMIN_EMAIL || 'admin';
      const adminPassword = process.env.TEST_ADMIN_PASSWORD || '123456';

      await loginPage.login(adminEmail, adminPassword);
      await page.waitForTimeout(2000);
      
      await dashboardPage.logout();
      
      await page.waitForTimeout(2000);
      const currentUrl = page.url();
      const isLoggedOut = currentUrl.includes('/login');
      
      expect(isLoggedOut).toBe(true);
    });

    test('TC-AUTH-008: Akses halaman protected setelah logout', async ({ page }) => {
      const adminEmail = process.env.TEST_ADMIN_EMAIL || 'admin';
      const adminPassword = process.env.TEST_ADMIN_PASSWORD || '123456';

      await loginPage.login(adminEmail, adminPassword);
      await page.waitForTimeout(2000);
      await dashboardPage.logout();
      await page.waitForTimeout(2000);
      
      await dashboardPage.navigateTo('/admin-dashboard');
      await page.waitForTimeout(2000);
      
      const currentUrl = page.url();
      const redirectedToLogin = currentUrl.includes('/login');
      
      expect(redirectedToLogin).toBe(true);
    });
  });

  test.describe('Session Management Tests', () => {
    test('TC-AUTH-009: Session persistence setelah refresh', async ({ page }) => {
      const adminEmail = process.env.TEST_ADMIN_EMAIL || 'admin';
      const adminPassword = process.env.TEST_ADMIN_PASSWORD || '123456';

      await loginPage.login(adminEmail, adminPassword);
      await page.waitForTimeout(2000);
      
      await page.reload();
      await page.waitForTimeout(2000);
      
      const currentUrl = page.url();
      const stillLoggedIn = !currentUrl.includes('/login');
      
      expect(stillLoggedIn).toBe(true);
    });
  });
});
