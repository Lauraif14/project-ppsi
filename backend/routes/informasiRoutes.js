// backend/routes/informasiRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ================================
// 🗂️ Konfigurasi Upload File PDF
// ================================
const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'informasi');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') cb(null, true);
  else cb(new Error('Hanya file PDF yang diperbolehkan!'), false);
};

const upload = multer({ storage, fileFilter });

// ================================
// ✅ [USER & ADMIN] Ambil semua informasi (SOP & Panduan)
// ================================
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, judul, isi, kategori, file_path, created_at, updated_at 
      FROM informasi 
      WHERE kategori IN ('SOP', 'Panduan', 'Informasi Lain') 
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      message: 'Data SOP & Panduan berhasil diambil',
      data: rows,
    });
  } catch (error) {
    console.error('Error GET /informasi:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data informasi',
      error: error.message,
    });
  }
});

// ================================
// ✅ [ADMIN] Tambah informasi baru (SOP / Panduan) + Upload PDF Opsional
// ================================
router.post('/', verifyToken, upload.single('file_pdf'), async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Akses ditolak. Hanya admin.' });

    const { judul, isi, kategori } = req.body;
    const filePath = req.file ? path.join('uploads', 'informasi', req.file.filename) : null;

    if (!judul || !isi || !kategori)
      return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });

    await db.query(
      'INSERT INTO informasi (judul, isi, kategori, file_path) VALUES (?, ?, ?, ?)',
      [judul, isi, kategori, filePath]
    );

    res.status(201).json({
      success: true,
      message: `Informasi ${kategori} berhasil ditambahkan`,
      file_path: filePath,
    });
  } catch (error) {
    console.error('Error POST /informasi:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan informasi',
      error: error.message,
    });
  }
});

// ================================
// ✅ [ADMIN] Edit informasi (Update) + Update PDF Opsional
// ================================
router.put('/:id', verifyToken, upload.single('file_pdf'), async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Akses ditolak. Hanya admin.' });

    const { id } = req.params;
    const { judul, isi, kategori } = req.body;

    if (!judul || !isi || !kategori)
      return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });

    // Ambil data lama untuk hapus file lama jika upload baru
    const [oldData] = await db.query('SELECT file_path FROM informasi WHERE id=?', [id]);
    if (oldData.length === 0)
      return res.status(404).json({ success: false, message: 'Informasi tidak ditemukan' });

    let query, values;

    if (req.file) {
      const newFilePath = path.join('uploads', 'informasi', req.file.filename);

      // Hapus file lama jika ada
      if (oldData[0].file_path) {
        const oldFile = path.join(__dirname, '..', 'public', oldData[0].file_path);
        if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
      }

      query = 'UPDATE informasi SET judul=?, isi=?, kategori=?, file_path=? WHERE id=?';
      values = [judul, isi, kategori, newFilePath, id];
    } else {
      query = 'UPDATE informasi SET judul=?, isi=?, kategori=? WHERE id=?';
      values = [judul, isi, kategori, id];
    }

    const [result] = await db.query(query, values);

    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: 'Informasi tidak ditemukan' });

    res.json({
      success: true,
      message: 'Informasi berhasil diperbarui',
    });
  } catch (error) {
    console.error('Error PUT /informasi:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui informasi',
      error: error.message,
    });
  }
});

// ================================
// ✅ [ADMIN] Hapus informasi + Hapus file PDF jika ada
// ================================
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Akses ditolak. Hanya admin.' });

    const { id } = req.params;

    // Ambil data dulu untuk tahu file_path
    const [rows] = await db.query('SELECT file_path FROM informasi WHERE id=?', [id]);
    if (rows.length === 0)
      return res.status(404).json({ success: false, message: 'Informasi tidak ditemukan' });

    const filePath = rows[0].file_path
      ? path.join(__dirname, '..', 'public', rows[0].file_path)
      : null;

    // Hapus data di database
    const [result] = await db.query('DELETE FROM informasi WHERE id=?', [id]);

    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: 'Informasi tidak ditemukan' });

    // Jika file PDF ada, hapus file fisiknya
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({
      success: true,
      message: 'Informasi dan file PDF (jika ada) berhasil dihapus',
    });
  } catch (error) {
    console.error('Error DELETE /informasi:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus informasi',
      error: error.message,
    });
  }
});

// ================================
// ✅ [USER & ADMIN] Ambil detail 1 informasi
// ================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM informasi WHERE id=?', [id]);

    if (rows.length === 0)
      return res.status(404).json({ success: false, message: 'Informasi tidak ditemukan' });

    res.json({
      success: true,
      message: 'Detail informasi berhasil diambil',
      data: rows[0],
    });
  } catch (error) {
    console.error('Error GET /informasi/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail informasi',
      error: error.message,
    });
  }
});

module.exports = router;
