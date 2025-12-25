// tests/controllers/jadwalController.test.js - Updated for date-based system

const jadwalControllerInstance = require('../../controllers/jadwalController');
const JadwalModel = require('../../models/jadwalModel');

jest.mock('../../models/jadwalModel');

describe('JadwalController - Date-based System', () => {
    let req;
    let res;

    const JadwalControllerClass = jadwalControllerInstance.constructor;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            protocol: 'http',
            get: jest.fn((header) => {
                if (header === 'host') return 'localhost:5000';
                return null;
            }),
            body: {},
            params: {},
            query: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    describe('Static Helper Methods', () => {
        test('getIndonesianDayName should return correct day name', () => {
            const monday = new Date('2025-01-06'); // Monday
            expect(JadwalControllerClass.getIndonesianDayName(monday)).toBe('Senin');

            const sunday = new Date('2025-01-05'); // Sunday
            expect(JadwalControllerClass.getIndonesianDayName(sunday)).toBe('Minggu');
        });

        test('isWeekday should return true for Monday-Friday', () => {
            const monday = new Date('2025-01-06');
            expect(JadwalControllerClass.isWeekday(monday)).toBe(true);

            const saturday = new Date('2025-01-04');
            expect(JadwalControllerClass.isWeekday(saturday)).toBe(false);
        });
    });

    describe('getJadwalHariIni', () => {
        test('should return today schedule with status', async () => {
            const mockJadwal = [
                { user_id: 1, nama_lengkap: 'User A', avatar_url: 'uploads/a.jpg' },
                { user_id: 2, nama_lengkap: 'User B', avatar_url: null }
            ];
            const mockAbsensi = [
                { user_id: 1, waktu_masuk: '2025-01-08 08:00', waktu_keluar: '2025-01-08 17:00' }
            ];

            JadwalModel.getJadwalByDate.mockResolvedValue(mockJadwal);
            JadwalModel.getAbsensiStatusForToday.mockResolvedValue(mockAbsensi);

            await jadwalControllerInstance.getJadwalHariIni(req, res);

            expect(JadwalModel.getJadwalByDate).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        pengurus: expect.any(Array)
                    })
                })
            );
        });

        test('should return 500 on error', async () => {
            JadwalModel.getJadwalByDate.mockRejectedValue(new Error('DB Error'));

            await jadwalControllerInstance.getJadwalHariIni(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('getJadwal', () => {
        test('should get current week schedule by default', async () => {
            JadwalModel.getCurrentWeekSchedule.mockResolvedValue([]);

            await jadwalControllerInstance.getJadwal(req, res);

            expect(JadwalModel.getCurrentWeekSchedule).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ success: true })
            );
        });

        test('should get schedule by date range', async () => {
            req.query = { start_date: '2025-01-08', end_date: '2025-01-12' };
            JadwalModel.getJadwalByDateRange.mockResolvedValue([]);

            await jadwalControllerInstance.getJadwal(req, res);

            expect(JadwalModel.getJadwalByDateRange).toHaveBeenCalledWith('2025-01-08', '2025-01-12');
        });

        test('should get schedule by month', async () => {
            req.query = { year: '2025', month: '1' };
            JadwalModel.getJadwalByMonth.mockResolvedValue([]);

            await jadwalControllerInstance.getJadwal(req, res);

            expect(JadwalModel.getJadwalByMonth).toHaveBeenCalledWith(2025, 1);
        });

        test('should return 500 on error', async () => {
            JadwalModel.getCurrentWeekSchedule.mockRejectedValue(new Error('DB Error'));

            await jadwalControllerInstance.getJadwal(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('saveJadwal', () => {
        test('should save schedule successfully', async () => {
            req.body = {
                schedule: [
                    { user_id: 1, tanggal: '2025-01-08', hari: 'Senin' },
                    { user_id: 2, tanggal: '2025-01-09', hari: 'Selasa' }
                ]
            };

            JadwalModel.deleteJadwalByDateRange.mockResolvedValue({ affectedRows: 0 });
            JadwalModel.insertJadwalByDate.mockResolvedValue();

            await jadwalControllerInstance.saveJadwal(req, res);

            expect(JadwalModel.deleteJadwalByDateRange).toHaveBeenCalled();
            expect(JadwalModel.insertJadwalByDate).toHaveBeenCalledTimes(2);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ success: true })
            );
        });

        test('should return 400 if schedule is not array', async () => {
            req.body = { schedule: 'invalid' };

            await jadwalControllerInstance.saveJadwal(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('should return 500 on error', async () => {
            req.body = { schedule: [{ user_id: 1, tanggal: '2025-01-08', hari: 'Senin' }] };
            JadwalModel.deleteJadwalByDateRange.mockRejectedValue(new Error('DB Error'));

            await jadwalControllerInstance.saveJadwal(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('deleteJadwal', () => {
        test('should delete all jadwal if no date range', async () => {
            JadwalModel.deleteAllJadwal.mockResolvedValue({ affectedRows: 10 });

            await jadwalControllerInstance.deleteJadwal(req, res);

            expect(JadwalModel.deleteAllJadwal).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ deleted_count: 10 })
            );
        });

        test('should delete jadwal by date range', async () => {
            req.query = { start_date: '2025-01-08', end_date: '2025-01-12' };
            JadwalModel.deleteJadwalByDateRange.mockResolvedValue({ affectedRows: 5 });

            await jadwalControllerInstance.deleteJadwal(req, res);

            expect(JadwalModel.deleteJadwalByDateRange).toHaveBeenCalledWith('2025-01-08', '2025-01-12');
        });

        test('should return 500 on error', async () => {
            JadwalModel.deleteAllJadwal.mockRejectedValue(new Error('DB Error'));

            await jadwalControllerInstance.deleteJadwal(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('generateJadwalByDateRange', () => {
        test('should generate schedule for date range', async () => {
            req.body = {
                start_date: '2025-01-06', // Monday
                end_date: '2025-01-10',   // Friday
                assignments_per_day: 3
            };

            const db = require('../../db');
            db.query = jest.fn().mockResolvedValue([[
                { id: 1, nama_lengkap: 'User A', divisi: 'IT' },
                { id: 2, nama_lengkap: 'User B', divisi: 'HR' }
            ]]);

            await jadwalControllerInstance.generateJadwalByDateRange(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        schedule: expect.any(Array),
                        total_days: 5
                    })
                })
            );
        });

        test('should return 400 if dates missing', async () => {
            req.body = {};

            await jadwalControllerInstance.generateJadwalByDateRange(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('should return 500 on error', async () => {
            req.body = { start_date: '2025-01-06', end_date: '2025-01-10' };
            const db = require('../../db');
            db.query = jest.fn().mockRejectedValue(new Error('DB Error'));

            await jadwalControllerInstance.generateJadwalByDateRange(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});