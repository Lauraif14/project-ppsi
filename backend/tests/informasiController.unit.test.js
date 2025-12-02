// backend/tests/informasiController.unit.test.js
const fs = require('fs');
const { InformasiController } = require('../controllers/informasiController');

// helper res mock
function createRes() {
  return {
    json: jest.fn(),
    status: jest.fn().mockReturnThis(),
  };
}

describe('InformasiController (unit)', () => {
  let mockDb;
  let controller;

  beforeEach(() => {
    mockDb = {
      query: jest.fn(),
    };
    controller = new InformasiController(mockDb);
  });

  afterEach(() => {                         // ⬅️ UPDATED
    jest.clearAllMocks();                   // ⬅️ UPDATED
    jest.restoreAllMocks();                 // ⬅️ UPDATED
  });                                       // ⬅️ UPDATED

  // ---------- getAllInformasi ----------
  test('getAllInformasi - tanpa kategori, mengembalikan data', async () => {
    const rows = [{ id: 1, judul: 'Tes 1' }];
    mockDb.query.mockResolvedValue([rows]);

    const req = { query: {} };
    const res = createRes();

    await controller.getAllInformasi(req, res);

    expect(mockDb.query).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ data: rows });
  });

  test('getAllInformasi - dengan kategori, query memakai WHERE', async () => {
    const rows = [{ id: 2, judul: 'Panduan' }];
    mockDb.query.mockResolvedValue([rows]);

    const req = { query: { kategori: 'Panduan' } };
    const res = createRes();

    await controller.getAllInformasi(req, res);

    expect(mockDb.query).toHaveBeenCalledWith(
      expect.stringContaining('WHERE kategori = ?'),
      ['Panduan']
    );
    expect(res.json).toHaveBeenCalledWith({ data: rows });
  });

  test('getAllInformasi - error DB, harus return 500', async () => {
    mockDb.query.mockRejectedValue(new Error('DB error'));

    const req = { query: {} };
    const res = createRes();

    await controller.getAllInformasi(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Gagal mengambil informasi.' });
  });

  // ---------- createInformasi ----------
  test('createInformasi - dengan file upload', async () => {
    const insertResult = { insertId: 10 };
    const newRow = [{ id: 10, judul: 'Baru', file_path: 'uploads/informasi/file.pdf' }];

    mockDb.query
      .mockResolvedValueOnce([insertResult]) // insert
      .mockResolvedValueOnce([newRow]);      // select by id

    const req = {
      body: { judul: 'Baru', isi: 'Isi', kategori: 'SOP' },
      file: { filename: 'file.pdf' },
    };
    const res = createRes();

    await controller.createInformasi(req, res);

    expect(mockDb.query).toHaveBeenNthCalledWith(
      1,
      'INSERT INTO informasi (judul, isi, kategori, file_path) VALUES (?, ?, ?, ?)',
      ['Baru', 'Isi', 'SOP', expect.stringContaining('uploads/informasi/file.pdf')]
    );
    expect(mockDb.query).toHaveBeenNthCalledWith(
      2,
      'SELECT * FROM informasi WHERE id = ?',
      [10]
    );
    expect(res.json).toHaveBeenCalledWith({
      message: 'Informasi dibuat.',
      data: newRow[0],
    });
  });

  test('createInformasi - tanpa file, kategori default', async () => {
    const insertResult = { insertId: 11 };
    const newRow = [{ id: 11, judul: 'Tanpa File', file_path: null }];

    mockDb.query
      .mockResolvedValueOnce([insertResult])
      .mockResolvedValueOnce([newRow]);

    const req = {
      body: { judul: 'Tanpa File', isi: null, kategori: null },
      file: null,
    };
    const res = createRes();

    await controller.createInformasi(req, res);

    expect(mockDb.query).toHaveBeenNthCalledWith(
      1,
      'INSERT INTO informasi (judul, isi, kategori, file_path) VALUES (?, ?, ?, ?)',
      ['Tanpa File', null, 'Informasi Lain', null]
    );
    expect(res.json).toHaveBeenCalledWith({
      message: 'Informasi dibuat.',
      data: newRow[0],
    });
  });

  test('createInformasi - error DB', async () => {
    mockDb.query.mockRejectedValue(new Error('Insert gagal'));

    const req = {
      body: { judul: 'Err', isi: 'x', kategori: 'SOP' },
      file: null,
    };
    const res = createRes();

    await controller.createInformasi(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Gagal membuat informasi.' });
  });

  // ---------- updateInformasi ----------
  test('updateInformasi - data tidak ditemukan', async () => {
    mockDb.query.mockResolvedValueOnce([[]]); // select existing

    const req = {
      params: { id: '1' },
      body: { judul: 'Baru', isi: 'Isi', kategori: 'SOP' },
      file: null,
    };
    const res = createRes();

    await controller.updateInformasi(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Informasi tidak ditemukan.' });
  });

  test('updateInformasi - update tanpa file', async () => {
    const existing = [{ id: 1, judul: 'Lama', file_path: null }];
    const updated = [{ id: 1, judul: 'Baru', file_path: null }];

    mockDb.query
      .mockResolvedValueOnce([existing]) // select existing
      .mockResolvedValueOnce([])        // update
      .mockResolvedValueOnce([updated]); // select updated

    const req = {
      params: { id: '1' },
      body: { judul: 'Baru', isi: 'Isi baru', kategori: 'Panduan' },
      file: null,
    };
    const res = createRes();

    await controller.updateInformasi(req, res);

    expect(mockDb.query).toHaveBeenNthCalledWith(
      2,
      'UPDATE informasi SET judul=?, isi=?, kategori=? WHERE id=?',
      ['Baru', 'Isi baru', 'Panduan', '1']
    );
    expect(res.json).toHaveBeenCalledWith({
      message: 'Informasi diupdate.',
      data: updated[0],
    });
  });

  test('updateInformasi - update dengan file & hapus file lama jika ada', async () => {
    const existing = [{
      id: 1,
      judul: 'Lama',
      file_path: 'uploads/informasi/old.pdf',
    }];
    const updated = [{
      id: 1,
      judul: 'Baru',
      file_path: 'uploads/informasi/new.pdf',
    }];

    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {});

    mockDb.query
      .mockResolvedValueOnce([existing]) // select existing
      .mockResolvedValueOnce([])        // update
      .mockResolvedValueOnce([updated]); // select updated

    const req = {
      params: { id: '1' },
      body: { judul: 'Baru', isi: 'Isi baru', kategori: 'SOP' },
      file: { filename: 'new.pdf' },
    };
    const res = createRes();

    await controller.updateInformasi(req, res);

    expect(fs.existsSync).toHaveBeenCalled();
    expect(fs.unlinkSync).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      message: 'Informasi diupdate.',
      data: updated[0],
    });
  });

  // test untuk cabang "file lama tidak ditemukan"
  test('updateInformasi - file lama tidak ada di disk, log warning', async () => {
    const existing = [{
      id: 1,
      judul: 'Lama',
      file_path: 'uploads/informasi/missing.pdf',
    }];
    const updated = [{
      id: 1,
      judul: 'Baru',
      file_path: 'uploads/informasi/new.pdf',
    }];

    jest.spyOn(fs, 'existsSync').mockReturnValue(false);
    const unlinkSpy = jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {});
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    mockDb.query
      .mockResolvedValueOnce([existing])  // select existing
      .mockResolvedValueOnce([])          // update
      .mockResolvedValueOnce([updated]);  // select updated

    const req = {
      params: { id: '1' },
      body: { judul: 'Baru', isi: 'Isi baru', kategori: 'SOP' },
      file: { filename: 'new.pdf' },
    };
    const res = createRes();

    await controller.updateInformasi(req, res);

    expect(fs.existsSync).toHaveBeenCalled();
    expect(unlinkSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(
      'Old file tidak ditemukan (tidak dihapus):',
      expect.any(String)
    );
    expect(res.json).toHaveBeenCalledWith({
      message: 'Informasi diupdate.',
      data: updated[0],
    });
  });

  // ⬇️ Test baru: fs.unlinkSync throw error (Gagal menghapus file lama)
  test('updateInformasi - gagal hapus file lama, tetapi update tetap berjalan', async () => {
    const existing = [{
      id: 1,
      judul: 'Lama',
      file_path: 'uploads/informasi/old.pdf',
    }];
    const updated = [{
      id: 1,
      judul: 'Baru',
      file_path: 'uploads/informasi/new.pdf',
    }];

    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {
      throw new Error('FS unlink error');
    });
    const errorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    mockDb.query
      .mockResolvedValueOnce([existing]) // select existing
      .mockResolvedValueOnce([])         // update
      .mockResolvedValueOnce([updated]); // select updated

    const req = {
      params: { id: '1' },
      body: { judul: 'Baru', isi: 'Isi baru', kategori: 'SOP' },
      file: { filename: 'new.pdf' },
    };
    const res = createRes();

    await controller.updateInformasi(req, res);

    expect(errorSpy).toHaveBeenCalledWith(
      'Gagal menghapus file lama:',
      expect.any(Error)
    );
    expect(mockDb.query).toHaveBeenNthCalledWith(
      2,
      'UPDATE informasi SET judul=?, isi=?, kategori=?, file_path=? WHERE id=?',
      ['Baru', 'Isi baru', 'SOP', expect.stringContaining('uploads/informasi/new.pdf'), '1']
    );
    expect(res.json).toHaveBeenCalledWith({
      message: 'Informasi diupdate.',
      data: updated[0],
    });
  });

  test('updateInformasi - error DB', async () => {
    const existing = [{ id: 1, judul: 'Lama', file_path: null }];
    mockDb.query
      .mockResolvedValueOnce([existing])
      .mockRejectedValueOnce(new Error('Update gagal'));

    const req = {
      params: { id: '1' },
      body: { judul: 'Baru', isi: 'x', kategori: 'SOP' },
      file: null,
    };
    const res = createRes();

    await controller.updateInformasi(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Gagal mengupdate informasi.' });
  });

  // ---------- deleteInformasi ----------
  test('deleteInformasi - data tidak ditemukan', async () => {
    mockDb.query.mockResolvedValueOnce([[]]); // select

    const req = { params: { id: '1' } };
    const res = createRes();

    await controller.deleteInformasi(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Informasi tidak ditemukan.' });
  });

  test('deleteInformasi - dengan file_path, hapus file', async () => {
    const existing = [{
      id: 1,
      file_path: 'uploads/informasi/file.pdf',
    }];

    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {});

    mockDb.query
      .mockResolvedValueOnce([existing]) // select
      .mockResolvedValueOnce([]);        // delete

    const req = { params: { id: '1' } };
    const res = createRes();

    await controller.deleteInformasi(req, res);

    expect(fs.existsSync).toHaveBeenCalled();
    expect(fs.unlinkSync).toHaveBeenCalled();
    expect(mockDb.query).toHaveBeenCalledWith(
      'DELETE FROM informasi WHERE id = ?',
      ['1']
    );
    expect(res.json).toHaveBeenCalledWith({
      message: 'Informasi berhasil dihapus.',
    });
  });

  // test untuk cabang "file to delete tidak ditemukan"
  test('deleteInformasi - file tidak ada di disk, log warning', async () => {
    const existing = [{
      id: 1,
      file_path: 'uploads/informasi/missing.pdf',
    }];

    jest.spyOn(fs, 'existsSync').mockReturnValue(false);
    const unlinkSpy = jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {});
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    mockDb.query
      .mockResolvedValueOnce([existing]) // select
      .mockResolvedValueOnce([]);        // delete

    const req = { params: { id: '1' } };
    const res = createRes();

    await controller.deleteInformasi(req, res);

    expect(fs.existsSync).toHaveBeenCalled();
    expect(unlinkSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(
      'File to delete tidak ditemukan:',
      expect.any(String)
    );
    expect(mockDb.query).toHaveBeenCalledWith(
      'DELETE FROM informasi WHERE id = ?',
      ['1']
    );
    expect(res.json).toHaveBeenCalledWith({
      message: 'Informasi berhasil dihapus.',
    });
  });

  // ⬇️ Test baru: fs.unlinkSync throw error (Gagal menghapus file sebelum delete DB)
  test('deleteInformasi - gagal hapus file di disk, tetapi delete DB tetap berjalan', async () => {
    const existing = [{
      id: 1,
      file_path: 'uploads/informasi/file.pdf',
    }];

    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {
      throw new Error('FS unlink error');
    });
    const errorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    mockDb.query
      .mockResolvedValueOnce([existing]) // select
      .mockResolvedValueOnce([]);        // delete

    const req = { params: { id: '1' } };
    const res = createRes();

    await controller.deleteInformasi(req, res);

    expect(errorSpy).toHaveBeenCalledWith(
      'Gagal menghapus file sebelum delete DB:',
      expect.any(Error)
    );
    expect(mockDb.query).toHaveBeenCalledWith(
      'DELETE FROM informasi WHERE id = ?',
      ['1']
    );
    expect(res.json).toHaveBeenCalledWith({
      message: 'Informasi berhasil dihapus.',
    });
  });

  test('deleteInformasi - error DB', async () => {
    const existing = [{ id: 1, file_path: null }];

    mockDb.query
      .mockResolvedValueOnce([existing]) // select
      .mockRejectedValueOnce(new Error('Delete gagal'));

    const req = { params: { id: '1' } };
    const res = createRes();

    await controller.deleteInformasi(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Gagal menghapus informasi.' });
  });
});
