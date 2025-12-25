const express = require('express');
const router = express.Router();
const informasiController = require('../controllers/informasiController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const { uploadInformasi } = require('../utils/uploadUtils');

/**
 * RUTE UNTUK PENGURUS & ADMIN
 */
// Mengambil semua informasi (SOP/Panduan/Informasi Lain)
router.get('/', verifyToken, informasiController.getAllInformasi);

// Mengambil informasi aktif untuk dashboard
router.get('/active', verifyToken, informasiController.getActiveInformasi);



/**
 * RUTE KHUSUS ADMIN (MANAJEMEN DOKUMEN)
 */
// Membuat informasi baru dengan upload file
router.post(
    '/',
    verifyAdmin,
    uploadInformasi.single('file'),
    informasiController.createInformasi
);

// Memperbarui informasi (bisa update teks saja atau dengan file baru)
router.put(
    '/:id',
    verifyAdmin,
    uploadInformasi.single('file'),
    informasiController.updateInformasi
);

// Menghapus informasi dan file fisiknya
router.delete('/:id', verifyAdmin, informasiController.deleteInformasi);

module.exports = router;
