// routes/authRoutes.js

const express = require('express');
// Pastikan yang diimpor adalah instance AuthController, yang kita asumsikan diekspor oleh controller/authController.js
const authController = require('../controllers/authController'); 
const { verifyToken } = require('../middleware/auth'); 

const router = express.Router();

// Endpoint untuk Login
// HARUS menggunakan .bind(authController)
router.post('/login', authController.login.bind(authController));

// Endpoint Lupa Password (meminta reset)
router.post('/forgot-password', authController.forgotPassword.bind(authController));

// Endpoint Reset Password (setelah user klik link)
router.post('/reset-password', authController.resetPassword.bind(authController));

// Endpoint Get Profile
router.get('/profile', verifyToken, authController.getProfile.bind(authController));

// Endpoint Update Profile
router.put('/profile', verifyToken, authController.updateProfile.bind(authController));

module.exports = router;