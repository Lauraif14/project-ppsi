// routes/adminRoutes.js (FINAL GABUNGAN)

const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/auth');
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

// GET all users
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT id, username, email, nama_lengkap, jabatan, divisi FROM users WHERE role = "user"');
    
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

// GET inventaris untuk Data Master (protected route) - UPDATE
router.get('/inventaris', verifyToken, async (req, res) => {
  try {
    console.log('🔍 Getting inventaris data');
    
    const [rows] = await db.execute(`
      SELECT 
        id, 
        nama_barang, 
        kode_barang,
        jumlah,
        status,
        created_at
      FROM inventaris 
      ORDER BY id DESC
    `);
    
    console.log('📊 Found inventaris:', rows.length);
    
    res.json({
      success: true,
      data: rows,
      total: rows.length
    });
  } catch (error) {
    console.error('Error fetching inventaris:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventaris data',
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

// Import Controllers
const userController = require('../controllers/userController'); // User Controller (OOP Class)
const inventarisController = require('../controllers/inventarisController'); // Inventaris Controller (Exports)

// Import Multer
const { upload } = require('../utils/uploadUtils'); 

// Helper untuk binding User Controller (karena ini Class/OOP)
const bindUser = (method) => method.bind(userController);
const bindInventaris = (method) => method.bind(inventarisController); 

// --- A. PENGURUS/USER MANAGEMENT ---

// GET all users (list user role="user")
router.get('/', verifyToken, bindUser(userController.getAllUsers)); 

// GET all users (list user lengkap untuk manajemen)
router.get('/all', verifyToken, bindUser(userController.getAllUsersComplete));

// POST create new user (simple form)
router.post('/', verifyToken, bindUser(userController.createUser));

// POST create new user/account (form lengkap)
router.post('/create-account', verifyToken, bindUser(userController.createAccount));

// PUT update user
router.put('/:id', verifyToken, bindUser(userController.updateUser));

// DELETE user
router.delete('/:id', verifyToken, bindUser(userController.deleteUser));

// POST reset password
router.post('/:id/reset-password', verifyToken, bindUser(userController.resetPassword));

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

    if (!fs.existsSync(filePath)) {
      return res.status(400).json({
        success: false,
        message: 'File tidak ditemukan setelah upload'
      });
    }

    let jsonData = [];
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    
    if (fileExt === '.csv') {
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
        message: 'File kosong atau format tidak sesuai. Format: nama_barang, kode_barang (opsional), jumlah, status (opsional)'
      });
    }

    const results = [];
    const errors = [];
    const validStatuses = ['Tersedia', 'Habis', 'Dipinjam', 'Rusak', 'Hilang'];

    // Process each row
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      try {
        const namaBarang = row.nama_barang ? row.nama_barang.toString().trim() : '';
        const kodeBarang = row.kode_barang && row.kode_barang.toString().trim() ? row.kode_barang.toString().trim() : null; // Boleh kosong
        const jumlah = row.jumlah ? parseInt(row.jumlah) : 0;
        const status = row.status && row.status.toString().trim() ? row.status.toString().trim() : 'Tersedia';

// --- B. INVENTARIS MANAGEMENT (DI BAWAH PATH ADMIN/USERS) ---

        // Validasi status
        if (status && !validStatuses.includes(status)) {
          errors.push(`Baris ${i + 2}: Status tidak valid. Harus: ${validStatuses.join(', ')}`);
          continue;
        }

        // Check if item already exists by name
        const [existingItem] = await db.execute('SELECT id, jumlah FROM inventaris WHERE nama_barang = ?', [namaBarang]);
        
        if (existingItem.length > 0) {
          // Update existing item quantity
          await db.execute(
            'UPDATE inventaris SET jumlah = jumlah + ?, kode_barang = COALESCE(?, kode_barang), status = COALESCE(?, status) WHERE nama_barang = ?',
            [jumlah, kodeBarang, status, namaBarang]
          );
          
          results.push({
            id: existingItem[0].id,
            nama_barang: namaBarang,
            kode_barang: kodeBarang,
            jumlah: jumlah,
            status: status,
            action: 'updated'
          });
        } else {
          // Insert new item
          const [result] = await db.execute(
            'INSERT INTO inventaris (nama_barang, kode_barang, jumlah, status, created_at) VALUES (?, ?, ?, ?, NOW())',
            [namaBarang, kodeBarang, jumlah, status]
          );

          results.push({
            id: result.insertId,
            nama_barang: namaBarang,
            kode_barang: kodeBarang,
            jumlah: jumlah,
            status: status,
            action: 'created'
          });
        }

// DELETE inventaris
// Jika frontend memanggil: DELETE /api/users/inventaris/123
router.delete('/inventaris/:id', verifyToken, bindInventaris(inventarisController.deleteInventaris));

// POST bulk create inventaris from file upload
router.post('/inventaris/bulk', verifyToken, upload.single('file'), bindInventaris(inventarisController.bulkCreateInventaris));


// POST create inventaris - ADD AFTER GET inventaris
router.post('/inventaris/create', verifyToken, async (req, res) => {
  try {
    const { nama_barang, kode_barang, jumlah, status } = req.body;
    
    console.log('📝 Creating inventaris:', { nama_barang, kode_barang, jumlah, status });
    
    if (!nama_barang || !jumlah) {
      return res.status(400).json({
        success: false,
        message: 'Nama barang dan jumlah harus diisi'
      });
    }

    if (parseInt(jumlah) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Jumlah harus lebih dari 0'
      });
    }

    // Validate status
    const validStatuses = ['Tersedia', 'Habis', 'Dipinjam', 'Rusak', 'Hilang'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status tidak valid. Harus salah satu dari: ' + validStatuses.join(', ')
      });
    }

    const [result] = await db.execute(`
      INSERT INTO inventaris (nama_barang, kode_barang, jumlah, status, created_at) 
      VALUES (?, ?, ?, ?, NOW())
    `, [
      nama_barang.trim(), 
      kode_barang && kode_barang.trim() ? kode_barang.trim() : null, // Kode barang boleh kosong
      parseInt(jumlah), 
      status || 'Tersedia'
    ]);
    
    // Get the created data
    const [newRows] = await db.execute(`
      SELECT * FROM inventaris WHERE id = ?
    `, [result.insertId]);
    
    res.json({
      success: true,
      message: 'Inventaris berhasil ditambahkan',
      data: newRows[0]
    });
  } catch (error) {
    console.error('Error creating inventaris:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating inventaris',
      error: error.message
    });
  }
});

// POST create new user/account (untuk form tambah akun)
router.post('/create-account', verifyToken, async (req, res) => {
  try {
    const { nama_lengkap, username, email, password, jabatan, divisi, role = 'user' } = req.body;
    
    console.log('Creating new account:', { nama_lengkap, username, email, jabatan, divisi, role });
    
    // Validation
    const errors = {};
    
    if (!nama_lengkap || nama_lengkap.trim().length < 2) {
      errors.nama_lengkap = 'Nama lengkap minimal 2 karakter';
    }
    
    if (!username || username.trim().length < 3) {
      errors.username = 'Username minimal 3 karakter';
    }
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Format email tidak valid';
    }
    
    if (!password || password.length < 6) {
      errors.password = 'Password minimal 6 karakter';
    }
    
    if (!jabatan || jabatan.trim().length === 0) {
      errors.jabatan = 'Jabatan harus diisi';
    }
    
    if (!divisi || divisi.trim().length === 0) {
      errors.divisi = 'Divisi harus diisi';
    }
    
    if (!['user', 'admin'].includes(role)) {
      errors.role = 'Role harus user atau admin';
    }
    
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }

    // Check if username already exists
    const [existingUsername] = await db.execute(
      'SELECT id FROM users WHERE username = ?',
      [username.trim()]
    );

    if (existingUsername.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username sudah digunakan',
        errors: { username: 'Username sudah digunakan' }
      });
    }

    // Check if email already exists
    const [existingEmail] = await db.execute(
      'SELECT id FROM users WHERE email = ?',
      [email.trim()]
    );

    if (existingEmail.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar',
        errors: { email: 'Email sudah digunakan' }
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user dengan semua field yang diperlukan
    const [result] = await db.execute(
      'INSERT INTO users (nama_lengkap, username, email, password, jabatan, divisi, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        nama_lengkap.trim(), 
        username.trim(), 
        email.trim(), 
        hashedPassword, 
        jabatan.trim(), 
        divisi.trim(),
        role
      ]
    );

    // Return success with user data (without password)
    res.status(201).json({
      success: true,
      message: 'Akun berhasil dibuat',
      user: {
        id: result.insertId,
        nama_lengkap: nama_lengkap.trim(),
        username: username.trim(),
        email: email.trim(),
        jabatan: jabatan.trim(),
        divisi: divisi.trim(),
        role: role
      }
    });

  } catch (error) {
    console.error('Create account error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating account',
      error: error.message
    });
  }
});

// GET all users with complete info for user management
router.get('/all', verifyToken, async (req, res) => {
  try {
    // PERBAIKI: Hapus kolom yang tidak ada di database
    const [rows] = await db.execute(`
      SELECT 
        id, 
        nama_lengkap, 
        username, 
        email, 
        jabatan, 
        role, 
        divisi
      FROM users 
      ORDER BY id DESC
    `);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// PUT update user - PERBAIKI juga bagian ini
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_lengkap, email, jabatan, role, divisi } = req.body;
    
    // Validation
    const errors = {};
    
    if (!nama_lengkap || nama_lengkap.trim().length < 2) {
      errors.nama_lengkap = 'Nama lengkap minimal 2 karakter';
    }
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Format email tidak valid';
    }
    
    if (!jabatan || jabatan.trim().length === 0) {
      errors.jabatan = 'Jabatan harus diisi';
    }
    
    if (!['user', 'admin'].includes(role)) {
      errors.role = 'Role harus user atau admin';
    }
    
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }

    // Check if user exists
    const [existingUser] = await db.execute('SELECT id FROM users WHERE id = ?', [id]);
    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    // Check if email is used by another user
    const [emailCheck] = await db.execute(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email.trim(), id]
    );

    if (emailCheck.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah digunakan oleh user lain',
        errors: { email: 'Email sudah digunakan' }
      });
    }

    // PERBAIKI: Update tanpa updated_at
    await db.execute(
      'UPDATE users SET nama_lengkap = ?, email = ?, jabatan = ?, role = ?, divisi = ? WHERE id = ?',
      [nama_lengkap.trim(), email.trim(), jabatan.trim(), role, divisi || jabatan.trim(), id]
    );

    // Get updated user data - PERBAIKI: tanpa updated_at
    const [updatedUser] = await db.execute(
      'SELECT id, nama_lengkap, username, email, jabatan, role, divisi FROM users WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'User berhasil diupdate',
      user: updatedUser[0]
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
});

// DELETE user
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const [existingUser] = await db.execute(
      'SELECT id, nama_lengkap, role FROM users WHERE id = ?', 
      [id]
    );
    
    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    const user = existingUser[0];

    // Prevent deleting the last admin
    if (user.role === 'admin') {
      const [adminCount] = await db.execute('SELECT COUNT(*) as count FROM users WHERE role = "admin"');
      if (adminCount[0].count <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Tidak dapat menghapus admin terakhir'
        });
      }
    }

    // Delete user (foreign key constraints will handle related data)
    const [result] = await db.execute('DELETE FROM users WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan atau sudah dihapus'
      });
    }

    res.json({
      success: true,
      message: `User ${user.nama_lengkap} berhasil dihapus`,
      deleted_user: {
        id: user.id,
        nama_lengkap: user.nama_lengkap
      }
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
});

// POST reset password
router.post('/:id/reset-password', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { new_password } = req.body;
    
    if (!new_password || new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password baru minimal 6 karakter'
      });
    }

    // Check if user exists
    const [existingUser] = await db.execute(
      'SELECT id, nama_lengkap FROM users WHERE id = ?', 
      [id]
    );
    
    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // PERBAIKI: Update tanpa updated_at
    await db.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );

    res.json({
      success: true,
      message: `Password untuk ${existingUser[0].nama_lengkap} berhasil direset`,
      user: {
        id: existingUser[0].id,
        nama_lengkap: existingUser[0].nama_lengkap
      }
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: error.message
    });
  }
});

// DELETE inventaris - TAMBAHKAN DI AKHIR FILE
router.delete('/inventaris/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🗑️ Deleting inventaris with ID:', id);
    
    // Validate ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID inventaris tidak valid'
      });
    }
    
    // Check if item exists
    const [existingItem] = await db.execute('SELECT * FROM inventaris WHERE id = ?', [id]);
    if (existingItem.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item inventaris tidak ditemukan'
      });
    }
    
    // Delete the item
    const [result] = await db.execute('DELETE FROM inventaris WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(500).json({
        success: false,
        message: 'Gagal menghapus inventaris'
      });
    }
    
    console.log('✅ Inventaris deleted successfully:', existingItem[0].nama_barang);
    
    res.json({
      success: true,
      message: 'Inventaris berhasil dihapus',
      data: existingItem[0]
    });
  } catch (error) {
    console.error('Error deleting inventaris:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting inventaris',
      error: error.message
    });
  }
});

module.exports = router;