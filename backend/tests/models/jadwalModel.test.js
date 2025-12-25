// tests/models/jadwalModel.test.js - Updated for date-based system

const db = require('../../db');

jest.mock('../../db', () => ({
    query: jest.fn(),
}));

const JadwalModel = require('../../models/jadwalModel');

describe('JadwalModel - Date-based System', () => {
    const mockQuery = db.query;

    beforeEach(() => {
        mockQuery.mockClear();
        mockQuery.mockResolvedValue([[]]);
    });

    describe('getJadwalByDateRange', () => {
        test('should fetch jadwal between start and end date', async () => {
            const mockRows = [{ id: 1, tanggal: '2025-01-08', nama_lengkap: 'User A' }];
            mockQuery.mockResolvedValue([mockRows]);

            const result = await JadwalModel.getJadwalByDateRange('2025-01-08', '2025-01-12');

            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockQuery.mock.calls[0][0]).toMatch(/SELECT jp\.\*, u\.nama_lengkap, u\.divisi, u\.avatar_url/);
            expect(mockQuery.mock.calls[0][0]).toMatch(/WHERE jp\.tanggal BETWEEN \? AND \?/);
            expect(mockQuery.mock.calls[0][1]).toEqual(['2025-01-08', '2025-01-12']);
            expect(result).toEqual(mockRows);
        });
    });

    describe('getJadwalByDate', () => {
        test('should fetch jadwal for specific date', async () => {
            const mockRows = [{ id: 1, tanggal: '2025-01-08' }];
            mockQuery.mockResolvedValue([mockRows]);

            await JadwalModel.getJadwalByDate('2025-01-08');

            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockQuery.mock.calls[0][0]).toMatch(/WHERE jp\.tanggal = \?/);
            expect(mockQuery.mock.calls[0][1]).toEqual(['2025-01-08']);
        });
    });

    describe('getCurrentWeekSchedule', () => {
        test('should fetch current week schedule', async () => {
            const mockRows = [{ id: 1 }];
            mockQuery.mockResolvedValue([mockRows]);

            const result = await JadwalModel.getCurrentWeekSchedule();

            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockQuery.mock.calls[0][0]).toMatch(/YEARWEEK/);
            expect(result).toEqual(mockRows);
        });
    });

    describe('getJadwalByMonth', () => {
        test('should fetch jadwal for specific month', async () => {
            mockQuery.mockResolvedValue([[]]);

            await JadwalModel.getJadwalByMonth(2025, 1);

            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockQuery.mock.calls[0][0]).toMatch(/YEAR\(jp\.tanggal\) = \? AND MONTH\(jp\.tanggal\) = \?/);
            expect(mockQuery.mock.calls[0][1]).toEqual([2025, 1]);
        });
    });

    describe('insertJadwalByDate', () => {
        test('should insert jadwal with userId, tanggal, and hari', async () => {
            mockQuery.mockResolvedValue([{}]);

            await JadwalModel.insertJadwalByDate(1, '2025-01-08', 'Senin');

            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockQuery.mock.calls[0][0]).toBe('INSERT INTO jadwal_piket (user_id, tanggal, hari) VALUES (?, ?, ?)');
            expect(mockQuery.mock.calls[0][1]).toEqual([1, '2025-01-08', 'Senin']);
        });
    });

    describe('deleteJadwalByDateRange', () => {
        test('should delete jadwal in date range', async () => {
            const mockResult = { affectedRows: 5 };
            mockQuery.mockResolvedValue([mockResult]);

            const result = await JadwalModel.deleteJadwalByDateRange('2025-01-08', '2025-01-12');

            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockQuery.mock.calls[0][0]).toBe('DELETE FROM jadwal_piket WHERE tanggal BETWEEN ? AND ?');
            expect(result).toEqual(mockResult);
        });
    });

    describe('deleteAllJadwal', () => {
        test('should delete all jadwal', async () => {
            const mockResult = { affectedRows: 10 };
            mockQuery.mockResolvedValue([mockResult]);

            const result = await JadwalModel.deleteAllJadwal();

            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockQuery.mock.calls[0][0]).toBe('DELETE FROM jadwal_piket');
            expect(result).toEqual(mockResult);
        });
    });

    describe('deleteJadwalByDate', () => {
        test('should delete jadwal for specific date', async () => {
            mockQuery.mockResolvedValue([{ affectedRows: 3 }]);

            await JadwalModel.deleteJadwalByDate('2025-01-08');

            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockQuery.mock.calls[0][0]).toBe('DELETE FROM jadwal_piket WHERE tanggal = ?');
            expect(mockQuery.mock.calls[0][1]).toEqual(['2025-01-08']);
        });
    });

    describe('deleteUserFromDate', () => {
        test('should delete specific user from specific date', async () => {
            mockQuery.mockResolvedValue([{ affectedRows: 1 }]);

            await JadwalModel.deleteUserFromDate(5, '2025-01-08');

            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockQuery.mock.calls[0][0]).toBe('DELETE FROM jadwal_piket WHERE user_id = ? AND tanggal = ?');
            expect(mockQuery.mock.calls[0][1]).toEqual([5, '2025-01-08']);
        });
    });

    describe('isUserScheduled', () => {
        test('should return true if user is scheduled', async () => {
            mockQuery.mockResolvedValue([[{ id: 1 }]]);

            const result = await JadwalModel.isUserScheduled(1, '2025-01-08');

            expect(result).toBe(true);
        });

        test('should return false if user is not scheduled', async () => {
            mockQuery.mockResolvedValue([[]]);

            const result = await JadwalModel.isUserScheduled(1, '2025-01-08');

            expect(result).toBe(false);
        });
    });

    describe('getAssignmentCount', () => {
        test('should return count of assignments for date', async () => {
            mockQuery.mockResolvedValue([[{ count: 3 }]]);

            const result = await JadwalModel.getAssignmentCount('2025-01-08');

            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(result).toBe(3);
        });
    });

    describe('getAbsensiStatusForToday', () => {
        test('should fetch absensi for specific date', async () => {
            const mockAbsensi = [{ user_id: 1, waktu_masuk: '2025-01-08 08:00:00' }];
            mockQuery.mockResolvedValue([mockAbsensi]);

            const result = await JadwalModel.getAbsensiStatusForToday('2025-01-08');

            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockQuery.mock.calls[0][0]).toBe('SELECT user_id, waktu_masuk, waktu_keluar FROM absensi WHERE DATE(waktu_masuk) = ?');
            expect(result).toEqual(mockAbsensi);
        });
    });

    // ========== BACKWARD COMPATIBILITY METHODS TESTS ==========

    describe('getAllJadwalPiket', () => {
        test('should fetch current week jadwal grouped by hari', async () => {
            const mockRows = [
                { id: 1, hari: 'Senin', user_id: 1, nama_lengkap: 'User A', jabatan: 'Staff', divisi: 'IT' },
                { id: 2, hari: 'Selasa', user_id: 2, nama_lengkap: 'User B', jabatan: 'Manager', divisi: 'HR' }
            ];
            mockQuery.mockResolvedValue([mockRows]);

            const result = await JadwalModel.getAllJadwalPiket();

            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockQuery.mock.calls[0][0]).toMatch(/YEARWEEK\(jp\.tanggal, 1\) = YEARWEEK\(CURDATE\(\), 1\)/);
            expect(mockQuery.mock.calls[0][0]).toMatch(/ORDER BY FIELD\(jp\.hari/);
            expect(result).toEqual(mockRows);
        });

        test('should handle empty results', async () => {
            mockQuery.mockResolvedValue([[]]);

            const result = await JadwalModel.getAllJadwalPiket();

            expect(result).toEqual([]);
        });
    });

    describe('clearAllJadwalPiket', () => {
        test('should delete all jadwal piket', async () => {
            const mockResult = { affectedRows: 15 };
            mockQuery.mockResolvedValue([mockResult]);

            const result = await JadwalModel.clearAllJadwalPiket();

            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockQuery.mock.calls[0][0]).toBe('DELETE FROM jadwal_piket');
            expect(result).toEqual(mockResult);
        });
    });

    describe('insertJadwalPiket', () => {
        test('should insert jadwal for Senin of current week', async () => {
            mockQuery.mockResolvedValue([{}]);

            await JadwalModel.insertJadwalPiket(1, 'Senin');

            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockQuery.mock.calls[0][0]).toBe('INSERT INTO jadwal_piket (user_id, tanggal, hari) VALUES (?, ?, ?)');
            expect(mockQuery.mock.calls[0][1][0]).toBe(1);
            expect(mockQuery.mock.calls[0][1][2]).toBe('Senin');
            // tanggal should be calculated
            expect(mockQuery.mock.calls[0][1][1]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });

        test('should insert jadwal for Jumat of current week', async () => {
            mockQuery.mockResolvedValue([{}]);

            await JadwalModel.insertJadwalPiket(2, 'Jumat');

            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockQuery.mock.calls[0][1][0]).toBe(2);
            expect(mockQuery.mock.calls[0][1][2]).toBe('Jumat');
        });

        test('should throw error for invalid hari', async () => {
            await expect(
                JadwalModel.insertJadwalPiket(1, 'InvalidDay')
            ).rejects.toThrow('Invalid hari: InvalidDay');
        });
    });

    describe('getScheduledUsersByDay', () => {
        test('should fetch scheduled users for specific day in current week', async () => {
            const mockUsers = [
                { id: 1, nama_lengkap: 'User A', avatar_url: 'avatar1.jpg' },
                { id: 2, nama_lengkap: 'User B', avatar_url: 'avatar2.jpg' }
            ];
            mockQuery.mockResolvedValue([mockUsers]);

            const result = await JadwalModel.getScheduledUsersByDay('Senin');

            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockQuery.mock.calls[0][0]).toMatch(/WHERE jp\.hari = \?/);
            expect(mockQuery.mock.calls[0][0]).toMatch(/YEARWEEK\(jp\.tanggal, 1\) = YEARWEEK\(CURDATE\(\), 1\)/);
            expect(mockQuery.mock.calls[0][1]).toEqual(['Senin']);
            expect(result).toEqual(mockUsers);
        });

        test('should handle empty results', async () => {
            mockQuery.mockResolvedValue([[]]);

            const result = await JadwalModel.getScheduledUsersByDay('Rabu');

            expect(result).toEqual([]);
        });
    });
});
