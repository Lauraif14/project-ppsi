class UserPage {
  constructor(page) {
    this.page = page;
    this.addButton = page.locator('button:has-text("Tambah Pengurus")');
    // Modal tambah menggunakan name attribute
    this.namaLengkapInput = page.locator('input[name="nama_lengkap"]');
    this.usernameInput = page.locator('input[name="username"]');
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.confirmPasswordInput = page.locator('input[name="confirmPassword"]');
    this.jabatanSelect = page.locator('select[name="jabatan"]');
    this.divisiSelect = page.locator('select[name="divisi"]');
    // Modal edit tidak menggunakan name attribute, gunakan label
    this.namaLengkapInputEdit = page.locator('text=Nama Lengkap').locator('..').locator('input');
    this.usernameInputEdit = page.locator('text=Username').locator('..').locator('input');
    this.emailInputEdit = page.locator('text=Email').locator('..').locator('input');
    this.jabatanSelectEdit = page.locator('text=Jabatan').locator('..').locator('select');
    this.divisiSelectEdit = page.locator('text=Divisi').locator('..').locator('select');
    this.submitButton = page.locator('button[type="submit"]');
    this.searchInput = page.locator('input[type="search"], input[placeholder*="Cari"]');
    this.userTable = page.locator('table');
    this.successMessage = page.locator('.alert-success, .success-message');
  }

  async goto() {
    await this.page.goto('/master');
    await this.page.waitForLoadState('networkidle');
  }

  async clickAddUser() {
    await this.addButton.click();
  }

  async fillUserForm(userData, isEdit = false) {
    // Use different selectors for edit modal (no name attributes)
    const namaInput = isEdit ? this.namaLengkapInputEdit : this.namaLengkapInput;
    const userInput = isEdit ? this.usernameInputEdit : this.usernameInput;
    const emailInp = isEdit ? this.emailInputEdit : this.emailInput;
    const jabatanSel = isEdit ? this.jabatanSelectEdit : this.jabatanSelect;
    const divisiSel = isEdit ? this.divisiSelectEdit : this.divisiSelect;
    
    if (userData.nama_lengkap) {
      await namaInput.fill(userData.nama_lengkap);
    }
    if (userData.username) {
      await userInput.fill(userData.username);
    }
    if (userData.email) {
      await emailInp.fill(userData.email);
    }
    if (userData.password && !isEdit) {
      // Password only for add, not edit
      await this.passwordInput.fill(userData.password);
      await this.confirmPasswordInput.fill(userData.password);
    }
    if (userData.jabatan) {
      await jabatanSel.selectOption(userData.jabatan);
    }
    if (userData.divisi) {
      await divisiSel.selectOption(userData.divisi);
    }
  }

  async submitForm() {
    await this.submitButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async searchUser(query) {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(1000); // Wait for search results
  }

  async getUserRow(identifier) {
    return this.page.locator(`tr:has-text("${identifier}")`);
  }

  async isUserInTable(identifier) {
    const row = await this.getUserRow(identifier);
    return await row.isVisible();
  }

  async clickEditUser(identifier) {
    const row = await this.getUserRow(identifier);
    // Button uses icon (Pencil) with title="Edit pengurus", not text
    await row.locator('button[title*="Edit"]').first().click();
  }

  async clickDeleteUser(identifier) {
    const row = await this.getUserRow(identifier);
    // Button uses icon (Trash2) with title="Hapus pengurus", not text
    await row.locator('button[title*="Hapus"]').first().click();
  }

  async confirmDelete() {
    // Handle confirmation dialog
    this.page.on('dialog', dialog => dialog.accept());
    await this.page.waitForTimeout(500);
  }

  async getSuccessMessage() {
    if (await this.successMessage.isVisible()) {
      return await this.successMessage.textContent();
    }
    return null;
  }

  // Cleanup method: delete user by username
  async deleteUserByUsername(username) {
    try {
      // Search for user first
      await this.searchUser(username);
      await this.page.waitForTimeout(1000);
      
      // Check if user exists
      const userExists = await this.isUserInTable(username);
      if (!userExists) {
        console.log(`User ${username} not found, skip deletion`);
        return;
      }

      // Click delete button and confirm
      await this.clickDeleteUser(username);
      
      // Handle browser confirmation dialog
      this.page.once('dialog', async dialog => {
        await dialog.accept();
      });
      
      await this.page.waitForTimeout(2000);
      console.log(`Cleaned up user: ${username}`);
    } catch (error) {
      console.log(`Failed to cleanup user ${username}:`, error.message);
    }
  }
}

module.exports = UserPage;
