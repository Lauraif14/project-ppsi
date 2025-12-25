class LaporanPage {
  constructor(page) {
    this.page = page;
    this.addButton = page.locator('button:has-text("Tambah"), button:has-text("Add")');
    this.judulInput = page.locator('input[name="judul"]');
    this.isiTextarea = page.locator('textarea[name="isi"]');
    this.tanggalInput = page.locator('input[name="tanggal"], input[type="date"]');
    this.kategoriSelect = page.locator('select[name="kategori"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.laporanTable = page.locator('table');
    this.filterSelect = page.locator('select[name="filter"]');
  }

  async goto() {
    await this.page.goto('/laporan');
    await this.page.waitForLoadState('networkidle');
  }

  async clickAddLaporan() {
    await this.addButton.click();
  }

  async fillLaporanForm(data) {
    if (data.judul) {
      await this.judulInput.fill(data.judul);
    }
    if (data.isi) {
      await this.isiTextarea.fill(data.isi);
    }
    if (data.tanggal) {
      await this.tanggalInput.fill(data.tanggal);
    }
    if (data.kategori) {
      await this.kategoriSelect.selectOption(data.kategori);
    }
  }

  async submitForm() {
    await this.submitButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async filterByKategori(kategori) {
    await this.filterSelect.selectOption(kategori);
    await this.page.waitForTimeout(1000);
  }

  async getLaporanCount() {
    const rows = await this.laporanTable.locator('tbody tr').count();
    return rows;
  }

  async isLaporanInTable(judul) {
    const row = this.page.locator(`tr:has-text("${judul}")`);
    return await row.isVisible();
  }

  async clickViewLaporan(judul) {
    const row = this.page.locator(`tr:has-text("${judul}")`);
    await row.locator('button:has-text("Lihat"), a:has-text("Lihat")').click();
  }

  async clickEditLaporan(judul) {
    const row = this.page.locator(`tr:has-text("${judul}")`);
    await row.locator('button:has-text("Edit")').click();
  }

  async clickDeleteLaporan(judul) {
    const row = this.page.locator(`tr:has-text("${judul}")`);
    await row.locator('button:has-text("Hapus")').click();
  }

  async confirmDelete() {
    this.page.on('dialog', dialog => dialog.accept());
    await this.page.waitForTimeout(500);
  }

  // Cleanup method: delete laporan by judul
  async deleteLaporanByJudul(judul) {
    try {
      // Check if laporan exists
      const laporanExists = await this.isLaporanInTable(judul);
      if (!laporanExists) {
        console.log(`Laporan ${judul} not found, skip deletion`);
        return;
      }

      // Click delete button
      await this.clickDeleteLaporan(judul);
      
      // Handle browser confirmation dialog
      this.page.once('dialog', async dialog => {
        await dialog.accept();
      });
      
      await this.page.waitForTimeout(2000);
      console.log(`Cleaned up laporan: ${judul}`);
    } catch (error) {
      console.log(`Failed to cleanup laporan ${judul}:`, error.message);
    }
  }
}

module.exports = LaporanPage;
