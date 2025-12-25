import { defineConfig, devices } from '@playwright/test';

/**
 * E2E Testing Configuration untuk Sistem Piket Sekretariat Informatika
 * URL Production: https://besti.app atau https://www.besti.app
 */

export default defineConfig({
    testDir: './tests',

    // Timeout untuk setiap test
    timeout: 60 * 1000, // 60 seconds

    // Expect timeout
    expect: {
        timeout: 10 * 1000, // 10 seconds
    },

    // Retry failed tests
    retries: process.env.CI ? 2 : 1,

    // Run tests in parallel
    workers: process.env.CI ? 2 : 4,

    // Reporter configuration
    reporter: [
        ['html', {
            outputFolder: 'reports/playwright-report',
            open: 'never'
        }],
        ['json', {
            outputFile: 'reports/test-results.json'
        }],
        ['junit', {
            outputFile: 'reports/junit-results.xml'
        }],
        ['list']
    ],

    // Global test configuration
    use: {
        // Base URL - Production
        baseURL: 'https://www.besti.app',

        // Browser options
        headless: true,
        viewport: { width: 1920, height: 1080 },

        // Screenshots
        screenshot: 'only-on-failure',

        // Videos
        video: 'retain-on-failure',

        // Traces
        trace: 'on-first-retry',

        // Action timeout
        actionTimeout: 15 * 1000,

        // Navigation timeout
        navigationTimeout: 30 * 1000,
    },

    // Test projects untuk berbagai browser (8+ browsers)
    projects: [
        // ========== DESKTOP BROWSERS ==========
        {
            name: 'Chrome Latest',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 1920, height: 1080 },
            },
        },

        {
            name: 'Firefox Latest',
            use: {
                ...devices['Desktop Firefox'],
                viewport: { width: 1920, height: 1080 },
            },
        },


        {
            name: 'Safari Latest',
            use: {
                ...devices['Desktop Safari'],
                viewport: { width: 1920, height: 1080 },
            },
        },

        {
            name: 'Edge Latest',
            use: {
                ...devices['Desktop Edge'],
                viewport: { width: 1920, height: 1080 },
            },
        },

        // ========== MOBILE BROWSERS ==========
        {
            name: 'Mobile Chrome',
            use: {
                ...devices['Pixel 5'],
            },
        },

        {
            name: 'Mobile Safari',
            use: {
                ...devices['iPhone 13'],
            },
        },

        // ========== TABLET ==========
        {
            name: 'iPad',
            use: {
                ...devices['iPad Pro'],
            },
        },

        {
            name: 'Galaxy S21',
            use: {
                ...devices['Galaxy S21'],
            },
        },
    ],
});
