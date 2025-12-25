// tests/models/informasiModel.test.js

// 1. Mock Database (MENGGANTIKAN KONEKSI DATABASE ASLI)
const db = require('../../db');

// Mocks database module (db.js)
jest.mock('../../db', () => ({
    query: jest.fn(),
    // Tidak perlu mock execute karena model ini hanya menggunakan db.query
}));

// 2. Import Model yang ingin diuji
const InformasiModel = require('../../models/informasiModel');

describe('InformasiModel', () => {

    const mockQuery = db.query;

    beforeEach(() => {
        // Clear mock calls sebelum setiap test
        mockQuery.mockClear();

        // Default mock untuk sukses
        mockQuery.mockResolvedValue([[]]);
    });

    // --- READ/SELECT OPERATIONS ---
    describe('Read/Select Operations', () => {

        test('getAll should select all info and apply default ordering', async () => {
            const mockRows = [{ id: 1, judul: 'SOP A' }];
            mockQuery.mockResolvedValue([mockRows]);

            await InformasiModel.getAll(undefined); // Tanpa kategori

            expect(mockQuery).toHaveBeenCalledTimes(1);

            // Verifikasi QUERY SQL (harus ada SELECT * FROM dan ORDER BY FIELD)
            const expectedSqlPattern = /SELECT \* FROM informasi ORDER BY FIELD\(kategori, "SOP", "Panduan", "Informasi Lain"\), created_at DESC/;
            expect(mockQuery.mock.calls[0][0]).toMatch(expectedSqlPattern);
            expect(mockQuery.mock.calls[0][1]).toEqual([]); // Parameter kosong
        });

        test('getAll should apply WHERE clause when kategori is provided', async () => {
            const mockKategori = 'Panduan';

            await InformasiModel.getAll(mockKategori);

            expect(mockQuery).toHaveBeenCalledTimes(1);

            // Verifikasi QUERY SQL (harus ada WHERE dan ORDER BY)
            const expectedSqlPattern = /SELECT \* FROM informasi WHERE kategori = \? ORDER BY FIELD\(kategori, "SOP", "Panduan", "Informasi Lain"\), created_at DESC/;
            expect(mockQuery.mock.calls[0][0]).toMatch(expectedSqlPattern);
            expect(mockQuery.mock.calls[0][1]).toEqual([mockKategori]);
        });

        test('findById should select a single row by ID', async () => {
            const mockInfo = { id: 10, judul: 'Test' };
            mockQuery.mockResolvedValue([[mockInfo]]);

            const result = await InformasiModel.findById(10);

            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockQuery.mock.calls[0][0]).toBe('SELECT * FROM informasi WHERE id = ?');
            expect(mockQuery.mock.calls[0][1]).toEqual([10]);
            expect(result).toEqual(mockInfo);
        });

        test('findById should return null if no row is found', async () => {
            mockQuery.mockResolvedValue([[]]);
            const result = await InformasiModel.findById(99);
            expect(result).toBeUndefined(); // rows[0] dari array kosong adalah undefined
        });

        test('getActiveInfo should return active informasi lain', async () => {
            const mockActiveInfo = { id: 1, judul: 'Active Info', kategori: 'Informasi Lain', is_active: true };
            mockQuery.mockResolvedValue([[mockActiveInfo]]);

            const result = await InformasiModel.getActiveInfo();

            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockQuery.mock.calls[0][0]).toBe('SELECT * FROM informasi WHERE kategori = "Informasi Lain" AND is_active = TRUE LIMIT 1');
            expect(result).toEqual(mockActiveInfo);
        });

        test('getActiveInfo should return null if no active info found', async () => {
            mockQuery.mockResolvedValue([[]]);

            const result = await InformasiModel.getActiveInfo();

            expect(result).toBeNull();
        });
    });

    // --- CREATE OPERATIONS ---
    describe('Create Operations', () => {
        const mockFilePath = 'public/uploads/file.pdf';

        test('create should insert new info using all provided values', async () => {
            mockQuery.mockResolvedValue([{ insertId: 50 }]);

            await InformasiModel.create('Judul Test', 'Isi Lengkap', 'SOP', mockFilePath);

            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockQuery.mock.calls[0][0]).toBe('INSERT INTO informasi (judul, isi, kategori, file_path, is_active) VALUES (?, ?, ?, ?, ?)');

            // Verifikasi Parameter
            expect(mockQuery.mock.calls[0][1]).toEqual([
                'Judul Test',
                'Isi Lengkap',
                'SOP',
                mockFilePath,
                false
            ]);
        });

        test('create should apply default value for kategori and isi (using || operator)', async () => {
            mockQuery.mockResolvedValue([{ insertId: 51 }]);

            // Test case: isi=null/undefined, kategori=null/undefined
            await InformasiModel.create('Judul Minimal', undefined, null, undefined);

            expect(mockQuery).toHaveBeenCalledTimes(1);

            // Verifikasi Parameter:
            expect(mockQuery.mock.calls[0][1]).toEqual([
                'Judul Minimal',
                null,                  // isi || null -> null
                'Informasi Lain',      // kategori || 'Informasi Lain' -> 'Informasi Lain'
                null,                  // file_path || null
                false                  // is_active default
            ]);
        });

        test('create should throw error on query failure', async () => {
            mockQuery.mockRejectedValue(new Error('DB Insert Failed'));

            await expect(InformasiModel.create('Judul', 'Isi', 'SOP', null))
                .rejects.toThrow('DB Insert Failed');
        });

        test('create should deactivate other "Informasi Lain" when creating active one', async () => {
            mockQuery.mockResolvedValue([{ insertId: 52 }]);

            await InformasiModel.create('Active Info', 'Content', 'Informasi Lain', null, true);

            // Should call UPDATE first to deactivate others, then INSERT
            expect(mockQuery).toHaveBeenCalledTimes(2);
            expect(mockQuery.mock.calls[0][0]).toBe('UPDATE informasi SET is_active = FALSE WHERE kategori = "Informasi Lain"');
            expect(mockQuery.mock.calls[1][0]).toBe('INSERT INTO informasi (judul, isi, kategori, file_path, is_active) VALUES (?, ?, ?, ?, ?)');
            expect(mockQuery.mock.calls[1][1]).toEqual(['Active Info', 'Content', 'Informasi Lain', null, true]);
        });
    });

    // --- UPDATE OPERATIONS ---
    describe('Update Operations', () => {
        const mockUpdateData = { judul: 'New Title', isi: 'New Content', kategori: 'Panduan' };

        test('update should use file_path column when file_path is provided', async () => {
            const newFilePath = 'public/uploads/new_file.pdf';

            await InformasiModel.update(5, mockUpdateData.judul, mockUpdateData.isi, mockUpdateData.kategori, newFilePath);

            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockQuery.mock.calls[0][0]).toBe('UPDATE informasi SET judul=?, isi=?, kategori=?, file_path=?, is_active=? WHERE id=?');

            // Verifikasi Parameter
            expect(mockQuery.mock.calls[0][1]).toEqual([
                mockUpdateData.judul,
                mockUpdateData.isi,
                mockUpdateData.kategori,
                newFilePath,
                undefined,
                5
            ]);
        });

        test('update should omit file_path column when file_path is undefined', async () => {
            await InformasiModel.update(10, mockUpdateData.judul, mockUpdateData.isi, mockUpdateData.kategori, undefined);

            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockQuery.mock.calls[0][0]).toBe('UPDATE informasi SET judul=?, isi=?, kategori=?, is_active=? WHERE id=?');

            // Verifikasi Parameter
            expect(mockQuery.mock.calls[0][1]).toEqual([
                mockUpdateData.judul,
                mockUpdateData.isi,
                mockUpdateData.kategori,
                undefined,
                10
            ]);
        });

        test('update should deactivate other "Informasi Lain" when updating to active', async () => {
            await InformasiModel.update(5, 'Active Title', 'Content', 'Informasi Lain', 'path/file.pdf', true);

            // Should call UPDATE first to deactivate others, then UPDATE the target
            expect(mockQuery).toHaveBeenCalledTimes(2);
            expect(mockQuery.mock.calls[0][0]).toBe('UPDATE informasi SET is_active = FALSE WHERE kategori = "Informasi Lain" AND id != ?');
            expect(mockQuery.mock.calls[0][1]).toEqual([5]);
            expect(mockQuery.mock.calls[1][0]).toBe('UPDATE informasi SET judul=?, isi=?, kategori=?, file_path=?, is_active=? WHERE id=?');
        });
    });

    // --- DELETE OPERATIONS ---
    describe('Delete Operations', () => {

        test('delete should call DELETE query and return affectedRows', async () => {
            mockQuery.mockResolvedValue([{ affectedRows: 1 }]);

            const affectedRows = await InformasiModel.delete(25);

            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockQuery.mock.calls[0][0]).toBe('DELETE FROM informasi WHERE id = ?');
            expect(mockQuery.mock.calls[0][1]).toEqual([25]);
            expect(affectedRows).toBe(1);
        });
    });
});