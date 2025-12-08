// controllers/userController.js (Bentuk Class/OOP)

const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');
// Mengimpor helper dari utils, bukan upload object Multer
const { parseUploadedFile, cleanupFile } = require('../utils/uploadUtils'); 

// Variabel Konstan
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const saltRounds = 10;
const defaultPassword = '123456';

// --- Helper Validation (Bisa diletakkan di luar class) ---
const validateUserFields = (data) => {
    const errors = {};
    // ... (Logika validasi sisanya tidak diubah) ...
    if (!data.nama_lengkap || data.nama_lengkap.trim().length < 2) {
        errors.nama_lengkap = 'Nama lengkap minimal 2 karakter';
    }
    if (!data.username || data.username.trim().length < 3) {
        errors.username = 'Username minimal 3 karakter';
    }
    if (!data.email || !emailRegex.test(data.email)) {
        errors.email = 'Format email tidak valid';
    }
    if (!data.jabatan || data.jabatan.trim().length === 0) {
        errors.jabatan = 'Jabatan harus diisi';
    }
    if (!data.divisi || data.divisi.trim().length === 0) {
        errors.divisi = 'Divisi harus diisi';
    }
    if (data.password && data.password.length < 6) {
        errors.password = 'Password minimal 6 karakter';
    }
    if (data.role && !['user', 'admin'].includes(data.role)) {
        errors.role = 'Role harus user atau admin';
    }
    return errors;
};
// -----------------------------------------------------------

class UserController {
    
    // --- CRUD Controllers ---

    async getAllUsers(req, res) {
        try {
            const rows = await UserModel.getAllUsers();
            res.json({ success: true, data: rows });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error fetching users', error: error.message });
        }
    }

    async getAllUsersComplete(req, res) {
        try {
            const rows = await UserModel.getAllUsersComplete();
            res.json({ success: true, data: rows });
        } catch (error) {
            console.error('Error fetching all users:', error);
            res.status(500).json({ success: false, message: 'Error fetching users', error: error.message });
        }
    }

    async createUser(req, res) {
        try {
            const { nama_lengkap, username, divisi, password } = req.body;

            if (!nama_lengkap || !username || !divisi || !password) {
                return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
            }

            if (await UserModel.findUserByUsername(username)) {
                return res.status(400).json({ success: false, message: 'Username sudah digunakan' });
            }

            const hashedPassword = await bcrypt.hash(password, saltRounds);
            // Catatan: UserModel.createUser di model Anda membutuhkan 7 parameter, di sini hanya 4 data + hash.
            // Asumsi: Model lama Anda menangani data yang hilang sebagai null.
            const insertId = await UserModel.createUser({ nama_lengkap, username, divisi, jabatan: null, email: null }, hashedPassword);
            
            res.status(201).json({
                success: true,
                message: 'User berhasil dibuat',
                data: { id: insertId, nama_lengkap, username, divisi }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error creating user', error: error.message });
        }
    }

    async createAccount(req, res) {
        try {
            const data = req.body;
            const errors = validateUserFields(data);

            if (Object.keys(errors).length > 0) {
                return res.status(400).json({ success: false, message: 'Validation failed', errors });
            }
            
            if (await UserModel.findUserByUsername(data.username)) {
                return res.status(400).json({ success: false, message: 'Username sudah digunakan', errors: { username: 'Username sudah digunakan' } });
            }

            if (await UserModel.findUserByEmail(data.email)) {
                return res.status(400).json({ success: false, message: 'Email sudah terdaftar', errors: { email: 'Email sudah digunakan' } });
            }

            const hashedPassword = await bcrypt.hash(data.password, 10);
            const insertId = await UserModel.createUser(data, hashedPassword);

            res.status(201).json({
                success: true,
                message: 'Akun berhasil dibuat',
                user: { id: insertId, ...data, password: undefined }
            });

        } catch (error) {
            console.error('Create account error:', error);
            res.status(500).json({ success: false, message: 'Error creating account', error: error.message });
        }
    }

    async updateUser(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;
            const errors = validateUserFields(data);
            
            delete errors.password;
            
            if (Object.keys(errors).length > 0) {
                return res.status(400).json({ success: false, message: 'Validation failed', errors });
            }

            if (!(await UserModel.findUserById(id))) {
                return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
            }

            const emailCheck = await UserModel.findUserByEmail(data.email);
            if (emailCheck && emailCheck.id.toString() !== id) {
                return res.status(400).json({ success: false, message: 'Email sudah digunakan oleh user lain', errors: { email: 'Email sudah digunakan' } });
            }

            await UserModel.updateUser(id, data);
            
            const updatedUser = await UserModel.findUserById(id);

            res.json({ success: true, message: 'User berhasil diupdate', user: updatedUser });
        } catch (error) {
            console.error('Update user error:', error);
            res.status(500).json({ success: false, message: 'Error updating user', error: error.message });
        }
    }

    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            const user = await UserModel.findUserById(id);

            if (!user) {
                return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
            }

            if (user.role === 'admin' && await UserModel.countAdmins() <= 1) {
                return res.status(400).json({ success: false, message: 'Tidak dapat menghapus admin terakhir' });
            }

            const affectedRows = await UserModel.deleteUser(id);

            if (affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'User tidak ditemukan atau sudah dihapus' });
            }

            res.json({ success: true, message: `User ${user.nama_lengkap} berhasil dihapus`, deleted_user: user });

        } catch (error) {
            console.error('Delete user error:', error);
            res.status(500).json({ success: false, message: 'Error deleting user', error: error.message });
        }
    }

    async resetPassword(req, res) {
        try {
            const { id } = req.params;
            const { new_password } = req.body;
            
            if (!new_password || new_password.length < 6) {
                return res.status(400).json({ success: false, message: 'Password baru minimal 6 karakter' });
            }

            const user = await UserModel.findUserById(id);
            
            if (!user) {
                return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
            }

            const hashedPassword = await bcrypt.hash(new_password, 10);
            await UserModel.updatePassword(id, hashedPassword);

            res.json({ success: true, message: `Password untuk ${user.nama_lengkap} berhasil direset`, user });

        } catch (error) {
            console.error('Reset password error:', error);
            res.status(500).json({ success: false, message: 'Error resetting password', error: error.message });
        }
    }

    async bulkCreatePengurus(req, res) {
        let filePath = null;
        
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'File tidak ditemukan' });
            }

            filePath = req.file.path;
            
            // 1. Parse File
            let jsonData;
            try {
                // Menggunakan helper dari Utils
                jsonData = parseUploadedFile(filePath, req.file.originalname); 
            } catch (e) {
                cleanupFile(filePath);
                return res.status(400).json({ success: false, message: e.message });
            }

            if (jsonData.length === 0) {
                cleanupFile(filePath);
                return res.status(400).json({ success: false, message: 'File kosong atau format tidak sesuai.' });
            }

            // 2. Process Data
            const results = [];
            const errors = [];
            const processedUsernames = new Set();
            const processedEmails = new Set();

            // ... (Loop dan Logika Sisanya) ...
            for (let i = 0; i < jsonData.length; i++) {
                const row = jsonData[i];
                const rowNumber = i + 2; 

                try {
                    const data = {
                        nama_lengkap: row.nama_lengkap ? row.nama_lengkap.toString().trim() : '',
                        username: row.username ? row.username.toString().trim() : '',
                        email: row.email ? row.email.toString().trim() : '',
                        divisi: row.divisi ? row.divisi.toString().trim() : '',
                        jabatan: row.jabatan ? row.jabatan.toString().trim() : '',
                        role: 'user',
                        password: defaultPassword
                    };

                    const rowErrors = validateUserFields(data);
                    if (Object.keys(rowErrors).length > 0) {
                        errors.push(`Baris ${rowNumber}: ${Object.values(rowErrors).join(', ')}`);
                        continue;
                    }
                    
                    if (processedUsernames.has(data.username) || await UserModel.findUserByUsername(data.username)) {
                        errors.push(`Baris ${rowNumber}: Username ${data.username} sudah digunakan`);
                        continue;
                    }
                    if (processedEmails.has(data.email) || await UserModel.findUserByEmail(data.email)) {
                        errors.push(`Baris ${rowNumber}: Email ${data.email} sudah digunakan`);
                        continue;
                    }
                    
                    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
                    const insertId = await UserModel.createUser(data, hashedPassword); // Menggunakan UserModel
                    
                    results.push({ id: insertId, ...data, password: undefined });
                    processedUsernames.add(data.username);
                    processedEmails.add(data.email);

                } catch (error) {
                    console.error('Row processing error:', error);
                    errors.push(`Baris ${rowNumber}: Error tidak terduga: ${error.message}`);
                }
            }
            
            
            // 3. Final Response
            res.status(201).json({
                success: true,
                message: `Berhasil import ${results.length} data pengurus dengan password default: ${defaultPassword}`,
                data: {
                    imported: results,
                    errors: errors,
                    total_processed: jsonData.length,
                    total_success: results.length,
                    total_errors: errors.length,
                    default_password: defaultPassword
                }
            });

        } catch (error) {
            console.error('Bulk upload error:', error);
            res.status(500).json({ success: false, message: 'Error processing bulk upload', error: error.message });
        } finally {
            cleanupFile(filePath); // Membersihkan file
        }
    }
}

// EKSPOR INSTANCE CLASS
module.exports = new UserController();