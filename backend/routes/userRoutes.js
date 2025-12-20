// routes/adminRoutes.js (FINAL GABUNGAN)

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');

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

// POST bulk create pengurus from file upload
router.post('/pengurus/bulk', verifyToken, upload.single('file'), bindUser(userController.bulkCreatePengurus));

// -------------------------------------------------------------

// --- B. INVENTARIS MANAGEMENT (DI BAWAH PATH ADMIN/USERS) ---

// GET inventaris untuk Data Master
// Jika frontend memanggil: GET /api/users/inventaris
router.get('/inventaris', verifyToken, bindInventaris(inventarisController.getAllInventaris));

// POST create inventaris
router.post('/inventaris/create', verifyToken, bindInventaris(inventarisController.createInventaris));

// PUT update inventaris
router.put('/inventaris/:id', verifyToken, bindInventaris(inventarisController.updateInventaris));

// DELETE inventaris
// Jika frontend memanggil: DELETE /api/users/inventaris/123
router.delete('/inventaris/:id', verifyToken, bindInventaris(inventarisController.deleteInventaris));

// POST bulk create inventaris from file upload
router.post('/inventaris/bulk', verifyToken, upload.single('file'), bindInventaris(inventarisController.bulkCreateInventaris));


module.exports = router;