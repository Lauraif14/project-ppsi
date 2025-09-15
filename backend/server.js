// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');

const app = express();
app.use(cors()); // Izinkan request dari domain lain (React app Anda)
app.use(express.json()); // Agar bisa membaca body request dalam format JSON
app.use(express.static('public'));

app.use('/api/auth', authRoutes); 
app.use('/api/profile', profileRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));