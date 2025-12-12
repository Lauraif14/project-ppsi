// 1. Mock Database (MENGGANTIKAN KONEKSI DATABASE ASLI)
const db = require('../../db'); 

// Mocks database module (db.js)
jest.mock('../../db', () => ({
    // AbsensiModel menggunakan db.query() dan db.execute()
    query: jest.fn(), 
    execute: jest.fn(),
}));

// 2. Import Model yang ingin diuji
const AbsensiModel = require('../../models/absensiModel');

describe('AbsensiModel', () => {
    
    const mockQuery = db.query;
    const mockExecute = db.execute;
    const MOCK_USER_ID = 5;

    beforeEach(() => {
        // Clear mock calls sebelum setiap test
        mockQuery.mockClear(); 
        mockExecute.mockClear();
        // Default mock untuk sukses
        mockQuery.mockResolvedValue([[]]); 
        mockExecute.mockResolvedValue([[]]);
    });

    // --- FIND OPERATIONS ---
    describe('Find Active Sessions', () => {
        
        test('findActiveSession should query for user_id and waktu_keluar IS NULL', async () => {
            const mockSession = { id: 10 };
            mockQuery.mockResolvedValue([[mockSession]]);

            const result = await AbsensiModel.findActiveSession(MOCK_USER_ID);

            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockQuery.mock.calls[0][0]).toBe('SELECT * FROM absensi WHERE user_id = ? AND waktu_keluar IS NULL');
            expect(mockQuery.mock.calls[0][1]).toEqual([MOCK_USER_ID]);
            expect(result).toEqual(mockSession);
        });

        test('findCurrentActiveSession should query and ORDER BY DESC LIMIT 1', async () => {
            const mockSession = { id: 11, waktu_masuk: new Date() };
            mockQuery.mockResolvedValue([[mockSession]]);

            const result = await AbsensiModel.findCurrentActiveSession(MOCK_USER_ID);

            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockQuery.mock.calls[0][0]).toBe('SELECT * FROM absensi WHERE user_id = ? AND waktu_keluar IS NULL ORDER BY waktu_masuk DESC LIMIT 1');
            expect(mockQuery.mock.calls[0][1]).toEqual([MOCK_USER_ID]);
            expect(result).toEqual(mockSession);
        });
        
        test('findByIdAndUserId should select based on ID and User ID', async () => {
            const mockSession = { id: 12, user_id: MOCK_USER_ID };
            mockQuery.mockResolvedValue([[mockSession]]);

            const result = await AbsensiModel.findByIdAndUserId(12, MOCK_USER_ID);

            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockQuery.mock.calls[0][0]).toBe('SELECT * FROM absensi WHERE id = ? AND user_id = ?');
            expect(mockQuery.mock.calls[0][1]).toEqual([12, MOCK_USER_ID]);
            expect(result).toEqual(mockSession);
        });
    });

    // --- CREATE & UPDATE OPERATIONS ---
    describe('Create and Update', () => {
        
        test('createAbsenMasuk should use INSERT INTO absensi SET ?', async () => {
            const mockNewData = { 
                user_id: MOCK_USER_ID, 
                waktu_masuk: '2025-12-08 08:00:00', 
                foto_path: 'path/to/photo.jpg'
            };
            mockQuery.mockResolvedValue([{ affectedRows: 1 }]); 

            await AbsensiModel.createAbsenMasuk(mockNewData);

            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockQuery.mock.calls[0][0]).toBe('INSERT INTO absensi SET ?');
            expect(mockQuery.mock.calls[0][1]).toEqual(mockNewData);
        });
        
        test('updateAbsenKeluar should update all expected fields for checkout', async () => {
            const ABSEN_ID = 20;
            const mockUpdateData = { 
                waktu_keluar: '2025-12-08 17:00:00',
                foto_path_keluar: 'path/out.jpg',
                latitude_keluar: 10.1,
                longitude_keluar: 100.1
            };
            mockQuery.mockResolvedValue([{ affectedRows: 1 }]);

            await AbsensiModel.updateAbsenKeluar(mockUpdateData, ABSEN_ID);

            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockQuery.mock.calls[0][0]).toBe(
                'UPDATE absensi SET waktu_keluar = ?, foto_path_keluar = ?, latitude_keluar = ?, longitude_keluar = ? WHERE id = ?'
            );
            expect(mockQuery.mock.calls[0][1]).toEqual([
                mockUpdateData.waktu_keluar, 
                mockUpdateData.foto_path_keluar, 
                mockUpdateData.latitude_keluar, 
                mockUpdateData.longitude_keluar, 
                ABSEN_ID
            ]);
        });
        
        test('updateChecklist should update checklist JSON and set flag to TRUE', async () => {
            const ABSEN_ID = 30;
            const mockChecklist = JSON.stringify({ item1: 'ok' });

            await AbsensiModel.updateChecklist(ABSEN_ID, MOCK_USER_ID, mockChecklist);

            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockQuery.mock.calls[0][0]).toBe(
                'UPDATE absensi SET inventaris_checklist = ?, checklist_submitted = TRUE WHERE id = ? AND user_id = ?'
            );
            expect(mockQuery.mock.calls[0][1]).toEqual([
                mockChecklist, 
                ABSEN_ID, 
                MOCK_USER_ID
            ]);
        });
    });

    // --- HISTORY AND REPORT OPERATIONS (db.execute) ---
    describe('History and Report', () => {
        
        test('getHistory should select all fields ordered by waktu_masuk DESC', async () => {
            const mockHistory = [{ id: 1, waktu_masuk: new Date() }];
            mockQuery.mockResolvedValue([mockHistory]);

            const history = await AbsensiModel.getHistory(MOCK_USER_ID);

            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockQuery.mock.calls[0][0]).toBe(
                'SELECT * FROM absensi WHERE user_id = ? ORDER BY waktu_masuk DESC'
            );
            expect(mockQuery.mock.calls[0][1]).toEqual([MOCK_USER_ID]);
            expect(history).toEqual(mockHistory);
        });

        test('getLaporanByDate should query join users and select/format all report fields (Regex Check)', async () => {
            const mockDate = '2025-12-08';
            mockExecute.mockResolvedValue([[{ id: 1, status: 'Hadir' }]]);

            await AbsensiModel.getLaporanByDate(mockDate);

            expect(mockExecute).toHaveBeenCalledTimes(1);
            
            const sql = mockExecute.mock.calls[0][0];
            
            // Verifikasi komponen kunci menggunakan RegEx
            expect(sql).toMatch(/FROM absensi a\s+LEFT JOIN users u ON a\.user_id = u\.id/);
            expect(sql).toContain('WHERE DATE(a.waktu_masuk) = ? OR DATE(a.waktu_keluar) = ?');
            expect(mockExecute.mock.calls[0][1]).toEqual([mockDate, mockDate]);
        });
        
        test('getTodayAbsensiStatus should query join users and filter by user role and date (Regex Check)', async () => {
            const mockDate = '2025-12-08';
            mockExecute.mockResolvedValue([[{ id: 1, nama_lengkap: 'Budi' }]]);

            await AbsensiModel.getTodayAbsensiStatus(mockDate);

            expect(mockExecute).toHaveBeenCalledTimes(1);
            
            const sql = mockExecute.mock.calls[0][0];
            expect(sql).toMatch(/LEFT JOIN absensi a ON u\.id = a\.user_id AND DATE\(a\.waktu_masuk\) = \?/);
            expect(sql).toContain("WHERE u.role = 'user'"); 
            expect(mockExecute.mock.calls[0][1]).toEqual([mockDate]);
        });
    });

    // --- DELETE OPERATION (BARU) ---
    describe('Delete Operation', () => {
        
        test('deleteRecord should execute DELETE FROM absensi WHERE id = ?', async () => {
            const ABSEN_ID = 40;
            mockQuery.mockResolvedValue([{ affectedRows: 1 }]);

            const affectedRows = await AbsensiModel.deleteRecord(ABSEN_ID);

            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockQuery.mock.calls[0][0]).toBe('DELETE FROM absensi WHERE id = ?');
            expect(mockQuery.mock.calls[0][1]).toEqual([ABSEN_ID]);
            expect(affectedRows).toBe(1);
        });
        
        test('Should throw error when deleteRecord fails', async () => {
            mockQuery.mockRejectedValue(new Error('DB Delete Failed'));
            
            await expect(AbsensiModel.deleteRecord(1))
                .rejects.toThrow('DB Delete Failed');
        });
    });

    // --- ERROR PATHS ---
    describe('Error Paths', () => {
        test('Should throw error when db.query fails (e.g., findActiveSession)', async () => {
            mockQuery.mockRejectedValue(new Error('DB Query Timeout'));
            
            await expect(AbsensiModel.findActiveSession(1))
                .rejects.toThrow('DB Query Timeout');
        });

        test('Should throw error when db.execute fails (e.g., getTodayAbsensiStatus)', async () => {
            mockExecute.mockRejectedValue(new Error('DB Execute Failed'));
            
            await expect(AbsensiModel.getTodayAbsensiStatus('2025-12-08'))
                .rejects.toThrow('DB Execute Failed');
        });
    });
});