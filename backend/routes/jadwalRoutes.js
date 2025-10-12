const express = require('express');
const db = require('../db');
// PASTIKAN BARIS INI MENGGUNAKAN KURUNG KURAWAL
const { verifyToken } = require('../middleware/auth'); 
const router = express.Router();

router.get('/hari-ini', verifyToken, async (req, res) => {
    try {
        const hariIndonesia = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
        const hariIni = hariIndonesia[new Date().getDay()];

        // 1. Ambil semua user yang dijadwalkan hari ini dari tabel 'jadwal_piket'
        const [jadwalUsers] = await db.query(
            'SELECT u.id, u.nama_lengkap, u.avatar_url FROM jadwal_piket jp JOIN users u ON jp.user_id = u.id WHERE jp.hari = ?',
            [hariIni]
        );

        // 2. Cek status absensi mereka untuk hari ini (Query disempurnakan untuk timezone)
        const todayDate = new Date().toISOString().slice(0, 10);
        const [absensiHariIni] = await db.query(
            'SELECT user_id, waktu_masuk, waktu_keluar FROM absensi WHERE waktu_masuk >= ? AND waktu_masuk < DATE_ADD(?, INTERVAL 1 DAY)',
            [todayDate, todayDate]
        );

        // 3. Gabungkan data jadwal dengan status absensi
        const hasil = jadwalUsers.map(user => {
            const absensi = absensiHariIni.find(a => a.user_id === user.id);
            let status = 'belum';
            if (absensi) {
                status = absensi.waktu_keluar ? 'sudah' : 'sedang';
            }
            return { ...user, status };
        });

        res.json(hasil);
    } catch (error) {
        console.error("Gagal mengambil jadwal piket:", error);
        res.status(500).json({ message: 'Gagal mengambil jadwal piket' });
    }
});

// Pastikan hanya ada satu module.exports di akhir file
module.exports = router;