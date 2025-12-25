// utils/absensiAutoClose.js
// Scheduled job untuk auto-close sesi absensi yang belum keluar pada tengah malam

const cron = require('node-cron');
const db = require('../db');

/**
 * Auto-close semua sesi absensi yang masih aktif (belum absen keluar)
 * pada jam 00:00 setiap hari
 */
async function autoCloseAbsensi() {
    try {
        const today = new Date().toISOString().split('T')[0];

        // Cari semua sesi yang masih aktif (waktu_keluar NULL) dari hari kemarin atau sebelumnya
        const [activeSessions] = await db.query(`
            SELECT id, user_id, waktu_masuk 
            FROM absensi 
            WHERE waktu_keluar IS NULL 
            AND DATE(waktu_masuk) < ?
        `, [today]);

        if (activeSessions.length === 0) {
            return;
        }

        // Update semua sesi tersebut dengan waktu_keluar = jam 23:59 hari sebelumnya
        for (const session of activeSessions) {
            const waktuMasuk = new Date(session.waktu_masuk);
            const waktuKeluar = new Date(waktuMasuk);
            waktuKeluar.setHours(23, 59, 59, 999); // Set ke 23:59:59 hari yang sama

            await db.query(`
                UPDATE absensi 
                SET waktu_keluar = ?,
                    foto_path_keluar = 'auto-closed',
                    latitude_keluar = latitude,
                    longitude_keluar = longitude
                WHERE id = ?
            `, [waktuKeluar, session.id]);
        }
    } catch (error) {
        console.error('[Auto-Close Absensi] Error:', error);
    }
}

/**
 * Start scheduled job yang berjalan setiap tengah malam (00:00)
 */
function startAbsensiAutoClose() {
    // Cron expression: '0 0 * * *' = setiap hari jam 00:00
    cron.schedule('0 0 * * *', () => {
        autoCloseAbsensi();
    }, {
        timezone: "Asia/Jakarta"
    });
}

module.exports = { startAbsensiAutoClose, autoCloseAbsensi };
