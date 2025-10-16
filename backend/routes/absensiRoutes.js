const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../db');
const { verifyToken } = require('../middleware/auth');
const axios = require('axios');
const sharp = require('sharp');

const router = express.Router();

// 🧩 1. Konfigurasi Multer untuk memproses file di memori
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 🧩 2. Fungsi untuk menambahkan watermark lokasi
const addWatermark = async (imageBuffer, latitude, longitude) => {
  try {
    const geoUrl = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${process.env.OPENCAGE_API_KEY}`;
    const response = await axios.get(geoUrl);
    const locationName = response.data.results[0]?.formatted || 'Lokasi tidak ditemukan';

    const text = `${locationName}\n${new Date().toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })}`;

    const svgImage = `
      <svg width="400" height="80">
        <style>
          .title {
            fill: #fff;
            font-size: 14px;
            font-weight: bold;
            font-family: Arial, sans-serif;
            text-shadow: 1px 1px 2px black;
          }
        </style>
        <rect x="0" y="0" width="100%" height="100%" fill="#000" fill-opacity="0.5" rx="10"/>
        <text x="10" y="30" class="title">${text.split('\n')[0]}</text>
        <text x="10" y="55" class="title">${text.split('\n')[1]}</text>
      </svg>
    `;

    const svgBuffer = Buffer.from(svgImage);
    return sharp(imageBuffer)
      .resize(600)
      .composite([{ input: svgBuffer, gravity: 'southwest' }])
      .toBuffer();
  } catch (error) {
    console.error('⚠️ Gagal menambahkan watermark:', error.message);
    return imageBuffer;
  }
};

// 🟢 3. Endpoint Absen MASUK
router.post('/masuk', verifyToken, upload.single('foto_absen'), async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const userId = req.user.id;

    if (!req.file) return res.status(400).json({ message: 'Foto absensi diperlukan.' });

    // Cek sesi aktif (belum keluar)
    const [activeSession] = await db.query(
      'SELECT * FROM absensi WHERE user_id = ? AND waktu_keluar IS NULL',
      [userId]
    );
    if (activeSession.length > 0) {
      return res.status(400).json({ message: 'Anda sudah memiliki sesi absen aktif.' });
    }

    // Tambahkan watermark
    const watermarkedBuffer = await addWatermark(req.file.buffer, latitude, longitude);
    const filename = `absen-${userId}-${Date.now()}.jpg`;
    const filePath = path.join(__dirname, '..', 'public', 'uploads', 'absensi', filename);
    await sharp(watermarkedBuffer).toFile(filePath);
    const foto_path = path.join('uploads', 'absensi', filename).replace(/\\/g, '/');

    // Ambil inventaris terkini
    const [inventarisItems] = await db.query(
      'SELECT id, kode_barang, nama_barang, status FROM inventaris'
    );
    const checklist = inventarisItems.map((item) => ({
      inventaris_id: item.id,
      kode_barang: item.kode_barang,
      nama: item.nama_barang,
      status: item.status,
      catatan: '',
    }));

    // Simpan data absensi masuk
    const waktuMasuk = new Date();
    await db.query('INSERT INTO absensi SET ?', {
      user_id: userId,
      waktu_masuk: waktuMasuk,
      foto_path,
      latitude,
      longitude,
      inventaris_checklist: JSON.stringify(checklist),
      checklist_submitted: false,
    });

    // 🟢 Sinkronisasi ke riwayat_piket
    await db.query(
      `INSERT INTO riwayat_piket (user_id, tanggal_piket, waktu_masuk, status)
       VALUES (?, CURDATE(), ?, 'Hadir')
       ON DUPLICATE KEY UPDATE waktu_masuk = VALUES(waktu_masuk), status = 'Hadir'`,
      [userId, waktuMasuk]
    );

    res.status(201).json({ message: 'Absen masuk berhasil dicatat.' });
  } catch (error) {
    console.error('❌ Error absen masuk:', error);
    res.status(500).json({ message: 'Gagal mencatat absen masuk.' });
  }
});

// 🟢 4. Endpoint Kirim Checklist Inventaris
router.post('/submit-checklist', verifyToken, async (req, res) => {
  try {
    const { absensiId, checklist } = req.body;
    const userId = req.user.id;

    await db.query(
      'UPDATE absensi SET inventaris_checklist = ?, checklist_submitted = TRUE WHERE id = ? AND user_id = ?',
      [JSON.stringify(checklist), absensiId, userId]
    );

    // Update status inventaris master
    for (const item of checklist) {
      await db.query('UPDATE inventaris SET status = ? WHERE id = ?', [
        item.status,
        item.inventaris_id,
      ]);
    }

    res.json({ message: 'Checklist inventaris berhasil disimpan dan status diperbarui.' });
  } catch (error) {
    console.error('❌ Error submit checklist:', error);
    res.status(500).json({ message: 'Gagal mengirim checklist inventaris.' });
  }
});

// 🟢 5. Endpoint Absen KELUAR + Sinkronisasi ke Riwayat
router.post('/keluar', verifyToken, upload.single('foto_absen'), async (req, res) => {
  try {
    const { absensiId, latitude, longitude } = req.body;
    const userId = req.user.id;

    if (!req.file) return res.status(400).json({ message: 'Foto absensi keluar diperlukan.' });

    const [rows] = await db.query('SELECT * FROM absensi WHERE id = ? AND user_id = ?', [
      absensiId,
      userId,
    ]);
    if (rows.length === 0) return res.status(404).json({ message: 'Sesi absensi tidak ditemukan.' });

    const sesiAbsen = rows[0];
    if (sesiAbsen.waktu_keluar)
      return res.status(400).json({ message: 'Anda sudah melakukan absen keluar.' });

    const waktuMasuk = new Date(sesiAbsen.waktu_masuk);
    const waktuSekarang = new Date();
    const selisihMenit = (waktuSekarang - waktuMasuk) / (1000 * 60);
    if (selisihMenit < 120) {
      return res.status(400).json({
        message: `Anda baru piket ${Math.floor(selisihMenit)} menit. Absen keluar bisa dilakukan setelah 2 jam.`,
      });
    }

    if (!sesiAbsen.checklist_submitted) {
      return res.status(400).json({
        message: 'Harap kirim checklist inventaris sebelum absen keluar.',
      });
    }

    // Proses foto keluar
    const watermarkedBuffer = await addWatermark(req.file.buffer, latitude, longitude);
    const filename = `absen-keluar-${userId}-${Date.now()}.jpg`;
    const filePath = path.join(__dirname, '..', 'public', 'uploads', 'absensi', filename);
    await sharp(watermarkedBuffer).toFile(filePath);
    const foto_path_keluar = path.join('uploads', 'absensi', filename).replace(/\\/g, '/');

    // Update data absensi
    await db.query(
      'UPDATE absensi SET waktu_keluar = ?, foto_path_keluar = ?, latitude_keluar = ?, longitude_keluar = ? WHERE id = ?',
      [waktuSekarang, foto_path_keluar, latitude, longitude, absensiId]
    );

    // Hitung durasi dan update riwayat_piket
    const durasiPiket = Math.floor((waktuSekarang - waktuMasuk) / 60000);
    await db.query(
      `INSERT INTO riwayat_piket (user_id, tanggal_piket, waktu_masuk, waktu_keluar, durasi_piket, laporan_inventaris, status)
       VALUES (?, DATE(?), ?, ?, ?, ?, 'Hadir')
       ON DUPLICATE KEY UPDATE 
           waktu_keluar = VALUES(waktu_keluar),
           durasi_piket = VALUES(durasi_piket),
           laporan_inventaris = VALUES(laporan_inventaris),
           status = 'Hadir'`,
      [userId, waktuMasuk, waktuMasuk, waktuSekarang, durasiPiket, sesiAbsen.inventaris_checklist]
    );

    res.json({ message: 'Absen keluar berhasil dicatat dan riwayat piket tersinkron.' });
  } catch (error) {
    console.error('❌ Error absen keluar:', error);
    res.status(500).json({ message: 'Gagal mencatat absen keluar.' });
  }
});

// 🟢 6. Endpoint Status Absensi Terkini
router.get('/status', verifyToken, async (req, res) => {
  try {
    const [activeSessions] = await db.query(
      'SELECT * FROM absensi WHERE user_id = ? AND waktu_keluar IS NULL ORDER BY waktu_masuk DESC LIMIT 1',
      [req.user.id]
    );
    if (activeSessions.length === 0) return res.json(null);

    const sesiAbsen = activeSessions[0];
    const hariMasuk = new Date(sesiAbsen.waktu_masuk).toDateString();
    const hariIni = new Date().toDateString();
    if (hariMasuk !== hariIni) return res.json(null);

    res.json(sesiAbsen);
  } catch (error) {
    console.error('❌ Error get status absensi:', error);
    res.status(500).json({ message: 'Gagal mengambil status absensi.' });
  }
});

// 🟢 7. Endpoint Riwayat Absensi User
router.get('/history', verifyToken, async (req, res) => {
  try {
    const [history] = await db.query(
      'SELECT * FROM absensi WHERE user_id = ? ORDER BY waktu_masuk DESC',
      [req.user.id]
    );

    const formatted = history.map((item) => ({
      ...item,
      foto_url: `${req.protocol}://${req.get('host')}/${item.foto_path.replace(/\\/g, '/')}`,
    }));

    res.json(formatted);
  } catch (error) {
    console.error('❌ Error get history absensi:', error);
    res.status(500).json({ message: 'Gagal mengambil riwayat absensi.' });
  }
});

module.exports = router;
