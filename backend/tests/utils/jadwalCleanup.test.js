// tests/utils/jadwalCleanup.test.js

jest.mock('../../db');

const db = require('../../db');
const { cleanupOldJadwal, startScheduledCleanup } = require('../../utils/jadwalCleanup');

describe('jadwalCleanup', () => {
    let consoleLogSpy;
    let consoleErrorSpy;

    beforeAll(() => {
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterAll(() => {
        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('cleanupOldJadwal', () => {
        test('should delete old jadwal and return affected rows', async () => {
            const mockResult = { affectedRows: 5 };
            db.query.mockResolvedValue([mockResult]);

            const result = await cleanupOldJadwal();

            expect(db.query).toHaveBeenCalledTimes(1);
            expect(db.query.mock.calls[0][0]).toBe('DELETE FROM jadwal_piket WHERE tanggal < ?');
            expect(db.query.mock.calls[0][1][0]).toMatch(/^\d{4}-\d{2}-\d{2}$/); // YYYY-MM-DD format
            expect(result).toBe(5);
            expect(consoleLogSpy).toHaveBeenCalledWith(
                expect.stringContaining('[Jadwal Cleanup] Deleted 5 old schedule(s)')
            );
        });

        test('should not log if no rows affected', async () => {
            const mockResult = { affectedRows: 0 };
            db.query.mockResolvedValue([mockResult]);

            const result = await cleanupOldJadwal();

            expect(result).toBe(0);
            expect(consoleLogSpy).not.toHaveBeenCalledWith(
                expect.stringContaining('[Jadwal Cleanup] Deleted')
            );
        });

        test('should handle database errors', async () => {
            const mockError = new Error('DB Error');
            db.query.mockRejectedValue(mockError);

            await expect(cleanupOldJadwal()).rejects.toThrow('DB Error');
            expect(consoleErrorSpy).toHaveBeenCalledWith('[Jadwal Cleanup] Error:', mockError);
        });
    });

    describe('startScheduledCleanup', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.clearAllTimers();
            jest.useRealTimers();
        });

        test('should start scheduled cleanup and log message', async () => {
            const mockResult = { affectedRows: 2 };
            db.query.mockResolvedValue([mockResult]);

            startScheduledCleanup();

            // Wait for initial cleanup promise
            await Promise.resolve();

            expect(consoleLogSpy).toHaveBeenCalledWith(
                '[Jadwal Cleanup] Scheduled cleanup started (runs every 24 hours)'
            );
        });

        test('should handle initial cleanup error', async () => {
            const mockError = new Error('Initial cleanup failed');
            db.query.mockRejectedValue(mockError);

            startScheduledCleanup();

            // Wait for initial cleanup promise to reject
            await Promise.resolve();
            await Promise.resolve();

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                '[Jadwal Cleanup] Initial cleanup failed:',
                mockError
            );
        });

        test('should run cleanup on interval', async () => {
            const mockResult = { affectedRows: 1 };
            db.query.mockResolvedValue([mockResult]);

            startScheduledCleanup();

            // Wait for initial cleanup
            await Promise.resolve();

            // Clear previous calls
            db.query.mockClear();

            // Fast-forward 24 hours
            jest.advanceTimersByTime(24 * 60 * 60 * 1000);

            // Wait for interval cleanup
            await Promise.resolve();

            expect(db.query).toHaveBeenCalled();
        });

        test('should handle scheduled cleanup error', async () => {
            const mockError = new Error('Scheduled cleanup failed');
            db.query
                .mockResolvedValueOnce([{ affectedRows: 0 }]) // Initial cleanup succeeds
                .mockRejectedValueOnce(mockError); // Scheduled cleanup fails

            startScheduledCleanup();

            // Wait for initial cleanup
            await Promise.resolve();

            // Fast-forward 24 hours
            jest.advanceTimersByTime(24 * 60 * 60 * 1000);

            // Wait for scheduled cleanup to fail
            await Promise.resolve();
            await Promise.resolve();

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                '[Jadwal Cleanup] Scheduled cleanup failed:',
                mockError
            );
        });
    });
});
