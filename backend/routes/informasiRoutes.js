// backend/routes/informasiRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const { informasiController } = require('../controllers/informasiController');
 // <<--- penting

const router = express.Router();

// ensure directory exists (safe)
const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'informasi');
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (e) {
  console.warn('Warn ensure upload dir:', e && e.message ? e.message : e);
}

// use memory storage in test to avoid disk writes
const storage = process.env.NODE_ENV === 'test'
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => cb(null, uploadDir),
      filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const safeName = file.originalname.replace(/\s+/g, '_');
        cb(null, `${unique}-${safeName}`);
      }
    });

const upload = multer({ storage });

// Routes
router.get('/', verifyToken, informasiController.getAllInformasi);
router.post('/', verifyAdmin, upload.single('file'), informasiController.createInformasi);
router.put('/:id', verifyAdmin, upload.single('file'), informasiController.updateInformasi);
router.delete('/:id', verifyAdmin, informasiController.deleteInformasi);

module.exports = router;
