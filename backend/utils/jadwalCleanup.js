// utils/jadwalCleanup.js
// Utility untuk membersihkan jadwal piket yang sudah lewat

const db = require('../db');

/**
 * Hapus jadwal piket yang sudah lewat dari tanggal hari ini
 * @returns {Promise<number>} Jumlah jadwal yang dihapus
 */
const cleanupOldJadwal = async () => {
    try {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

        const [result] = await db.query(
            'DELETE FROM jadwal_piket WHERE tanggal < ?',
            [todayStr]
        );

        if (result.affectedRows > 0) {
            console.log(`[Jadwal Cleanup] Deleted ${result.affectedRows} old schedule(s)`);
        }

        return result.affectedRows;
    } catch (error) {
        console.error('[Jadwal Cleanup] Error:', error);
        throw error;
    }
};

/**
 * Jalankan cleanup secara berkala (setiap hari pada jam 00:00)
 */
const startScheduledCleanup = () => {
    // Jalankan cleanup pertama kali saat server start
    cleanupOldJadwal().catch(err => {
        console.error('[Jadwal Cleanup] Initial cleanup failed:', err);
    });

    // Jalankan cleanup setiap 24 jam (86400000 ms)
    setInterval(() => {
        cleanupOldJadwal().catch(err => {
            console.error('[Jadwal Cleanup] Scheduled cleanup failed:', err);
        });
    }, 24 * 60 * 60 * 1000);


};

module.exports = {
    cleanupOldJadwal,
    startScheduledCleanup
};
