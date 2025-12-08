// backend/routes/informasiRoutes.js

const express = require('express');
const router = express.Router();
const informasiController = require('../controllers/informasiController'); // Import instance
const { verifyToken } = require('../middleware/auth'); 
const { upload } = require('../utils/uploadUtils');

// Middleware helper untuk binding
const bind = (method) => method.bind(informasiController);

// Routes
router.get('/', verifyToken, bind(informasiController.getAllInformasi));
router.post('/', verifyToken, upload.single('file'), bind(informasiController.createInformasi));
router.put('/:id', verifyToken, upload.single('file'), bind(informasiController.updateInformasi));
router.delete('/:id', verifyToken, bind(informasiController.deleteInformasi));

module.exports = router;