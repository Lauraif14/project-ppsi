// controllers/authController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../db');

// Login (username atau email)
exports.login = async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res
      .status(400)
      .json({ message: 'Username/email dan password harus diisi.' });
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [identifier, identifier]
    );

    if (rows.length === 0) {
      return res
        .status(401)
        .json({ message: 'Username/email atau password salah.' });
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: 'Username/email atau password salah.' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.nama_lengkap },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// (Opsional) Registrasi – kalau mau diaktifkan tinggal pakai di routes
// exports.register = async (req, res) => {
//   try {
//     const { username, email, password, role } = req.body;

//     const [existingUser] = await db.query(
//       'SELECT * FROM users WHERE username = ? OR email = ?',
//       [username, email]
//     );

//     if (existingUser.length > 0) {
//       return res
//         .status(409)
//         .json({ message: 'Username atau email sudah digunakan.' });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     await db.query(
//       'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
//       [username, email, hashedPassword, role || 'user']
//     );

//     res.status(201).json({ message: 'User berhasil dibuat.' });
//   } catch (error) {
//     console.error('Register error:', error);
//     res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
//   }
// };

// Lupa Password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [
      email,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Email tidak ditemukan.' });
    }

    const user = rows[0];
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 jam

    await db.query(
      'UPDATE users SET resetToken = ?, resetTokenExpiry = ? WHERE id = ?',
      [resetToken, resetTokenExpiry, user.id]
    );

    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;
    console.log(`Link Reset Password untuk ${email}: ${resetLink}`);

    res.json({
      message: 'Link reset password telah dikirim (cek konsol backend).',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE resetToken = ? AND resetTokenExpiry > ?',
      [token, Date.now()]
    );

    if (rows.length === 0) {
      return res
        .status(400)
        .json({ message: 'Token tidak valid atau sudah kedaluwarsa.' });
    }

    const user = rows[0];
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      'UPDATE users SET password = ?, resetToken = NULL, resetTokenExpiry = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );

    res.json({ message: 'Password berhasil direset.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// Get Profile
exports.getProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.query(
      'SELECT id, username, email, role, nama_lengkap FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length > 0) {
      return res.json(rows[0]);
    }

    res.status(404).json({ message: 'User tidak ditemukan' });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// Update Profile
exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { nama_lengkap, email } = req.body;

  try {
    await db.query(
      'UPDATE users SET nama_lengkap = ?, email = ? WHERE id = ?',
      [nama_lengkap, email, userId]
    );

    res.json({ message: 'Profil berhasil diperbarui' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};
