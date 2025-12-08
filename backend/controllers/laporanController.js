// controllers/laporanController.js

const LaporanModel = require('../models/laporanModel');

// Fungsi helper yang dipindahkan dari Route lama
const getDateRange = (tanggal) => {
    const startDate = new Date(tanggal);
    startDate.setHours(0, 0, 0, 0); // Jam 00:00:00 di awal hari

    const endDate = new Date(tanggal);
    endDate.setHours(23, 59, 59, 999); // Jam 23:59:59 di akhir hari

    return { startDate, endDate };
};

// --- Controller Endpoints ---

exports.getAbsensiLaporan = async (req, res) => {
    try {
        let { startDate, endDate } = req.query;
        
        // Asumsi query parameter startDate dan endDate sudah dikirim dalam format YYYY-MM-DD
        if (!startDate || !endDate) {
             return res.status(400).json({ message: 'Rentang tanggal (startDate dan endDate) diperlukan.' });
        }
        
        // Logika Bisnis: Menyesuaikan rentang waktu untuk mencakup seluruh hari
        const startTimestamp = startDate + ' 00:00:00';
        const endTimestamp = endDate + ' 23:59:59';
        
        const rows = await LaporanModel.getAbsensiReport(startTimestamp, endTimestamp);

        // Logika Bisnis: Ubah path file menjadi URL lengkap
        const resultsWithUrls = rows.map(item => ({
            ...item,
            // req.protocol dan req.get('host') hanya tersedia di Controller/Route
            foto_masuk_url: item.foto_path ? `${req.protocol}://${req.get('host')}/${item.foto_path}` : null,
            foto_keluar_url: item.foto_path_keluar ? `${req.protocol}://${req.get('host')}/${item.foto_path_keluar}` : null,
        }));

        res.json(resultsWithUrls);
    } catch (error) {
        console.error("Error Laporan Absensi:", error);
        res.status(500).json({ message: 'Gagal mengambil laporan absensi' });
    }
};

exports.getInventarisStatusRealtime = async (req, res) => {
    try {
        const rows = await LaporanModel.getInventarisStatus();
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil status inventaris' });
    }
};

exports.getInventarisLaporanByDate = async (req, res) => {
    try {
        const { tanggal } = req.query;
        if (!tanggal) return res.status(400).json({ message: 'Tanggal diperlukan.' });
        
        // Logika Bisnis: Menghitung rentang tanggal
        const { startDate, endDate } = getDateRange(tanggal);

        const rows = await LaporanModel.getInventarisChecklistReport(startDate, endDate);
        
        // Logika Bisnis: Mungkin perlu parsing inventaris_checklist dari JSON string
        const parsedRows = rows.map(row => ({
            ...row,
            inventaris_checklist: JSON.parse(row.inventaris_checklist) // Perlu try/catch jika data tidak valid
        }));

        res.json(parsedRows);
    } catch (error) {
        console.error("Error Laporan Inventaris:", error);
        res.status(500).json({ message: 'Gagal mengambil laporan inventaris' });
    }
};