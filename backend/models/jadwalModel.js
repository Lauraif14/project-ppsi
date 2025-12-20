// models/jadwalModel.js - Updated untuk sistem berbasis tanggal

const db = require('../db');

const JadwalModel = {
    /**
     * Get jadwal by date range
     * @param {string} startDate - Format: YYYY-MM-DD
     * @param {string} endDate - Format: YYYY-MM-DD
     * @returns {Promise<Array>}
     */
    getJadwalByDateRange: async (startDate, endDate) => {
        const [rows] = await db.query(`
            SELECT jp.*, u.nama_lengkap, u.divisi, u.avatar_url
            FROM jadwal_piket jp
            JOIN users u ON jp.user_id = u.id
            WHERE jp.tanggal BETWEEN ? AND ?
            ORDER BY jp.tanggal ASC, u.nama_lengkap ASC
        `, [startDate, endDate]);
        return rows;
    },

    /**
     * Get jadwal for specific date
     * @param {string} tanggal - Format: YYYY-MM-DD
     * @returns {Promise<Array>}
     */
    getJadwalByDate: async (tanggal) => {
        const [rows] = await db.query(`
            SELECT jp.*, u.nama_lengkap, u.divisi, u.avatar_url
            FROM jadwal_piket jp
            JOIN users u ON jp.user_id = u.id
            WHERE jp.tanggal = ?
            ORDER BY u.nama_lengkap ASC
        `, [tanggal]);
        return rows;
    },

    /**
     * Get jadwal for current week (Monday to Friday)
     * @returns {Promise<Array>}
     */
    getCurrentWeekSchedule: async () => {
        const [rows] = await db.query(`
            SELECT jp.*, u.nama_lengkap, u.divisi, u.avatar_url
            FROM jadwal_piket jp
            JOIN users u ON jp.user_id = u.id
            WHERE YEARWEEK(jp.tanggal, 1) = YEARWEEK(CURDATE(), 1)
            AND WEEKDAY(jp.tanggal) < 5
            ORDER BY jp.tanggal ASC, u.nama_lengkap ASC
        `);
        return rows;
    },

    /**
     * Get jadwal for specific month
     * @param {number} year
     * @param {number} month (1-12)
     * @returns {Promise<Array>}
     */
    getJadwalByMonth: async (year, month) => {
        const [rows] = await db.query(`
            SELECT jp.*, u.nama_lengkap, u.divisi, u.avatar_url
            FROM jadwal_piket jp
            JOIN users u ON jp.user_id = u.id
            WHERE YEAR(jp.tanggal) = ? AND MONTH(jp.tanggal) = ?
            ORDER BY jp.tanggal ASC, u.nama_lengkap ASC
        `, [year, month]);
        return rows;
    },

    /**
     * Insert jadwal for specific date
     * @param {number} userId
     * @param {string} tanggal - Format: YYYY-MM-DD
     * @param {string} hari - Nama hari (Senin, Selasa, dll)
     * @returns {Promise<void>}
     */
    insertJadwalByDate: async (userId, tanggal, hari) => {
        await db.query(
            'INSERT INTO jadwal_piket (user_id, tanggal, hari) VALUES (?, ?, ?)',
            [userId, tanggal, hari]
        );
    },

    /**
     * Delete jadwal by date range
     * @param {string} startDate - Format: YYYY-MM-DD
     * @param {string} endDate - Format: YYYY-MM-DD
     * @returns {Promise<Object>}
     */
    deleteJadwalByDateRange: async (startDate, endDate) => {
        const [result] = await db.query(
            'DELETE FROM jadwal_piket WHERE tanggal BETWEEN ? AND ?',
            [startDate, endDate]
        );
        return result;
    },

    /**
     * Delete all jadwal
     * @returns {Promise<Object>}
     */
    deleteAllJadwal: async () => {
        const [result] = await db.query('DELETE FROM jadwal_piket');
        return result;
    },

    /**
     * Delete jadwal for specific date
     * @param {string} tanggal - Format: YYYY-MM-DD
     * @returns {Promise<Object>}
     */
    deleteJadwalByDate: async (tanggal) => {
        const [result] = await db.query(
            'DELETE FROM jadwal_piket WHERE tanggal = ?',
            [tanggal]
        );
        return result;
    },

    /**
     * Delete specific user from specific date
     * @param {number} userId
     * @param {string} tanggal - Format: YYYY-MM-DD
     * @returns {Promise<Object>}
     */
    deleteUserFromDate: async (userId, tanggal) => {
        const [result] = await db.query(
            'DELETE FROM jadwal_piket WHERE user_id = ? AND tanggal = ?',
            [userId, tanggal]
        );
        return result;
    },

    /**
     * Check if user already scheduled for date
     * @param {number} userId
     * @param {string} tanggal - Format: YYYY-MM-DD
     * @returns {Promise<boolean>}
     */
    isUserScheduled: async (userId, tanggal) => {
        const [rows] = await db.query(
            'SELECT id FROM jadwal_piket WHERE user_id = ? AND tanggal = ?',
            [userId, tanggal]
        );
        return rows.length > 0;
    },

    /**
     * Get count of assignments for date
     * @param {string} tanggal - Format: YYYY-MM-DD
     * @returns {Promise<number>}
     */
    getAssignmentCount: async (tanggal) => {
        const [rows] = await db.query(
            'SELECT COUNT(*) as count FROM jadwal_piket WHERE tanggal = ?',
            [tanggal]
        );
        return rows[0].count;
    },

    /**
     * Get status absensi for today (untuk backward compatibility)
     * @param {string} todayDate - Format: YYYY-MM-DD
     * @returns {Promise<Array>}
     */
    getAbsensiStatusForToday: async (todayDate) => {
        const [rows] = await db.query(
            'SELECT user_id, waktu_masuk, waktu_keluar FROM absensi WHERE DATE(waktu_masuk) = ?',
            [todayDate]
        );
        return rows;
    },

    // ========== BACKWARD COMPATIBILITY METHODS ==========
    // Methods untuk mendukung controller lama yang masih menggunakan sistem hari

    /**
     * Get all jadwal piket (backward compatibility)
     * Returns current week schedule grouped by hari
     * @returns {Promise<Array>}
     */
    getAllJadwalPiket: async () => {
        const [rows] = await db.query(`
            SELECT jp.id, jp.hari, jp.user_id, u.nama_lengkap, u.jabatan, u.divisi
            FROM jadwal_piket jp
            JOIN users u ON jp.user_id = u.id
            WHERE YEARWEEK(jp.tanggal, 1) = YEARWEEK(CURDATE(), 1)
            ORDER BY FIELD(jp.hari, 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'), u.nama_lengkap ASC
        `);
        return rows;
    },

    /**
     * Clear all jadwal piket (backward compatibility)
     * @returns {Promise<Object>}
     */
    clearAllJadwalPiket: async () => {
        const [result] = await db.query('DELETE FROM jadwal_piket');
        return result;
    },

    /**
     * Insert jadwal piket by hari (backward compatibility)
     * Automatically calculates tanggal based on current week
     * @param {number} userId
     * @param {string} hari - Nama hari (Senin, Selasa, dll)
     * @returns {Promise<void>}
     */
    insertJadwalPiket: async (userId, hari) => {
        // Calculate tanggal based on hari for current week
        const hariMap = { 'Senin': 1, 'Selasa': 2, 'Rabu': 3, 'Kamis': 4, 'Jumat': 5 };
        const targetDay = hariMap[hari];

        if (!targetDay) {
            throw new Error(`Invalid hari: ${hari}`);
        }

        // Get current week's Monday
        const now = new Date();
        const currentDay = now.getDay();
        const diff = currentDay === 0 ? -6 : 1 - currentDay; // If Sunday, go back 6 days
        const monday = new Date(now);
        monday.setDate(now.getDate() + diff);

        // Calculate target date
        const targetDate = new Date(monday);
        targetDate.setDate(monday.getDate() + (targetDay - 1));

        const tanggal = targetDate.toISOString().split('T')[0];

        await db.query(
            'INSERT INTO jadwal_piket (user_id, tanggal, hari) VALUES (?, ?, ?)',
            [userId, tanggal, hari]
        );
    },

    /**
     * Get scheduled users by day (backward compatibility)
     * @param {string} hari - Nama hari (Senin, Selasa, dll)
     * @returns {Promise<Array>}
     */
    getScheduledUsersByDay: async (hari) => {
        const [rows] = await db.query(`
            SELECT u.id, u.nama_lengkap, u.avatar_url
            FROM jadwal_piket jp
            JOIN users u ON jp.user_id = u.id
            WHERE jp.hari = ?
            AND YEARWEEK(jp.tanggal, 1) = YEARWEEK(CURDATE(), 1)
        `, [hari]);
        return rows;
    }
};

module.exports = JadwalModel;