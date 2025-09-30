const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

// Pastikan folder uploads ada dengan path absolute
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
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

// GET all users untuk mengisi tabel Daftar Akun (protected route)
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT id, username, nama_lengkap, divisi FROM users WHERE role = "user"');
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// GET pengurus untuk Data Master (protected route)
router.get('/pengurus', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT id, nama_lengkap, jabatan FROM users WHERE jabatan IS NOT NULL AND jabatan != ""');
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pengurus',
      error: error.message
    });
  }
});

// GET inventaris untuk Data Master (protected route)
router.get('/inventaris', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT id, nama_barang, jumlah FROM inventaris');
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching inventaris',
      error: error.message
    });
  }
});

// POST create new user
router.post('/', verifyToken, async (req, res) => {
  try {
    const { nama_lengkap, username, divisi, password } = req.body;

    // Validasi input
    if (!nama_lengkap || !username || !divisi || !password) {
      return res.status(400).json({
        success: false,
        message: 'Semua field wajib diisi (nama_lengkap, username, divisi, password)'
      });
    }

    // Check if username already exists
    const [existingUser] = await db.execute('SELECT id FROM users WHERE username = ?', [username]);
    
    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username sudah digunakan'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Insert new user
    const [result] = await db.execute(
      'INSERT INTO users (nama_lengkap, username, divisi, password) VALUES (?, ?, ?, ?)',
      [nama_lengkap, username, divisi, hashedPassword]
    );
    
    res.status(201).json({
      success: true,
      message: 'User berhasil dibuat',
      data: {
        id: result.insertId,
        nama_lengkap,
        username,
        divisi
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
});

// POST bulk create pengurus from file upload
router.post('/pengurus/bulk', verifyToken, upload.single('file'), async (req, res) => {
  let filePath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File tidak ditemukan'
      });
    }

    filePath = req.file.path;
    console.log('File uploaded to:', filePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(400).json({
        success: false,
        message: 'File tidak ditemukan setelah upload'
      });
    }

    let jsonData = [];
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    
    if (fileExt === '.csv') {
      // Improved CSV parsing
      try {
        const csvData = fs.readFileSync(filePath, 'utf-8');
        const lines = csvData.split('\n').filter(line => line.trim() !== '');
        
        if (lines.length < 2) {
          return res.status(400).json({
            success: false,
            message: 'File CSV harus memiliki header dan minimal 1 baris data'
          });
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        console.log('CSV Headers:', headers);
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          const row = {};
          
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          
          // Skip empty rows
          if (row.nama_lengkap || row.username || row.email) {
            jsonData.push(row);
          }
        }
      } catch (csvError) {
        console.error('CSV parsing error:', csvError);
        return res.status(400).json({
          success: false,
          message: 'Error parsing CSV file: ' + csvError.message
        });
      }
    } else {
      // Handle Excel files
      try {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        jsonData = xlsx.utils.sheet_to_json(worksheet);
      } catch (xlsxError) {
        console.error('XLSX parsing error:', xlsxError);
        return res.status(400).json({
          success: false,
          message: 'Error parsing Excel file: ' + xlsxError.message
        });
      }
    }

    console.log('Parsed data:', jsonData);

    if (jsonData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'File kosong atau format tidak sesuai. Pastikan file memiliki kolom nama_lengkap, username, email, divisi, jabatan'
      });
    }

    const results = [];
    const errors = [];
    const defaultPassword = '123456'; // Password default

    // Process each row
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      try {
        // Clean and validate data
        const namaLengkap = row.nama_lengkap ? row.nama_lengkap.toString().trim() : '';
        const username = row.username ? row.username.toString().trim() : '';
        const email = row.email ? row.email.toString().trim() : '';
        const divisi = row.divisi ? row.divisi.toString().trim() : '';
        const jabatan = row.jabatan ? row.jabatan.toString().trim() : '';

        // Validasi required fields
        if (!namaLengkap || !username || !email || !divisi || !jabatan) {
          errors.push(`Baris ${i + 2}: Semua field harus diisi (nama_lengkap, username, email, divisi, jabatan)`);
          continue;
        }

        // Validasi format email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          errors.push(`Baris ${i + 2}: Format email tidak valid (${email})`);
          continue;
        }

        // Check if username already exists
        const [existingUsername] = await db.execute('SELECT id FROM users WHERE username = ?', [username]);
        if (existingUsername.length > 0) {
          errors.push(`Baris ${i + 2}: Username ${username} sudah digunakan`);
          continue;
        }

        // Check if email already exists
        const [existingEmail] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existingEmail.length > 0) {
          errors.push(`Baris ${i + 2}: Email ${email} sudah digunakan`);
          continue;
        }

        // Hash password default
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        // Insert new user
        const [result] = await db.execute(
          'INSERT INTO users (nama_lengkap, username, email, divisi, jabatan, password) VALUES (?, ?, ?, ?, ?, ?)',
          [namaLengkap, username, email, divisi, jabatan, hashedPassword]
        );

        results.push({
          id: result.insertId,
          nama_lengkap: namaLengkap,
          username: username,
          email: email,
          divisi: divisi,
          jabatan: jabatan
        });

      } catch (error) {
        console.error('Row processing error:', error);
        errors.push(`Baris ${i + 2}: ${error.message}`);
      }
    }

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
    res.status(500).json({
      success: false,
      message: 'Error processing bulk upload',
      error: error.message
    });
  } finally {
    // Clean up uploaded file
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log('File cleaned up:', filePath);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }
  }
});

// POST bulk create inventaris
router.post('/inventaris/bulk', verifyToken, upload.single('file'), async (req, res) => {
  let filePath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File tidak ditemukan'
      });
    }

    filePath = req.file.path;
    console.log('File uploaded to:', filePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(400).json({
        success: false,
        message: 'File tidak ditemukan setelah upload'
      });
    }

    let jsonData = [];
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    
    if (fileExt === '.csv') {
      // Improved CSV parsing
      try {
        const csvData = fs.readFileSync(filePath, 'utf-8');
        const lines = csvData.split('\n').filter(line => line.trim() !== '');
        
        if (lines.length < 2) {
          return res.status(400).json({
            success: false,
            message: 'File CSV harus memiliki header dan minimal 1 baris data'
          });
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        console.log('CSV Headers:', headers);
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          const row = {};
          
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          
          // Skip empty rows
          if (row.nama_barang || row.jumlah) {
            jsonData.push(row);
          }
        }
      } catch (csvError) {
        console.error('CSV parsing error:', csvError);
        return res.status(400).json({
          success: false,
          message: 'Error parsing CSV file: ' + csvError.message
        });
      }
    } else {
      // Handle Excel files
      try {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        jsonData = xlsx.utils.sheet_to_json(worksheet);
      } catch (xlsxError) {
        console.error('XLSX parsing error:', xlsxError);
        return res.status(400).json({
          success: false,
          message: 'Error parsing Excel file: ' + xlsxError.message
        });
      }
    }

    console.log('Parsed data:', jsonData);

    if (jsonData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'File kosong atau format tidak sesuai. Pastikan file memiliki kolom nama_barang dan jumlah'
      });
    }

    const results = [];
    const errors = [];

    // Process each row
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      try {
        // Clean and validate data
        const namaBarang = row.nama_barang ? row.nama_barang.toString().trim() : '';
        const jumlah = row.jumlah ? parseInt(row.jumlah) : 0;

        // Validasi required fields
        if (!namaBarang || !jumlah || jumlah <= 0) {
          errors.push(`Baris ${i + 2}: nama_barang dan jumlah (harus > 0) harus diisi`);
          continue;
        }

        // Check if item already exists
        const [existingItem] = await db.execute('SELECT id FROM inventaris WHERE nama_barang = ?', [namaBarang]);
        
        if (existingItem.length > 0) {
          // Update existing item quantity
          await db.execute(
            'UPDATE inventaris SET jumlah = jumlah + ? WHERE nama_barang = ?',
            [jumlah, namaBarang]
          );
          
          results.push({
            id: existingItem[0].id,
            nama_barang: namaBarang,
            jumlah: jumlah,
            action: 'updated'
          });
        } else {
          // Insert new item
          const [result] = await db.execute(
            'INSERT INTO inventaris (nama_barang, jumlah) VALUES (?, ?)',
            [namaBarang, jumlah]
          );

          results.push({
            id: result.insertId,
            nama_barang: namaBarang,
            jumlah: jumlah,
            action: 'created'
          });
        }

      } catch (error) {
        console.error('Row processing error:', error);
        errors.push(`Baris ${i + 2}: ${error.message}`);
      }
    }

    res.status(201).json({
      success: true,
      message: `Berhasil import ${results.length} data inventaris`,
      data: {
        imported: results,
        errors: errors,
        total_processed: jsonData.length,
        total_success: results.length,
        total_errors: errors.length
      }
    });

  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing bulk upload',
      error: error.message
    });
  } finally {
    // Clean up uploaded file
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log('File cleaned up:', filePath);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }
  }
});

module.exports = router;