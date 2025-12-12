// tests/models/inventarisModel.test.js

const db = require('../../db'); 

jest.mock('../../db', () => ({
    query: jest.fn(), 
    execute: jest.fn(), 
}));

const InventarisModel = require('../../models/inventarisModel');

describe('InventarisModel', () => {
    
    const mockQuery = db.query;
    const mockExecute = db.execute;

    beforeEach(() => {
        // Clear mock calls sebelum setiap test
        mockQuery.mockClear(); 
        mockExecute.mockClear();
        
        // ** FIX 2: Reset default mock untuk sukses sebelum setiap test **
        mockQuery.mockResolvedValue([[]]); 
        mockExecute.mockResolvedValue([[]]); 
    });

    // --- READ OPERATIONS ---
    describe('Read/Select Operations', () => {
        
        test('findAllItems should select only specific fields for checklist', async () => {
            const mockRows = [{ id: 1, kode_barang: 'A1', nama_barang: 'Laptop', status: 'Tersedia' }];
            mockQuery.mockResolvedValue([mockRows]);

            const result = await InventarisModel.findAllItems();

            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockQuery.mock.calls[0][0]).toBe('SELECT id, kode_barang, nama_barang, status FROM inventaris');
            expect(result).toEqual(mockRows);
        });

        test('getAllInventaris should call db.execute with correct ordering', async () => {
            const mockRows = [{ id: 1, jumlah: 10 }];
            mockExecute.mockResolvedValue([mockRows]);

            await InventarisModel.getAllInventaris();

            expect(mockExecute).toHaveBeenCalledTimes(1);
            
            // ** FIX 1: Menggunakan RegEx untuk mengabaikan whitespace dan newline **
            const expectedSqlPattern = /SELECT id, nama_barang, kode_barang, jumlah, status, created_at[\s\S]+FROM inventaris[\s\S]+ORDER BY id DESC/;
            
            expect(mockExecute.mock.calls[0][0]).toMatch(expectedSqlPattern);
        });

        test('findInventarisById should return null if no item found', async () => {
            mockQuery.mockResolvedValue([[]]);
            const result = await InventarisModel.findInventarisById(99);
            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(result).toBeNull();
        });
        
        test('findInventarisByName should return item ID and count', async () => {
            const mockItem = { id: 5, jumlah: 10 };
            mockQuery.mockResolvedValue([[mockItem]]);

            const result = await InventarisModel.findInventarisByName('Monitor');

            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockQuery.mock.calls[0][0]).toBe('SELECT id, jumlah FROM inventaris WHERE nama_barang = ?');
            expect(result).toEqual(mockItem);
        });

        test('findInventarisByName should return null if not found', async () => {
            mockQuery.mockResolvedValue([[]]);

            const result = await InventarisModel.findInventarisByName('NonExistent');

            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(result).toBeNull();
        });
    });

    // --- CREATE OPERATIONS ---
    describe('Create Operations', () => {
        const mockData = { nama_barang: 'Mouse', kode_barang: 'M-01', jumlah: 5, status: 'Tersedia' };

        test('createInventaris should call db.query with correct INSERT structure', async () => {
            mockQuery.mockResolvedValue([{ insertId: 10 }]);

            const insertId = await InventarisModel.createInventaris(mockData);

            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockQuery.mock.calls[0][0]).toBe('INSERT INTO inventaris (nama_barang, kode_barang, jumlah, status, created_at) VALUES (?, ?, ?, ?, NOW())');
            
            expect(mockQuery.mock.calls[0][1]).toEqual([
                'Mouse', 'M-01', 5, 'Tersedia'
            ]);
            expect(insertId).toBe(10);
        });
        
        test('createInventaris should throw error on query failure', async () => {
            // Mock ini hanya akan berlaku untuk test ini saja
            mockQuery.mockRejectedValue(new Error('DB Insert Failed')); 

            await expect(InventarisModel.createInventaris(mockData))
                .rejects.toThrow('DB Insert Failed');
        });
    });
    
    // --- UPDATE/BULK OPERATIONS ---
    describe('Update/Bulk Operations', () => {

        test('updateInventarisQuantity should handle only jumlahTambahan (kodeBarang/status null)', async () => {
            // FIX 2: Pastikan mock resolved value direset oleh beforeEach
            await InventarisModel.updateInventarisQuantity('Keyboard', 10, null, null);

            expect(mockQuery).toHaveBeenCalledTimes(1);
            
            expect(mockQuery.mock.calls[0][0]).toBe(
                'UPDATE inventaris SET jumlah = jumlah + ?, kode_barang = COALESCE(?, kode_barang), status = COALESCE(?, status) WHERE nama_barang = ?'
            );
            
            expect(mockQuery.mock.calls[0][1]).toEqual([
                10,         // jumlahTambahan
                null,       // kodeBarang
                null,       // status
                'Keyboard'
            ]);
        });
        
        test('updateInventarisQuantity should update all fields when provided', async () => {
            // FIX 2: Pastikan mock resolved value direset oleh beforeEach
            await InventarisModel.updateInventarisQuantity('Keyboard', 10, 'KB-01', 'Rusak');

            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockQuery.mock.calls[0][1]).toEqual([
                10,         // jumlahTambahan
                'KB-01',    // kodeBarang
                'Rusak',    // status
                'Keyboard'
            ]);
        });
        
        test('updateStatus should update only the status field', async () => {
            // FIX 2: Pastikan mock resolved value direset oleh beforeEach
            await InventarisModel.updateStatus(5, 'Hilang');
            
            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockQuery.mock.calls[0][0]).toBe('UPDATE inventaris SET status = ? WHERE id = ?');
            expect(mockQuery.mock.calls[0][1]).toEqual(['Hilang', 5]);
        });
    });
    
    // --- DELETE OPERATIONS ---
    describe('Delete Operations', () => {

        test('deleteInventaris should call DELETE query and return affectedRows', async () => {
            mockQuery.mockResolvedValue([{ affectedRows: 1 }]);

            const affectedRows = await InventarisModel.deleteInventaris(15);

            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockQuery.mock.calls[0][0]).toBe('DELETE FROM inventaris WHERE id = ?');
            expect(affectedRows).toBe(1);
        });
    });
});