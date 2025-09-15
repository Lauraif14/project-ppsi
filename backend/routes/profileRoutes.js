// profileRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const verifyToken = require('../middleware/auth'); // Kita akan buat middleware ini

const router = express.Router();

// GET - Mengambil data profil pengguna saat ini
router.get('/', verifyToken, async (req, res) => {
    try {
        const [rows] = await db.query(
           'SELECT id, username, email, nama_lengkap, divisi, jabatan, role FROM users WHERE id = ?',
            [req.user.id] // req.user.id didapat dari middleware verifyToken
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Kesalahan server' });
    }
});

// PUT - Memperbarui data profil pengguna saat ini
router.put('/', verifyToken, async (req, res) => {
    try {
        const { username, name, email, divisi, jabatan, password, confirmPassword } = req.body;
        const userId = req.user.id;

        // Validasi dasar
        if (!name || !email) {
            return res.status(400).json({ message: 'Nama dan email harus diisi.' });
        }

        // Update nama dan email
        await db.query(
            'UPDATE users SET username = ?, nama_lengkap = ?, email = ?, divisi = ?, jabatan = ? WHERE id = ?',
            [name, email, divisi, jabatan, userId]
        );

        // Jika pengguna ingin mengubah password
        if (password) {
            if (password !== confirmPassword) {
                return res.status(400).json({ message: 'Password konfirmasi tidak cocok.' });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            await db.query(
                'UPDATE users SET password = ? WHERE id = ?',
                [hashedPassword, userId]
            );
        }

        res.json({ message: 'Profil berhasil diperbarui.' });
    } catch (error) {
        res.status(500).json({ message: 'Kesalahan server' });
    }
});

module.exports = router;