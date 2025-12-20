// tests/controllers/absensiController.test.js

const AbsensiController = require('../../controllers/absensiController');
const AbsensiModel = require('../../models/absensiModel');
const InventarisModel = require('../../models/inventarisModel');
const JadwalModel = require('../../models/jadwalModel');

// Mocking eksternal/internal modules
const axios = require('axios');
const sharp = require('sharp');
const path = require('path');

// Import instance class
const absensiControllerInstance = require('../../controllers/absensiController');

// Mocking models
jest.mock('../../models/absensiModel');
jest.mock('../../models/inventarisModel');
jest.mock('../../models/jadwalModel');

// Mocking eksternal libraries
jest.mock('axios');
jest.mock('sharp');
jest.mock('path');

// Variabel global untuk melacak panggilan sharp().toFile
let mockToFile;

// Mocking Date untuk mengontrol waktu (penting untuk Watermark dan Absen Keluar)
const MOCK_DATE = new Date('2025-11-17T08:00:00.000Z'); // Waktu Masuk
const MOCK_DATE_KELUAR = new Date('2025-11-17T11:00:00.000Z'); // Waktu Keluar (3 jam kemudian)
const REAL_DATE = Date;

describe('AbsensiController (OOP)', () => {
    let req;
    let res;

    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => { });
        jest.spyOn(console, 'log').mockImplementation(() => { });
    });

    afterAll(() => {
        console.error.mockRestore();
        console.log.mockRestore();
    });

    // Persiapan sebelum setiap test
    beforeEach(() => {
        jest.clearAllMocks();

        // --- 1. SETUP MOCK SHARP YANG BISA DILACAK ---
        mockToFile = jest.fn().mockResolvedValue(true);

        sharp.mockImplementation(() => ({
            resize: jest.fn().mockReturnThis(),
            composite: jest.fn().mockReturnThis(),
            toBuffer: jest.fn().mockResolvedValue(Buffer.from('watermarkedBuffer')),
            toFile: mockToFile, // <-- Gunakan mockToFile untuk verifikasi
        }));
        // ---------------------------------------------

        // Mock objek Request dan Response
        req = {
            body: {},
            user: { id: 1 },
            file: { buffer: Buffer.from('mockImageBuffer') },
            protocol: 'http',
            get: jest.fn().mockReturnValue('localhost:3000'),
            query: {},
            params: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Mock process.env
        process.env.OPENCAGE_API_KEY = 'mock_key';

        // Mock path
        path.join.mockImplementation((...args) => args.join('/')); // Menggunakan forward slash untuk konsistensi di mock logic
    });

    afterAll(() => {
        global.Date = REAL_DATE; // Kembalikan Date asli
    });

    // --- Testing absenMasuk ---
    describe('absenMasuk', () => {
        beforeEach(() => {
            // Mock Date untuk absenMasuk
            global.Date = class extends REAL_DATE {
                constructor(input) {
                    return input ? new REAL_DATE(input) : MOCK_DATE;
                }
            };

            // Mock axios untuk geocoding default sukses
            axios.get.mockResolvedValue({
                data: {
                    results: [{ formatted: 'Gedung Mock' }]
                }
            });

            // Mock JadwalModel - user dijadwalkan hari ini
            JadwalModel.getJadwalByDate.mockResolvedValue([
                { user_id: 1, tanggal: '2025-11-17', hari: 'Senin' }
            ]);

            // Mock Model default
            AbsensiModel.findActiveSession.mockResolvedValue(null);
            InventarisModel.findAllItems.mockResolvedValue([
                { id: 101, kode_barang: 'A001', nama_barang: 'Laptop', status: 'Baik' },
            ]);
            AbsensiModel.createAbsenMasuk.mockResolvedValue({ id: 1 });

            // Set body required
            req.body = { latitude: '123', longitude: '456' };
        });

        // Test Kasus Sukses
        test('should return 201 and create session with watermark and checklist', async () => {
            await absensiControllerInstance.absenMasuk.bind(absensiControllerInstance)(req, res);

            // Verifikasi Response
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ message: 'Absen masuk berhasil dicatat.' });
        });

        // Test Gagal Watermark (Axios Error)
        test('should still proceed and save file even if geocoding/watermark fails', async () => {
            axios.get.mockRejectedValue(new Error('Geocoding API failed'));

            await absensiControllerInstance.absenMasuk.bind(absensiControllerInstance)(req, res);

            expect(mockToFile).toHaveBeenCalled();
            expect(AbsensiModel.createAbsenMasuk).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
        });

        // Test Gagal DB (Error 500)
        test('should return 500 on database error during createAbsenMasuk', async () => {
            AbsensiModel.createAbsenMasuk.mockRejectedValue(new Error('DB Creation Error'));

            await absensiControllerInstance.absenMasuk.bind(absensiControllerInstance)(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Gagal mencatat absen masuk.' });
        });

        // Test Kasus Gagal: Missing File
        test('should return 400 if req.file is missing', async () => {
            req.file = undefined;

            await absensiControllerInstance.absenMasuk.bind(absensiControllerInstance)(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Foto absensi diperlukan.' });
        });

        // Test Kasus Gagal: Missing Lat/Long
        test('should return 400 if latitude or longitude is missing', async () => {
            req.body = { latitude: '123' }; // longitude missing

            await absensiControllerInstance.absenMasuk.bind(absensiControllerInstance)(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Lokasi (latitude dan longitude) diperlukan.' });
        });

        // Test Kasus Gagal: Already Active Session
        test('should return 400 if an active session exists', async () => {
            AbsensiModel.findActiveSession.mockResolvedValue({ id: 1 });

            await absensiControllerInstance.absenMasuk.bind(absensiControllerInstance)(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Anda sudah memiliki sesi absen yang aktif.' });
        });
    });

    // --- Testing submitChecklist ---
    describe('submitChecklist', () => {
        test('should return success message and update models', async () => {
            req.body = {
                absensiId: 10,
                checklist: [
                    { inventaris_id: 101, status: 'Rusak', catatan: 'Pecah' },
                ]
            };
            AbsensiModel.updateChecklist.mockResolvedValue(1);
            InventarisModel.updateStatus.mockResolvedValue(1);

            await absensiControllerInstance.submitChecklist.bind(absensiControllerInstance)(req, res);

            expect(res.json).toHaveBeenCalledWith({ message: 'Laporan inventaris telah dikirim dan status master telah diperbarui.' });
        });

        // Test Gagal DB (Error 500)
        test('should return 500 on database error', async () => {
            req.body = { absensiId: 10, checklist: [] };
            AbsensiModel.updateChecklist.mockRejectedValue(new Error('DB Update Error'));

            await absensiControllerInstance.submitChecklist.bind(absensiControllerInstance)(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Gagal mengirim checklist.' });
        });
    });

    // --- Testing absenKeluar ---
    describe('absenKeluar', () => {
        const VALID_SESSION = {
            id: 10,
            user_id: 1,
            waktu_masuk: new Date('2025-11-17T08:00:00.000Z'), // Waktu masuk mock
            waktu_keluar: null,
            checklist_submitted: true
        };

        beforeEach(() => {
            // Mock Date untuk absenKeluar (3 jam setelah MOCK_DATE)
            global.Date = class extends REAL_DATE {
                constructor(input) {
                    return input ? new REAL_DATE(input) : MOCK_DATE_KELUAR;
                }
            };

            axios.get.mockResolvedValue({
                data: { results: [{ formatted: 'Lokasi Keluar Mock' }] }
            });

            AbsensiModel.findByIdAndUserId.mockResolvedValue(VALID_SESSION);
            AbsensiModel.updateAbsenKeluar.mockResolvedValue(1);

            req.file = { buffer: Buffer.from('mockImageBuffer') };
            req.body = { absensiId: 10, latitude: '789', longitude: '101' };
        });

        test('should succeed and update session for valid exit', async () => {
            await absensiControllerInstance.absenKeluar.bind(absensiControllerInstance)(req, res);
            expect(res.json).toHaveBeenCalledWith({ message: 'Absen keluar berhasil dicatat. Selamat beristirahat!' });
        });

        // Test Sesi Tidak Ditemukan (404) -> Menutup Baris 133
        test('should return 404 if session ID is not found', async () => {
            AbsensiModel.findByIdAndUserId.mockResolvedValue(null);

            await absensiControllerInstance.absenKeluar.bind(absensiControllerInstance)(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Sesi absensi tidak ditemukan.' });
        });

        // Test Sudah Absen Keluar (400)
        test('should return 400 if user has already clocked out', async () => {
            const CLOSED_SESSION = { ...VALID_SESSION, waktu_keluar: MOCK_DATE_KELUAR };
            AbsensiModel.findByIdAndUserId.mockResolvedValue(CLOSED_SESSION);

            await absensiControllerInstance.absenKeluar.bind(absensiControllerInstance)(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Anda sudah melakukan absen keluar untuk sesi ini.' });
        });

        // Test Checklist Belum Dikirim (400)
        test('should return 400 if checklist not submitted', async () => {
            AbsensiModel.findByIdAndUserId.mockResolvedValue({ ...VALID_SESSION, checklist_submitted: false });

            await absensiControllerInstance.absenKeluar.bind(absensiControllerInstance)(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Harap kirim checklist inventaris sebelum absen keluar.' });
        });

        test('should return 400 if duration is too short (less than 120 min)', async () => {
            const SHORT_SESSION = {
                ...VALID_SESSION,
                waktu_masuk: new Date('2025-11-17T09:01:00.000Z'), // 119 menit lalu
            };
            AbsensiModel.findByIdAndUserId.mockResolvedValue(SHORT_SESSION);

            await absensiControllerInstance.absenKeluar.bind(absensiControllerInstance)(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Anda baru piket 119 menit. Absen keluar bisa dilakukan setelah 2 jam.' });
        });

        // Test Gagal DB (Error 500)
        test('should return 500 on database error during updateAbsenKeluar', async () => {
            AbsensiModel.updateAbsenKeluar.mockRejectedValue(new Error('DB Update Error'));

            await absensiControllerInstance.absenKeluar.bind(absensiControllerInstance)(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Gagal mencatat absen keluar.' });
        });
    });

    // --- Testing getAbsensiStatus ---
    describe('getAbsensiStatus', () => {
        const TODAY_SESSION = { id: 10, waktu_masuk: MOCK_DATE.toISOString() };
        const YESTERDAY_SESSION = { id: 10, waktu_masuk: new Date(MOCK_DATE.getTime() - 86400000).toISOString() };

        test('should return the active session if it is from today', async () => {
            AbsensiModel.findCurrentActiveSession.mockResolvedValue(TODAY_SESSION);

            await absensiControllerInstance.getAbsensiStatus.bind(absensiControllerInstance)(req, res);

            expect(res.json).toHaveBeenCalledWith(TODAY_SESSION);
        });

        test('should return null if active session is not from today', async () => {
            AbsensiModel.findCurrentActiveSession.mockResolvedValue(YESTERDAY_SESSION);

            await absensiControllerInstance.getAbsensiStatus.bind(absensiControllerInstance)(req, res);

            expect(res.json).toHaveBeenCalledWith(null);
        });

        // Test Gagal DB (Error 500) -> Menutup Baris 187
        test('should return 500 on database error', async () => {
            AbsensiModel.findCurrentActiveSession.mockRejectedValue(new Error('DB Error'));

            await absensiControllerInstance.getAbsensiStatus.bind(absensiControllerInstance)(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Gagal mengambil status absensi.' });
        });
    });

    // --- Testing getAbsensiHistory ---
    describe('getAbsensiHistory', () => {
        const MOCK_HISTORY = [
            { id: 1, foto_path: 'uploads/absensi/foto1.jpg', foto_path_keluar: 'uploads/absensi/foto2.jpg' },
        ];

        test('should return history with correct full URLs', async () => {
            AbsensiModel.getHistory.mockResolvedValue(MOCK_HISTORY);

            await absensiControllerInstance.getAbsensiHistory.bind(absensiControllerInstance)(req, res);

            const expectedHistory = [{
                ...MOCK_HISTORY[0],
                foto_url: 'http://localhost:3000/uploads/absensi/foto1.jpg',
                foto_keluar_url: 'http://localhost:3000/uploads/absensi/foto2.jpg',
            }];

            expect(res.json).toHaveBeenCalledWith(expectedHistory);
        });

        // Test Gagal DB (Error 500) -> Menutup Baris 210
        test('should return 500 on database error', async () => {
            AbsensiModel.getHistory.mockRejectedValue(new Error('DB Error'));

            await absensiControllerInstance.getAbsensiHistory.bind(absensiControllerInstance)(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Gagal mengambil riwayat.' });
        });
    });

    // --- Testing getLaporanAbsensi ---
    describe('getLaporanAbsensi', () => {
        test('should return 400 if date parameter is missing', async () => {
            req.query = {};

            await absensiControllerInstance.getLaporanAbsensi.bind(absensiControllerInstance)(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Parameter tanggal diperlukan' });
        });

        test('should return report data on success', async () => {
            req.query.date = '2025-11-17';
            const mockRows = [{ id: 1 }];
            AbsensiModel.getLaporanByDate.mockResolvedValue(mockRows);

            await absensiControllerInstance.getLaporanAbsensi.bind(absensiControllerInstance)(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ success: true, data: mockRows })
            );
        });

        // Test Gagal DB (Error 500)
        test('should return 500 on database error', async () => {
            req.query.date = '2025-11-17';
            AbsensiModel.getLaporanByDate.mockRejectedValue(new Error('DB Error'));

            await absensiControllerInstance.getLaporanAbsensi.bind(absensiControllerInstance)(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, message: 'Error fetching absensi data' }));
        });
    });

    // --- Testing getTodayAbsensi ---
    describe('getTodayAbsensi', () => {
        test('should return today absensi status', async () => {
            const today = MOCK_DATE.toISOString().slice(0, 10);
            const mockRows = [{ user: 'A', status: 'Belum Keluar' }];
            AbsensiModel.getTodayAbsensiStatus.mockResolvedValue(mockRows);

            await absensiControllerInstance.getTodayAbsensi.bind(absensiControllerInstance)(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ success: true, data: mockRows, date: today })
            );
        });

        // Test Gagal DB (Error 500)
        test('should return 500 on database error', async () => {
            AbsensiModel.getTodayAbsensiStatus.mockRejectedValue(new Error('DB Error'));

            await absensiControllerInstance.getTodayAbsensi.bind(absensiControllerInstance)(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, message: 'Error fetching today absensi' }));
        });
    });
});