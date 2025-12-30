// tests/controllers/laporanController.test.js
const LaporanController = require('../../controllers/laporanController');
const db = require('../../db');

jest.mock('../../db');

describe('LaporanController', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            query: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        // Suppress console.error during tests
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    describe('getLaporanAbsensi', () => {
        const mockRows = [
            {
                absensi_id: 1,
                tanggal: '2025-01-01',
                day_name: 'Monday',
                user_id: 101,
                nama_lengkap: 'Budi',
                divisi: 'IT',
                avatar_url: 'avatar.jpg',
                waktu_masuk: '2025-01-01T08:00:00.000Z',
                waktu_keluar: '2025-01-01T17:00:00.000Z',
                checklist_submitted: 1,
                note: 'On time',
                foto_path: 'masuk.jpg',
                foto_path_keluar: 'keluar.jpg'
            },
            {
                absensi_id: 2,
                tanggal: '2025-01-01',
                day_name: 'Monday',
                user_id: 102,
                nama_lengkap: 'Siti',
                divisi: 'HR',
                avatar_url: 'avatar2.jpg',
                waktu_masuk: '2025-01-01T09:00:00.000Z',
                waktu_keluar: null,
                checklist_submitted: 0,
                note: null,
                foto_path: 'masuk2.jpg',
                foto_path_keluar: null
            }
        ];

        test('should return grouped data successfully with default date range', async () => {
            db.query.mockResolvedValue([mockRows]);

            await LaporanController.getLaporanAbsensi(req, res);

            // Verify DB query params (default: month ago)
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('SELECT'),
                expect.any(Array)
            );
            // expect params to be [monthAgo]

            // Verify Response
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                total: 2,
                data: expect.any(Array)
            }));

            const responseData = res.json.mock.calls[0][0].data;
            expect(responseData.length).toBe(1); // 1 group (date '2025-01-01')
            expect(responseData[0].tanggal).toBe('2025-01-01');
            expect(responseData[0].hari).toBe('Senin'); // Monday -> Senin
            expect(responseData[0].pengurus.length).toBe(2);
            expect(responseData[0].pengurus[0].status).toBe('sudah');
            expect(responseData[0].pengurus[1].status).toBe('sedang');
        });

        test('should filter by start_date and end_date', async () => {
            req.query = { start_date: '2025-01-01', end_date: '2025-01-02' };
            db.query.mockResolvedValue([mockRows]);

            await LaporanController.getLaporanAbsensi(req, res);

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('BETWEEN ? AND ?'),
                ['2025-01-01', '2025-01-02']
            );
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        });

        test('should handle database error', async () => {
            const error = new Error('DB Error');
            db.query.mockRejectedValue(error);

            await LaporanController.getLaporanAbsensi(req, res);

            expect(console.error).toHaveBeenCalledWith('Error getting laporan absensi:', error);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: false,
                message: expect.stringContaining('Gagal mengambil laporan absensi')
            }));
        });
    });
});
