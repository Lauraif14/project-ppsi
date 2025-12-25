const path = require('path');
const fs = require('fs');
const InformasiModel = require('../models/informasiModel');

class InformasiController {
  // Ambil Semua Data
  getAllInformasi = async (req, res) => {
    try {
      const { kategori } = req.query;
      const rows = await InformasiModel.getAll(kategori);
      return res.json({ data: rows });
    } catch (err) {
      return res.status(500).json({ message: 'Gagal mengambil data.' });
    }
  };

  // Ambil Informasi Aktif untuk Dashboard
  getActiveInformasi = async (req, res) => {
    try {
      const activeInfo = await InformasiModel.getActiveInfo();
      return res.json({ data: activeInfo });
    } catch (err) {
      return res.status(500).json({ message: 'Gagal mengambil informasi aktif.' });
    }
  };



  // Buat Data Baru (Handle File & Teks)
  createInformasi = async (req, res) => {
    try {
      const { judul, isi, kategori, is_active } = req.body;
      const file_path = req.file
        ? `uploads/informasi/${req.file.filename}`.replace(/\\/g, '/')
        : null;

      const isActive = is_active === 'true' || is_active === true;
      const insertId = await InformasiModel.create(judul, isi, kategori, file_path, isActive);
      const newRow = await InformasiModel.findById(insertId);
      return res.status(201).json({ message: 'Informasi dibuat.', data: newRow });
    } catch (err) {
      console.error('Error creating informasi:', err);
      return res.status(500).json({ message: 'Gagal membuat informasi.', error: err.message });
    }
  };

  // Update Data (Hapus file lama jika ada file baru)
  updateInformasi = async (req, res) => {
    try {
      const { id } = req.params;
      const { judul, isi, kategori, is_active } = req.body;
      const existing = await InformasiModel.findById(id);

      if (!existing) return res.status(404).json({ message: 'Data tidak ditemukan.' });

      let newFilePath = existing.file_path;
      if (req.file) {
        newFilePath = `uploads/informasi/${req.file.filename}`.replace(/\\/g, '/');
        if (existing.file_path) {
          const oldPath = path.join(__dirname, '..', 'public', existing.file_path);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
      }

      const isActive = is_active === 'true' || is_active === true;
      await InformasiModel.update(id, judul, isi, kategori, newFilePath, isActive);
      return res.json({ message: 'Informasi diperbarui.' });
    } catch (err) {
      return res.status(500).json({ message: 'Gagal update data.' });
    }
  };

  // Hapus Data & File Fisik
  deleteInformasi = async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await InformasiModel.findById(id);
      if (existing && existing.file_path) {
        const absPath = path.join(__dirname, '..', 'public', existing.file_path);
        if (fs.existsSync(absPath)) fs.unlinkSync(absPath);
      }
      await InformasiModel.delete(id);
      return res.json({ message: 'Data dihapus.' });
    } catch (err) {
      return res.status(500).json({ message: 'Gagal menghapus.' });
    }
  };
}

module.exports = new InformasiController();