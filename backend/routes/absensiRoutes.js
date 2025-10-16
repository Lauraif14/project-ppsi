const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../db');
const verifyToken = require('../middleware/auth');

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

// Endpoint 1: Absen MASUK (Logika checklist diubah)
router.post('/masuk', verifyToken, upload.single('foto_absen'), async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        const userId = req.user.id;
        
        if (!req.file) return res.status(400).json({ message: 'Foto absensi diperlukan.' });
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

// GET absensi berdasarkan tanggal - DIPERBAIKI sesuai struktur database
router.get('/laporan', verifyToken, async (req, res) => {
  try {
    const { date } = req.query;
    
    console.log('🔍 Getting absensi data for date:', date);
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Parameter tanggal diperlukan'
      });
    }
    
    // Query untuk mengambil data absensi berdasarkan tanggal
    // Sesuaikan dengan struktur tabel yang benar
    const [rows] = await db.execute(`
      SELECT 
        a.id,
        a.user_id,
        a.waktu_masuk,
        a.waktu_keluar,
        a.foto_path,
        a.foto_path_keluar,
        a.latitude,
        a.longitude,
        a.latitude_keluar,
        a.longitude_keluar,
        a.inventaris_checklist,
        a.checklist_submitted,
        u.nama_lengkap,
        u.username,
        u.email,
        u.jabatan,
        u.divisi,
        -- Tentukan status berdasarkan waktu_masuk dan waktu_keluar
        CASE 
          WHEN a.waktu_masuk IS NOT NULL AND a.waktu_keluar IS NOT NULL THEN 'Hadir'
          WHEN a.waktu_masuk IS NOT NULL AND a.waktu_keluar IS NULL THEN 'Belum Keluar'
          ELSE 'Tidak Hadir'
        END as status,
        -- Format waktu untuk tampilan
        TIME_FORMAT(a.waktu_masuk, '%H:%i') as waktu_absen_formatted,
        TIME_FORMAT(a.waktu_keluar, '%H:%i') as waktu_keluar_formatted
      FROM absensi a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE DATE(a.waktu_masuk) = ? OR DATE(a.waktu_keluar) = ?
      ORDER BY a.waktu_masuk ASC
    `, [date, date]);
    
    console.log('📊 Found absensi records:', rows.length);
    
    res.json({
      success: true,
      data: rows,
      total: rows.length,
      date: date
    });
  } catch (error) {
    console.error('Error fetching absensi data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching absensi data',
      error: error.message
    });
  }
});

// GET absensi hari ini untuk pengurus yang belum absen
router.get('/today', verifyToken, async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    
    console.log('🔍 Getting today absensi data:', today);
    
    // Get semua pengurus dan status absensi hari ini
    const [rows] = await db.execute(`
      SELECT 
        u.id,
        u.nama_lengkap,
        u.username,
        u.email,
        u.jabatan,
        u.divisi,
        a.waktu_masuk,
        a.waktu_keluar,
        a.foto_path,
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
    
    res.json({
      success: true,
      data: rows,
      total: rows.length,
      date: today
    });
  } catch (error) {
    console.error('Error fetching today absensi:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching today absensi',
      error: error.message
    });
  }
});

module.exports = router;