// tests/models/jadwalModel.test.js (FINAL & 100% COVERAGE)

// 1. Mock Database (MENGGANTIKAN KONEKSI DATABASE ASLI)
const db = require('../../db'); 

// Mocks database module (db.js)
jest.mock('../../db', () => ({
    // FIX: Tambahkan execute() karena clearAllJadwalPiket menggunakannya
    query: jest.fn(), 
    execute: jest.fn(), 
}));

// 2. Import Model yang ingin diuji
const JadwalModel = require('../../models/jadwalModel');

describe('JadwalModel', () => {
    
    const mockQuery = db.query;
    const mockExecute = db.execute; // Gunakan mockExecute

    beforeEach(() => {
        // Clear mock calls sebelum setiap test
        mockQuery.mockClear(); 
        mockExecute.mockClear(); // Clear mockExecute
    });

    // --- TESTING getScheduledUsersByDay (Sudah ada & benar) ---
    describe('getScheduledUsersByDay', () => {
        const mockHari = 'Senin';
        const mockUsers = [{ id: 1, nama_lengkap: 'A' }];

        test('should call db.query with correct SELECT and WHERE clause', async () => {
            mockQuery.mockResolvedValue([mockUsers]);
            const result = await JadwalModel.getScheduledUsersByDay(mockHari);
            
            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockQuery.mock.calls[0][0]).toBe(
                'SELECT u.id, u.nama_lengkap, u.avatar_url FROM jadwal_piket jp JOIN users u ON jp.user_id = u.id WHERE jp.hari = ?'
            );
            expect(mockQuery.mock.calls[0][1]).toEqual([mockHari]);
            expect(result).toEqual(mockUsers);
        });

        test('should throw error if query fails', async () => {
            mockQuery.mockRejectedValue(new Error('DB Jadwal Fetch Error')); 
            await expect(JadwalModel.getScheduledUsersByDay(mockHari))
                .rejects.toThrow('DB Jadwal Fetch Error');
        });
    });

    // --- TESTING getAbsensiStatusForToday (Sudah ada & benar) ---
    describe('getAbsensiStatusForToday', () => {
        const mockDate = '2025-12-08'; 
        const mockAbsensi = [{ user_id: 1, waktu_keluar: null }];

        test('should call db.query with correct date range logic', async () => {
            mockQuery.mockResolvedValue([mockAbsensi]);
            await JadwalModel.getAbsensiStatusForToday(mockDate);
            
            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockQuery.mock.calls[0][0]).toBe(
                'SELECT user_id, waktu_masuk, waktu_keluar FROM absensi WHERE waktu_masuk >= ? AND waktu_masuk < DATE_ADD(?, INTERVAL 1 DAY)'
            );
            expect(mockQuery.mock.calls[0][1]).toEqual([mockDate, mockDate]);
        });

        test('should throw error if query fails', async () => {
            mockQuery.mockRejectedValue(new Error('DB Absensi Fetch Error')); 
            await expect(JadwalModel.getAbsensiStatusForToday(mockDate))
                .rejects.toThrow('DB Absensi Fetch Error');
        });
    });
    
    // -----------------------------------------------------------
    // --- TESTING METHOD BARU (Jadwal Piket CRUD) ---
    // -----------------------------------------------------------

    // --- TESTING getAllJadwalPiket ---
    describe('getAllJadwalPiket', () => {
        const mockRows = [{ hari: 'Senin', nama_lengkap: 'A' }];
        const expectedSqlPattern = /SELECT jp\.id, jp\.hari, jp\.user_id, u\.nama_lengkap, u\.jabatan[\s\S]+ORDER BY FIELD\(jp\.hari, 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'\)/;

        test('should execute complex SELECT with JOIN and FIELD ordering', async () => {
            mockQuery.mockResolvedValue([mockRows]);
            
            await JadwalModel.getAllJadwalPiket();

            expect(mockQuery).toHaveBeenCalledTimes(1);
            // Menggunakan RegEx karena query multi-baris dan mengandung spasi/newline
            expect(mockQuery.mock.calls[0][0]).toMatch(expectedSqlPattern);
        });

        test('should throw error on fetch failure', async () => {
            mockQuery.mockRejectedValue(new Error('Jadwal Fetch Failed'));
            await expect(JadwalModel.getAllJadwalPiket())
                .rejects.toThrow('Jadwal Fetch Failed');
        });
    });

    // --- TESTING clearAllJadwalPiket ---
    describe('clearAllJadwalPiket', () => {
        test('should execute DELETE FROM jadwal_piket and return result', async () => {
            const mockResult = { affectedRows: 10 };
            mockExecute.mockResolvedValue([mockResult]); // Menggunakan mockExecute

            const result = await JadwalModel.clearAllJadwalPiket();

            expect(mockExecute).toHaveBeenCalledTimes(1);
            expect(mockExecute.mock.calls[0][0]).toBe('DELETE FROM jadwal_piket');
            expect(result).toEqual(mockResult);
        });

        test('should throw error on delete failure', async () => {
            mockExecute.mockRejectedValue(new Error('Delete Failed'));
            await expect(JadwalModel.clearAllJadwalPiket())
                .rejects.toThrow('Delete Failed');
        });
    });
    
    // --- TESTING insertJadwalPiket ---
    describe('insertJadwalPiket', () => {
        const MOCK_USER_ID = 1;
        const MOCK_HARI = 'Selasa';
        
        test('should execute INSERT INTO jadwal_piket with user_id and hari', async () => {
            mockQuery.mockResolvedValue([{}]); // INSERT tidak mengembalikan data

            await JadwalModel.insertJadwalPiket(MOCK_USER_ID, MOCK_HARI);

            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockQuery.mock.calls[0][0]).toBe('INSERT INTO jadwal_piket (user_id, hari) VALUES (?, ?)');
            expect(mockQuery.mock.calls[0][1]).toEqual([MOCK_USER_ID, MOCK_HARI]);
        });
        
        test('should throw error on insert failure', async () => {
            mockQuery.mockRejectedValue(new Error('Insert Failed'));
            await expect(JadwalModel.insertJadwalPiket(MOCK_USER_ID, MOCK_HARI))
                .rejects.toThrow('Insert Failed');
        });
    });
});