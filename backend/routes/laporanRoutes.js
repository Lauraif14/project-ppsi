// backend/routes/laporanRoutes.js

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const laporanController = require('../controllers/laporanController');

// GET Laporan Absensi Lengkap
router.get('/absensi-lengkap', verifyToken, laporanController.getLaporanAbsensi);

module.exports = router;