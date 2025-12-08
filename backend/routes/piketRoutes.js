// routes/piketRoutes.js

const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middleware/auth'); 
// Import instance class
const piketController = require('../controllers/piketController'); 

// --- Pengurus ---
router.get('/pengurus', verifyToken, piketController.getPengurusList.bind(piketController));

// --- Jadwal Piket ---
router.get('/jadwal', verifyToken, piketController.getJadwalPiket.bind(piketController));

router.post('/jadwal', verifyToken, piketController.saveJadwalPiket.bind(piketController));

router.delete('/jadwal', verifyToken, piketController.deleteJadwalPiket.bind(piketController));

router.post('/jadwal/generate', verifyToken, piketController.generateJadwalPiket.bind(piketController));

// --- Absensi Laporan ---
router.get('/absensi', verifyToken, piketController.getAbsensiReport.bind(piketController));

router.delete('/absensi/:id', verifyToken, piketController.deleteAbsensi.bind(piketController));

module.exports = router;