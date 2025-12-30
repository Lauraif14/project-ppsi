class InformasiPage {
  constructor(page) {
    this.page = page;
    this.addButton = page.locator('button:has-text("Tambah"), button:has-text("Add")');
    this.judulInput = page.locator('input[name="judul"]');
    this.isiTextarea = page.locator('textarea[name="isi"]');
    this.tanggalInput = page.locator('input[name="tanggal"], input[type="date"]');
    this.prioritasSelect = page.locator('select[name="prioritas"]');
    this.submitButton = page.locator('button[type="submit"]');
    // InformationPage uses cards, not tables
    this.informasiCards = page.locator('.border-2.rounded-xl, [class*="Card"]');
    this.documentCards = page.locator('text=SOP Piket, text=Job Desk Piket').locator('..');
    this.mainContent = page.locator('main');
  }

  async goto() {
    await this.page.goto('/informasi-piket');
    await this.page.waitForLoadState('networkidle');
  }

  async clickAddInformasi() {
    await this.addButton.click();
  }

  async fillInformasiForm(data) {
    if (data.judul) {
      await this.judulInput.fill(data.judul);
    }
    if (data.isi) {
      await this.isiTextarea.fill(data.isi);
    }
    if (data.tanggal) {
      await this.tanggalInput.fill(data.tanggal);
    }
    if (data.prioritas) {
      await this.prioritasSelect.selectOption(data.prioritas);
    }
  }

  async submitForm() {
    await this.submitButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async getInformasiCount() {
    // InformationPage uses cards, not tables
    return await this.informasiCards.count();
  }

  async isInformasiVisible(judul) {
    const element = this.page.locator(`text=${judul}`);
    return await element.isVisible();
  }

  async clickEditInformasi(judul) {
    const container = this.page.locator(`.card:has-text("${judul}"), [class*="Card"]:has-text("${judul}")`);
    await container.locator('button:has-text("Edit")').click();
  }

  async clickDeleteInformasi(judul) {
    const container = this.page.locator(`.card:has-text("${judul}"), [class*="Card"]:has-text("${judul}")`);
    await container.locator('button:has-text("Hapus")').click();
  }

  async confirmDelete() {
    this.page.on('dialog', dialog => dialog.accept());
    await this.page.waitForTimeout(500);
  }
}

module.exports = InformasiPage;
