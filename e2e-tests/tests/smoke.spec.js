import { test, expect } from '@playwright/test';
import { login } from '../utils/test-config.js';

/**
 * SMOKE TESTS - Quick verification
 * Tests paling basic untuk memastikan aplikasi accessible dan functional
 */

test.describe('Smoke Tests', () => {

    test('SMOKE-001: Application should be accessible', async ({ page }) => {
        await page.goto('/');

        // Should load without errors
        await expect(page).toHaveURL(/besti\.app/);

        // Page should have content
        const bodyText = await page.locator('body').textContent();
        expect(bodyText.length).toBeGreaterThan(50);

        console.log('✅ Application is accessible');
    });

    test('SMOKE-002: Login page should load', async ({ page }) => {
        await page.goto('/login');

        // Should have login form
        await expect(page.locator('input[name="identifier"]')).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();

        console.log('✅ Login page loads correctly');
    });

    test('SMOKE-003: Admin can login', async ({ page }) => {
        await login(page, 'admin');

        // Should redirect to dashboard
        await expect(page).toHaveURL(/dashboard/);

        // Dashboard should load
        await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });

        console.log('✅ Admin login successful');
    });

    test('SMOKE-004: User can login', async ({ page }) => {
        await login(page, 'user');

        // Should redirect to dashboard
        await expect(page).toHaveURL(/dashboard/);

        // Dashboard should load
        await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });

        console.log('✅ User login successful');
    });

    test('SMOKE-005: Invalid login should fail', async ({ page }) => {
        await page.goto('/login');

        await page.fill('input[name="identifier"]', 'wronguser');
        await page.fill('input[type="password"]', 'wrongpass');
        await page.click('button[type="submit"]');

        await page.waitForTimeout(2000);

        // Should NOT redirect to dashboard
        expect(page.url()).not.toContain('dashboard');

        console.log('✅ Invalid login correctly rejected');
    });
});
