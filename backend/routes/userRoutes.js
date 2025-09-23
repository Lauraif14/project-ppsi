const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/auth');

// GET all users untuk mengisi tabel Daftar Akun (protected route)
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT id, username, nama_lengkap, divisi FROM users');
    
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

module.exports = router;