// backend/controllers/informasiController.js
const path = require('path');
const fs = require('fs');
const db = require('../db');

// Helper path
function getAbsolutePathFromFilePath(filePath) {
  if (!filePath) return null;
  const normalized = filePath.replace(/\\/g, '/').replace(/^\/+/, '');
  return path.join(__dirname, '..', 'public', normalized);
}

class InformasiController {
  constructor(db) {
    this.db = db;
  }

  getAllInformasi = async (req, res) => {
    try {
      const { kategori } = req.query;
      let sql = 'SELECT * FROM informasi';
      const params = [];

      if (kategori) {
        sql += ' WHERE kategori = ?';
        params.push(kategori);
      }

      sql += ' ORDER BY FIELD(kategori, "SOP","Panduan","Informasi Lain"), created_at DESC';
      const [rows] = await this.db.query(sql, params);
      return res.json({ data: rows });
    } catch (err) {
      console.error('Error getAllInformasi:', err);
      return res.status(500).json({ message: 'Gagal mengambil informasi.' });
    }
  };

  createInformasi = async (req, res) => {
    try {
      const { judul, isi, kategori } = req.body;
      const file_path =
        req.file && req.file.filename
          ? path.join('uploads', 'informasi', req.file.filename).replace(/\\/g, '/')
          : null;

      const [result] = await this.db.query(
        'INSERT INTO informasi (judul, isi, kategori, file_path) VALUES (?, ?, ?, ?)',
        [judul, isi || null, kategori || 'Informasi Lain', file_path]
      );

      const [newRow] = await this.db.query('SELECT * FROM informasi WHERE id = ?', [
        result.insertId,
      ]);

      return res.json({ message: 'Informasi dibuat.', data: newRow[0] });
    } catch (err) {
      console.error('Error createInformasi:', err);
      return res.status(500).json({ message: 'Gagal membuat informasi.' });
    }
  };

  updateInformasi = async (req, res) => {
    try {
      const { id } = req.params;
      const { judul, isi, kategori } = req.body;

      const [existingRows] = await this.db.query('SELECT * FROM informasi WHERE id = ?', [id]);
      if (!existingRows || existingRows.length === 0) {
        return res.status(404).json({ message: 'Informasi tidak ditemukan.' });
      }
      const existing = existingRows[0];

      if (req.file && req.file.filename) {
        const newFilePath = path
          .join('uploads', 'informasi', req.file.filename)
          .replace(/\\/g, '/');

        // Hapus file lama (TANPA pengecekan NODE_ENV)
        if (existing.file_path) {
          try {
            const absOldPath = getAbsolutePathFromFilePath(existing.file_path);
            if (absOldPath && fs.existsSync(absOldPath)) {
              fs.unlinkSync(absOldPath);
              console.log('Deleted old file:', absOldPath);
            } else {
              console.warn('Old file tidak ditemukan (tidak dihapus):', absOldPath);
            }
          } catch (unlinkErr) {
            console.error('Gagal menghapus file lama:', unlinkErr);
          }
        }

        await this.db.query(
          'UPDATE informasi SET judul=?, isi=?, kategori=?, file_path=? WHERE id=?',
          [judul, isi, kategori, newFilePath, id]
        );
      } else {
        await this.db.query(
          'UPDATE informasi SET judul=?, isi=?, kategori=? WHERE id=?',
          [judul, isi, kategori, id]
        );
      }

      const [row] = await this.db.query('SELECT * FROM informasi WHERE id = ?', [id]);
      return res.json({ message: 'Informasi diupdate.', data: row[0] });
    } catch (err) {
      console.error('Error updateInformasi:', err);
      return res.status(500).json({ message: 'Gagal mengupdate informasi.' });
    }
  };

  deleteInformasi = async (req, res) => {
    try {
      const { id } = req.params;
      const [rows] = await this.db.query('SELECT * FROM informasi WHERE id = ?', [id]);
      if (!rows || rows.length === 0) {
        return res.status(404).json({ message: 'Informasi tidak ditemukan.' });
      }
      const row = rows[0];

      if (row.file_path) {
        try {
          const absPath = getAbsolutePathFromFilePath(row.file_path);
          if (absPath && fs.existsSync(absPath)) {
            fs.unlinkSync(absPath);
            console.log('Deleted file for deleted informasi:', absPath);
          } else {
            console.warn('File to delete tidak ditemukan:', absPath);
          }
        } catch (unlinkErr) {
          console.error('Gagal menghapus file sebelum delete DB:', unlinkErr);
        }
      }

      await this.db.query('DELETE FROM informasi WHERE id = ?', [id]);
      return res.json({ message: 'Informasi berhasil dihapus.' });
    } catch (err) {
      console.error('Error deleteInformasi:', err);
      return res.status(500).json({ message: 'Gagal menghapus informasi.' });
    }
  };
}

// instance untuk dipakai di route
const informasiController = new InformasiController(db);

module.exports = {
  InformasiController, // class (untuk test)
  informasiController, // instance (untuk route)
};