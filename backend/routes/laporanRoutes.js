// backend/routes/laporanRoutes.js
const express = require('express');
const db = require('../db');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

// Fungsi helper untuk membuat rentang tanggal
const getDateRange = (tanggal) => {
    const startDate = new Date(tanggal);
    startDate.setHours(0, 0, 0, 0); // Jam 00:00:00 di awal hari

    const endDate = new Date(tanggal);
    endDate.setHours(23, 59, 59, 999); // Jam 23:59:59 di akhir hari

    return { startDate, endDate };
};

router.get('/absensi', verifyAdmin, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        const query = `
            SELECT 
                a.id, 
                u.nama_lengkap, 
                u.divisi, 
                u.jabatan,
                a.waktu_masuk, 
                a.waktu_keluar,
                a.foto_path,
                a.foto_path_keluar
            FROM absensi a
            JOIN users u ON a.user_id = u.id
            WHERE a.waktu_masuk BETWEEN ? AND ?
            ORDER BY a.waktu_masuk ASC
        `;
        
        const [rows] = await db.query(query, [startDate + ' 00:00:00', endDate + ' 23:59:59']);

        // Ubah path file menjadi URL lengkap
        const resultsWithUrls = rows.map(item => ({
            ...item,
            foto_masuk_url: item.foto_path ? `${req.protocol}://${req.get('host')}/${item.foto_path}` : null,
            foto_keluar_url: item.foto_path_keluar ? `${req.protocol}://${req.get('host')}/${item.foto_path_keluar}` : null,
        }));

        res.json(resultsWithUrls);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil laporan absensi' });
    }
});

// Endpoint BARU untuk mengambil status inventaris REAL-TIME
router.get('/inventaris-status', verifyAdmin, async (req, res) => {
    try {
        // DIUBAH: Query untuk mengambil semua kolom yang relevan
        const [rows] = await db.query(
            'SELECT id, nama_barang, kode_barang, status, jumlah, created_at FROM inventaris ORDER BY nama_barang ASC'
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil status inventaris' });
    }
});

// Endpoint untuk mengambil laporan inventaris berdasarkan tanggal
router.get('/inventaris', verifyAdmin, async (req, res) => {
    try {
        const { tanggal } = req.query;
        if (!tanggal) return res.status(400).json({ message: 'Tanggal diperlukan.' });
        
        // Gunakan rentang tanggal
        const { startDate, endDate } = getDateRange(tanggal);

        const query = `
            SELECT a.id, u.nama_lengkap, a.waktu_masuk, a.inventaris_checklist
            FROM absensi a
            JOIN users u ON a.user_id = u.id
            WHERE a.waktu_masuk >= ? AND a.waktu_masuk <= ? AND a.checklist_submitted = TRUE
            ORDER BY a.waktu_masuk ASC
        `;
        const [rows] = await db.query(query, [startDate, endDate]);
        res.json(rows);
    } catch (error) {
        console.error("Error Laporan Inventaris:", error);
        res.status(500).json({ message: 'Gagal mengambil laporan inventaris' });
    }
});

module.exports = router;