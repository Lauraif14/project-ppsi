class AbsensiPage {
  constructor(page) {
    this.page = page;
    this.tanggalInput = page.locator('input[name="tanggal"], input[type="date"]');
    this.jamMasukInput = page.locator('input[name="jam_masuk"]');
    this.jamKeluarInput = page.locator('input[name="jam_keluar"]');
    this.keteranganTextarea = page.locator('textarea[name="keterangan"]');
    this.fotoInput = page.locator('input[type="file"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.absensiTable = page.locator('table');
    this.filterSelect = page.locator('select[name="filter"]');
  }

  async goto() {
    await this.page.goto('/absensi');
    await this.page.waitForLoadState('networkidle');
  }

  async fillAbsensiForm(data) {
    if (data.tanggal) {
      await this.tanggalInput.fill(data.tanggal);
    }
    if (data.jam_masuk) {
      await this.jamMasukInput.fill(data.jam_masuk);
    }
    if (data.jam_keluar) {
      await this.jamKeluarInput.fill(data.jam_keluar);
    }
    if (data.keterangan) {
      await this.keteranganTextarea.fill(data.keterangan);
    }
    if (data.foto) {
      await this.fotoInput.setInputFiles(data.foto);
    }
  }

  async submitForm() {
    await this.submitButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async filterByDate(date) {
    await this.filterSelect.selectOption({ value: date });
    await this.page.waitForTimeout(1000);
  }

  async getAbsensiCount() {
    const rows = await this.absensiTable.locator('tbody tr').count();
    return rows;
  }

  async isAbsensiInTable(date) {
    const row = this.page.locator(`tr:has-text("${date}")`);
    return await row.isVisible();
  }
}

module.exports = AbsensiPage;
