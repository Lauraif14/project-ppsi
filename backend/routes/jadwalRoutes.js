// routes/jadwalRoutes.js - Updated untuk sistem berbasis tanggal

const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const jadwalController = require('../controllers/jadwalController');

// Helper untuk binding
const bind = (method) => method.bind(jadwalController);

/**
 * PUBLIC ROUTES (dengan verifyToken)
 */

// GET Jadwal Hari Ini dengan status absensi
router.get('/hari-ini', verifyToken, bind(jadwalController.getJadwalHariIni));

// GET Jadwal (by date range, month, or current week)
// Query params: ?start_date=...&end_date=... atau ?month=...&year=...
router.get('/', verifyToken, bind(jadwalController.getJadwal));

/**
 * ADMIN ROUTES
 */

// POST Generate Jadwal (preview, belum save ke DB)
router.post('/generate', verifyAdmin, bind(jadwalController.generateJadwalByDateRange));

// POST Save Jadwal ke Database
router.post('/', verifyAdmin, bind(jadwalController.saveJadwal));

// DELETE Jadwal
// Query params: ?start_date=...&end_date=... atau tanpa query untuk delete all
router.delete('/', verifyAdmin, bind(jadwalController.deleteJadwal));

module.exports = router;