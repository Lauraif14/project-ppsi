// controllers/laporanController.js
// Controller khusus untuk laporan absensi

const db = require('../db');

class LaporanController {
    /**
     * Get laporan absensi lengkap
     * GET /api/laporan/absensi
     * Query params: ?start_date=...&end_date=... (optional)
     */
    async getLaporanAbsensi(req, res) {
        try {
            const { start_date, end_date } = req.query;

            let whereClause = '';
            let params = [];

            if (start_date && end_date) {
                whereClause = 'WHERE DATE(a.waktu_masuk) BETWEEN ? AND ?';
                params = [start_date, end_date];
            } else {
                // Default: 30 hari terakhir
                const today = new Date();
                const monthAgo = new Date(today);
                monthAgo.setDate(today.getDate() - 30);

                whereClause = 'WHERE DATE(a.waktu_masuk) >= ?';
                params = [monthAgo.toISOString().split('T')[0]];
            }

            const [rows] = await db.query(`
                SELECT 
                    a.id as absensi_id,
                    DATE(a.waktu_masuk) as tanggal,
                    DAYNAME(a.waktu_masuk) as day_name,
                    a.user_id,
                    u.nama_lengkap,
                    u.divisi,
                    u.avatar_url,
                    a.waktu_masuk,
                    a.waktu_keluar,
                    a.checklist_submitted,
                    a.note,
                    a.foto_path,
                    a.foto_path_keluar
                FROM absensi a
                JOIN users u ON a.user_id = u.id
                ${whereClause}
                ORDER BY a.waktu_masuk DESC
            `, params);

            // Convert day_name to Indonesian
            const hariIndonesia = {
                'Sunday': 'Minggu',
                'Monday': 'Senin',
                'Tuesday': 'Selasa',
                'Wednesday': 'Rabu',
                'Thursday': 'Kamis',
                'Friday': 'Jumat',
                'Saturday': 'Sabtu'
            };

            // Group by date
            const grouped = {};
            rows.forEach(row => {
                const tanggal = row.tanggal;

                if (!grouped[tanggal]) {
                    grouped[tanggal] = {
                        tanggal: tanggal,
                        hari: hariIndonesia[row.day_name] || row.day_name,
                        pengurus: []
                    };
                }

                const status = row.waktu_keluar ? 'sudah' : 'sedang';

                grouped[tanggal].pengurus.push({
                    id: row.user_id,
                    user_id: row.user_id,
                    nama_lengkap: row.nama_lengkap,
                    divisi: row.divisi,
                    avatar_url: row.avatar_url,
                    status: status,
                    waktu_masuk: new Date(row.waktu_masuk).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                    waktu_keluar: row.waktu_keluar ? new Date(row.waktu_keluar).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
                    checklist_submitted: row.checklist_submitted || false,
                    note: row.note || null,
                    foto_path: row.foto_path || null,
                    foto_path_keluar: row.foto_path_keluar || null
                });
            });

            res.json({
                success: true,
                data: Object.values(grouped),
                total: rows.length
            });

        } catch (error) {
            console.error('Error getting laporan absensi:', error);
            res.status(500).json({
                success: false,
                message: 'Gagal mengambil laporan absensi: ' + error.message
            });
        }
    }
}

module.exports = new LaporanController();