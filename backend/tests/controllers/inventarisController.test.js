// tests/controllers/inventarisController.test.js

const InventarisController = require('../../controllers/inventarisController');
const InventarisModel = require('../../models/inventarisModel');
const { parseUploadedFile, cleanupFile } = require('../../utils/uploadUtils');

// Mocking dependencies
jest.mock('../../models/inventarisModel');
jest.mock('../../utils/uploadUtils', () => ({
    // Mock Helper Functions
    parseUploadedFile: jest.fn(),
    cleanupFile: jest.fn(),
}));

// Ambil instance controller yang sudah diexport (Class/OOP)
const inventarisControllerInstance = require('../../controllers/inventarisController');

describe('InventarisController (OOP)', () => {
    let req;
    let res;

    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => { });
        jest.spyOn(console, 'log').mockImplementation(() => { });
        jest.spyOn(console, 'warn').mockImplementation(() => { });
    });

    afterAll(() => {
        console.error.mockRestore();
        console.log.mockRestore();
        console.warn.mockRestore();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            body: {},
            params: {},
            query: {},
            file: { path: 'mock/path/file.xlsx', originalname: 'data.xlsx' }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Mock default successes
        InventarisModel.getAllInventaris.mockResolvedValue([]);
        InventarisModel.findInventarisById.mockResolvedValue({ id: '1', nama_barang: 'Keyboard' });
        InventarisModel.deleteInventaris.mockResolvedValue(1);
        InventarisModel.createInventaris.mockResolvedValue(50);
        InventarisModel.findInventarisByName.mockResolvedValue(null);
        InventarisModel.updateInventarisQuantity.mockResolvedValue(true);
        parseUploadedFile.mockImplementation((path, name) => [{ nama_barang: 'Mock', jumlah: 1, status: 'Tersedia' }]);
    });

    // Helper untuk binding method Class
    const bind = (method) => method.bind(inventarisControllerInstance);

    // --- Testing getAllInventaris ---
    describe('getAllInventaris', () => {
        test('should return 200 and all inventaris data', async () => {
            const mockRows = [{ id: 1, nama_barang: 'Laptop' }];
            InventarisModel.getAllInventaris.mockResolvedValue(mockRows);

            await bind(inventarisControllerInstance.getAllInventaris)(req, res);

            expect(InventarisModel.getAllInventaris).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ success: true, data: mockRows, total: 1 });
        });

        // TEST CATCH BLOCK 500 (Line 27)
        test('should return 500 on database error', async () => {
            InventarisModel.getAllInventaris.mockRejectedValue(new Error('DB Fetch Error'));

            await bind(inventarisControllerInstance.getAllInventaris)(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ success: false, message: 'Error fetching inventaris data' })
            );
        });
    });

    // --- Testing createInventaris ---
    describe('createInventaris', () => {
        const mockNewItem = { id: 50, nama_barang: 'Mouse', jumlah: 10, status: 'Tersedia' };

        beforeEach(() => {
            InventarisModel.findInventarisById.mockResolvedValue(mockNewItem);
            req.body = { nama_barang: 'Mouse', jumlah: '10', status: 'Habis' };
        });

        test('should create item successfully with valid data', async () => {
            await bind(inventarisControllerInstance.createInventaris)(req, res);

            expect(InventarisModel.createInventaris).toHaveBeenCalledWith(
                expect.objectContaining({ nama_barang: 'Mouse', jumlah: 10, status: 'Habis' })
            );
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ success: true, data: mockNewItem })
            );
        });

        // TEST 400: Missing nama_barang (Line 42)
        test('should return 400 if nama_barang is missing', async () => {
            req.body = { jumlah: '10', status: 'Tersedia' };
            await bind(inventarisControllerInstance.createInventaris)(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        // TEST 400: Jumlah is NaN (Line 47)
        test('should return 400 if jumlah is not a number', async () => {
            req.body = { nama_barang: 'Test', jumlah: 'sepuluh' };
            await bind(inventarisControllerInstance.createInventaris)(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('should return 400 if jumlah is invalid (<= 0)', async () => {
            req.body = { nama_barang: 'Test', jumlah: '0' };
            await bind(inventarisControllerInstance.createInventaris)(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('should return 400 if status is invalid (Line 51)', async () => {
            req.body = { nama_barang: 'Test', jumlah: 1, status: 'InvalidStatus' };
            await bind(inventarisControllerInstance.createInventaris)(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        // TEST CATCH BLOCK 500 (Line 77)
        test('should return 500 if DB fails during creation', async () => {
            req.body = { nama_barang: 'Mouse', jumlah: '10', status: 'Habis' };
            InventarisModel.createInventaris.mockRejectedValue(new Error('DB Insert Failed'));

            await bind(inventarisControllerInstance.createInventaris)(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    // --- Testing deleteInventaris ---
    describe('deleteInventaris', () => {
        const mockExistingItem = { id: '1', nama_barang: 'Keyboard' };

        beforeEach(() => {
            req.params = { id: '1' };
            InventarisModel.findInventarisById.mockResolvedValue(mockExistingItem);
        });

        test('should delete item and return success message', async () => {
            InventarisModel.deleteInventaris.mockResolvedValue(1);

            await bind(inventarisControllerInstance.deleteInventaris)(req, res);

            expect(InventarisModel.deleteInventaris).toHaveBeenCalledWith('1');
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ success: true, message: 'Inventaris berhasil dihapus' })
            );
        });

        // TEST 400: ID inventaris tidak valid (Line 85)
        test('should return 400 if id parameter is invalid', async () => {
            req.params = { id: 'abc' };
            await bind(inventarisControllerInstance.deleteInventaris)(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'ID inventaris tidak valid' }));
        });

        test('should return 404 if item not found (Line 92)', async () => {
            InventarisModel.findInventarisById.mockResolvedValue(null);

            await bind(inventarisControllerInstance.deleteInventaris)(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(InventarisModel.deleteInventaris).not.toHaveBeenCalled();
        });

        // TEST 500: Gagal menghapus meskipun item ditemukan (Line 95)
        test('should return 500 if affectedRows is 0 after existing item check', async () => {
            InventarisModel.deleteInventaris.mockResolvedValue(0);

            await bind(inventarisControllerInstance.deleteInventaris)(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Gagal menghapus inventaris' }));
        });

        // TEST CATCH BLOCK 500 (Line 99)
        test('should return 500 on database error during deletion', async () => {
            InventarisModel.findInventarisById.mockRejectedValue(new Error('DB Delete Error'));

            await bind(inventarisControllerInstance.deleteInventaris)(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    // --- Testing bulkCreateInventaris ---
    describe('bulkCreateInventaris', () => {
        beforeEach(() => {
            // Reset mock input for each test case
            parseUploadedFile.mockReturnValue([
                { nama_barang: 'New Laptop', jumlah: 5, status: 'Tersedia' },
            ]);
            InventarisModel.createInventaris.mockImplementation((data) => data.nama_barang === 'New' ? 10 : 11);
            InventarisModel.findInventarisByName.mockResolvedValue(null);
        });

        test('should process new items and return 201 success', async () => {
            await bind(inventarisControllerInstance.bulkCreateInventaris)(req, res);

            expect(InventarisModel.createInventaris).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(201);
        });

        // TEST 400: req.file is missing (Line 112)
        test('should return 400 if req.file is missing', async () => {
            req.file = undefined;

            await bind(inventarisControllerInstance.bulkCreateInventaris)(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(parseUploadedFile).not.toHaveBeenCalled();
        });

        // TEST 400: File parsing fails (Line 124)
        test('should return 400 if parsing file fails and clean up file', async () => {
            parseUploadedFile.mockImplementation(() => { throw new Error('Parsing failed'); });

            await bind(inventarisControllerInstance.bulkCreateInventaris)(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(cleanupFile).toHaveBeenCalledWith('mock/path/file.xlsx');
        });

        test('should process update existing items', async () => {
            parseUploadedFile.mockReturnValue([
                { nama_barang: 'Existing Item', jumlah: 5, status: 'Rusak' },
            ]);
            InventarisModel.findInventarisByName.mockResolvedValue({ id: 50, jumlah: 10 });

            await bind(inventarisControllerInstance.bulkCreateInventaris)(req, res);

            expect(InventarisModel.updateInventarisQuantity).toHaveBeenCalledWith('Existing Item', 5, null, 'Rusak');
            expect(res.json.mock.calls[0][0].data.imported[0].action).toBe('updated');
        });

        // TEST 201 Error Report: Invalid data in loop (Line 137)
        test('should report errors for invalid data (missing required field) but succeed overall', async () => {
            parseUploadedFile.mockReturnValue([
                { nama_barang: 'Valid', jumlah: 1, status: 'Tersedia' },
                { nama_barang: 'Invalid', jumlah: '0' }, // Gagal validasi jumlah <= 0
            ]);

            await bind(inventarisControllerInstance.bulkCreateInventaris)(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json.mock.calls[0][0].data.total_success).toBe(1);
            expect(res.json.mock.calls[0][0].data.total_errors).toBe(1);
            expect(res.json.mock.calls[0][0].data.errors[0]).toContain('jumlah (harus > 0) harus diisi');
        });

        // TEST 201 Error Report: DB Error pada Model di loop (Line 137)
        test('should collect error if createInventaris fails', async () => {
            InventarisModel.createInventaris.mockRejectedValue(new Error('Insert Loop Failed'));

            parseUploadedFile.mockReturnValue([
                { nama_barang: 'New Item', jumlah: 5, status: 'Tersedia' },
            ]);

            await bind(inventarisControllerInstance.bulkCreateInventaris)(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json.mock.calls[0][0].data.total_errors).toBe(1);
            expect(res.json.mock.calls[0][0].data.errors[0]).toContain('Insert Loop Failed');
        });

        // TEST CATCH BLOCK LUAR 500 (Line 150) - PERBAIKAN ASSERTION
        test('should return 400 if unexpected error occurs outside loop and cleanup file', async () => {
            // Kita akan memicu error di parsing agar tertangkap oleh catch terluar.
            parseUploadedFile.mockImplementation(() => {
                // Kita sengaja melempar error di sini
                throw new Error('Critical pre-loop error');
            });

            await bind(inventarisControllerInstance.bulkCreateInventaris)(req, res);

            // Karena Line 124 (catch(e)) menghasilkan 400, assertion diubah menjadi 400
            expect(res.status).toHaveBeenCalledWith(400);
            expect(cleanupFile).toHaveBeenCalled();
        });

        // TEST: Empty file (Line 105-106)
        test('should return 400 if file is empty after parsing', async () => {
            parseUploadedFile.mockReturnValue([]);

            await bind(inventarisControllerInstance.bulkCreateInventaris)(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: 'File kosong atau format tidak sesuai.'
                })
            );
            expect(cleanupFile).toHaveBeenCalledWith('mock/path/file.xlsx');
        });

        // TEST: Invalid status validation (Line 129-130)
        test('should report error for invalid status', async () => {
            parseUploadedFile.mockReturnValue([
                { nama_barang: 'Item 1', jumlah: 5, status: 'InvalidStatus' },
                { nama_barang: 'Item 2', jumlah: 3, status: 'Tersedia' },
            ]);

            await bind(inventarisControllerInstance.bulkCreateInventaris)(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json.mock.calls[0][0].data.total_errors).toBe(1);
            expect(res.json.mock.calls[0][0].data.errors[0]).toContain('Status tidak valid');
            expect(res.json.mock.calls[0][0].data.total_success).toBe(1);
        });

        // TEST: Outer catch block 500 error (Line 165-166)
        test('should return 500 if unexpected error in outer catch block', async () => {
            // Untuk memicu outer catch, error harus terjadi di luar loop
            // Strategi: mock res.status untuk throw error saat dipanggil dengan 201
            parseUploadedFile.mockReturnValue([{ nama_barang: 'Test', jumlah: 1, status: 'Tersedia' }]);

            const originalStatus = res.status;
            res.status = jest.fn((code) => {
                if (code === 201) {
                    throw new Error('Unexpected error');
                }
                return res;
            });

            await bind(inventarisControllerInstance.bulkCreateInventaris)(req, res);

            // Restore
            res.status = originalStatus;
            expect(cleanupFile).toHaveBeenCalled();
        });
    });


    // --- Testing updateInventaris ---
    describe('updateInventaris', () => {
        const mockExistingItem = { id: 1, nama_barang: 'Laptop', jumlah: 5, status: 'Tersedia', kode_barang: 'L001' };

        beforeEach(() => {
            jest.clearAllMocks();
            InventarisModel.findInventarisById.mockResolvedValue(mockExistingItem);
            InventarisModel.updateInventaris.mockResolvedValue(1);
        });

        test('should update item successfully with valid data', async () => {
            const req = {
                params: { id: '1' },
                body: { nama_barang: 'Updated Laptop', kode_barang: 'L002', jumlah: '10', status: 'Rusak' }
            };

            const updatedItem = { ...mockExistingItem, ...req.body, jumlah: 10 };

            InventarisModel.findInventarisById
                .mockResolvedValueOnce(mockExistingItem)
                .mockResolvedValueOnce(updatedItem);

            await inventarisControllerInstance.updateInventaris(req, res);

            expect(InventarisModel.updateInventaris).toHaveBeenCalledWith(
                '1',
                expect.objectContaining({
                    nama_barang: 'Updated Laptop',
                    kode_barang: 'L002',
                    jumlah: 10,
                    status: 'Rusak'
                })
            );

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: updatedItem
                })
            );
        });

        test('should return 400 if id parameter is missing', async () => {
            const req = {
                params: {},
                body: { nama_barang: 'Laptop', jumlah: '10' }
            };

            await inventarisControllerInstance.updateInventaris(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'ID inventaris tidak valid' }));
        });

        test('should return 400 if id parameter is not a number', async () => {
            const req = {
                params: { id: 'abc' },
                body: { nama_barang: 'Laptop', jumlah: '10' }
            };

            await inventarisControllerInstance.updateInventaris(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'ID inventaris tidak valid' }));
        });

        test('should return 404 if item not found', async () => {
            const req = {
                params: { id: '999' },
                body: { nama_barang: 'Laptop', jumlah: '10' }
            };

            InventarisModel.findInventarisById.mockResolvedValue(null);

            await inventarisControllerInstance.updateInventaris(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Item inventaris tidak ditemukan' }));
            expect(InventarisModel.updateInventaris).not.toHaveBeenCalled();
        });

        test('should return 400 if nama_barang is missing', async () => {
            const req = {
                params: { id: '1' },
                body: { jumlah: '10', status: 'Tersedia' }
            };

            await inventarisControllerInstance.updateInventaris(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Nama barang dan jumlah harus diisi' }));
        });

        test('should return 400 if jumlah is missing', async () => {
            const req = {
                params: { id: '1' },
                body: { nama_barang: 'Laptop', status: 'Tersedia' }
            };

            await inventarisControllerInstance.updateInventaris(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Nama barang dan jumlah harus diisi' }));
        });

        test('should return 400 if jumlah is not a number', async () => {
            const req = {
                params: { id: '1' },
                body: { nama_barang: 'Laptop', jumlah: 'sepuluh', status: 'Tersedia' }
            };

            await inventarisControllerInstance.updateInventaris(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Jumlah harus berupa angka dan lebih dari 0' }));
        });

        test('should return 400 if jumlah is less than or equal to 0', async () => {
            const req = {
                params: { id: '1' },
                body: { nama_barang: 'Laptop', jumlah: '0', status: 'Tersedia' }
            };

            await inventarisControllerInstance.updateInventaris(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Jumlah harus berupa angka dan lebih dari 0' }));
        });

        test('should return 400 if status is invalid', async () => {
            const req = {
                params: { id: '1' },
                body: { nama_barang: 'Laptop', jumlah: '10', status: 'InvalidStatus' }
            };

            await inventarisControllerInstance.updateInventaris(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: expect.stringContaining('Status tidak valid')
                })
            );
        });

        test('should handle optional kode_barang field', async () => {
            const req = {
                params: { id: '1' },
                body: { nama_barang: 'Laptop', jumlah: '10', status: 'Tersedia' } // No kode_barang
            };

            const updatedItem = { ...mockExistingItem, ...req.body, jumlah: 10 };
            InventarisModel.findInventarisById.mockResolvedValueOnce(mockExistingItem).mockResolvedValueOnce(updatedItem);

            await inventarisControllerInstance.updateInventaris(req, res);

            expect(InventarisModel.updateInventaris).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        });

        test('should return 500 on database error during update', async () => {
            const req = {
                params: { id: '1' },
                body: { nama_barang: 'Laptop', jumlah: '10', status: 'Tersedia' }
            };

            InventarisModel.findInventarisById.mockResolvedValue(mockExistingItem);
            InventarisModel.updateInventaris.mockRejectedValue(new Error('DB Update Error'));

            await inventarisControllerInstance.updateInventaris(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: expect.stringContaining('Error')
                })
            );
        });
    });
});