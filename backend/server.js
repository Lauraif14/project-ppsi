// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const absensiRoutes = require('./routes/absensiRoutes');
const userRoutes = require('./routes/userRoutes');
const piketRoutes = require('./routes/piketRoutes');

const app = express();
app.use(cors()); // Izinkan request dari domain lain (React app Anda)
app.use(express.json()); // Agar bisa membaca body request dalam format JSON
app.use(express.static('public'));

app.use('/api/auth', authRoutes); 
app.use('/api/profile', profileRoutes);
app.use('/api/absensi', absensiRoutes);
app.use('/api/users', userRoutes);
app.use('/api/piket', piketRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));