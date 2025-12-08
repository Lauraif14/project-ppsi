// backend/controllers/informasiController.js (DIKOREKSI UNTUK MEMANGGIL MODEL)

const path = require('path');
const fs = require('fs');
// Impor Model yang sudah di-inject dengan DB
const InformasiModel = require('../models/informasiModel'); const { upload } = require('../utils/uploadUtils');

// Helper path (Tetap di Controller karena ini logika bisnis terkait request/disk)
function getAbsolutePathFromFilePath(filePath) {
  if (!filePath) return null;
  const normalized = filePath.replace(/\\/g, '/').replace(/^\/+/, '');
  // Asumsi root proyek adalah folder 'backend' (sesuaikan jika berbeda)
  return path.join(__dirname, '..', 'public', normalized); 
}

class InformasiController {

  getAllInformasi = async (req, res) => {
    try {
      const { kategori } = req.query;
      
      // Panggil Model
      const rows = await InformasiModel.getAll(kategori); 
      
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
          ? path.join('public','uploads', 'informasi', req.file.filename).replace(/\\/g, '/')
          : null;

      // Panggil Model untuk CREATE
      const insertId = await InformasiModel.create(judul, isi, kategori, file_path);

      // Ambil data baru dari Model
      const newRow = await InformasiModel.findById(insertId);

      return res.json({ message: 'Informasi dibuat.', data: newRow });
    } catch (err) {
      console.error('Error createInformasi:', err);
      return res.status(500).json({ message: 'Gagal membuat informasi.' });
    }
  };

  updateInformasi = async (req, res) => {
    try {
      const { id } = req.params;
      const { judul, isi, kategori } = req.body;

      // 1. Cek keberadaan dan ambil file_path lama
      const existing = await InformasiModel.findById(id);
      if (!existing) {
        return res.status(404).json({ message: 'Informasi tidak ditemukan.' });
      }

      let newFilePath = existing.file_path;

      // 2. Handle File Update dan Deletion
      if (req.file && req.file.filename) {
        newFilePath = path.join('public','uploads', 'informasi', req.file.filename).replace(/\\/g, '/');

        // Hapus file lama jika ada
        if (existing.file_path) {
          try {
            const absOldPath = getAbsolutePathFromFilePath(existing.file_path);
            if (absOldPath && fs.existsSync(absOldPath)) {
              fs.unlinkSync(absOldPath);
            } else {
              console.warn('Old file tidak ditemukan (tidak dihapus):', absOldPath);
            }
          } catch (unlinkErr) {
            console.error('Gagal menghapus file lama:', unlinkErr);
          }
        }
      } 
      
      // 3. Panggil Model untuk UPDATE
      await InformasiModel.update(id, judul, isi, kategori, newFilePath);

      // Ambil data terbaru
      const updatedRow = await InformasiModel.findById(id); 

      return res.json({ message: 'Informasi diupdate.', data: updatedRow });
    } catch (err) {
      console.error('Error updateInformasi:', err);
      return res.status(500).json({ message: 'Gagal mengupdate informasi.' });
    }
  };

  deleteInformasi = async (req, res) => {
    try {
      const { id } = req.params;

      // 1. Cek keberadaan dan ambil file_path
      const existing = await InformasiModel.findById(id);
      if (!existing) {
        return res.status(404).json({ message: 'Informasi tidak ditemukan.' });
      }

      // 2. Handle File Deletion
      if (existing.file_path) {
        try {
          const absPath = getAbsolutePathFromFilePath(existing.file_path);
          if (absPath && fs.existsSync(absPath)) {
            fs.unlinkSync(absPath);
          } else {
            console.warn('File to delete tidak ditemukan:', absPath);
          }
        } catch (unlinkErr) {
          console.error('Gagal menghapus file sebelum delete DB:', unlinkErr);
        }
      }

      // 3. Panggil Model untuk DELETE
      await InformasiModel.delete(id); 
      
      return res.json({ message: 'Informasi berhasil dihapus.' });
    } catch (err) {
      console.error('Error deleteInformasi:', err);
      return res.status(500).json({ message: 'Gagal menghapus informasi.' });
    }
  };
}

// EKSPOR INSTANCE CLASS
const informasiController = new InformasiController(); 
module.exports = informasiController;