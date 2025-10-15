// backend/routes/informasiRoutes.js
const express = require('express');
const db = require('../db');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const router = express.Router();

// Endpoint untuk PENGURUS (user) - Hanya mengambil data
router.get('/', verifyToken, async (req, res) => {
    try {
        const [informasi] = await db.query('SELECT * FROM informasi ORDER BY kategori, judul');
        res.json(informasi);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil informasi.' });
    }
});

// === Rute Khusus Admin ===

// Endpoint untuk ADMIN - Membuat informasi baru
router.post('/', verifyAdmin, async (req, res) => {
    try {
        const { judul, isi, kategori } = req.body;
        await db.query('INSERT INTO informasi (judul, isi, kategori) VALUES (?, ?, ?)', [judul, isi, kategori]);
        res.status(201).json({ message: 'Informasi berhasil dibuat.' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal membuat informasi.' });
    }
});

// Endpoint untuk ADMIN - Memperbarui informasi
router.put('/:id', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { judul, isi, kategori } = req.body;
        await db.query('UPDATE informasi SET judul = ?, isi = ?, kategori = ? WHERE id = ?', [judul, isi, kategori, id]);
        res.json({ message: 'Informasi berhasil diperbarui.' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal memperbarui informasi.' });
    }
});

// Endpoint untuk ADMIN - Menghapus informasi
router.delete('/:id', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM informasi WHERE id = ?', [id]);
        res.json({ message: 'Informasi berhasil dihapus.' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus informasi.' });
    }
});

module.exports = router;