const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/auth');

// GET all users untuk mengisi tabel Daftar Akun (protected route)
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT id, username, nama_lengkap, divisi FROM users WHERE role = "user"');
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// GET pengurus untuk Data Master (protected route)
router.get('/pengurus', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT id, nama_lengkap, jabatan FROM users WHERE jabatan IS NOT NULL AND jabatan != ""');
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pengurus',
      error: error.message
    });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { nama_lengkap, username, divisi, password } = req.body;

    // Validasi input
    if (!nama_lengkap || !username || !divisi || !password) {
      return res.status(400).json({
        success: false,
        message: 'Semua field wajib diisi (nama_lengkap, username, divisi, password)'
      });
    }

    // Check if username already exists
    const [existingUser] = await db.execute('SELECT id FROM users WHERE username = ?', [username]);
    
    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username sudah digunakan'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Insert new user
    const [result] = await db.execute(
      'INSERT INTO users (nama_lengkap, username, divisi, password) VALUES (?, ?, ?, ?)',
      [nama_lengkap, username, divisi, hashedPassword]
    );
    
    res.status(201).json({
      success: true,
      message: 'User berhasil dibuat',
      data: {
        id: result.insertId,
        nama_lengkap,
        username,
        divisi
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
});

module.exports = router;