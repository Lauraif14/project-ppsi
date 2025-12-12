// controllers/jadwalController.js (Bentuk Class/OOP)

const JadwalModel = require('../models/jadwalModel');

class JadwalController {

    // Fungsi helper statis (bisa diakses tanpa instance)
    static getIndonesianDayName(date) {
        const hariIndonesia = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
        return hariIndonesia[date.getDay()];
    }

    async getJadwalPiketHariIni(req, res) {
        try {
            const today = new Date();
            // Panggil helper statis menggunakan Class Name
            const hariIni = JadwalController.getIndonesianDayName(today); 
            const todayDate = today.toISOString().slice(0, 10); // YYYY-MM-DD
            
            // 1. Ambil data dari Model
            const scheduledUsers = await JadwalModel.getScheduledUsersByDay(hariIni);
            const absensiHariIni = await JadwalModel.getAbsensiStatusForToday(todayDate);

            // 2. Logika Bisnis: Gabungkan data dan tentukan status
            const hasil = scheduledUsers.map(user => {
                const absensi = absensiHariIni.find(a => a.user_id === user.id);
                let status = 'belum'; 
                
                if (absensi) {
                    status = absensi.waktu_keluar ? 'sudah' : 'sedang'; 
                }

                // Logika Bisnis: Buat URL lengkap untuk avatar (memerlukan req)
                let avatar_url_full = user.avatar_url ? 
                    `${req.protocol}://${req.get('host')}/${user.avatar_url.replace(/\\/g, '/')}` : 
                    null;

                return { 
                    ...user, 
                    avatar_url: avatar_url_full, 
                    status 
                };
            });

            res.json(hasil);
            
        } catch (error) {
            console.error("Gagal mengambil jadwal piket:", error);
            res.status(500).json({ message: 'Gagal mengambil jadwal piket' });
        }
    }
}

// EKSPOR INSTANCE CLASS
module.exports = new JadwalController();