// backend/models/informasiModel.js

class InformasiModel {
    constructor(db) {
        this.db = db;
    }

    async getAll(kategori) {
        let sql = 'SELECT * FROM informasi';
        const params = [];

        if (kategori) {
            sql += ' WHERE kategori = ?';
            params.push(kategori);
        }

        sql += ' ORDER BY FIELD(kategori, "SOP","Panduan","Informasi Lain"), created_at DESC';
        const [rows] = await this.db.query(sql, params);
        return rows;
    }

    async findById(id) {
        const [rows] = await this.db.query('SELECT * FROM informasi WHERE id = ?', [id]);
        return rows[0];
    }

    async create(judul, isi, kategori, file_path) {
        const [result] = await this.db.query(
            'INSERT INTO informasi (judul, isi, kategori, file_path) VALUES (?, ?, ?, ?)',
            [judul, isi || null, kategori || 'Informasi Lain', file_path]
        );
        return result.insertId;
    }

    async update(id, judul, isi, kategori, file_path) {
        if (file_path) {
            await this.db.query(
                'UPDATE informasi SET judul=?, isi=?, kategori=?, file_path=? WHERE id=?',
                [judul, isi, kategori, file_path, id]
            );
        } else {
            await this.db.query(
                'UPDATE informasi SET judul=?, isi=?, kategori=? WHERE id=?',
                [judul, isi, kategori, id]
            );
        }
    }

    async delete(id) {
        const [result] = await this.db.query('DELETE FROM informasi WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

// EKSPOR INSTANCE MODEL (DIJALANKAN DENGAN DB DARI INDEX/APP START)
const db = require('../db');
const informasiModel = new InformasiModel(db);

module.exports = informasiModel;