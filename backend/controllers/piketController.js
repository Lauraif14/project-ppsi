// Mengimpor Model yang sudah ada dan sesuai dengan fungsionalitas
const UserModel = require('../models/userModel'); 
const AbsensiModel = require('../models/absensiModel');
// Mengimpor JadwalModel, yang mungkin berisi query jadwal piket
const JadwalModel = require('../models/jadwalModel'); 

class PiketController {

    // Fungsi helper statis (bisa diakses tanpa instance)
    static getIndonesianDayName(date) {
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        return days[date.getDay()];
    }

    // --- 1. Pengurus List (READ) ---
    async getPengurusList(req, res) {
        try {
            // Menggunakan UserModel untuk mendapatkan semua user (termasuk pengurus)
            const rows = await UserModel.getAllUsersComplete(); 
            
            res.json({
                success: true,
                data: rows
            });
        } catch (error) {
            console.error('Error fetching pengurus:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching pengurus',
                error: error.message
            });
        }
    }

    // --- 2. Jadwal Piket (READ) ---
    async getJadwalPiket(req, res) {
        try {
            // ASUMSI: Menggunakan JadwalModel yang ada untuk fetch data
            // Jika getScheduledUsersByDay di JadwalModel mengambil semua jadwal, kita gunakan itu.
            const rows = await JadwalModel.getAllJadwalPiket(); // Asumsi method ini ada di JadwalModel
            
            // Logika Bisnis: Group by hari
            const groupedSchedule = rows.reduce((acc, row) => {
                if (!acc[row.hari]) {
                    acc[row.hari] = [];
                }
                acc[row.hari].push({
                    id: row.id,
                    user_id: row.user_id,
                    nama_lengkap: row.nama_lengkap,
                    jabatan: row.jabatan,
                    hari: row.hari
                });
                return acc;
            }, {});
            
            res.json({
                success: true,
                data: groupedSchedule
            });
        } catch (error) {
            console.error('Error fetching jadwal piket:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching jadwal piket',
                error: error.message
            });
        }
    }

    // --- 3. Save Jadwal Piket (WRITE) ---
    async saveJadwalPiket(req, res) {
        try {
            const { schedule } = req.body;
            
            if (!schedule || typeof schedule !== 'object') {
                return res.status(400).json({
                    success: false,
                    message: 'Schedule data is required'
                });
            }

            // 1. Clear lama, menggunakan JadwalModel
            await JadwalModel.clearAllJadwalPiket(); // Asumsi method ini ada di JadwalModel

            let totalInserted = 0;
            let errors = [];
            
            // 2. Loop dan Insert baru
            for (const [hari, namaList] of Object.entries(schedule)) {
                for (const nama of namaList) {
                    try {
                        // Menggunakan UserModel untuk mencari ID
                        const userRow = await UserModel.findUserByNamaLengkap(nama); 
                        const user_id = userRow ? userRow.id : null;
                        
                        if (user_id) {
                            await JadwalModel.insertJadwalPiket(user_id, hari); // Asumsi method ini ada di JadwalModel
                            totalInserted++;
                        } else {
                            errors.push(`User not found: ${nama}`);
                        }
                    } catch (insertError) {
                        console.error(`Error inserting ${nama}:`, insertError);
                        errors.push(`Error inserting ${nama}: ${insertError.message}`);
                    }
                }
            }

            res.status(201).json({
                success: true,
                message: 'Jadwal piket berhasil disimpan',
                data: {
                    total_hari: Object.keys(schedule).length,
                    total_assignments: Object.values(schedule).reduce((sum, names) => sum + names.length, 0),
                    total_inserted: totalInserted,
                    errors: errors.length > 0 ? errors : undefined
                }
            });

        } catch (error) {
            console.error('Error saving jadwal piket:', error);
            res.status(500).json({
                success: false,
                message: 'Error saving jadwal piket',
                error: error.message
            });
        }
    }

    // --- 4. Delete Jadwal Piket (DELETE) ---
    async deleteJadwalPiket(req, res) {
        try {
            // Menggunakan JadwalModel
            const result = await JadwalModel.clearAllJadwalPiket();

            res.json({
                success: true,
                message: `Berhasil menghapus ${result.affectedRows} jadwal piket`,
                deleted_count: result.affectedRows
            });

        } catch (error) {
            console.error('Error deleting jadwal piket:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting jadwal piket',
                error: error.message
            });
        }
    }

    // --- 5. Generate Jadwal Piket (LOGIC) ---
    async generateJadwalPiket(req, res) {
        try {
            const { assignments_per_day = 3 } = req.body;

            // Menggunakan UserModel untuk mengambil pengurus
            const pengurusRows = await UserModel.getAllPengurus(); // Asumsi method ini ada di UserModel (misalnya filter role)

            if (pengurusRows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No pengurus found'
                });
            }

            // 2. Logika Bisnis: Generate schedule (Round-robin sederhana)
            const pengurus = pengurusRows.map(p => p.nama_lengkap);
            const shuffledPengurus = [...pengurus].sort(() => 0.5 - Math.random());
            
            const weekdays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
            const schedule = {};
            
            weekdays.forEach((hari, index) => {
                const startIdx = (index * assignments_per_day) % shuffledPengurus.length;
                const assigned = [];
                
                for (let i = 0; i < assignments_per_day; i++) {
                    const pengurusIdx = (startIdx + i) % shuffledPengurus.length;
                    assigned.push(shuffledPengurus[pengurusIdx]);
                }
                
                schedule[hari] = assigned;
            });

            res.json({
                success: true,
                message: 'Schedule generated successfully',
                data: {
                    schedule: schedule,
                    total_assignments: Object.values(schedule).reduce((sum, names) => sum + names.length, 0),
                    assignments_per_day: assignments_per_day,
                    total_pengurus: pengurus.length
                }
            });

        } catch (error) {
            console.error('Error generating schedule:', error);
            res.status(500).json({
                success: false,
                message: 'Error generating schedule',
                error: error.message
            });
        }
    }

    // --- 6. Absensi Laporan (READ) ---
    async getAbsensiReport(req, res) {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Date query parameter is required'
            });
        }

        try {
            // 1. Validasi dan Konversi Tanggal
            const targetDate = new Date(date);
            if (isNaN(targetDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid date format'
                });
            }

            const dateString = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD
            const hari = PiketController.getIndonesianDayName(targetDate); 

            // 2. Fetch data menggunakan AbsensiModel
            const absensi = await AbsensiModel.getLaporanByDate(dateString);

            res.json({
                success: true,
                data: {
                    tanggal: dateString,
                    hari: hari,
                    absensi: absensi
                }
            });
        } catch (error) {
            console.error('Error fetching absensi data:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching absensi data',
                error: error.message
            });
        }
    }

    // --- 7. Delete Absensi Record (DELETE) ---
    async deleteAbsensi(req, res) {
        const { id } = req.params;

        try {
            // Kita asumsikan ada method deleteRecord di AbsensiModel
            const affectedRows = await AbsensiModel.deleteRecord(id); 

            if (affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Absensi record not found'
                });
            }

            res.json({
                success: true,
                message: 'Absensi record deleted successfully',
                deleted_id: id
            });
        } catch (error) {
            console.error('Error deleting absensi record:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting absensi record',
                error: error.message
            });
        }
    }
}

// EKSPOR INSTANCE CLASS
module.exports = new PiketController();