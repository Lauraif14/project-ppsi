class LoginPage {
  constructor(page) {
    this.page = page;
    this.identifierInput = page.locator('input[name="identifier"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('.error-message, .alert-danger, [role="alert"]');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(identifier, password) {
    await this.identifierInput.fill(identifier);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    
    // Wait for either navigation or error message
    await this.page.waitForLoadState('networkidle');
  }

  async isLoggedIn() {
    // Wait a bit for any redirects
    await this.page.waitForTimeout(1000);
    
    // Check if redirected from login page
    const url = this.page.url();
    return !url.includes('/login');
  }

  async getErrorMessage() {
    if (await this.errorMessage.isVisible()) {
      return await this.errorMessage.textContent();
    }
    return null;
  }
}

module.exports = LoginPage;
