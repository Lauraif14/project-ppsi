// controllers/jadwalController.js - Updated untuk sistem berbasis tanggal

const JadwalModel = require('../models/jadwalModel');

class JadwalController {
    // Helper function to get Indonesian day name
    static getIndonesianDayName(date) {
        const hariIndonesia = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
        return hariIndonesia[date.getDay()];
    }

    // Helper function to check if date is weekday (Monday-Friday)
    static isWeekday(date) {
        const day = date.getDay();
        return day >= 1 && day <= 5; // 1=Monday, 5=Friday
    }

    // Helper function to get all weekdays between two dates
    static getWeekdaysBetween(startDate, endDate) {
        const dates = [];
        const current = new Date(startDate);
        const end = new Date(endDate);

        while (current <= end) {
            if (this.isWeekday(current)) {
                dates.push(new Date(current));
            }
            current.setDate(current.getDate() + 1);
        }

        return dates;
    }

    /**
     * Generate jadwal piket dengan range tanggal
     * POST /api/piket/jadwal/generate
     * Body: { start_date, end_date, assignments_per_day }
     */
    async generateJadwalByDateRange(req, res) {
        try {
            const { start_date, end_date, assignments_per_day = 3 } = req.body;

            if (!start_date || !end_date) {
                return res.status(400).json({
                    success: false,
                    message: 'start_date dan end_date harus diisi'
                });
            }

            // Get all users except admin
            const [users] = await require('../db').query(
                'SELECT id, nama_lengkap, divisi FROM users WHERE role != "admin" ORDER BY nama_lengkap'
            );

            if (users.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Tidak ada user yang tersedia untuk dijadwalkan. Pastikan ada user (bukan admin) yang terdaftar di sistem.'
                });
            }

            // Get all weekdays in range
            const weekdays = JadwalController.getWeekdaysBetween(start_date, end_date);

            if (weekdays.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Tidak ada hari kerja dalam range tanggal tersebut'
                });
            }

            // Generate schedule using round-robin distribution
            const schedule = [];
            let userIndex = 0;

            for (const date of weekdays) {
                const tanggal = date.toISOString().split('T')[0];
                const hari = JadwalController.getIndonesianDayName(date);

                for (let i = 0; i < assignments_per_day; i++) {
                    schedule.push({
                        user_id: users[userIndex].id,
                        nama_lengkap: users[userIndex].nama_lengkap,
                        divisi: users[userIndex].divisi,
                        tanggal: tanggal,
                        hari: hari
                    });

                    userIndex = (userIndex + 1) % users.length;
                }
            }

            res.json({
                success: true,
                message: 'Jadwal berhasil digenerate',
                data: {
                    schedule: schedule,
                    total_days: weekdays.length,
                    total_assignments: schedule.length,
                    assignments_per_day: assignments_per_day,
                    start_date: start_date,
                    end_date: end_date
                }
            });

        } catch (error) {
            console.error('Error generating schedule:', error);
            res.status(500).json({
                success: false,
                message: 'Gagal generate jadwal: ' + error.message
            });
        }
    }

    /**
     * Save jadwal to database
     * POST /api/piket/jadwal
     * Body: { schedule: [...] }
     */
    async saveJadwal(req, res) {
        try {
            const { schedule } = req.body;

            console.log('📥 Received schedule to save:', schedule?.length, 'items');

            if (!schedule || !Array.isArray(schedule)) {
                return res.status(400).json({
                    success: false,
                    message: 'Schedule harus berupa array'
                });
            }

            // Get date range from schedule
            const dates = schedule.map(s => s.tanggal);
            const startDate = dates.sort()[0];
            const endDate = dates.sort()[dates.length - 1];

            console.log('📅 Date range:', startDate, 'to', endDate);

            // Delete existing schedule in this range
            await JadwalModel.deleteJadwalByDateRange(startDate, endDate);

            // Insert new schedule
            let insertedCount = 0;
            for (const item of schedule) {
                try {
                    await JadwalModel.insertJadwalByDate(
                        item.user_id,
                        item.tanggal,
                        item.hari
                    );
                    insertedCount++;
                } catch (err) {
                    // Skip duplicates
                    if (err.code !== 'ER_DUP_ENTRY') {
                        throw err;
                    }
                }
            }

            console.log('✅ Inserted', insertedCount, 'records');

            res.json({
                success: true,
                message: 'Jadwal berhasil disimpan',
                data: {
                    total_inserted: insertedCount,
                    start_date: startDate,
                    end_date: endDate
                }
            });

        } catch (error) {
            console.error('Error saving schedule:', error);
            res.status(500).json({
                success: false,
                message: 'Gagal menyimpan jadwal: ' + error.message
            });
        }
    }

    /**
     * Get jadwal by date range with absensi data
     * GET /api/piket/jadwal?start_date=...&end_date=...
     */
    async getJadwal(req, res) {
        try {
            const { start_date, end_date, month, year } = req.query;

            let jadwal;

            if (month && year) {
                // Get by month
                jadwal = await JadwalModel.getJadwalByMonth(parseInt(year), parseInt(month));
            } else if (start_date && end_date) {
                // Get by date range
                jadwal = await JadwalModel.getJadwalByDateRange(start_date, end_date);
            } else {
                // Get current week by default
                jadwal = await JadwalModel.getCurrentWeekSchedule();
            }

            // Get all absensi data for the date range
            const db = require('../db');

            // Jika tidak ada jadwal, ambil absensi minggu ini
            let dates = jadwal.length > 0 ? [...new Set(jadwal.map(j => j.tanggal))] : [];

            // Jika tidak ada jadwal sama sekali, ambil absensi 7 hari terakhir
            if (dates.length === 0) {
                const today = new Date();
                const weekAgo = new Date(today);
                weekAgo.setDate(today.getDate() - 7);

                const [absensiDates] = await db.query(`
                    SELECT DISTINCT DATE(waktu_masuk) as tanggal
                    FROM absensi
                    WHERE DATE(waktu_masuk) >= ?
                    ORDER BY tanggal DESC
                `, [weekAgo.toISOString().split('T')[0]]);

                dates = absensiDates.map(row => row.tanggal);
            }

            let absensiData = [];
            if (dates.length > 0) {
                const placeholders = dates.map(() => 'DATE(waktu_masuk) = ?').join(' OR ');
                const [rows] = await db.query(`
                    SELECT 
                        a.user_id,
                        DATE(a.waktu_masuk) as tanggal,
                        a.waktu_masuk,
                        a.waktu_keluar,
                        a.checklist_submitted,
                        a.note,
                        a.foto_path,
                        a.foto_path_keluar,
                        u.nama_lengkap,
                        u.divisi,
                        u.avatar_url
                    FROM absensi a
                    JOIN users u ON a.user_id = u.id
                    WHERE ${placeholders}
                    ORDER BY a.waktu_masuk DESC
                `, dates);
                absensiData = rows;
            }

            // Group by date
            const grouped = {};

            // Pertama, masukkan semua jadwal
            jadwal.forEach(item => {
                if (!grouped[item.tanggal]) {
                    grouped[item.tanggal] = {
                        tanggal: item.tanggal,
                        hari: item.hari,
                        pengurus: []
                    };
                }

                // Find absensi for this user on this date
                const absensi = absensiData.find(a =>
                    a.user_id === item.user_id && a.tanggal === item.tanggal
                );

                let status = 'belum';
                if (absensi) {
                    status = absensi.waktu_keluar ? 'sudah' : 'sedang';
                }

                grouped[item.tanggal].pengurus.push({
                    id: item.user_id,
                    user_id: item.user_id,
                    nama_lengkap: item.nama_lengkap,
                    divisi: item.divisi,
                    avatar_url: item.avatar_url,
                    status: status,
                    waktu_masuk: absensi ? new Date(absensi.waktu_masuk).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
                    waktu_keluar: absensi && absensi.waktu_keluar ? new Date(absensi.waktu_keluar).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
                    checklist_submitted: absensi ? absensi.checklist_submitted : false,
                    note: absensi ? absensi.note : null,
                    foto_path: absensi ? absensi.foto_path : null,
                    foto_path_keluar: absensi ? absensi.foto_path_keluar : null
                });
            });

            // Kedua, tambahkan absensi yang tidak ada di jadwal
            absensiData.forEach(absensi => {
                const tanggal = absensi.tanggal;

                // Cek apakah tanggal sudah ada di grouped
                if (!grouped[tanggal]) {
                    // Buat entry baru untuk tanggal ini
                    const date = new Date(tanggal);
                    const hariIndonesia = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

                    grouped[tanggal] = {
                        tanggal: tanggal,
                        hari: hariIndonesia[date.getDay()],
                        pengurus: []
                    };
                }

                // Cek apakah user ini sudah ada di pengurus untuk tanggal ini
                const existingUser = grouped[tanggal].pengurus.find(p => p.user_id === absensi.user_id);

                if (!existingUser) {
                    // User belum ada di jadwal, tambahkan dari data absensi
                    let status = absensi.waktu_keluar ? 'sudah' : 'sedang';

                    grouped[tanggal].pengurus.push({
                        id: absensi.user_id,
                        user_id: absensi.user_id,
                        nama_lengkap: absensi.nama_lengkap,
                        divisi: absensi.divisi,
                        avatar_url: absensi.avatar_url,
                        status: status,
                        waktu_masuk: new Date(absensi.waktu_masuk).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                        waktu_keluar: absensi.waktu_keluar ? new Date(absensi.waktu_keluar).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
                        checklist_submitted: absensi.checklist_submitted || false,
                        note: absensi.note || null,
                        foto_path: absensi.foto_path || null,
                        foto_path_keluar: absensi.foto_path_keluar || null
                    });
                }
            });

            res.json({
                success: true,
                data: Object.values(grouped)
            });

        } catch (error) {
            console.error('Error getting schedule:', error);
            res.status(500).json({
                success: false,
                message: 'Gagal mengambil jadwal: ' + error.message
            });
        }
    }

    /**
     * Get jadwal for today
     * GET /api/piket/jadwal/today
     */
    async getJadwalHariIni(req, res) {
        try {
            const today = new Date().toISOString().split('T')[0];
            console.log('📅 Getting Jadwal Hari Ini for date:', today);

            const jadwal = await JadwalModel.getJadwalByDate(today);
            console.log(`✅ Found ${jadwal.length} jadwal entries`);

            // Get absensi status
            const absensiHariIni = await JadwalModel.getAbsensiStatusForToday(today);

            // Combine with status
            const hasil = jadwal.map(user => {
                const absensi = absensiHariIni.find(a => a.user_id === user.user_id);
                let status = 'belum';

                if (absensi) {
                    status = absensi.waktu_keluar ? 'sudah' : 'sedang';
                }

                let avatar_url_full = user.avatar_url ?
                    `${req.protocol}://${req.get('host')}/${user.avatar_url.replace(/\\/g, '/')}` :
                    null;

                return {
                    ...user,
                    avatar_url: avatar_url_full,
                    status
                };
            });

            res.json({
                success: true,
                data: {
                    tanggal: today,
                    hari: JadwalController.getIndonesianDayName(new Date()),
                    pengurus: hasil
                }
            });

        } catch (error) {
            console.error('Error getting today schedule:', error);
            res.status(500).json({
                success: false,
                message: 'Gagal mengambil jadwal hari ini: ' + error.message
            });
        }
    }

    /**
     * Delete jadwal
     * DELETE /api/piket/jadwal?start_date=...&end_date=...
     * or DELETE /api/piket/jadwal (delete all)
     */
    async deleteJadwal(req, res) {
        try {
            const { start_date, end_date } = req.query;

            let result;
            if (start_date && end_date) {
                result = await JadwalModel.deleteJadwalByDateRange(start_date, end_date);
            } else {
                result = await JadwalModel.deleteAllJadwal();
            }

            res.json({
                success: true,
                message: 'Jadwal berhasil dihapus',
                deleted_count: result.affectedRows
            });

        } catch (error) {
            console.error('Error deleting schedule:', error);
            res.status(500).json({
                success: false,
                message: 'Gagal menghapus jadwal: ' + error.message
            });
        }
    }
}

module.exports = new JadwalController();