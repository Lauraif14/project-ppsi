// routes/authRoutes.js

const express = require('express');
const { verifyToken } = require('../middleware/auth');
const authController = require('../controllers/authController');

const router = express.Router();

// Login
router.post('/login', authController.login);

// (Opsional) Registrasi
// router.post('/register', authController.register);

// Lupa Password
router.post('/forgot-password', authController.forgotPassword);

// Reset Password
router.post('/reset-password', authController.resetPassword);

// Profil
router.get('/profile', verifyToken, authController.getProfile);
router.put('/profile', verifyToken, authController.updateProfile);

module.exports = router;
