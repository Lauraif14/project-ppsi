const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',

  // Maximum time one test can run
  timeout: 60 * 1000,

  // Test configuration
  expect: {
    timeout: 10000
  },

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : 4,

  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list']
  ],

  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // Browser viewport
    viewport: { width: 1920, height: 1080 },

    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,

    // Timeout for each action
    actionTimeout: 10000,

    // Timeout for navigation
    navigationTimeout: 30000,
  },

  // Configure projects for major browsers
  projects: [
    /* -------------------------------------------------------------------------- */
    /*                              Desktop Browsers                              */
    /* -------------------------------------------------------------------------- */
    {
      name: 'Google Chrome',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome', // Use actual Chrome instead of Chromium
      },
    },
    {
      name: 'Firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },
    {
      name: 'Safari (WebKit)',
      use: {
        ...devices['Desktop Safari'],
      },
    },

    /* -------------------------------------------------------------------------- */
    /*                               Mobile Devices                               */
    /* -------------------------------------------------------------------------- */
    {
      name: 'Mobile Chrome (Pixel 7)',
      use: {
        ...devices['Pixel 7'],
      },
    },
    {
      name: 'Mobile Safari (iPhone 14)',
      use: {
        ...devices['iPhone 14'],
      },
    },
    {
      name: 'Small Mobile Safari (iPhone SE)',
      use: {
        ...devices['iPhone SE'],
      },
    },
    {
      name: 'Tablet Safari (iPad Pro)',
      use: {
        ...devices['iPad Pro 11'],
      },
    },

    /* -------------------------------------------------------------------------- */
    /*                            Other Desktop Browsers                          */
    /* -------------------------------------------------------------------------- */
    {
      name: 'Microsoft Edge',
      use: {
        ...devices['Desktop Edge'],
        channel: 'msedge',
      },
    },
  ],

  // Run your local dev server before starting the tests
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
