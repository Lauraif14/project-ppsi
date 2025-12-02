// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const absensiRoutes = require('./routes/absensiRoutes');
const userRoutes = require('./routes/userRoutes');
const piketRoutes = require('./routes/piketRoutes');
const jadwalRoutes = require('./routes/jadwalRoutes');
const informasiRoutes = require('./routes/informasiRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (pastikan folder public ada)
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/absensi', absensiRoutes);
app.use('/api/users', userRoutes);
app.use('/api/piket', piketRoutes);
app.use('/api/jadwal', jadwalRoutes);
app.use('/api/informasi', informasiRoutes);

// fallback handler untuk route tidak ditemukan (404)
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' });
});

// error handler global (4 arg)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan pada server'
  });
});

// Jika dijalankan langsung (node server.js), jalankan listen.
// Jika di-require oleh test (supertest), jangan listen — cukup export app.
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));
}

module.exports = app;
