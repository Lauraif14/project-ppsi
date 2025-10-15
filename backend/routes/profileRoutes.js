const express = require('express');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Konfigurasi Multer untuk upload foto profil (avatar)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '..', 'public', 'uploads', 'avatars');
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `user-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueSuffix);
    }
});
const upload = multer({ storage: storage });

// GET - Mengambil data profil (DIUBAH untuk menyertakan avatar_url)
router.get('/', verifyToken, async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT id, username, email, nama_lengkap, divisi, jabatan, role, avatar_url FROM users WHERE id = ?',
            [req.user.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }
        
        const user = rows[0];
        // Buat URL lengkap untuk foto profil jika ada
        if (user.avatar_url) {
            user.avatar_url = `${req.protocol}://${req.get('host')}/${user.avatar_url.replace(/\\/g, '/')}`;
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Kesalahan server' });
    }
});

// PUT - Memperbarui profil (DIUBAH untuk menangani file)
router.put('/', verifyToken, upload.single('avatar'), async (req, res) => {
    try {
        const { name, email, username, password, confirmPassword } = req.body;
        const userId = req.user.id;

        // Update info teks
        await db.query(
            'UPDATE users SET nama_lengkap = ?, email = ?, username = ? WHERE id = ?',
            [name, email, username, userId]
        );

        // Update foto profil jika ada file baru yang di-upload
        if (req.file) {
            const avatar_url = path.join('uploads', 'avatars', req.file.filename).replace(/\\/g, '/');
            await db.query('UPDATE users SET avatar_url = ? WHERE id = ?', [avatar_url, userId]);
        }
        
        // Update password jika diisi
        if (password) {
            if (password !== confirmPassword) {
                return res.status(400).json({ message: 'Password konfirmasi tidak cocok.' });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
        }

        res.json({ message: 'Profil berhasil diperbarui.' });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ message: 'Gagal memperbarui profil.' });
    }
});

module.exports = router;