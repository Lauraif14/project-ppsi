class DashboardPage {
  constructor(page) {
    this.page = page;
    this.logoutButton = page.locator('button:has-text("Keluar")');
    this.userMenu = page.locator('[class*="user"], [class*="profile"], [class*="avatar"]');
    this.dashboardTitle = page.locator('h1, h2, .dashboard-title');
  }

  async isDashboardLoaded() {
    await this.page.waitForLoadState('networkidle');
    const url = this.page.url();
    return url.includes('dashboard') || url.includes('admin') || url.includes('user');
  }

  async navigateTo(path) {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }

  async logout() {
    // Handle browser confirmation dialog
    this.page.on('dialog', dialog => dialog.accept());
    
    // Try to click user menu first if it exists
    try {
      if (await this.userMenu.isVisible({ timeout: 2000 })) {
        await this.userMenu.click();
      }
    } catch (e) {
      // User menu doesn't exist, proceed to logout button
    }
    
    await this.logoutButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async getDashboardTitle() {
    if (await this.dashboardTitle.isVisible()) {
      return await this.dashboardTitle.textContent();
    }
    return null;
  }
}

module.exports = DashboardPage;
