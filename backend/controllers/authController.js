// controllers/authController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); 
const userModel = require('../models/userModel'); // Model tetap diimpor di sini

class AuthController {
    
    // Fungsi untuk Login
    async login(req, res) {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({ message: 'Username/email dan password harus diisi.' });
        }

        try {
            const user = await userModel.findUserByIdentifier(identifier);

            if (!user) {
                return res.status(401).json({ message: 'Username/email atau password salah.' });
            }

            // Verifikasi Password
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Username/email atau password salah.' });
            }

            // Generate Token
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
    }

    // Fungsi untuk Lupa Password
    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            
            const user = await userModel.findUserByEmail(email); 

            if (!user) {
                return res.status(404).json({ message: "Email tidak ditemukan." });
            }

            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetTokenExpiry = Date.now() + 3600000; // Token berlaku 1 jam

            await userModel.updateResetToken(resetToken, resetTokenExpiry, user.id);

            const resetLink = `http://localhost:3000/reset-password/${resetToken}`;
            console.log(`Link Reset Password untuk ${email}: ${resetLink}`);

            res.json({ message: "Link reset password telah dikirim (cek konsol backend)." });
        } catch (error) {
            console.error('Forgot password error:', error);
            res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
        }
    }

    // Fungsi untuk Reset Password
    async resetPassword(req, res) {
        try {
            const { token, password } = req.body;
            
            const user = await userModel.findUserByResetToken(token, Date.now()); 

            if (!user) {
                return res.status(400).json({ message: "Token tidak valid atau sudah kedaluwarsa." });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            await userModel.updatePasswordAndClearToken(hashedPassword, user.id);

            res.json({ message: "Password berhasil direset." });
        } catch (error) {
            console.error('Reset password error:', error);
            res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
        }
    }

    // Fungsi untuk Mendapatkan Profil
    async getProfile(req, res) {
        try {
            const userId = req.user.id;
            
            const user = await userModel.findUserById(userId); 

            if (user) {
                // Menghapus password
                const { password, ...profileData } = user; 
                return res.json(profileData);
            } else {
                return res.status(404).json({ message: 'User tidak ditemukan' });
            }
        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
        }
    }

    // Fungsi untuk Mengupdate Profil
    async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const { nama_lengkap, email } = req.body;
            
            await userModel.updateProfile(nama_lengkap, email, userId);
            
            res.json({ message: 'Profil berhasil diperbarui' });
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
        }
    }
}

module.exports = new AuthController();