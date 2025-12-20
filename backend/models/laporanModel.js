const db = require('../db');

const LaporanModel = {
    getAbsensiReport: async (startTimestamp, endTimestamp) => {
        const query = `
            SELECT 
                a.id as absensi_id,
                u.id as user_id,
                u.nama_lengkap,
                u.username,
                u.email,
                u.jabatan,
                u.divisi,
                a.waktu_masuk,
                a.waktu_keluar,
                DATE_FORMAT(a.waktu_masuk, '%H:%i') as waktu_absen_formatted,
                DATE_FORMAT(a.waktu_keluar, '%H:%i') as waktu_keluar_formatted,
                CASE 
                    WHEN a.waktu_masuk IS NOT NULL AND a.waktu_keluar IS NOT NULL THEN 'Selesai'
                    WHEN a.waktu_masuk IS NOT NULL AND a.waktu_keluar IS NULL THEN 'Tidak Selesai'
                    ELSE 'Tidak Piket'
                END as status_piket,
                CASE 
                    WHEN a.waktu_masuk IS NOT NULL AND a.waktu_keluar IS NOT NULL THEN 'Hadir'
                    WHEN a.waktu_masuk IS NOT NULL AND a.waktu_keluar IS NULL THEN 'Belum Keluar'
                    ELSE 'Tidak Hadir'
                END as status,
                a.foto_path,
                a.foto_path_keluar,
                a.latitude,
                a.longitude,
                a.latitude_keluar,
                a.longitude_keluar,
                a.inventaris_checklist,
                a.checklist_submitted,
                jp.tanggal as jadwal_tanggal,
                jp.hari as jadwal_hari,
                1 as is_scheduled
            FROM jadwal_piket jp
            INNER JOIN users u ON jp.user_id = u.id
            LEFT JOIN absensi a ON u.id = a.user_id AND a.waktu_masuk BETWEEN ? AND ?
            WHERE jp.tanggal BETWEEN DATE(?) AND DATE(?)
            AND u.role = 'user'
            ORDER BY u.nama_lengkap ASC
        `;
        const [rows] = await db.execute(query, [startTimestamp, endTimestamp, startTimestamp, endTimestamp]);

        // Map result to maintain compatibility with controller expectation
        return rows.map(row => ({
            ...row,
            id: row.absensi_id || `temp_${row.user_id}` // Ensure ID exists for frontend key
        }));
    },

    /**
     * Mengambil status inventaris saat ini (Real-time)
     * @returns {Promise<Array>}
     */
    getInventarisStatus: async () => {
        const query = `
            SELECT 
                i.id,
                i.nama_barang,
                i.kode_barang,
                i.jumlah,
                i.status,
                i.created_at
            FROM inventaris i
            ORDER BY i.nama_barang ASC
        `;
        const [rows] = await db.execute(query);
        return rows;
    },

    /**
     * Mengambil laporan checklist inventaris berdasarkan tanggal (dari tabel absensi/history)
     * Karena checklist disimpan sebagai JSON di tabel absensi (kolom inventaris_checklist),
     * kita ambil row absensi yang punya checklist.
     */
    getInventarisChecklistReport: async (startDate, endDate) => {
        const query = `
            SELECT 
                a.id,
                a.user_id,
                u.nama_lengkap,
                u.jabatan,
                a.waktu_masuk,
                a.inventaris_checklist
            FROM absensi a
            JOIN users u ON a.user_id = u.id
            WHERE a.checklist_submitted = 1 
            AND a.waktu_masuk BETWEEN ? AND ?
            ORDER BY a.waktu_masuk DESC
        `;
        const [rows] = await db.execute(query, [startDate, endDate]);
        return rows;
    },

    /**
     * Mengambil rekap laporan piket mingguan
     * @param {string} startDate - Format: YYYY-MM-DD
     * @param {string} endDate - Format: YYYY-MM-DD
     * @returns {Promise<Array>}
     */
    getWeeklyPiketReport: async (startDate, endDate) => {
        const query = `
            SELECT 
                u.id as user_id,
                u.nama_lengkap,
                u.divisi,
                u.jabatan,
                COUNT(DISTINCT jp.tanggal) as total_jadwal,
                COUNT(DISTINCT CASE 
                    WHEN a.waktu_masuk IS NOT NULL AND a.waktu_keluar IS NOT NULL 
                    THEN DATE(a.waktu_masuk) 
                END) as total_selesai,
                COUNT(DISTINCT CASE 
                    WHEN a.waktu_masuk IS NOT NULL AND a.waktu_keluar IS NULL 
                    THEN DATE(a.waktu_masuk) 
                END) as total_tidak_selesai,
                COUNT(DISTINCT CASE 
                    WHEN jp.tanggal IS NOT NULL AND a.waktu_masuk IS NULL 
                    THEN jp.tanggal 
                END) as total_tidak_piket
            FROM users u
            LEFT JOIN jadwal_piket jp ON u.id = jp.user_id AND jp.tanggal BETWEEN ? AND ?
            LEFT JOIN absensi a ON u.id = a.user_id AND DATE(a.waktu_masuk) = jp.tanggal
            WHERE u.role = 'user'
            GROUP BY u.id, u.nama_lengkap, u.divisi, u.jabatan
            HAVING total_jadwal > 0
            ORDER BY u.nama_lengkap ASC
        `;
        const [rows] = await db.execute(query, [startDate, endDate]);
        return rows;
    },

    /**
     * Mengambil rekap laporan piket bulanan
     * @param {number} year
     * @param {number} month
     * @returns {Promise<Array>}
     */
    getMonthlyPiketReport: async (year, month) => {
        const query = `
            SELECT 
                u.id as user_id,
                u.nama_lengkap,
                u.divisi,
                u.jabatan,
                COUNT(DISTINCT jp.tanggal) as total_jadwal,
                COUNT(DISTINCT CASE 
                    WHEN a.waktu_masuk IS NOT NULL AND a.waktu_keluar IS NOT NULL 
                    THEN DATE(a.waktu_masuk) 
                END) as total_selesai,
                COUNT(DISTINCT CASE 
                    WHEN a.waktu_masuk IS NOT NULL AND a.waktu_keluar IS NULL 
                    THEN DATE(a.waktu_masuk) 
                END) as total_tidak_selesai,
                COUNT(DISTINCT CASE 
                    WHEN jp.tanggal IS NOT NULL AND a.waktu_masuk IS NULL 
                    THEN jp.tanggal 
                END) as total_tidak_piket
            FROM users u
            LEFT JOIN jadwal_piket jp ON u.id = jp.user_id 
                AND YEAR(jp.tanggal) = ? AND MONTH(jp.tanggal) = ?
            LEFT JOIN absensi a ON u.id = a.user_id AND DATE(a.waktu_masuk) = jp.tanggal
            WHERE u.role = 'user'
            GROUP BY u.id, u.nama_lengkap, u.divisi, u.jabatan
            HAVING total_jadwal > 0
            ORDER BY u.nama_lengkap ASC
        `;
        const [rows] = await db.execute(query, [year, month]);
        return rows;
    }
};

module.exports = LaporanModel;
