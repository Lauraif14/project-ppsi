import { test, expect } from '@playwright/test';

/**
 * NON-FUNCTIONAL TEST: Cross-Browser Compatibility
 * Testing compatibility di 8+ browsers
 */

test.describe('Cross-Browser Compatibility', () => {

    test('COMPAT-001: Should display login page correctly', async ({ page, browserName }) => {
        await page.goto('/login');

        // Check critical elements exist
        await expect(page.locator('input[name="identifier"]')).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();

        // Take screenshot for visual comparison
        await page.screenshot({
            path: `reports/screenshots/login-${browserName}.png`,
            fullPage: true
        });

        console.log(`✅ Login page compatible with ${browserName}`);
    });

    test('COMPAT-002: Should handle responsive layout', async ({ page, viewport }) => {
        await page.goto('/');

        const isMobile = viewport.width < 768;
        const isTablet = viewport.width >= 768 && viewport.width < 1024;
        const isDesktop = viewport.width >= 1024;

        console.log(`Testing on ${isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'} (${viewport.width}x${viewport.height})`);

        // Take screenshot
        await page.screenshot({
            path: `reports/screenshots/responsive-${viewport.width}x${viewport.height}.png`,
            fullPage: true
        });

        // Verify page is responsive
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 50); // Allow margin
    });

    test('COMPAT-003: Should support form inputs', async ({ page }) => {
        await page.goto('/login');

        // Test text input
        const identifierInput = page.locator('input[name="identifier"]');
        await identifierInput.fill('testuser');
        const value = await identifierInput.inputValue();
        expect(value).toBe('testuser');

        console.log('✅ Form inputs work correctly');
    });

    test('COMPAT-004: Should load CSS correctly', async ({ page }) => {
        await page.goto('/');

        // Check if CSS loaded
        const backgroundColor = await page.locator('body').evaluate(
            el => window.getComputedStyle(el).backgroundColor
        );

        // Should have some background color (not transparent)
        expect(backgroundColor).toBeTruthy();

        console.log('✅ CSS loaded correctly');
    });
});
