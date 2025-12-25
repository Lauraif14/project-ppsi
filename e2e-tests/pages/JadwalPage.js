class JadwalPage {
  constructor(page) {
    this.page = page;
    this.addButton = page.locator('button:has-text("Tambah"), button:has-text("Add")');
    this.tanggalInput = page.locator('input[name="tanggal"], input[type="date"]');
    this.shiftSelect = page.locator('select[name="shift"]');
    this.petugasSelect = page.locator('select[name="petugas"]');
    this.lokasiInput = page.locator('input[name="lokasi"]');
    this.submitButton = page.locator('button[type="submit"]');
    // JadwalPiketPage displays schedule in day cards with tables inside
    this.jadwalTable = page.locator('table').first();
    this.scheduleCards = page.locator('.border-2.border-gray-800');
    this.calendar = page.locator('.calendar, [class*="calendar"]');
  }

  async goto() {
    await this.page.goto('/jadwal-piket');
    await this.page.waitForLoadState('networkidle');
  }

  async clickAddJadwal() {
    await this.addButton.click();
  }

  async fillJadwalForm(data) {
    if (data.tanggal) {
      await this.tanggalInput.fill(data.tanggal);
    }
    if (data.shift) {
      await this.shiftSelect.selectOption(data.shift);
    }
    if (data.petugas) {
      await this.petugasSelect.selectOption(data.petugas);
    }
    if (data.lokasi) {
      await this.lokasiInput.fill(data.lokasi);
    }
  }

  async submitForm() {
    await this.submitButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async getJadwalCount() {
    const rows = await this.jadwalTable.locator('tbody tr').count();
    return rows;
  }

  async isJadwalInTable(date) {
    const row = this.page.locator(`tr:has-text("${date}")`);
    return await row.isVisible();
  }

  async clickEditJadwal(date) {
    const row = this.page.locator(`tr:has-text("${date}")`);
    await row.locator('button:has-text("Edit")').click();
  }

  async clickDeleteJadwal(date) {
    const row = this.page.locator(`tr:has-text("${date}")`);
    await row.locator('button:has-text("Hapus")').click();
  }

  async confirmDelete() {
    this.page.on('dialog', dialog => dialog.accept());
    await this.page.waitForTimeout(500);
  }
}

module.exports = JadwalPage;
