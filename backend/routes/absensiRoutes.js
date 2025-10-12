const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Konfigurasi Multer (tidak ada perubahan)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '..', 'public', 'uploads', 'absensi');
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, `absen-${uniqueSuffix}`);
    }
});
const upload = multer({ storage });

// --- FUNGSI BARU UNTUK WATERMARK ---
const addWatermark = async (filePath, latitude, longitude) => {
    try {
        // 1. Dapatkan nama lokasi dari koordinat menggunakan OpenCage API
        const geoUrl = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${process.env.OPENCAGE_API_KEY}`;
        const response = await axios.get(geoUrl);
        const locationName = response.data.results[0]?.formatted || 'Lokasi tidak ditemukan';

        // 2. Buat gambar teks (watermark) menggunakan SVG
        const text = `${locationName}\n${new Date().toLocaleString('id-ID')}`;
        const svgImage = `
        <svg width="400" height="80">
          <style>
          .title { fill: #fff; font-size: 14px; font-weight: bold; font-family: Arial, sans-serif; }
          </style>
          <rect x="0" y="0" width="100%" height="100%" fill="#000" fill-opacity="0.5" rx="10"/>
          <text x="10" y="30" class="title">${text.split('\n')[0]}</text>
          <text x="10" y="55" class="title">${text.split('\n')[1]}</text>
        </svg>
        `;
        const svgBuffer = Buffer.from(svgImage);

        // 3. Gabungkan gambar asli dengan watermark
        const imageBuffer = await sharp(filePath)
            .composite([{
                input: svgBuffer,
                gravity: 'southwest', // Posisi di pojok kiri bawah
            }])
            .toBuffer();
        
        // 4. Timpa file asli dengan yang sudah di-watermark
        await sharp(imageBuffer).toFile(filePath);

    } catch (error) {
        console.error("Gagal menambahkan watermark:", error.message);
    }
};

// Endpoint 1: Absen MASUK (Logika checklist diubah)
router.post('/masuk', verifyToken, upload.single('foto_absen'), async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        const userId = req.user.id;
        
        if (!req.file) return res.status(400).json({ message: 'Foto absensi diperlukan.' });
        await addWatermark(req.file.path, latitude, longitude);
        const foto_path = path.join('uploads', 'absensi', req.file.filename).replace(/\\/g, '/');

        const [activeSession] = await db.query('SELECT * FROM absensi WHERE user_id = ? AND waktu_keluar IS NULL', [userId]);
        if (activeSession.length > 0) {
            return res.status(400).json({ message: 'Anda sudah memiliki sesi absen yang aktif.' });
        }

        // DIUBAH: Checklist diambil dari status master TERKINI di tabel inventaris
        const [inventarisItems] = await db.query('SELECT nama_barang, status FROM inventaris');
        const checklist = inventarisItems.map(item => ({
            nama: item.nama_barang,
            status: item.status, // Ambil status terkini dari master
            catatan: '' // Tambahkan field catatan kosong
        }));

        const newAbsen = {
            user_id: userId,
            waktu_masuk: new Date(),
            foto_path: foto_path,
            latitude,
            longitude,
            inventaris_checklist: JSON.stringify(checklist),
            checklist_submitted: false
        };

        await db.query('INSERT INTO absensi SET ?', newAbsen);
        res.status(201).json({ message: 'Absen masuk berhasil dicatat.' });

    } catch (error) {
        console.error("Error saat absen masuk:", error);
        res.status(500).json({ message: 'Gagal mencatat absen masuk.' });
    }
});

// Endpoint 2: Kirim Laporan Inventaris (Logika update master ditambahkan)
router.post('/submit-checklist', verifyToken, async (req, res) => {
    try {
        const { absensiId, checklist } = req.body;
        const userId = req.user.id;
        
        // Langkah 1: Simpan laporan checklist ke data absensi (tidak berubah)
        await db.query(
            'UPDATE absensi SET inventaris_checklist = ?, checklist_submitted = TRUE WHERE id = ? AND user_id = ?',
            [JSON.stringify(checklist), absensiId, userId]
        );

        // LANGKAH 2 BARU: Loop melalui laporan dan update status master di tabel inventaris
        for (const item of checklist) {
            await db.query(
                'UPDATE inventaris SET status = ? WHERE nama_barang = ?',
                [item.status, item.nama]
            );
        }
        
        res.json({ message: 'Laporan inventaris telah dikirim dan status master telah diperbarui.' });
    } catch (error) {
        console.error("Error saat submit checklist:", error);
        res.status(500).json({ message: 'Gagal mengirim checklist.' });
    }
});

// Endpoint 3: Absen KELUAR (tidak ada perubahan)
router.post('/keluar', verifyToken, upload.single('foto_absen'), async (req, res) => {
    // ... (kode di sini sudah benar dan tidak perlu diubah) ...
    try {
        const { absensiId, latitude, longitude } = req.body;
        const userId = req.user.id;

        if (!req.file) return res.status(400).json({ message: 'Foto absensi keluar diperlukan.' });
          await addWatermark(req.file.path, latitude, longitude);
        const foto_path_keluar = path.join('uploads', 'absensi', req.file.filename).replace(/\\/g, '/');

        const [rows] = await db.query('SELECT * FROM absensi WHERE id = ? AND user_id = ?', [absensiId, userId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Sesi absensi tidak ditemukan.' });
        }
        const sesiAbsen = rows[0];

        if (sesiAbsen.waktu_keluar) {
            return res.status(400).json({ message: 'Anda sudah melakukan absen keluar untuk sesi ini.' });
        }
        
        const waktuMasuk = new Date(sesiAbsen.waktu_masuk);
        const selisihMenit = (new Date() - waktuMasuk) / (1000 * 60);
        if (selisihMenit < 120) {
            return res.status(400).json({ message: `Anda baru piket ${Math.floor(selisihMenit)} menit. Absen keluar bisa dilakukan setelah 2 jam.` });
        }

        if (!sesiAbsen.checklist_submitted) {
            return res.status(400).json({ message: 'Harap kirim checklist inventaris sebelum absen keluar.' });
        }
        
        await db.query(
            'UPDATE absensi SET waktu_keluar = ?, foto_path_keluar = ?, latitude_keluar = ?, longitude_keluar = ? WHERE id = ?',
            [new Date(), foto_path_keluar, latitude, longitude, absensiId]
        );

        res.json({ message: 'Absen keluar berhasil dicatat. Selamat beristirahat!' });
    } catch (error) {
        console.error("Error saat absen keluar:", error);
        res.status(500).json({ message: 'Gagal mencatat absen keluar.' });
    }
});

// Endpoint 4: Get Status Absensi Terkini (tidak ada perubahan)
router.get('/status', verifyToken, async (req, res) => {
    // ... (kode di sini sudah benar dan tidak perlu diubah) ...
    try {
        const [activeSession] = await db.query(
            'SELECT * FROM absensi WHERE user_id = ? AND waktu_keluar IS NULL ORDER BY waktu_masuk DESC LIMIT 1',
            [req.user.id]
        );
        res.json(activeSession[0] || null);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil status absensi.' });
    }
});

module.exports = router;