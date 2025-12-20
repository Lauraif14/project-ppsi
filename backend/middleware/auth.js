const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(403).json({ message: 'Token diperlukan untuk otentikasi' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next(); // Panggil next() jika token valid
    } catch (err) {
        return res.status(401).json({ message: 'Token tidak valid' });
    }
};

const verifyAdmin = (req, res, next) => {
    // Gunakan kembali verifyToken untuk memastikan user sudah login
    verifyToken(req, res, () => {
        // Cek role setelah token diverifikasi
        if (req.user && req.user.role === 'admin') {
            next(); // Lanjutkan jika rolenya admin
        } else {
            res.status(403).json({ message: 'Akses ditolak. Hanya untuk admin.' });
        }
    });
};

// DIUBAH: Ekspor kedua fungsi di dalam sebuah objek
module.exports = { verifyToken, verifyAdmin };