// routes/jadwalRoutes.js

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth'); 
const jadwalController = require('../controllers/jadwalController'); // Import instance

// Helper untuk binding
const bind = (method) => method.bind(jadwalController);

// GET Jadwal Piket dan Status Absensi Hari Ini
router.get('/hari-ini', verifyToken, bind(jadwalController.getJadwalPiketHariIni));

module.exports = router;