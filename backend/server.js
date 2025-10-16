const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const cron = require('node-cron');
const axios = require('axios');

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const absensiRoutes = require('./routes/absensiRoutes');
const userRoutes = require('./routes/userRoutes');
const jadwalRoutes = require('./routes/jadwalRoutes');
const riwayatPiketRoutes = require('./routes/riwayatRoutes');
const informasiRoutes = require('./routes/informasiRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// ✅ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/absensi', absensiRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jadwal', jadwalRoutes);
app.use('/api/informasi', informasiRoutes);
app.use('/api/riwayat', riwayatPiketRoutes);
app.use('/api/laporan', require('./routes/laporanRoutes'));

const PORT = process.env.PORT || 5000;

// 🕓 Jalankan auto-mark "Tidak Hadir" setiap jam 23:59
cron.schedule('59 23 * * *', async () => {
  try {
    console.log("⏰ Menjalankan auto-mark-absent...");
    await axios.post(`http://localhost:${PORT}/api/riwayat/auto-mark-absent`);
    console.log("✅ Auto mark 'Tidak Hadir' selesai.");
  } catch (error) {
    console.error("❌ Gagal menjalankan auto-mark-absent:", error.message);
  }
});

app.listen(PORT, () => console.log(`🚀 Server berjalan di port ${PORT}`));
