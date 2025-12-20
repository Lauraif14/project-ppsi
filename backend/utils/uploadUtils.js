// utils/uploadUtils.js

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');

// Pastikan folder uploads ada dengan path absolute (dari root proyek)
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Pastikan folder untuk informasi ada
const informasiDir = path.join(process.cwd(), 'public', 'uploads', 'informasi');
if (!fs.existsSync(informasiDir)) {
    fs.mkdirSync(informasiDir, { recursive: true });
}

// Konfigurasi Multer untuk bulk upload (Excel/CSV)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `bulk-${Date.now()}${path.extname(file.originalname)}`);
    }
});

exports.upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.xlsx', '.xls', '.csv'];
        const fileExt = path.extname(file.originalname).toLowerCase();

        if (allowedTypes.includes(fileExt)) {
            cb(null, true);
        } else {
            cb(new Error('File type tidak didukung. Gunakan .xlsx, .xls, atau .csv'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Konfigurasi Multer untuk upload file informasi (PDF, DOC, DOCX, dll)
const informasiStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, informasiDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `informasi-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

exports.uploadInformasi = multer({
    storage: informasiStorage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png'];
        const fileExt = path.extname(file.originalname).toLowerCase();

        if (allowedTypes.includes(fileExt)) {
            cb(null, true);
        } else {
            cb(new Error('File type tidak didukung. Gunakan PDF, DOC, DOCX, TXT, atau gambar'), false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});


/**
 * Membaca dan mem-parse data dari file Excel/CSV yang diupload.
 */
exports.parseUploadedFile = (filePath, originalFileName) => {
    const fileExt = path.extname(originalFileName).toLowerCase();

    if (fileExt === '.csv') {
        // Logika Improved CSV parsing
        const csvData = fs.readFileSync(filePath, 'utf-8');
        const lines = csvData.split('\n').filter(line => line.trim() !== '');

        if (lines.length < 2) {
            throw new Error('File CSV harus memiliki header dan minimal 1 baris data.');
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const jsonData = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
            const row = {};

            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });

            // Skip empty rows
            if (Object.values(row).some(val => val !== '')) {
                jsonData.push(row);
            }
        }
        return jsonData;

    } else {
        // Handle Excel files (.xlsx, .xls)
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        return xlsx.utils.sheet_to_json(worksheet);
    }
};

/**
 * Membersihkan file yang diupload.
 */
exports.cleanupFile = (filePath) => {
    if (filePath && fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
        } catch (err) {
            console.error('Error deleting file:', err);
        }
    }
};