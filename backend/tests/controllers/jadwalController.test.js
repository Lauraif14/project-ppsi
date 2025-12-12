// tests/controllers/jadwalController.test.js

const jadwalControllerInstance = require('../../controllers/jadwalController');
const JadwalModel = require('../../models/jadwalModel');

// Dapatkan referensi ke Class Constructor untuk mengakses static method
const JadwalControllerClass = jadwalControllerInstance.constructor; // <-- Akses ke Class

// Mocking dependencies
jest.mock('../../models/jadwalModel');

describe('JadwalController (OOP)', () => {
    let req;
    let res;

    // Helper untuk binding method Class
    const bind = (method) => method.bind(jadwalControllerInstance);

    const MOCK_SCHEDULE = [
        { id: 1, nama_lengkap: 'User A', avatar_url: 'uploads\\a.jpg' },
        { id: 2, nama_lengkap: 'User B', avatar_url: null },
        { id: 3, nama_lengkap: 'User C', avatar_url: 'uploads\\c.jpg' },
    ];

    const MOCK_ABSENSI = [
        // User 1: Sudah Selesai (sudah waktu_keluar)
        { user_id: 1, waktu_masuk: '2025-12-08T08:00:00Z', waktu_keluar: '2025-12-08T16:00:00Z' },
        // User 3: Sedang Piket (belum waktu_keluar)
        { user_id: 3, waktu_masuk: '2025-12-08T09:00:00Z', waktu_keluar: null },
    ];

    // Mocking Date untuk konsistensi (Paksa hari ini menjadi Senin)
    const mockDate = new Date('2025-12-08T10:00:00.000Z');
    const mockDateSpy = jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
    
    beforeEach(() => {
        jest.clearAllMocks();
        
        req = { 
            protocol: 'http', 
            get: jest.fn((header) => {
                if (header === 'host') return 'localhost:3000';
                return null;
            }), 
            body: {}, params: {}, query: {} 
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Spy on static helper (menggunakan Class Constructor yang benar)
        jest.spyOn(JadwalControllerClass, 'getIndonesianDayName').mockReturnValue('Senin');

        // Mock Model default success paths
        JadwalModel.getScheduledUsersByDay.mockResolvedValue(MOCK_SCHEDULE);
        JadwalModel.getAbsensiStatusForToday.mockResolvedValue(MOCK_ABSENSI);
    });

    afterAll(() => {
        mockDateSpy.mockRestore(); // Restore Date global mock
    });

    // --- TESTING STATIC HELPER ---
    describe('getIndonesianDayName (Static Helper)', () => {
        // PERBAIKAN: Menguji fungsi asli karena mocking di beforeEach hanya untuk Controller
        beforeEach(() => {
            jest.spyOn(JadwalControllerClass, 'getIndonesianDayName').mockRestore();
        });
        
        test('should correctly return Indonesian day name for Monday', () => {
            // Monday is 1
            const date = new Date('2025-12-08T10:00:00Z'); 
            date.getDay = jest.fn(() => 1); 

            const hari = JadwalControllerClass.getIndonesianDayName(date);
            expect(hari).toBe('Senin');
        });

        test('should correctly return Indonesian day name for Sunday', () => {
            // Sunday is 0
            const date = new Date('2025-12-07T10:00:00Z');
            date.getDay = jest.fn(() => 0); 
            
            const hari = JadwalControllerClass.getIndonesianDayName(date);
            expect(hari).toBe('Minggu');
        });
    });

    // --- TESTING getJadwalPiketHariIni ---
    describe('getJadwalPiketHariIni', () => {
        
        test('should return combined data with correct status (sudah, sedang, belum)', async () => {
            await bind(jadwalControllerInstance.getJadwalPiketHariIni)(req, res);

            // Verifikasi pemanggilan Model
            expect(JadwalModel.getScheduledUsersByDay).toHaveBeenCalledWith('Senin');
            expect(JadwalModel.getAbsensiStatusForToday).toHaveBeenCalledWith('2025-12-08');

            const results = res.json.mock.calls[0][0];
            
            expect(results.length).toBe(3);
            
            // User 1: Sudah (waktu_keluar ada)
            expect(results.find(u => u.id === 1).status).toBe('sudah');
            // User 2: Belum (tidak ada di MOCK_ABSENSI)
            expect(results.find(u => u.id === 2).status).toBe('belum');
            // User 3: Sedang (waktu_keluar null)
            expect(results.find(u => u.id === 3).status).toBe('sedang');
        });
        
        // TEST: Memastikan URL avatar dibentuk dengan benar
        test('should construct full avatar URL correctly', async () => {
            await bind(jadwalControllerInstance.getJadwalPiketHariIni)(req, res);
            
            const results = res.json.mock.calls[0][0];
            
            const userA = results.find(u => u.id === 1);
            const userB = results.find(u => u.id === 2);

            // Verifikasi URL yang sudah di-replace backslash dan ditambahkan protocol/host
            expect(userA.avatar_url).toBe('http://localhost:3000/uploads/a.jpg');
            // Verifikasi avatar null
            expect(userB.avatar_url).toBeNull();
        });
        
        // TEST: Error Handling (Catch Block - Line 63)
        test('should return 500 on database error during scheduled user fetch', async () => {
            JadwalModel.getScheduledUsersByDay.mockRejectedValue(new Error('DB Query Failed'));

            await bind(jadwalControllerInstance.getJadwalPiketHariIni)(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Gagal mengambil jadwal piket' }));
        });
    });
});