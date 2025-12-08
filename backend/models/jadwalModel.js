// models/jadwalModel.js

const db = require('../db');

const JadwalModel = {
    /**
     * Mengambil daftar user yang dijadwalkan piket pada hari tertentu.
     * @param {string} hari Nama hari (Senin, Selasa, dll.)
     * @returns {Promise<Array>} Daftar user yang dijadwalkan.
     */
    getScheduledUsersByDay: async (hari) => {
        const [rows] = await db.query(
            'SELECT u.id, u.nama_lengkap, u.avatar_url FROM jadwal_piket jp JOIN users u ON jp.user_id = u.id WHERE jp.hari = ?',
            [hari]
        );
        return rows;
    },

    /**
     * Mengambil status absensi untuk semua user pada tanggal hari ini.
     * @param {string} todayDate Tanggal hari ini dalam format YYYY-MM-DD.
     * @returns {Promise<Array>} Daftar sesi absensi hari ini.
     */
    getAbsensiStatusForToday: async (todayDate) => {
        // Query menggunakan DATE_ADD untuk rentang satu hari penuh
        const [rows] = await db.query(
            'SELECT user_id, waktu_masuk, waktu_keluar FROM absensi WHERE waktu_masuk >= ? AND waktu_masuk < DATE_ADD(?, INTERVAL 1 DAY)',
            [todayDate, todayDate]
        );
        return rows;
    },

    // Digunakan oleh getJadwalPiket
    getAllJadwalPiket: async () => {
        const [rows] = await db.query(`
            SELECT jp.id, jp.hari, jp.user_id, u.nama_lengkap, u.jabatan 
            FROM jadwal_piket jp
            JOIN users u ON jp.user_id = u.id
            ORDER BY FIELD(jp.hari, 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat')
        `);
        return rows;
    },
    
    // Digunakan oleh saveJadwalPiket dan deleteJadwalPiket
    clearAllJadwalPiket: async () => {
        // Menggunakan TRUNCATE atau DELETE FROM
        const [result] = await db.execute('DELETE FROM jadwal_piket');
        return result; // Mengembalikan hasil (termasuk affectedRows)
    },
    
    // Digunakan oleh saveJadwalPiket
    insertJadwalPiket: async (userId, hari) => {
        await db.query('INSERT INTO jadwal_piket (user_id, hari) VALUES (?, ?)', [userId, hari]);
    },

};

module.exports = JadwalModel;