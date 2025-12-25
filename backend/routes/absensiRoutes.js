// routes/absensiRoutes.js

const express = require('express');
const multer = require('multer');
const { verifyToken } = require('../middleware/auth');
const absensiController = require('../controllers/absensiController'); // Import instance

const router = express.Router();

// 1. Konfigurasi Multer (Middleware)
// Tetap di sini karena Multer adalah middleware spesifik untuk routing ini.
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Helper untuk binding agar kode lebih rapi
const bind = (method) => method.bind(absensiController);

// Endpoint Absen MASUK
router.post('/masuk', verifyToken, upload.single('foto_absen'), bind(absensiController.absenMasuk));

// Endpoint Get Checklist Inventaris
router.get('/checklist', verifyToken, bind(absensiController.getChecklist));

// Endpoint Kirim Laporan Inventaris
router.post('/submit-checklist', verifyToken, bind(absensiController.submitChecklist));


// Endpoint Absen KELUAR
router.post('/keluar', verifyToken, upload.single('foto_absen'), bind(absensiController.absenKeluar));

// Endpoint Get Status Absensi Terkini
router.get('/status', verifyToken, bind(absensiController.getAbsensiStatus));

// Endpoint Get Riwayat Absensi
router.get('/history', verifyToken, bind(absensiController.getAbsensiHistory));

// Endpoint Laporan Absensi Berdasarkan Tanggal
router.get('/laporan', verifyToken, bind(absensiController.getLaporanAbsensi));


// Endpoint Absensi Hari Ini (untuk admin/pengurus)
router.get('/today', verifyToken, bind(absensiController.getTodayAbsensi));

module.exports = router;