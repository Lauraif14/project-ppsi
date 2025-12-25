class InformasiModel {
    constructor(db) {
        this.db = db;
    }

    // Mengambil semua data dengan sorting kategori tertentu
    async getAll(kategori) {
        let sql = 'SELECT * FROM informasi';
        const params = [];

        if (kategori) {
            sql += ' WHERE kategori = ?';
            params.push(kategori);
        }

        // Sorting: SOP -> Panduan -> Informasi Lain
        sql += ' ORDER BY FIELD(kategori, "SOP", "Panduan", "Informasi Lain"), created_at DESC';
        const [rows] = await this.db.query(sql, params);
        return rows;
    }

    // Mengambil informasi aktif untuk dashboard
    async getActiveInfo() {
        const [rows] = await this.db.query(
            'SELECT * FROM informasi WHERE kategori = "Informasi Lain" AND is_active = TRUE LIMIT 1'
        );
        return rows[0] || null;
    }

    // Mengambil semua SOP, Panduan, dan Informasi Lain yang AKTIF saja (Kombinasi)
    async getDashboardInfo() {
        const sql = `
            SELECT * FROM informasi 
            WHERE kategori IN ('SOP', 'Panduan') 
            OR (kategori = 'Informasi Lain' AND is_active = 1)
            ORDER BY FIELD(kategori, "SOP", "Panduan", "Informasi Lain"), created_at DESC
        `;
        const [rows] = await this.db.query(sql);
        return rows;
    }

    async findById(id) {
        const [rows] = await this.db.query('SELECT * FROM informasi WHERE id = ?', [id]);
        return rows[0];
    }

    async create(judul, isi, kategori, file_path, is_active = false) {
        // Jika kategori Informasi Lain dan is_active = true, nonaktifkan yang lain
        if (kategori === 'Informasi Lain' && is_active) {
            await this.db.query('UPDATE informasi SET is_active = FALSE WHERE kategori = "Informasi Lain"');
        }

        const [result] = await this.db.query(
            'INSERT INTO informasi (judul, isi, kategori, file_path, is_active) VALUES (?, ?, ?, ?, ?)',
            [judul, isi || null, kategori || 'Informasi Lain', file_path || null, is_active]
        );
        return result.insertId;
    }

    async update(id, judul, isi, kategori, file_path, is_active) {
        // Jika kategori Informasi Lain dan is_active = true, nonaktifkan yang lain
        if (kategori === 'Informasi Lain' && is_active) {
            await this.db.query('UPDATE informasi SET is_active = FALSE WHERE kategori = "Informasi Lain" AND id != ?', [id]);
        }

        // Jika ada file baru, update kolom file_path
        if (file_path !== undefined) {
            await this.db.query(
                'UPDATE informasi SET judul=?, isi=?, kategori=?, file_path=?, is_active=? WHERE id=?',
                [judul, isi, kategori, file_path, is_active, id]
            );
        } else {
            // Jika tidak ada file baru, file_path lama dipertahankan
            await this.db.query(
                'UPDATE informasi SET judul=?, isi=?, kategori=?, is_active=? WHERE id=?',
                [judul, isi, kategori, is_active, id]
            );
        }
    }

    async delete(id) {
        const [result] = await this.db.query('DELETE FROM informasi WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

// Impor koneksi DB
const db = require('../db');
const informasiModel = new InformasiModel(db);

module.exports = informasiModel;