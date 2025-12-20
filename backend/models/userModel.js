// models/userModel.js (VERSI BERSIH, HAPUS DUPLIKASI)

const db = require('../db');

const UserModel = {
    // ----------------------------------------------------------------------
    // --- AUTENTIKASI & PENCARIAN ---
    // ----------------------------------------------------------------------

    findUserByIdentifier: async (identifier) => {
        const [rows] = await db.query(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [identifier, identifier]
        );
        return rows[0] || null;
    },

    findUserByResetToken: async (token, expiry) => {
        const [rows] = await db.query(
            'SELECT * FROM users WHERE resetToken = ? AND resetTokenExpiry > ?',
            [token, expiry]
        );
        return rows[0] || null;
    },

    findUserByEmail: async (email) => {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0] || null;
    },

    findUserByUsername: async (username) => {
        const [rows] = await db.execute('SELECT id FROM users WHERE username = ?', [username]);
        return rows[0] || null;
    },

    // ----------------------------------------------------------------------
    // --- DATA MASTER & LAPORAN ---
    // ----------------------------------------------------------------------

    getAllUsers: async () => {
        const [rows] = await db.execute('SELECT id, username, email, nama_lengkap, jabatan, divisi FROM users WHERE role = "user"');
        return rows;
    },

    getAllUsersComplete: async () => {
        const [rows] = await db.execute(`
            SELECT id, nama_lengkap, username, email, jabatan, role, divisi
            FROM users 
            ORDER BY id DESC
        `);
        return rows;
    },

    findUserById: async (userId) => {
        const [rows] = await db.execute('SELECT id, nama_lengkap, username, email, jabatan, role, divisi FROM users WHERE id = ?', [userId]);
        return rows[0] || null;
    },

    countAdmins: async () => {
        const [rows] = await db.execute('SELECT COUNT(*) as count FROM users WHERE role = "admin"');
        return rows[0].count;
    },

    // ----------------------------------------------------------------------
    // --- WRITE/UPDATE ---
    // ----------------------------------------------------------------------

    createUser: async (data, hashedPassword) => {
        const [result] = await db.execute(
            'INSERT INTO users (nama_lengkap, username, email, password, jabatan, divisi, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [data.nama_lengkap, data.username, data.email || null, hashedPassword, data.jabatan || null, data.divisi, data.role || 'user']
        );
        return result.insertId;
    },

    updateUser: async (id, data) => {
        // Build dynamic query - hanya update field yang ada
        const fields = [];
        const values = [];

        if (data.nama_lengkap !== undefined) {
            fields.push('nama_lengkap = ?');
            values.push(data.nama_lengkap);
        }
        if (data.username !== undefined) {
            fields.push('username = ?');
            values.push(data.username);
        }
        if (data.email !== undefined) {
            fields.push('email = ?');
            values.push(data.email);
        }
        if (data.jabatan !== undefined) {
            fields.push('jabatan = ?');
            values.push(data.jabatan || null);
        }
        if (data.divisi !== undefined) {
            fields.push('divisi = ?');
            values.push(data.divisi || null);
        }
        if (data.role !== undefined) {
            fields.push('role = ?');
            values.push(data.role);
        }

        if (fields.length === 0) {
            return; // Tidak ada yang diupdate
        }

        values.push(id); // Tambahkan id untuk WHERE clause

        const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
        await db.execute(query, values);
    },

    updateProfile: async (namaLengkap, email, userId) => {
        await db.query('UPDATE users SET nama_lengkap = ?, email = ? WHERE id = ?', [namaLengkap, email, userId]);
    },

    updatePassword: async (id, hashedPassword) => {
        await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
    },

    updatePasswordAndClearToken: async (hashedPassword, userId) => {
        await db.query(
            'UPDATE users SET password = ?, resetToken = NULL, resetTokenExpiry = NULL WHERE id = ?',
            [hashedPassword, userId]
        );
    },

    updateResetToken: async (resetToken, resetTokenExpiry, userId) => {
        await db.query('UPDATE users SET resetToken = ?, resetTokenExpiry = ? WHERE id = ?', [resetToken, resetTokenExpiry, userId]);
    },

    deleteUser: async (id) => {
        const [result] = await db.execute('DELETE FROM users WHERE id = ?', [id]);
        return result.affectedRows;
    },

    findUserByNamaLengkap: async (namaLengkap) => {
        const [rows] = await db.query('SELECT id, nama_lengkap FROM users WHERE nama_lengkap = ?', [namaLengkap]);
        return rows[0] || null;
    },

    // Digunakan oleh generateJadwalPiket
    getAllPengurus: async () => {
        // Filter user dengan role yang relevan untuk piket (asumsi admin/user)
        const [rows] = await db.execute('SELECT id, nama_lengkap FROM users WHERE role IN ("admin", "user") ORDER BY nama_lengkap');
        return rows;
    }
};

module.exports = UserModel;