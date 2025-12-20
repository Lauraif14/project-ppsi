-- Migration Script: Jadwal Piket Berbasis Tanggal
-- Tanggal: 2025-12-18

-- Step 1: Backup tabel lama
CREATE TABLE IF NOT EXISTS jadwal_piket_backup AS SELECT * FROM jadwal_piket;

-- Step 2: Drop tabel lama
DROP TABLE IF EXISTS jadwal_piket;

-- Step 3: Buat tabel baru dengan struktur berbasis tanggal
CREATE TABLE jadwal_piket (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    tanggal DATE NOT NULL,
    hari VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date (user_id, tanggal),
    INDEX idx_tanggal (tanggal),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Note: Data lama di jadwal_piket_backup bisa dipindahkan manual jika diperlukan
-- Tapi karena struktur berubah (dari hari ke tanggal), lebih baik generate ulang
