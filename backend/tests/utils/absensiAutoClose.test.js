// tests/utils/absensiAutoClose.test.js

const cron = require('node-cron');
const db = require('../../db');
const { startAbsensiAutoClose, autoCloseAbsensi } = require('../../utils/absensiAutoClose');

// Mock dependencies
jest.mock('node-cron');
jest.mock('../../db', () => ({
    query: jest.fn(),
}));

describe('absensiAutoClose', () => {
    let mockQuery;
    let consoleErrorSpy;

    beforeAll(() => {
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterAll(() => {
        consoleErrorSpy.mockRestore();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockQuery = db.query;
    });

    describe('autoCloseAbsensi', () => {
        test('should auto-close active sessions from previous days', async () => {
            const today = new Date().toISOString().split('T')[0];
            const mockActiveSessions = [
                {
                    id: 1,
                    user_id: 10,
                    waktu_masuk: new Date('2025-12-24T08:00:00.000Z'),
                },
                {
                    id: 2,
                    user_id: 20,
                    waktu_masuk: new Date('2025-12-24T09:30:00.000Z'),
                }
            ];

            // Mock SELECT query to return active sessions
            mockQuery.mockResolvedValueOnce([mockActiveSessions]);
            // Mock UPDATE queries
            mockQuery.mockResolvedValue([{ affectedRows: 1 }]);

            await autoCloseAbsensi();

            // Verify SELECT was called with correct parameters
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('SELECT id, user_id, waktu_masuk'),
                [today]
            );

            // Verify UPDATE was called for each session
            expect(mockQuery).toHaveBeenCalledTimes(3); // 1 SELECT + 2 UPDATEs

            // Verify UPDATE calls
            const updateCalls = mockQuery.mock.calls.slice(1); // Skip first SELECT call
            expect(updateCalls[0][0]).toContain('UPDATE absensi');
            expect(updateCalls[0][0]).toContain('SET waktu_keluar = ?');
            expect(updateCalls[0][1][1]).toBe(1); // session id
        });

        test('should do nothing if no active sessions found', async () => {
            const today = new Date().toISOString().split('T')[0];

            // Mock SELECT query to return empty array
            mockQuery.mockResolvedValueOnce([[]]);

            await autoCloseAbsensi();

            // Verify only SELECT was called
            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('SELECT id, user_id, waktu_masuk'),
                [today]
            );
        });

        test('should set waktu_keluar to 23:59:59 of the same day as waktu_masuk', async () => {
            const today = new Date().toISOString().split('T')[0];
            const waktuMasuk = new Date('2025-12-24T08:30:00.000Z');

            const mockActiveSessions = [{
                id: 1,
                user_id: 10,
                waktu_masuk: waktuMasuk,
            }];

            mockQuery.mockResolvedValueOnce([mockActiveSessions]);
            mockQuery.mockResolvedValue([{ affectedRows: 1 }]);

            await autoCloseAbsensi();

            // Get the UPDATE call
            const updateCall = mockQuery.mock.calls[1];
            const waktuKeluar = updateCall[1][0];

            // Verify waktu_keluar is set to 23:59:59 of the same day
            expect(waktuKeluar.getDate()).toBe(waktuMasuk.getDate());
            expect(waktuKeluar.getHours()).toBe(23);
            expect(waktuKeluar.getMinutes()).toBe(59);
            expect(waktuKeluar.getSeconds()).toBe(59);
        });

        test('should log error and continue if database query fails', async () => {
            const dbError = new Error('Database connection failed');
            mockQuery.mockRejectedValue(dbError);

            await autoCloseAbsensi();

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                '[Auto-Close Absensi] Error:',
                dbError
            );
        });

        test('should set foto_path_keluar to auto-closed', async () => {
            const today = new Date().toISOString().split('T')[0];
            const mockActiveSessions = [{
                id: 1,
                user_id: 10,
                waktu_masuk: new Date('2025-12-24T08:00:00.000Z'),
            }];

            mockQuery.mockResolvedValueOnce([mockActiveSessions]);
            mockQuery.mockResolvedValue([{ affectedRows: 1 }]);

            await autoCloseAbsensi();

            const updateCall = mockQuery.mock.calls[1];
            expect(updateCall[0]).toContain("foto_path_keluar = 'auto-closed'");
        });

        test('should copy latitude and longitude from masuk to keluar', async () => {
            const today = new Date().toISOString().split('T')[0];
            const mockActiveSessions = [{
                id: 1,
                user_id: 10,
                waktu_masuk: new Date('2025-12-24T08:00:00.000Z'),
            }];

            mockQuery.mockResolvedValueOnce([mockActiveSessions]);
            mockQuery.mockResolvedValue([{ affectedRows: 1 }]);

            await autoCloseAbsensi();

            const updateCall = mockQuery.mock.calls[1];
            expect(updateCall[0]).toContain('latitude_keluar = latitude');
            expect(updateCall[0]).toContain('longitude_keluar = longitude');
        });
    });

    describe('startAbsensiAutoClose', () => {
        test('should schedule cron job at midnight (00:00)', () => {
            const mockSchedule = jest.fn();
            cron.schedule.mockImplementation(mockSchedule);

            startAbsensiAutoClose();

            expect(cron.schedule).toHaveBeenCalledWith(
                '0 0 * * *',
                expect.any(Function),
                { timezone: 'Asia/Jakarta' }
            );
        });

        test('should call autoCloseAbsensi when cron job runs', () => {
            let cronCallback;
            cron.schedule.mockImplementation((pattern, callback, options) => {
                cronCallback = callback;
            });

            startAbsensiAutoClose();

            // Verify cron was scheduled
            expect(cron.schedule).toHaveBeenCalled();

            // Mock autoCloseAbsensi to verify it gets called
            const mockActiveSessions = [];
            mockQuery.mockResolvedValueOnce([mockActiveSessions]);

            // Execute the cron callback
            cronCallback();

            // Verify autoCloseAbsensi was triggered (db.query should be called)
            expect(mockQuery).toHaveBeenCalled();
        });
    });
});
