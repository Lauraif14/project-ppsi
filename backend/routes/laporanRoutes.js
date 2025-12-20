// backend/routes/laporanRoutes.js

const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../middleware/auth'); // Asumsi ada verifyAdmin
const laporanController = require('../controllers/laporanController');

// GET Laporan Absensi dalam rentang tanggal
router.get('/absensi', verifyAdmin, laporanController.getAbsensiLaporan);

// GET Status Inventaris Real-Time
router.get('/inventaris-status', verifyAdmin, laporanController.getInventarisStatusRealtime);

// GET Laporan Checklist Inventaris berdasarkan tanggal
router.get('/inventaris', verifyAdmin, laporanController.getInventarisLaporanByDate);

// GET Laporan Piket Mingguan
router.get('/piket/weekly', verifyAdmin, laporanController.getWeeklyPiketReport);

// GET Laporan Piket Bulanan
router.get('/piket/monthly', verifyAdmin, laporanController.getMonthlyPiketReport);

module.exports = router;