// controllers/absensiController.js 

const path = require('path');
const axios = require('axios');
const sharp = require('sharp');

// Import Models
const AbsensiModel = require('../models/absensiModel');
const InventarisModel = require('../models/inventarisModel');
const JadwalModel = require('../models/jadwalModel');

class AbsensiController {

    // --- Logika Bisnis Watermark (Method Internal) ---
    async #addWatermark(imageBuffer, latitude, longitude) {
        try {
            // 1. Geocoding
            const geoUrl = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${process.env.OPENCAGE_API_KEY}`;
            const response = await axios.get(geoUrl);
            const locationName = response.data.results[0]?.formatted || 'Lokasi tidak ditemukan';

            // 2. Format Teks & SVG
            const text = `${locationName}\n${new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}`;
            const svgImage = `
            <svg width="400" height="80">
            <style>
            .title { fill: #fff; font-size: 14px; font-weight: bold; font-family: Arial, sans-serif; text-shadow: 1px 1px 2px black; }
            </style>
            <rect x="0" y="0" width="100%" height="100%" fill="#000" fill-opacity="0.5" rx="10"/>
            <text x="10" y="30" class="title">${text.split('\n')[0]}</text>
            <text x="10" y="55" class="title">${text.split('\n')[1]}</text>
            </svg>
            `;
            const svgBuffer = Buffer.from(svgImage);

            // 3. Gabungkan dengan Sharp
            return sharp(imageBuffer)
                .resize(600)
                .composite([{ input: svgBuffer, gravity: 'southwest' }])
                .toBuffer();

        } catch (error) {
            console.error("Gagal menambahkan watermark:", error.message);
            // Mengembalikan buffer asli jika watermark gagal
            return imageBuffer;
        }
    };
    // -----------------------------------------------------------------

    // Endpoint Absen MASUK
    async absenMasuk(req, res) {
        try {
            const { latitude, longitude } = req.body;
            const userId = req.user.id;

            if (!req.file) return res.status(400).json({ message: 'Foto absensi diperlukan.' });
            if (!latitude || !longitude) return res.status(400).json({ message: 'Lokasi (latitude dan longitude) diperlukan.' });

            // 1. Validasi Jadwal Piket - Cek apakah user dijadwalkan hari ini
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            const jadwalHariIni = await JadwalModel.getJadwalByDate(today);
            const isScheduledToday = jadwalHariIni.some(jadwal => jadwal.user_id === userId);

            if (!isScheduledToday) {
                return res.status(403).json({
                    message: 'Anda tidak dijadwalkan piket hari ini. Hanya pengurus yang dijadwalkan yang dapat melakukan absensi.'
                });
            }

            // 2. Cek Sesi Aktif
            const activeSession = await AbsensiModel.findActiveSession(userId);
            if (activeSession) {
                return res.status(400).json({ message: 'Anda sudah memiliki sesi absen yang aktif.' });
            }

            // 2. Logika Bisnis: Watermark
            const watermarkedBuffer = await this.#addWatermark(req.file.buffer, latitude, longitude);

            // 3. Logika Bisnis: Simpan File
            const filename = `absen-${userId}-${Date.now()}.jpg`;
            const filePath = path.join(process.cwd(), 'public', 'uploads', 'absensi', filename);
            await sharp(watermarkedBuffer).toFile(filePath);

            const foto_path = path.join('uploads', 'absensi', filename).replace(/\\/g, '/');

            // 4. Logika Bisnis: Buat Checklist Inventaris
            const inventarisItems = await InventarisModel.findAllItems();
            const checklist = inventarisItems.map(item => ({
                inventaris_id: item.id,
                kode_barang: item.kode_barang,
                nama: item.nama_barang,
                status: item.status,
                catatan: ''
            }));

            const newAbsen = {
                user_id: userId,
                waktu_masuk: new Date(),
                foto_path: foto_path,
                latitude,
                longitude,
                inventaris_checklist: JSON.stringify(checklist),
                checklist_submitted: false
            };

            // 5. Simpan ke DB
            await AbsensiModel.createAbsenMasuk(newAbsen);
            res.status(201).json({ message: 'Absen masuk berhasil dicatat.' });

        } catch (error) {
            console.error("Error saat absen masuk:", error);
            res.status(500).json({ message: 'Gagal mencatat absen masuk.' });
        }
    }

    // Endpoint Kirim Laporan Inventaris
    async submitChecklist(req, res) {
        try {
            const { absensiId, checklist } = req.body;
            const userId = req.user.id;

            const checklistJson = JSON.stringify(checklist);

            // 1. Update Absensi
            await AbsensiModel.updateChecklist(absensiId, userId, checklistJson);

            // 2. Update Status Inventaris Master
            for (const item of checklist) {
                await InventarisModel.updateStatus(item.inventaris_id, item.status);
            }

            res.json({ message: 'Laporan inventaris telah dikirim dan status master telah diperbarui.' });
        } catch (error) {
            console.error("Error saat submit checklist:", error);
            res.status(500).json({ message: 'Gagal mengirim checklist.' });
        }
    }

    // Endpoint Absen KELUAR
    async absenKeluar(req, res) {
        try {
            const { absensiId, latitude, longitude } = req.body;
            const userId = req.user.id;

            if (!req.file) return res.status(400).json({ message: 'Foto absensi keluar diperlukan.' });

            // 1. Cek Sesi Absen
            const sesiAbsen = await AbsensiModel.findByIdAndUserId(absensiId, userId);
            if (!sesiAbsen) {
                return res.status(404).json({ message: 'Sesi absensi tidak ditemukan.' });
            }

            if (sesiAbsen.waktu_keluar) {
                return res.status(400).json({ message: 'Anda sudah melakukan absen keluar untuk sesi ini.' });
            }

            // 2. Logika Bisnis: Validasi Durasi Piket
            const waktuMasuk = new Date(sesiAbsen.waktu_masuk);
            const selisihMenit = (new Date() - waktuMasuk) / (1000 * 60);
            const MIN_DURATION = 120; // 2 jam
            if (selisihMenit < MIN_DURATION) {
                return res.status(400).json({ message: `Anda baru piket ${Math.floor(selisihMenit)} menit. Absen keluar bisa dilakukan setelah 2 jam.` });
            }

            // 3. Logika Bisnis: Validasi Checklist
            if (!sesiAbsen.checklist_submitted) {
                return res.status(400).json({ message: 'Harap kirim checklist inventaris sebelum absen keluar.' });
            }

            // 4. Logika Bisnis: Watermark & Simpan File
            const watermarkedBuffer = await this.#addWatermark(req.file.buffer, latitude, longitude);
            const filename = `absen-keluar-${userId}-${Date.now()}.jpg`;
            const filePath = path.join(process.cwd(), 'public', 'uploads', 'absensi', filename);
            await sharp(watermarkedBuffer).toFile(filePath);

            const foto_path_keluar = path.join('uploads', 'absensi', filename).replace(/\\/g, '/');

            // 5. Update DB
            const updateData = {
                waktu_keluar: new Date(),
                foto_path_keluar: foto_path_keluar,
                latitude_keluar: latitude,
                longitude_keluar: longitude
            };
            await AbsensiModel.updateAbsenKeluar(updateData, absensiId);

            res.json({ message: 'Absen keluar berhasil dicatat. Selamat beristirahat!' });
        } catch (error) {
            console.error("Error saat absen keluar:", error);
            res.status(500).json({ message: 'Gagal mencatat absen keluar.' });
        }
    }

    // Endpoint Get Status Absensi Terkini
    async getAbsensiStatus(req, res) {
        try {
            const sesiAbsen = await AbsensiModel.findCurrentActiveSession(req.user.id);

            if (!sesiAbsen) return res.json(null);

            const hariMasuk = new Date(sesiAbsen.waktu_masuk).toDateString();
            const hariIni = new Date().toDateString();

            // Logika Bisnis: Cek apakah sesi ini hari ini
            if (hariMasuk !== hariIni) return res.json(null);

            res.json(sesiAbsen);
        } catch (error) {
            res.status(500).json({ message: 'Gagal mengambil status absensi.' });
        }
    }

    // Endpoint Get Riwayat Absensi
    async getAbsensiHistory(req, res) {
        try {
            const history = await AbsensiModel.getHistory(req.user.id);

            const historyWithFullUrl = history.map(item => ({
                ...item,
                // Logika Bisnis: Buat URL lengkap
                foto_url: `${req.protocol}://${req.get('host')}/${item.foto_path.replace(/\\/g, '/')}`,
                foto_keluar_url: item.foto_path_keluar ? `${req.protocol}://${req.get('host')}/${item.foto_path_keluar.replace(/\\/g, '/')}` : null,
            }));
            res.json(historyWithFullUrl);
        } catch (error) {
            res.status(500).json({ message: 'Gagal mengambil riwayat.' });
        }
    }

    // GET absensi berdasarkan tanggal (Laporan)
    async getLaporanAbsensi(req, res) {
        try {
            const { date } = req.query;

            if (!date) {
                return res.status(400).json({ success: false, message: 'Parameter tanggal diperlukan' });
            }

            const rows = await AbsensiModel.getLaporanByDate(date);

            res.json({
                success: true,
                data: rows,
                total: rows.length,
                date: date
            });
        } catch (error) {
            console.error('Error fetching absensi data:', error);
            res.status(500).json({ success: false, message: 'Error fetching absensi data', error: error.message });
        }
    }

    // GET absensi hari ini untuk pengurus yang belum absen
    async getTodayAbsensi(req, res) {
        try {
            const today = new Date().toISOString().slice(0, 10);

            const rows = await AbsensiModel.getTodayAbsensiStatus(today);

            res.json({
                success: true,
                data: rows,
                total: rows.length,
                date: today
            });
        } catch (error) {
            console.error('Error fetching today absensi:', error);
            res.status(500).json({ success: false, message: 'Error fetching today absensi', error: error.message });
        }
    }
}


module.exports = new AbsensiController();