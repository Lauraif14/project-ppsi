/**
 * Test Configuration & Credentials
 * Centralized configuration untuk semua E2E tests
 */

export const config = {
    // Base URL
    baseURL: 'https://www.besti.app',

    // Test Credentials
    credentials: {
        admin: {
            username: 'admin',
            password: '123456'
        },
        user: {
            username: 'laura',
            password: '123456'
        }
    },

    // Timeouts
    timeouts: {
        navigation: 30000,
        action: 15000,
        assertion: 10000
    },

    // Selectors (update based on actual app structure)
    selectors: {
        login: {
            usernameInput: 'input[name="identifier"]',
            passwordInput: 'input[type="password"]',
            submitButton: 'button[type="submit"]'
        },
        dashboard: {
            title: 'h1, h2',
            nav: 'nav, aside',
            logoutButton: 'button:has-text("Logout"), a:has-text("Logout"), button:has-text("Keluar")'
        }
    }
};

// Helper function untuk login
export async function login(page, role = 'admin') {
    const creds = config.credentials[role];

    await page.goto('/login');
    await page.fill(config.selectors.login.usernameInput, creds.username);
    await page.fill(config.selectors.login.passwordInput, creds.password);
    await page.click(config.selectors.login.submitButton);

    // Wait for navigation to dashboard
    await page.waitForURL(/.*dashboard/, { timeout: config.timeouts.navigation });
}

// Helper function untuk logout
export async function logout(page) {
    const logoutBtn = page.locator(config.selectors.dashboard.logoutButton).first();

    if (await logoutBtn.isVisible().catch(() => false)) {
        await logoutBtn.click();
        await page.waitForURL(/.*login/, { timeout: config.timeouts.navigation });
    }
}
