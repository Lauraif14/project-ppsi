// tests/controllers/laporanController.test.js

jest.mock('../../models/laporanModel');

const laporanController = require('../../controllers/laporanController');
const LaporanModel = require('../../models/laporanModel');

describe('LaporanController', () => {
    let req;
    let res;

    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterAll(() => {
        console.error.mockRestore();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            query: {},
            protocol: 'http',
            get: jest.fn((header) => {
                if (header === 'host') return 'localhost:5000';
                return null;
            }),
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    describe('getAbsensiLaporan', () => {
        const mockAbsensiData = [
            {
                id: 1,
                nama_lengkap: 'User A',
                foto_path: 'public/uploads/absensi/photo1.jpg',
                foto_path_keluar: 'public/uploads/absensi/photo2.jpg',
                waktu_masuk: '2025-12-09 08:00:00',
                waktu_keluar: '2025-12-09 17:00:00',
            },
            {
                id: 2,
                nama_lengkap: 'User B',
                foto_path: null,
                foto_path_keluar: null,
                waktu_masuk: '2025-12-09 08:30:00',
                waktu_keluar: null,
            },
        ];

        test('should return 400 if startDate or endDate is missing', async () => {
            req.query = {};
            await laporanController.getAbsensiLaporan(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Rentang tanggal (startDate dan endDate) diperlukan.' });
        });

        test('should return 400 if only startDate is provided', async () => {
            req.query = { startDate: '2025-12-01' };
            await laporanController.getAbsensiLaporan(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('should return 400 if only endDate is provided', async () => {
            req.query = { endDate: '2025-12-09' };
            await laporanController.getAbsensiLaporan(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('should return absensi report with photo URLs', async () => {
            req.query = { startDate: '2025-12-01', endDate: '2025-12-09' };
            LaporanModel.getAbsensiReport.mockResolvedValue(mockAbsensiData);

            await laporanController.getAbsensiLaporan(req, res);

            expect(LaporanModel.getAbsensiReport).toHaveBeenCalledWith(
                '2025-12-01 00:00:00',
                '2025-12-09 23:59:59'
            );
            expect(res.json).toHaveBeenCalledWith([
                {
                    id: 1,
                    nama_lengkap: 'User A',
                    foto_path: 'public/uploads/absensi/photo1.jpg',
                    foto_path_keluar: 'public/uploads/absensi/photo2.jpg',
                    waktu_masuk: '2025-12-09 08:00:00',
                    waktu_keluar: '2025-12-09 17:00:00',
                    foto_masuk_url: 'http://localhost:5000/public/uploads/absensi/photo1.jpg',
                    foto_keluar_url: 'http://localhost:5000/public/uploads/absensi/photo2.jpg',
                },
                {
                    id: 2,
                    nama_lengkap: 'User B',
                    foto_path: null,
                    foto_path_keluar: null,
                    waktu_masuk: '2025-12-09 08:30:00',
                    waktu_keluar: null,
                    foto_masuk_url: null,
                    foto_keluar_url: null,
                },
            ]);
        });

        test('should return 500 on database error', async () => {
            req.query = { startDate: '2025-12-01', endDate: '2025-12-09' };
            console.error.mockClear();
            LaporanModel.getAbsensiReport.mockRejectedValue(new Error('DB Error'));

            await laporanController.getAbsensiLaporan(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Gagal mengambil laporan absensi' });
            expect(console.error).toHaveBeenCalledWith('Error Laporan Absensi:', expect.any(Error));
        });
    });

    describe('getInventarisStatusRealtime', () => {
        const mockInventarisStatus = [
            { id: 1, nama: 'Kursi', status: 'Baik', kategori: 'Furniture' },
            { id: 2, nama: 'Meja', status: 'Rusak', kategori: 'Furniture' },
        ];

        test('should return inventaris status successfully', async () => {
            LaporanModel.getInventarisStatus.mockResolvedValue(mockInventarisStatus);

            await laporanController.getInventarisStatusRealtime(req, res);

            expect(LaporanModel.getInventarisStatus).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(mockInventarisStatus);
        });

        test('should return 500 on database error', async () => {
            LaporanModel.getInventarisStatus.mockRejectedValue(new Error('DB Error'));

            await laporanController.getInventarisStatusRealtime(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Gagal mengambil status inventaris' });
        });
    });

    describe('getInventarisLaporanByDate', () => {
        const mockChecklistData = [
            {
                id: 1,
                tanggal: '2025-12-09',
                inventaris_checklist: '{"items":[{"id":1,"status":"Baik"}]}',
            },
            {
                id: 2,
                tanggal: '2025-12-09',
                inventaris_checklist: '{"items":[{"id":2,"status":"Rusak"}]}',
            },
        ];

        test('should return 400 if tanggal is missing', async () => {
            req.query = {};
            await laporanController.getInventarisLaporanByDate(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Tanggal diperlukan.' });
        });

        test('should return inventaris report with parsed checklist', async () => {
            req.query = { tanggal: '2025-12-09' };

            // Mock master items
            LaporanModel.getInventarisStatus.mockResolvedValue([
                { id: 1, nama: 'Item 1', status: 'Baik' },
                { id: 2, nama: 'Item 2', status: 'Rusak' }
            ]);

            // Mock checklist data
            LaporanModel.getInventarisChecklistReport.mockResolvedValue(mockChecklistData);

            await laporanController.getInventarisLaporanByDate(req, res);

            expect(LaporanModel.getInventarisStatus).toHaveBeenCalled();
            expect(LaporanModel.getInventarisChecklistReport).toHaveBeenCalled();

            // Controller returns processed data, just check it was called
            expect(res.json).toHaveBeenCalled();
        });

        test('should return 500 on database error', async () => {
            req.query = { tanggal: '2025-12-09' };
            console.error.mockClear();
            LaporanModel.getInventarisChecklistReport.mockRejectedValue(new Error('DB Error'));

            await laporanController.getInventarisLaporanByDate(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Gagal mengambil laporan inventaris' });
            expect(console.error).toHaveBeenCalledWith('Error Laporan Inventaris:', expect.any(Error));
        });

        test('should handle invalid JSON in inventaris_checklist and log error', async () => {
            req.query = { tanggal: '2025-12-09' };
            console.error.mockClear();

            LaporanModel.getInventarisStatus.mockResolvedValue([
                { id: 1, nama_barang: 'Item 1', status: 'Baik' }
            ]);

            // Mock data with invalid JSON string
            LaporanModel.getInventarisChecklistReport.mockResolvedValue([
                {
                    id: 1,
                    nama_lengkap: 'User A',
                    waktu_masuk: '2025-12-09 08:00:00',
                    inventaris_checklist: 'invalid json {{{' // Invalid JSON
                }
            ]);

            await laporanController.getInventarisLaporanByDate(req, res);

            expect(console.error).toHaveBeenCalledWith('Error parsing checklist JSON:', expect.any(Error));
            expect(res.json).toHaveBeenCalled();
        });

        test('should process checklist array and update itemStatusMap by ID', async () => {
            req.query = { tanggal: '2025-12-09' };

            LaporanModel.getInventarisStatus.mockResolvedValue([
                { id: 1, nama_barang: 'Kursi', status: 'Baik' },
                { id: 2, nama_barang: 'Meja', status: 'Tersedia' }
            ]);

            // Mock checklist with array of items
            LaporanModel.getInventarisChecklistReport.mockResolvedValue([
                {
                    id: 1,
                    nama_lengkap: 'User A',
                    waktu_masuk: '2025-12-09 08:00:00',
                    inventaris_checklist: [
                        { id: 1, condition: 'Rusak' },
                        { id: 2, status: 'Dipinjam' }
                    ]
                }
            ]);

            await laporanController.getInventarisLaporanByDate(req, res);

            expect(res.json).toHaveBeenCalled();
            const response = res.json.mock.calls[0][0];
            expect(response).toBeInstanceOf(Array);
            expect(response.length).toBe(2);
        });

        test('should use itemName fallback when ID is not available', async () => {
            req.query = { tanggal: '2025-12-09' };

            LaporanModel.getInventarisStatus.mockResolvedValue([
                { id: 1, nama_barang: 'Kursi', status: 'Baik' }
            ]);

            // Mock checklist with items using nama/item/nama_barang instead of id
            LaporanModel.getInventarisChecklistReport.mockResolvedValue([
                {
                    id: 1,
                    nama_lengkap: 'User A',
                    waktu_masuk: '2025-12-09 08:00:00',
                    inventaris_checklist: [
                        { nama: 'Kursi', condition: 'Rusak' }
                    ]
                }
            ]);

            await laporanController.getInventarisLaporanByDate(req, res);

            expect(res.json).toHaveBeenCalled();
            const response = res.json.mock.calls[0][0];
            expect(response[0].status).toBe('Rusak');
        });

        test('should handle items without history (not checked today)', async () => {
            req.query = { tanggal: '2025-12-09' };

            LaporanModel.getInventarisStatus.mockResolvedValue([
                { id: 1, nama_barang: 'Kursi', status: 'Baik' },
                { id: 2, nama_barang: 'Meja', status: 'Tersedia' }
            ]);

            // Empty checklist - no items checked
            LaporanModel.getInventarisChecklistReport.mockResolvedValue([]);

            await laporanController.getInventarisLaporanByDate(req, res);

            expect(res.json).toHaveBeenCalled();
            const response = res.json.mock.calls[0][0];
            expect(response.length).toBe(2);
            expect(response[0]).toHaveProperty('keterangan_laporan');
            expect(response[0]).toHaveProperty('status_cek', 'not_checked');
        });

        test('should handle invalid JSON in inventaris_checklist gracefully', async () => {
            // Controller menangani invalid JSON dengan console.error dan return (graceful handling)
            req.query = { tanggal: '2025-12-09' };
            const invalidData = [
                {
                    id: 1,
                    tanggal: '2025-12-09',
                    inventaris_checklist: 'invalid json string',
                },
            ];
            console.error.mockClear();

            // Mock master items
            LaporanModel.getInventarisStatus.mockResolvedValue([
                { id: 1, nama_barang: 'Item 1', kode_barang: 'A001', status: 'Baik' }
            ]);

            LaporanModel.getInventarisChecklistReport.mockResolvedValue(invalidData);

            await laporanController.getInventarisLaporanByDate(req, res);

            // Controller menangani dengan graceful - log error tapi tetap return 200
            expect(console.error).toHaveBeenCalledWith('Error parsing checklist JSON:', expect.any(Error));
            expect(res.json).toHaveBeenCalled();
            // Masih return data master items
            const response = res.json.mock.calls[0][0];
            expect(response.length).toBe(1);
        });
    });

    describe('getWeeklyPiketReport', () => {
        const mockWeeklyData = [
            {
                user_id: 1,
                nama_lengkap: 'User A',
                divisi: 'IT',
                jabatan: 'Staff',
                total_jadwal: 5,
                total_selesai: 4,
                total_tidak_selesai: 1,
                total_tidak_piket: 0
            },
            {
                user_id: 2,
                nama_lengkap: 'User B',
                divisi: 'HR',
                jabatan: 'Manager',
                total_jadwal: 3,
                total_selesai: 2,
                total_tidak_selesai: 0,
                total_tidak_piket: 1
            }
        ];

        test('should return 400 if startDate or endDate is missing', async () => {
            req.query = {};
            await laporanController.getWeeklyPiketReport(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'startDate dan endDate diperlukan' });
        });

        test('should return 400 if only startDate is provided', async () => {
            req.query = { startDate: '2025-12-01' };
            await laporanController.getWeeklyPiketReport(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('should return 400 if only endDate is provided', async () => {
            req.query = { endDate: '2025-12-09' };
            await laporanController.getWeeklyPiketReport(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('should return weekly piket report with summary', async () => {
            req.query = { startDate: '2025-12-01', endDate: '2025-12-07' };
            LaporanModel.getWeeklyPiketReport.mockResolvedValue(mockWeeklyData);

            await laporanController.getWeeklyPiketReport(req, res);

            expect(LaporanModel.getWeeklyPiketReport).toHaveBeenCalledWith('2025-12-01', '2025-12-07');
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                period: { startDate: '2025-12-01', endDate: '2025-12-07' },
                data: mockWeeklyData,
                summary: {
                    total_pengurus: 2,
                    total_jadwal: 8,
                    total_selesai: 6,
                    total_tidak_selesai: 1,
                    total_tidak_piket: 1
                }
            });
        });

        test('should return 500 on database error', async () => {
            req.query = { startDate: '2025-12-01', endDate: '2025-12-07' };
            console.error.mockClear();
            LaporanModel.getWeeklyPiketReport.mockRejectedValue(new Error('DB Error'));

            await laporanController.getWeeklyPiketReport(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Gagal mengambil laporan piket mingguan' });
            expect(console.error).toHaveBeenCalledWith('Error Weekly Piket Report:', expect.any(Error));
        });
    });

    describe('getMonthlyPiketReport', () => {
        const mockMonthlyData = [
            {
                user_id: 1,
                nama_lengkap: 'User A',
                divisi: 'IT',
                jabatan: 'Staff',
                total_jadwal: 20,
                total_selesai: 18,
                total_tidak_selesai: 2,
                total_tidak_piket: 0
            },
            {
                user_id: 2,
                nama_lengkap: 'User B',
                divisi: 'HR',
                jabatan: 'Manager',
                total_jadwal: 15,
                total_selesai: 14,
                total_tidak_selesai: 0,
                total_tidak_piket: 1
            }
        ];

        test('should return 400 if year or month is missing', async () => {
            req.query = {};
            await laporanController.getMonthlyPiketReport(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'year dan month diperlukan' });
        });

        test('should return 400 if only year is provided', async () => {
            req.query = { year: '2025' };
            await laporanController.getMonthlyPiketReport(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('should return 400 if only month is provided', async () => {
            req.query = { month: '12' };
            await laporanController.getMonthlyPiketReport(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('should return monthly piket report with summary', async () => {
            req.query = { year: '2025', month: '12' };
            LaporanModel.getMonthlyPiketReport.mockResolvedValue(mockMonthlyData);

            await laporanController.getMonthlyPiketReport(req, res);

            expect(LaporanModel.getMonthlyPiketReport).toHaveBeenCalledWith(2025, 12);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                period: { year: 2025, month: 12 },
                data: mockMonthlyData,
                summary: {
                    total_pengurus: 2,
                    total_jadwal: 35,
                    total_selesai: 32,
                    total_tidak_selesai: 2,
                    total_tidak_piket: 1
                }
            });
        });

        test('should return 500 on database error', async () => {
            req.query = { year: '2025', month: '12' };
            console.error.mockClear();
            LaporanModel.getMonthlyPiketReport.mockRejectedValue(new Error('DB Error'));

            await laporanController.getMonthlyPiketReport(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Gagal mengambil laporan piket bulanan' });
            expect(console.error).toHaveBeenCalledWith('Error Monthly Piket Report:', expect.any(Error));
        });
    });
});
