// controllers/laporanController.js

const LaporanModel = require('../models/laporanModel');

// Fungsi helper yang dipindahkan dari Route lama
// Fungsi helper yang dipindahkan dari Route lama
const getDateRange = (tanggal) => {
    // Pastikan tanggal dalam format YYYY-MM-DD string
    // Kita gunakan string manipulation sederhana untuk menghindari timezone shift dari Date object
    const startTimestamp = `${tanggal} 00:00:00`;
    const endTimestamp = `${tanggal} 23:59:59`;

    return { startDate: startTimestamp, endDate: endTimestamp };
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

        console.log(`[Laporan Inventaris] Request for date: ${tanggal}`);
        console.log(`[Laporan Inventaris] Date range: ${startDate} to ${endDate}`);

        // 1. Ambil Data Master Inventaris (Semua Barang)
        // Agar laporan tetap menampilkan semua barang meskipun tidak dicek hari itu
        const masterItems = await LaporanModel.getInventarisStatus();

        console.log(`[Laporan Inventaris] Master items found: ${masterItems.length}`);

        // 2. Ambil History Checklist dari Absensi pada tanggal tersebut
        const checklistRows = await LaporanModel.getInventarisChecklistReport(startDate, endDate);

        // 3. Proses Checklist untuk mencari status TERAKHIR setiap barang pada tanggal tersebut
        // Menggunakan Map untuk performa: itemId -> { condition, checkedBy, checkedTime }
        const itemStatusMap = {};
        const itemStatusMapByName = {}; // Fallback untuk matching berdasarkan nama

        // checklistRows sudah di-order DESC by waktu_masuk (terbaru dulu)
        checklistRows.forEach(row => {
            let checklist = [];
            try {
                // Parse JSON checklist
                checklist = (typeof row.inventaris_checklist === 'string')
                    ? JSON.parse(row.inventaris_checklist)
                    : row.inventaris_checklist;
            } catch (e) {
                console.error("Error parsing checklist JSON:", e);
                return;
            }

            if (Array.isArray(checklist)) {
                checklist.forEach(item => {
                    // Update Map By ID
                    if (item.id && !itemStatusMap[item.id]) {
                        itemStatusMap[item.id] = {
                            condition: item.condition || item.status || 'Tersedia',
                            checkedBy: row.nama_lengkap,
                            checkedTime: row.waktu_masuk,
                            checklistId: row.id
                        };
                    }

                    // Update Map By Name (Fallback jika ID tidak disimpan)
                    const itemName = item.nama || item.item || item.nama_barang;
                    if (itemName && !itemStatusMapByName[itemName]) {
                        itemStatusMapByName[itemName] = {
                            condition: item.condition || item.status || 'Tersedia',
                            checkedBy: row.nama_lengkap,
                            checkedTime: row.waktu_masuk,
                            checklistId: row.id
                        };
                    }
                });
            }
        });

        // 4. Gabungkan Master Data dengan History Harian
        const finalReport = masterItems.map(masterItem => {
            // Prioritas match by ID, lalu by Name
            const history = itemStatusMap[masterItem.id] || itemStatusMapByName[masterItem.nama_barang];

            if (history) {
                // Jika ada laporan hari itu, pakai data history
                return {
                    ...masterItem,
                    status: history.condition, // Override status master dengan status history
                    dicek_oleh: history.checkedBy,
                    waktu_cek: history.checkedTime, // Gunakan waktu submit checklist
                    tanggal_cek: tanggal, // Tanggal laporan
                    is_history: true, // Marker bahwa ini data history
                    keterangan_laporan: `Dicek oleh ${history.checkedBy}`
                };
            } else {
                // Jika TIDAK ada laporan hari itu
                // Kita kembalikan data master, tapi beri tanda bahwa ini bukan hasil cek hari itu
                // Opsional: Kosongkan status jika ingin strict "Tidak Ada Laporan"
                // Tapi untuk UI yang lebih baik, kita tampilkan status terakhir saja (dari Master)

                // Cek apakah tanggal laporan == hari ini. 
                // Jika ya, status master valid. Jika masa lalu, status master mungkin sudah berubah.
                // Cek apakah tanggal laporan == hari ini (Local Time Server)
                const now = new Date();
                const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                const isToday = todayStr === tanggal;

                return {
                    ...masterItem,
                    keterangan_laporan: isToday ? 'Belum dicek hari ini' : 'Tidak ada laporan pada tanggal ini',
                    status_cek: 'not_checked'
                };
            }
        });

        console.log(`[Laporan Inventaris] Date: ${tanggal}, Master: ${masterItems.length}, History: ${checklistRows.length}, Final: ${finalReport.length}`);

        res.json(finalReport);
    } catch (error) {
        console.error("Error Laporan Inventaris:", error);
        res.status(500).json({ message: 'Gagal mengambil laporan inventaris' });
    }
};

exports.getWeeklyPiketReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'startDate dan endDate diperlukan' });
        }

        const rows = await LaporanModel.getWeeklyPiketReport(startDate, endDate);

        res.json({
            success: true,
            period: { startDate, endDate },
            data: rows,
            summary: {
                total_pengurus: rows.length,
                total_jadwal: rows.reduce((sum, r) => sum + parseInt(r.total_jadwal), 0),
                total_selesai: rows.reduce((sum, r) => sum + parseInt(r.total_selesai), 0),
                total_tidak_selesai: rows.reduce((sum, r) => sum + parseInt(r.total_tidak_selesai), 0),
                total_tidak_piket: rows.reduce((sum, r) => sum + parseInt(r.total_tidak_piket), 0)
            }
        });
    } catch (error) {
        console.error("Error Weekly Piket Report:", error);
        res.status(500).json({ message: 'Gagal mengambil laporan piket mingguan' });
    }
};

exports.getMonthlyPiketReport = async (req, res) => {
    try {
        const { year, month } = req.query;

        if (!year || !month) {
            return res.status(400).json({ message: 'year dan month diperlukan' });
        }

        const rows = await LaporanModel.getMonthlyPiketReport(parseInt(year), parseInt(month));

        res.json({
            success: true,
            period: { year: parseInt(year), month: parseInt(month) },
            data: rows,
            summary: {
                total_pengurus: rows.length,
                total_jadwal: rows.reduce((sum, r) => sum + parseInt(r.total_jadwal), 0),
                total_selesai: rows.reduce((sum, r) => sum + parseInt(r.total_selesai), 0),
                total_tidak_selesai: rows.reduce((sum, r) => sum + parseInt(r.total_tidak_selesai), 0),
                total_tidak_piket: rows.reduce((sum, r) => sum + parseInt(r.total_tidak_piket), 0)
            }
        });
    } catch (error) {
        console.error("Error Monthly Piket Report:", error);
        res.status(500).json({ message: 'Gagal mengambil laporan piket bulanan' });
    }
};