// models/absensiModel.js

const db = require('../db'); // Asumsi db.js ada di root

const AbsensiModel = {
    // Mencari sesi absen yang aktif (waktu_keluar IS NULL)
    findActiveSession: async (userId) => {
        const [rows] = await db.query(
            'SELECT * FROM absensi WHERE user_id = ? AND waktu_keluar IS NULL',
            [userId]
        );
        return rows[0]; // Mengembalikan satu sesi atau undefined
    },

    // Mencatat sesi absen masuk baru
    createAbsenMasuk: async (newAbsenData) => {
        await db.query('INSERT INTO absensi SET ?', newAbsenData);
        // Dalam aplikasi nyata, Anda mungkin ingin mengembalikan ID yang baru dibuat
    },

    // Mencari sesi absen berdasarkan ID dan User ID
    findByIdAndUserId: async (absensiId, userId) => {
        const [rows] = await db.query(
            'SELECT * FROM absensi WHERE id = ? AND user_id = ?',
            [absensiId, userId]
        );
        return rows[0];
    },

    // Mengupdate sesi absensi untuk absen keluar
    updateAbsenKeluar: async (data, absensiId) => {
        await db.query(
            'UPDATE absensi SET waktu_keluar = ?, foto_path_keluar = ?, latitude_keluar = ?, longitude_keluar = ? WHERE id = ?',
            [data.waktu_keluar, data.foto_path_keluar, data.latitude_keluar, data.longitude_keluar, absensiId]
        );
    },

    // Mengupdate checklist inventaris
    updateChecklist: async (absensiId, userId, checklistJson) => {
        await db.query(
            'UPDATE absensi SET inventaris_checklist = ?, checklist_submitted = TRUE WHERE id = ? AND user_id = ?',
            [checklistJson, absensiId, userId]
        );
    },

    // Mengambil sesi aktif terkini (untuk status)
    findCurrentActiveSession: async (userId) => {
        const [rows] = await db.query(
            'SELECT * FROM absensi WHERE user_id = ? AND waktu_keluar IS NULL ORDER BY waktu_masuk DESC LIMIT 1',
            [userId]
        );
        return rows[0];
    },

    // Mengambil riwayat absensi
    getHistory: async (userId) => {
        const [history] = await db.query(
            'SELECT * FROM absensi WHERE user_id = ? ORDER BY waktu_masuk DESC',
            [userId]
        );
        return history;
    },

    // Mengambil laporan berdasarkan tanggal (menggunakan db.execute dari kode asli)
    getLaporanByDate: async (date) => {
        const [rows] = await db.execute(`
            SELECT 
                a.id, a.user_id, a.waktu_masuk, a.waktu_keluar, a.foto_path, a.foto_path_keluar, 
                a.latitude, a.longitude, a.latitude_keluar, a.longitude_keluar, a.inventaris_checklist,
                a.checklist_submitted, u.nama_lengkap, u.username, u.email, u.jabatan, u.divisi,
                CASE 
                    WHEN a.waktu_masuk IS NOT NULL AND a.waktu_keluar IS NOT NULL THEN 'Hadir'
                    WHEN a.waktu_masuk IS NOT NULL AND a.waktu_keluar IS NULL THEN 'Belum Keluar'
                    ELSE 'Tidak Hadir'
                END as status,
                TIME_FORMAT(a.waktu_masuk, '%H:%i') as waktu_absen_formatted,
                TIME_FORMAT(a.waktu_keluar, '%H:%i') as waktu_keluar_formatted
            FROM absensi a
            LEFT JOIN users u ON a.user_id = u.id
            WHERE DATE(a.waktu_masuk) = ? OR DATE(a.waktu_keluar) = ?
            ORDER BY a.waktu_masuk ASC
        `, [date, date]);
        return rows;
    },

    // Mengambil data absensi hari ini (untuk admin/pengurus)
    getTodayAbsensiStatus: async (today) => {
        const [rows] = await db.execute(`
            SELECT 
                u.id, u.nama_lengkap, u.username, u.email, u.jabatan, u.divisi,
                a.waktu_masuk, a.waktu_keluar, a.foto_path,
                CASE 
                    WHEN a.waktu_masuk IS NOT NULL AND a.waktu_keluar IS NOT NULL THEN 'Hadir'
                    WHEN a.waktu_masuk IS NOT NULL AND a.waktu_keluar IS NULL THEN 'Belum Keluar'
                    ELSE 'Tidak Hadir'
                END as status,
                TIME_FORMAT(a.waktu_masuk, '%H:%i') as waktu_absen
            FROM users u
            LEFT JOIN absensi a ON u.id = a.user_id AND DATE(a.waktu_masuk) = ?
            WHERE u.role = 'user'
            ORDER BY u.nama_lengkap
        `, [today]);
        return rows;
    },

    deleteRecord: async (id) => {
        const [result] = await db.query('DELETE FROM absensi WHERE id = ?', [id]);
        return result.affectedRows;
    }
};

module.exports = AbsensiModel;