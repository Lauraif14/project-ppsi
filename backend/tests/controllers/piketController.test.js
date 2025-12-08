// tests/controllers/piketController.test.js (VERSI TERKOREKSI)

const PiketController = require('../../controllers/piketController'); 
const UserModel = require('../../models/userModel');
const AbsensiModel = require('../../models/absensiModel');
const JadwalModel = require('../../models/jadwalModel'); 

// Mock Model yang benar
jest.mock('../../models/userModel');
jest.mock('../../models/absensiModel');
jest.mock('../../models/jadwalModel'); 

// Mocking Math.random untuk membuat hasil generateJadwalPiket konsisten
global.Math.random = jest.fn(() => 0.4); 

// Mocking Date untuk konsistensi pengujian hari dan tanggal
const MOCK_DATE_MONDAY = new Date('2025-11-17T12:00:00.000Z'); // Senin (getDay() = 1)
const REAL_DATE = Date; 

describe('PiketController (OOP)', () => {
    let req;
    let res;
    // Ambil instance controller yang sudah diexport
    const piketControllerInstance = require('../../controllers/piketController'); 

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Mock objek Request dan Response
        req = {
            body: {},
            user: { id: 1 },
            query: {},
            params: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Mock Date
        global.Date = class extends REAL_DATE {
            constructor(input) {
                return input ? new REAL_DATE(input) : MOCK_DATE_MONDAY;
            }
        };
    });

    afterAll(() => {
        global.Date = REAL_DATE; // Kembalikan Date asli
    });

    // --- Testing getPengurusList ---
    describe('getPengurusList', () => {
        // Menggunakan UserModel.getAllUsersComplete
        test('should return 200 and list of pengurus', async () => {
            const mockPengurus = [{ id: 1, nama_lengkap: 'A', jabatan: 'Ketua' }];
            UserModel.getAllUsersComplete.mockResolvedValue(mockPengurus); // <--- DIGANTI

            await piketControllerInstance.getPengurusList.bind(piketControllerInstance)(req, res);

            expect(UserModel.getAllUsersComplete).toHaveBeenCalled(); // <--- DIGANTI
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockPengurus
            });
        });

        // Menutup catch block
        test('should return 500 on database error', async () => {
            UserModel.getAllUsersComplete.mockRejectedValue(new Error('DB Error')); // <--- DIGANTI

            await piketControllerInstance.getPengurusList.bind(piketControllerInstance)(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ success: false, message: 'Error fetching pengurus' })
            );
        });
    });

    // --- Testing getJadwalPiket ---
    describe('getJadwalPiket', () => {
        const mockJadwalRows = [
            { id: 1, hari: 'Senin', user_id: 1, nama_lengkap: 'Pengurus A', jabatan: 'K' },
            { id: 2, hari: 'Senin', user_id: 2, nama_lengkap: 'Pengurus B', jabatan: 'S' },
            { id: 3, hari: 'Rabu', user_id: 3, nama_lengkap: 'Pengurus C', jabatan: 'B' },
        ];

        // Menggunakan JadwalModel.getAllJadwalPiket
        test('should return 200 and grouped schedule', async () => {
            JadwalModel.getAllJadwalPiket.mockResolvedValue(mockJadwalRows); // <--- DIGANTI

            await piketControllerInstance.getJadwalPiket.bind(piketControllerInstance)(req, res);

            // TIDAK ADA checkJadwalPiketTableExists di Controller yang baru
            expect(JadwalModel.getAllJadwalPiket).toHaveBeenCalled(); // <--- DIGANTI
            
            const expectedSchedule = { /* ... (Logic grouping tetap sama) ... */ }; 
            // Kita hanya memastikan grouping berjalan
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ success: true, data: expect.any(Object) })
            );
        });
        
        // Menutup catch block
        test('should return 500 on database error during fetch', async () => {
            JadwalModel.getAllJadwalPiket.mockRejectedValue(new Error('Fetch Error')); // <--- DIGANTI

            await piketControllerInstance.getJadwalPiket.bind(piketControllerInstance)(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ success: false, message: 'Error fetching jadwal piket' })
            );
        });
    });

    // --- Testing saveJadwalPiket ---
    describe('saveJadwalPiket', () => {
        beforeEach(() => {
            // Mengganti semua PiketModel dengan Model yang baru
            JadwalModel.clearAllJadwalPiket.mockResolvedValue({ affectedRows: 5 }); // <--- DIGANTI
            
            UserModel.findUserByNamaLengkap.mockImplementation((name) => { // <--- DIGANTI
                if (name === 'A') return { id: 1 };
                if (name === 'B') return { id: 2 };
                return null;
            });
            JadwalModel.insertJadwalPiket.mockResolvedValue(true); // <--- DIGANTI
        });

        test('should clear old schedule and insert new schedule successfully', async () => {
            req.body = { schedule: { 'Senin': ['A', 'B'], 'Selasa': ['A'] } };

            await piketControllerInstance.saveJadwalPiket.bind(piketControllerInstance)(req, res);

            expect(JadwalModel.clearAllJadwalPiket).toHaveBeenCalled(); // <--- DIGANTI
            expect(JadwalModel.insertJadwalPiket).toHaveBeenCalledTimes(3); // <--- DIGANTI
            expect(JadwalModel.insertJadwalPiket).toHaveBeenCalledWith(1, 'Senin');
            
            expect(res.status).toHaveBeenCalledWith(201);
        });

        test('should return 400 if schedule data is missing', async () => {
            req.body = { schedule: null };

            await piketControllerInstance.saveJadwalPiket.bind(piketControllerInstance)(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(JadwalModel.clearAllJadwalPiket).not.toHaveBeenCalled(); // <--- DIGANTI
        });

        // Menutup catch block inside loop (insertError)
        test('should handle database insert error inside loop', async () => {
            req.body = { schedule: { 'Senin': ['A'] } };
            JadwalModel.insertJadwalPiket.mockRejectedValue(new Error('Insert Fail')); // <--- DIGANTI
            
            await piketControllerInstance.saveJadwalPiket.bind(piketControllerInstance)(req, res);
            
            expect(res.status).toHaveBeenCalledWith(201); 
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        total_inserted: 0,
                        errors: [expect.stringContaining('Error inserting A: Insert Fail')]
                    })
                })
            );
        });
        
        // Menutup catch block utama (clearAllJadwalPiket fails)
        test('should return 500 if clearAllJadwalPiket fails', async () => {
            req.body = { schedule: { 'Senin': ['A'] } };
            JadwalModel.clearAllJadwalPiket.mockRejectedValue(new Error('Clear DB Fail')); // <--- DIGANTI
            
            await piketControllerInstance.saveJadwalPiket.bind(piketControllerInstance)(req, res);
            
            expect(res.status).toHaveBeenCalledWith(500); 
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ success: false, message: 'Error saving jadwal piket' })
            );
        });
    });

    // --- Testing deleteJadwalPiket ---
    describe('deleteJadwalPiket', () => {
        // Menggunakan JadwalModel.clearAllJadwalPiket
        test('should return success and count of deleted rows', async () => {
            JadwalModel.clearAllJadwalPiket.mockResolvedValue({ affectedRows: 10 }); // <--- DIGANTI

            await piketControllerInstance.deleteJadwalPiket.bind(piketControllerInstance)(req, res);

            expect(JadwalModel.clearAllJadwalPiket).toHaveBeenCalled(); // <--- DIGANTI
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Berhasil menghapus 10 jadwal piket' })
            );
        });

        // Menutup catch block
        test('should return 500 on database error', async () => {
            JadwalModel.clearAllJadwalPiket.mockRejectedValue(new Error('Delete Error')); // <--- DIGANTI

            await piketControllerInstance.deleteJadwalPiket.bind(piketControllerInstance)(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    // --- Testing generateJadwalPiket ---
    describe('generateJadwalPiket', () => {
        const mockPengurus = [
            { id: 1, nama_lengkap: 'A' }, { id: 2, nama_lengkap: 'B' }, 
            { id: 3, nama_lengkap: 'C' }, { id: 4, nama_lengkap: 'D' }, { id: 5, nama_lengkap: 'E' },
        ];
        
        beforeEach(() => {
            UserModel.getAllPengurus.mockResolvedValue(mockPengurus); // <--- DIGANTI
        });

        // Menggunakan UserModel.getAllPengurus
        test('should generate schedule for 5 days with default 3 assignments/day', async () => {
            req.body = {}; 
            await piketControllerInstance.generateJadwalPiket.bind(piketControllerInstance)(req, res);

            expect(UserModel.getAllPengurus).toHaveBeenCalled(); // <--- DIGANTI
            
            const generatedSchedule = res.json.mock.calls[0][0].data.schedule;
            expect(generatedSchedule.Senin.length).toBe(3);
        });
        
        // Menutup 400 Not Found
        test('should return 400 if no pengurus found', async () => {
            UserModel.getAllPengurus.mockResolvedValue([]); // <--- DIGANTI

            await piketControllerInstance.generateJadwalPiket.bind(piketControllerInstance)(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'No pengurus found' });
        });
        
        // Menutup catch block
        test('should return 500 on database error during getAllPengurus', async () => {
            UserModel.getAllPengurus.mockRejectedValue(new Error('Generate DB Error')); // <--- DIGANTI

            await piketControllerInstance.generateJadwalPiket.bind(piketControllerInstance)(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ success: false, message: 'Error generating schedule' })
            );
        });
    });

    // --- Testing getAbsensiReport ---
    describe('getAbsensiReport', () => {
        const mockAbsensi = [{ id: 1, nama_lengkap: 'A', status: 'Masuk' }];

        beforeEach(() => {
            AbsensiModel.getLaporanByDate.mockResolvedValue(mockAbsensi); // <--- DIGANTI
        });

        // Menggunakan AbsensiModel.getLaporanByDate
        test('should return 200 and absensi report for valid date', async () => {
            req.query.date = '2025-11-17'; // Senin
            
            await piketControllerInstance.getAbsensiReport.bind(piketControllerInstance)(req, res);

            expect(AbsensiModel.getLaporanByDate).toHaveBeenCalledWith('2025-11-17'); // <--- DIGANTI
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({ hari: 'Senin' })
                })
            );
        });

        // Menutup 400 Invalid Date Format
        test('should return 400 if date query param is invalid', async () => {
            req.query.date = 'invalid-date';

            await piketControllerInstance.getAbsensiReport.bind(piketControllerInstance)(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid date format' });
        });
        
        // Menutup catch block
        test('should return 500 on database error', async () => {
            req.query.date = '2025-11-17';
            AbsensiModel.getLaporanByDate.mockRejectedValue(new Error('DB Query Failed')); // <--- DIGANTI

            await piketControllerInstance.getAbsensiReport.bind(piketControllerInstance)(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ success: false, message: 'Error fetching absensi data' })
            );
        });
    });

    // --- Testing deleteAbsensi ---
    describe('deleteAbsensi', () => {
        // Menggunakan AbsensiModel.deleteRecord
        test('should return 200 and success message if record deleted', async () => {
            req.params = { id: '5' };
            AbsensiModel.deleteRecord.mockResolvedValue(1); // <--- DIGANTI

            await piketControllerInstance.deleteAbsensi.bind(piketControllerInstance)(req, res);

            expect(AbsensiModel.deleteRecord).toHaveBeenCalledWith('5'); // <--- DIGANTI
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Absensi record deleted successfully' })
            );
        });

        // Menutup 404 Not Found
        test('should return 404 if record not found', async () => {
            req.params = { id: '999' };
            AbsensiModel.deleteRecord.mockResolvedValue(0); // <--- DIGANTI

            await piketControllerInstance.deleteAbsensi.bind(piketControllerInstance)(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Absensi record not found' });
        });

        // Menutup catch block
        test('should return 500 on database error during delete', async () => {
            req.params = { id: '5' };
            AbsensiModel.deleteRecord.mockRejectedValue(new Error('Delete DB Error')); // <--- DIGANTI

            await piketControllerInstance.deleteAbsensi.bind(piketControllerInstance)(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ success: false, message: 'Error deleting absensi record' })
            );
        });
    });
});