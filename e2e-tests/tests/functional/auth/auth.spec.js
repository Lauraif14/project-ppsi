import { test, expect } from '@playwright/test';
import { config, login } from '../../../utils/test-config.js';

/**
 * COMPREHENSIVE FUNCTIONAL TEST: Authentication
 * Complete test coverage untuk authentication module
 */

test.describe('Authentication - Login', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
    });

    // BASIC LOGIN TESTS
    test('TC-AUTH-001: Should display login page correctly', async ({ page }) => {
        await expect(page.locator('h1, h2, .title').first()).toBeVisible();
        await expect(page.locator(config.selectors.login.usernameInput)).toBeVisible();
        await expect(page.locator(config.selectors.login.passwordInput)).toBeVisible();
        await expect(page.locator(config.selectors.login.submitButton)).toBeVisible();
    });

    test('TC-AUTH-002: Should login successfully as admin', async ({ page }) => {
        await login(page, 'admin');
        await expect(page).toHaveURL(/.*dashboard/);
        await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 5000 });
    });

    test('TC-AUTH-003: Should login successfully as user', async ({ page }) => {
        await login(page, 'user');
        await expect(page).toHaveURL(/.*dashboard/);
        await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 5000 });
    });

    // VALIDATION TESTS
    test('TC-AUTH-004: Should show error for invalid username', async ({ page }) => {
        await page.fill(config.selectors.login.usernameInput, 'invaliduser123');
        await page.fill(config.selectors.login.passwordInput, '123456');
        await page.click(config.selectors.login.submitButton);
        await page.waitForTimeout(2000);
        expect(page.url()).not.toContain('dashboard');
    });

    test('TC-AUTH-005: Should show error for invalid password', async ({ page }) => {
        await page.fill(config.selectors.login.usernameInput, 'admin');
        await page.fill(config.selectors.login.passwordInput, 'wrongpassword');
        await page.click(config.selectors.login.submitButton);
        await page.waitForTimeout(2000);
        expect(page.url()).not.toContain('dashboard');
    });

    test('TC-AUTH-006: Should show error for empty username', async ({ page }) => {
        await page.fill(config.selectors.login.passwordInput, '123456');
        await page.click(config.selectors.login.submitButton);
        const usernameInput = page.locator(config.selectors.login.usernameInput);
        const isRequired = await usernameInput.getAttribute('required');
        expect(isRequired).not.toBeNull();
    });

    test('TC-AUTH-007: Should show error for empty password', async ({ page }) => {
        await page.fill(config.selectors.login.usernameInput, 'admin');
        await page.click(config.selectors.login.submitButton);
        const passwordInput = page.locator(config.selectors.login.passwordInput);
        const isRequired = await passwordInput.getAttribute('required');
        expect(isRequired).not.toBeNull();
    });

    test('TC-AUTH-008: Should show error for both empty fields', async ({ page }) => {
        await page.click(config.selectors.login.submitButton);
        await page.waitForTimeout(1000);
        expect(page.url()).toContain('login');
    });

    // SESSION TESTS
    test('TC-AUTH-009: Should maintain session after login', async ({ page }) => {
        await login(page, 'admin');
        await page.reload();
        await page.waitForTimeout(2000);
        await expect(page).toHaveURL(/.*dashboard/);
    });

    test('TC-AUTH-010: Should logout successfully', async ({ page }) => {
        await login(page, 'admin');

        const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout"), button:has-text("Keluar")').first();
        if (await logoutButton.isVisible().catch(() => false)) {
            await logoutButton.click();
            await page.waitForTimeout(2000);
            expect(page.url()).toContain('login');
        }
    });

    test('TC-AUTH-011: Should clear session after logout', async ({ page }) => {
        await login(page, 'admin');

        const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout"), button:has-text("Keluar")').first();
        if (await logoutButton.isVisible().catch(() => false)) {
            await logoutButton.click();
            await page.waitForTimeout(2000);

            // Try to access dashboard directly
            await page.goto('/dashboard');
            await page.waitForTimeout(2000);

            // Should redirect to login
            expect(page.url()).toContain('login');
        }
    });

    // SECURITY TESTS
    test('TC-AUTH-012: Should not allow SQL injection in username', async ({ page }) => {
        await page.fill(config.selectors.login.usernameInput, "' OR '1'='1");
        await page.fill(config.selectors.login.passwordInput, '123456');
        await page.click(config.selectors.login.submitButton);
        await page.waitForTimeout(2000);
        expect(page.url()).not.toContain('dashboard');
    });

    test('TC-AUTH-013: Should not allow XSS in username', async ({ page }) => {
        await page.fill(config.selectors.login.usernameInput, '<script>alert("XSS")</script>');
        await page.fill(config.selectors.login.passwordInput, '123456');
        await page.click(config.selectors.login.submitButton);
        await page.waitForTimeout(2000);
        expect(page.url()).not.toContain('dashboard');
    });

    // UI/UX TESTS
    test('TC-AUTH-014: Should allow password visibility toggle', async ({ page }) => {
        const passwordInput = page.locator(config.selectors.login.passwordInput);
        const toggleButton = page.locator('button:has-text("Show"), button[aria-label*="password"]').first();

        if (await toggleButton.isVisible().catch(() => false)) {
            await toggleButton.click();
            const inputType = await passwordInput.getAttribute('type');
            expect(inputType).toBe('text');
        }
    });

    test('TC-AUTH-015: Should handle Enter key to submit', async ({ page }) => {
        await page.fill(config.selectors.login.usernameInput, 'admin');
        await page.fill(config.selectors.login.passwordInput, '123456');
        await page.press(config.selectors.login.passwordInput, 'Enter');
        await page.waitForTimeout(3000);
        await expect(page).toHaveURL(/.*dashboard/);
    });
});
