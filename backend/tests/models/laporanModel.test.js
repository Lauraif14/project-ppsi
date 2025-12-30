// tests/models/laporanModel.test.js

jest.mock('../../db');

const db = require('../../db');
const LaporanModel = require('../../models/laporanModel');

describe('LaporanModel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAbsensiReport', () => {
        const mockAbsensiData = [
            {
                absensi_id: 1,
                user_id: 1,
                nama_lengkap: 'User A',
                username: 'usera',
                email: 'usera@test.com',
                jabatan: 'Staff',
                divisi: 'IT',
                waktu_masuk: '2025-12-09 08:00:00',
                waktu_keluar: '2025-12-09 17:00:00',
                status_piket: 'Selesai',
                status: 'Hadir',
                jadwal_tanggal: '2025-12-09',
                jadwal_hari: 'Senin',
                is_scheduled: 1
            },
            {
                absensi_id: null,
                user_id: 2,
                nama_lengkap: 'User B',
                username: 'userb',
                email: 'userb@test.com',
                jabatan: 'Manager',
                divisi: 'HR',
                waktu_masuk: null,
                waktu_keluar: null,
                status_piket: 'Tidak Piket',
                status: 'Tidak Hadir',
                jadwal_tanggal: '2025-12-09',
                jadwal_hari: 'Senin',
                is_scheduled: 1
            }
        ];

        test('should return absensi report with mapped IDs', async () => {
            db.execute.mockResolvedValue([mockAbsensiData]);

            const result = await LaporanModel.getAbsensiReport('2025-12-01 00:00:00', '2025-12-09 23:59:59');

            expect(db.execute).toHaveBeenCalledWith(
                expect.stringContaining('SELECT'),
                ['2025-12-01 00:00:00', '2025-12-09 23:59:59', '2025-12-01 00:00:00', '2025-12-09 23:59:59']
            );
            expect(result).toHaveLength(2);
            expect(result[0].id).toBe(1);
            expect(result[1].id).toBe('temp_2'); // No absensi_id, so temp ID
        });

        test('should handle empty results', async () => {
            db.execute.mockResolvedValue([[]]);

            const result = await LaporanModel.getAbsensiReport('2025-12-01 00:00:00', '2025-12-09 23:59:59');

            expect(result).toEqual([]);
        });

        test('should handle database errors', async () => {
            db.execute.mockRejectedValue(new Error('DB Error'));

            await expect(
                LaporanModel.getAbsensiReport('2025-12-01 00:00:00', '2025-12-09 23:59:59')
            ).rejects.toThrow('DB Error');
        });
    });

    describe('getInventarisStatus', () => {
        const mockInventarisData = [
            {
                id: 1,
                nama_barang: 'Kursi',
                kode_barang: 'KRS001',
                jumlah: 10,
                status: 'Baik',
                created_at: '2025-12-01 10:00:00'
            },
            {
                id: 2,
                nama_barang: 'Meja',
                kode_barang: 'MJA001',
                jumlah: 5,
                status: 'Rusak',
                created_at: '2025-12-01 10:00:00'
            }
        ];

        test('should return all inventaris items', async () => {
            db.execute.mockResolvedValue([mockInventarisData]);

            const result = await LaporanModel.getInventarisStatus();

            expect(db.execute).toHaveBeenCalledWith(expect.stringContaining('SELECT'));
            expect(result).toEqual(mockInventarisData);
            expect(result).toHaveLength(2);
        });

        test('should handle empty results', async () => {
            db.execute.mockResolvedValue([[]]);

            const result = await LaporanModel.getInventarisStatus();

            expect(result).toEqual([]);
        });

        test('should handle database errors', async () => {
            db.execute.mockRejectedValue(new Error('DB Error'));

            await expect(LaporanModel.getInventarisStatus()).rejects.toThrow('DB Error');
        });
    });

    describe('getInventarisChecklistReport', () => {
        const mockChecklistData = [
            {
                id: 1,
                user_id: 1,
                nama_lengkap: 'User A',
                jabatan: 'Staff',
                waktu_masuk: '2025-12-09 08:00:00',
                inventaris_checklist: JSON.stringify([
                    { id: 1, nama: 'Kursi', status: 'Baik' },
                    { id: 2, nama: 'Meja', status: 'Rusak' }
                ])
            },
            {
                id: 2,
                user_id: 2,
                nama_lengkap: 'User B',
                jabatan: 'Manager',
                waktu_masuk: '2025-12-09 09:00:00',
                inventaris_checklist: JSON.stringify([
                    { id: 1, nama: 'Kursi', status: 'Baik' }
                ])
            }
        ];

        test('should return checklist report for date range', async () => {
            db.execute.mockResolvedValue([mockChecklistData]);

            const result = await LaporanModel.getInventarisChecklistReport(
                '2025-12-09 00:00:00',
                '2025-12-09 23:59:59'
            );

            expect(db.execute).toHaveBeenCalledWith(
                expect.stringContaining('WHERE a.checklist_submitted = 1'),
                ['2025-12-09 00:00:00', '2025-12-09 23:59:59']
            );
            expect(result).toEqual(mockChecklistData);
            expect(result).toHaveLength(2);
        });

        test('should handle empty results', async () => {
            db.execute.mockResolvedValue([[]]);

            const result = await LaporanModel.getInventarisChecklistReport(
                '2025-12-09 00:00:00',
                '2025-12-09 23:59:59'
            );

            expect(result).toEqual([]);
        });

        test('should handle database errors', async () => {
            db.execute.mockRejectedValue(new Error('DB Error'));

            await expect(
                LaporanModel.getInventarisChecklistReport('2025-12-09 00:00:00', '2025-12-09 23:59:59')
            ).rejects.toThrow('DB Error');
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

        test('should return weekly piket report', async () => {
            db.execute.mockResolvedValue([mockWeeklyData]);

            const result = await LaporanModel.getWeeklyPiketReport('2025-12-01', '2025-12-07');

            expect(db.execute).toHaveBeenCalledWith(
                expect.stringContaining('GROUP BY u.id'),
                ['2025-12-01', '2025-12-07']
            );
            expect(result).toEqual(mockWeeklyData);
            expect(result).toHaveLength(2);
        });

        test('should handle empty results', async () => {
            db.execute.mockResolvedValue([[]]);

            const result = await LaporanModel.getWeeklyPiketReport('2025-12-01', '2025-12-07');

            expect(result).toEqual([]);
        });

        test('should handle database errors', async () => {
            db.execute.mockRejectedValue(new Error('DB Error'));

            await expect(
                LaporanModel.getWeeklyPiketReport('2025-12-01', '2025-12-07')
            ).rejects.toThrow('DB Error');
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

        test('should return monthly piket report', async () => {
            db.execute.mockResolvedValue([mockMonthlyData]);

            const result = await LaporanModel.getMonthlyPiketReport(2025, 12);

            expect(db.execute).toHaveBeenCalledWith(
                expect.stringContaining('YEAR(jp.tanggal) = ? AND MONTH(jp.tanggal) = ?'),
                [2025, 12]
            );
            expect(result).toEqual(mockMonthlyData);
            expect(result).toHaveLength(2);
        });

        test('should handle empty results', async () => {
            db.execute.mockResolvedValue([[]]);

            const result = await LaporanModel.getMonthlyPiketReport(2025, 12);

            expect(result).toEqual([]);
        });

        test('should handle database errors', async () => {
            db.execute.mockRejectedValue(new Error('DB Error'));

            await expect(
                LaporanModel.getMonthlyPiketReport(2025, 12)
            ).rejects.toThrow('DB Error');
        });
    });
});
