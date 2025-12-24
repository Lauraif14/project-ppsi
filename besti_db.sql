-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 20, 2025 at 04:28 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `besti_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `absensi`
--

CREATE TABLE `absensi` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `waktu_masuk` datetime NOT NULL,
  `waktu_keluar` datetime DEFAULT NULL,
  `foto_path` varchar(255) NOT NULL,
  `foto_path_keluar` varchar(255) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `latitude_keluar` decimal(10,8) DEFAULT NULL,
  `longitude_keluar` decimal(11,8) DEFAULT NULL,
  `inventaris_checklist` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`inventaris_checklist`)),
  `checklist_submitted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `absensi`
--

INSERT INTO `absensi` (`id`, `user_id`, `waktu_masuk`, `waktu_keluar`, `foto_path`, `foto_path_keluar`, `latitude`, `longitude`, `latitude_keluar`, `longitude_keluar`, `inventaris_checklist`, `checklist_submitted`) VALUES
(10, 69, '2025-10-16 09:00:39', NULL, 'uploads/absensi/absen-69-1760580039763.jpg', NULL, -0.92280000, 100.37780000, NULL, NULL, '[{\"inventaris_id\":1,\"kode_barang\":null,\"nama\":\"Laptop BEM\",\"status\":\"Tersedia\",\"catatan\":\"\"},{\"inventaris_id\":2,\"kode_barang\":null,\"nama\":\"Proyektor\",\"status\":\"Tersedia\",\"catatan\":\"\"},{\"inventaris_id\":3,\"kode_barang\":null,\"nama\":\"Spidol Whiteboard\",\"status\":\"Tersedia\",\"catatan\":\"\"},{\"inventaris_id\":4,\"kode_barang\":null,\"nama\":\"Kunci Sekretariat\",\"status\":\"Tersedia\",\"catatan\":\"\"},{\"inventaris_id\":5,\"kode_barang\":\"INV001\",\"nama\":\"Laptop Lenovo ThinkPad\",\"status\":\"Rusak\",\"catatan\":\"\"},{\"inventaris_id\":6,\"kode_barang\":\"INV002\",\"nama\":\"Proyektor Epson EB-X400\",\"status\":\"Rusak\",\"catatan\":\"\"},{\"inventaris_id\":7,\"kode_barang\":\"INV003\",\"nama\":\"Kabel HDMI 2 Meter\",\"status\":\"Hilang\",\"catatan\":\"\"},{\"inventaris_id\":8,\"kode_barang\":\"INV004\",\"nama\":\"Mouse Logitech M185\",\"status\":\"Tersedia\",\"catatan\":\"\"},{\"inventaris_id\":9,\"kode_barang\":\"INV005\",\"nama\":\"Keyboard Wireless Logitech\",\"status\":\"Tersedia\",\"catatan\":\"\"},{\"inventaris_id\":10,\"kode_barang\":\"INV006\",\"nama\":\"Speaker Aktif Polytron\",\"status\":\"Dipinjam\",\"catatan\":\"\"},{\"inventaris_id\":11,\"kode_barang\":\"INV007\",\"nama\":\"Whiteboard Magnetik\",\"status\":\"Hilang\",\"catatan\":\"\"},{\"inventaris_id\":12,\"kode_barang\":\"INV008\",\"nama\":\"Kipas Angin Dinding Cosmos\",\"status\":\"Tersedia\",\"catatan\":\"\"},{\"inventaris_id\":13,\"kode_barang\":\"INV009\",\"nama\":\"Dispenser Miyako\",\"status\":\"Tersedia\",\"catatan\":\"\"},{\"inventaris_id\":14,\"kode_barang\":\"INV010\",\"nama\":\"Printer Canon Pixma G2010\",\"status\":\"Tersedia\",\"catatan\":\"\"},{\"inventaris_id\":15,\"kode_barang\":\"INV011\",\"nama\":\"Stop Kontak 6 Lubang\",\"status\":\"Tersedia\",\"catatan\":\"\"},{\"inventaris_id\":16,\"kode_barang\":\"INV012\",\"nama\":\"Router TP-Link Archer C20\",\"status\":\"Tersedia\",\"catatan\":\"\"},{\"inventaris_id\":17,\"kode_barang\":\"INV013\",\"nama\":\"Meja Kerja Kayu\",\"status\":\"Habis\",\"catatan\":\"\"},{\"inventaris_id\":18,\"kode_barang\":\"INV014\",\"nama\":\"Kursi Kantor Putar\",\"status\":\"Dipinjam\",\"catatan\":\"\"},{\"inventaris_id\":19,\"kode_barang\":\"INV015\",\"nama\":\"Kamera DSLR Canon EOS 1500D\",\"status\":\"Hilang\",\"catatan\":\"\"}]', 1),
(11, 72, '2025-12-19 02:41:50', NULL, 'uploads/absensi/absen-72-1766086910103.jpg', NULL, -0.95247740, 100.38489390, NULL, NULL, '[{\"inventaris_id\":1,\"kode_barang\":null,\"nama\":\"Laptop BEM\",\"status\":\"Tersedia\",\"catatan\":\"\"},{\"inventaris_id\":2,\"kode_barang\":null,\"nama\":\"Proyektor\",\"status\":\"Tersedia\",\"catatan\":\"\"},{\"inventaris_id\":3,\"kode_barang\":null,\"nama\":\"Spidol Whiteboard\",\"status\":\"Tersedia\",\"catatan\":\"\"},{\"inventaris_id\":4,\"kode_barang\":null,\"nama\":\"Kunci Sekretariat\",\"status\":\"Tersedia\",\"catatan\":\"\"},{\"inventaris_id\":5,\"kode_barang\":\"INV001\",\"nama\":\"Laptop Lenovo ThinkPad\",\"status\":\"Rusak\",\"catatan\":\"\"},{\"inventaris_id\":6,\"kode_barang\":\"INV002\",\"nama\":\"Proyektor Epson EB-X400\",\"status\":\"Rusak\",\"catatan\":\"\"},{\"inventaris_id\":7,\"kode_barang\":\"INV003\",\"nama\":\"Kabel HDMI 2 Meter\",\"status\":\"Hilang\",\"catatan\":\"\"},{\"inventaris_id\":8,\"kode_barang\":\"INV004\",\"nama\":\"Mouse Logitech M185\",\"status\":\"Tersedia\",\"catatan\":\"\"},{\"inventaris_id\":9,\"kode_barang\":\"INV005\",\"nama\":\"Keyboard Wireless Logitech\",\"status\":\"Tersedia\",\"catatan\":\"\"},{\"inventaris_id\":10,\"kode_barang\":\"INV006\",\"nama\":\"Speaker Aktif Polytron\",\"status\":\"Dipinjam\",\"catatan\":\"\"},{\"inventaris_id\":11,\"kode_barang\":\"INV007\",\"nama\":\"Whiteboard Magnetik\",\"status\":\"Hilang\",\"catatan\":\"\"},{\"inventaris_id\":12,\"kode_barang\":\"INV008\",\"nama\":\"Kipas Angin Dinding Cosmos\",\"status\":\"Tersedia\",\"catatan\":\"\"},{\"inventaris_id\":13,\"kode_barang\":\"INV009\",\"nama\":\"Dispenser Miyako\",\"status\":\"Tersedia\",\"catatan\":\"\"},{\"inventaris_id\":14,\"kode_barang\":\"INV010\",\"nama\":\"Printer Canon Pixma G2010\",\"status\":\"Tersedia\",\"catatan\":\"\"},{\"inventaris_id\":15,\"kode_barang\":\"INV011\",\"nama\":\"Stop Kontak 6 Lubang\",\"status\":\"Tersedia\",\"catatan\":\"\"},{\"inventaris_id\":16,\"kode_barang\":\"INV012\",\"nama\":\"Router TP-Link Archer C20\",\"status\":\"Tersedia\",\"catatan\":\"\"},{\"inventaris_id\":17,\"kode_barang\":\"INV013\",\"nama\":\"Meja Kerja Kayu\",\"status\":\"Habis\",\"catatan\":\"\"},{\"inventaris_id\":18,\"kode_barang\":\"INV014\",\"nama\":\"Kursi Kantor Putar\",\"status\":\"Dipinjam\",\"catatan\":\"\"},{\"inventaris_id\":19,\"kode_barang\":\"INV015\",\"nama\":\"Kamera DSLR Canon EOS 1500D\",\"status\":\"Hilang\",\"catatan\":\"\"}]', 0);

-- --------------------------------------------------------

--
-- Table structure for table `informasi`
--

CREATE TABLE `informasi` (
  `id` int(11) NOT NULL,
  `judul` varchar(255) NOT NULL,
  `isi` text DEFAULT NULL,
  `kategori` enum('SOP','Panduan','Informasi Lain') DEFAULT 'Informasi Lain',
  `file_path` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `informasi`
--

INSERT INTO `informasi` (`id`, `judul`, `isi`, `kategori`, `file_path`, `is_active`, `created_at`, `updated_at`) VALUES
(3, 'SOP Piket', '', 'SOP', 'uploads/informasi/informasi-1766194708969-942939050.docx', 1, '2025-12-18 15:35:42', '2025-12-20 01:38:28'),
(6, 'TERKENDALA PIKET (IZIN, TUKAR HARI, DLL)', 'Hubungi no wa 0812xxxxx', 'Informasi Lain', NULL, 1, '2025-12-18 16:04:37', '2025-12-20 01:38:15'),
(7, 'Job Desk Piket', '', 'Panduan', 'uploads/informasi/informasi-1766194739076-456708776.docx', 1, '2025-12-18 16:05:40', '2025-12-20 01:38:59');

-- --------------------------------------------------------

--
-- Table structure for table `inventaris`
--

CREATE TABLE `inventaris` (
  `id` int(11) NOT NULL,
  `nama_barang` varchar(255) NOT NULL,
  `kode_barang` varchar(50) DEFAULT NULL,
  `jumlah` int(11) DEFAULT 1,
  `status` enum('Tersedia','Habis','Dipinjam','Rusak','Hilang') DEFAULT 'Tersedia',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inventaris`
--

INSERT INTO `inventaris` (`id`, `nama_barang`, `kode_barang`, `jumlah`, `status`, `created_at`) VALUES
(1, 'Laptop BEM', NULL, 1, 'Tersedia', '2025-09-15 16:38:37'),
(2, 'Proyektor', NULL, 1, 'Tersedia', '2025-09-15 16:38:37'),
(3, 'Spidol Whiteboard', NULL, 0, 'Tersedia', '2025-09-15 16:38:37'),
(4, 'Kunci Sekretariat', NULL, 1, 'Tersedia', '2025-09-15 16:38:37'),
(5, 'Laptop Lenovo ThinkPad', 'INV001', 1, 'Rusak', '2025-10-15 23:13:20'),
(6, 'Proyektor Epson EB-X400', 'INV002', 1, 'Rusak', '2025-10-15 23:13:20'),
(7, 'Kabel HDMI 2 Meter', 'INV003', 1, 'Hilang', '2025-10-15 23:13:20'),
(8, 'Mouse Logitech M185', 'INV004', 1, 'Tersedia', '2025-10-15 23:13:20'),
(9, 'Keyboard Wireless Logitech', 'INV005', 1, 'Tersedia', '2025-10-15 23:13:20'),
(10, 'Speaker Aktif Polytron', 'INV006', 1, 'Dipinjam', '2025-10-15 23:13:20'),
(11, 'Whiteboard Magnetik', 'INV007', 1, 'Hilang', '2025-10-15 23:13:20'),
(12, 'Kipas Angin Dinding Cosmos', 'INV008', 1, 'Tersedia', '2025-10-15 23:13:20'),
(13, 'Dispenser Miyako', 'INV009', 1, 'Habis', '2025-10-15 23:13:20'),
(14, 'Printer Canon Pixma G2010', 'INV010', 1, 'Tersedia', '2025-10-15 23:13:20'),
(15, 'Stop Kontak 6 Lubang', 'INV011', 1, 'Tersedia', '2025-10-15 23:13:20'),
(16, 'Router TP-Link Archer C20', 'INV012', 1, 'Tersedia', '2025-10-15 23:13:20'),
(17, 'Meja Kerja Kayu', 'INV013', 1, 'Habis', '2025-10-15 23:13:20'),
(18, 'Kursi Kantor Putar', 'INV014', 1, 'Dipinjam', '2025-10-15 23:13:20'),
(19, 'Kamera DSLR Canon EOS 1500D', 'INV015', 1, 'Hilang', '2025-10-15 23:13:20');

-- --------------------------------------------------------

--
-- Table structure for table `jadwal_piket`
--

CREATE TABLE `jadwal_piket` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `tanggal` date NOT NULL,
  `hari` varchar(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `nama_lengkap` varchar(255) DEFAULT NULL,
  `divisi` varchar(100) DEFAULT NULL,
  `jabatan` varchar(100) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','user') DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `reset_otp` varchar(255) DEFAULT NULL,
  `reset_otp_expiry` datetime DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `nama_lengkap`, `divisi`, `jabatan`, `password`, `role`, `created_at`, `reset_otp`, `reset_otp_expiry`, `avatar_url`) VALUES
(2, 'admin', 'lauraifra143@gmail.com', 'Iffa Razitta', '', '', '$2b$10$JvCnAQLzviJyn2XVR2FuTOeFNtMMzD5esXRjqTY80xm8ovdHMkJoq', 'admin', '2025-09-15 09:50:01', NULL, NULL, NULL),
(69, 'laura', 'laura@ftiunand.ac.id', 'Laura Iffa Razitta', 'kestari', 'Sekretaris', '$2b$10$JvCnAQLzviJyn2XVR2FuTOeFNtMMzD5esXRjqTY80xm8ovdHMkJoq', 'user', '2025-10-15 23:09:36', NULL, NULL, 'uploads/avatars/user-69-1766184212937.jpeg'),
(70, 'triana', 'triana@ftiunand.ac.id', 'Triana Putri', 'kestari', 'Staff', '$2b$10$JvCnAQLzviJyn2XVR2FuTOeFNtMMzD5esXRjqTY80xm8ovdHMkJoq', 'user', '2025-10-15 23:09:36', NULL, NULL, NULL),
(71, 'rizky', 'rizky@ftiunand.ac.id', 'Rizky Hidayat', 'kestari', 'Staff', '$2b$10$JvCnAQLzviJyn2XVR2FuTOeFNtMMzD5esXRjqTY80xm8ovdHMkJoq', 'user', '2025-10-15 23:09:36', NULL, NULL, NULL),
(72, 'andi', 'andi@ftiunand.ac.id', 'Andi Saputra', 'bistech', 'Koordinator', '$2b$10$JvCnAQLzviJyn2XVR2FuTOeFNtMMzD5esXRjqTY80xm8ovdHMkJoq', 'user', '2025-10-15 23:09:36', NULL, NULL, NULL),
(73, 'nadia', 'nadia@ftiunand.ac.id', 'Nadia Rahma', 'bistech', 'Staff', '$2b$10$JvCnAQLzviJyn2XVR2FuTOeFNtMMzD5esXRjqTY80xm8ovdHMkJoq', 'user', '2025-10-15 23:09:36', NULL, NULL, NULL),
(74, 'fikri', 'fikri@ftiunand.ac.id', 'Fikri Ramadhan', 'bistech', 'Staff', '$2b$10$JvCnAQLzviJyn2XVR2FuTOeFNtMMzD5esXRjqTY80xm8ovdHMkJoq', 'user', '2025-10-15 23:09:36', NULL, NULL, NULL),
(75, 'siti', 'siti@ftiunand.ac.id', 'Siti Nurhaliza', 'internal', 'Koordinator', '$2b$10$JvCnAQLzviJyn2XVR2FuTOeFNtMMzD5esXRjqTY80xm8ovdHMkJoq', 'user', '2025-10-15 23:09:36', NULL, NULL, NULL),
(76, 'ilham', 'ilham@ftiunand.ac.id', 'Ilham Prakoso', 'internal', 'Staff', '$2b$10$JvCnAQLzviJyn2XVR2FuTOeFNtMMzD5esXRjqTY80xm8ovdHMkJoq', 'user', '2025-10-15 23:09:36', NULL, NULL, NULL),
(77, 'yuni', 'yuni@ftiunand.ac.id', 'Yuni Lestari', 'internal', 'Staff', '$2b$10$JvCnAQLzviJyn2XVR2FuTOeFNtMMzD5esXRjqTY80xm8ovdHMkJoq', 'user', '2025-10-15 23:09:36', NULL, NULL, NULL),
(78, 'rafi', 'rafi@ftiunand.ac.id', 'Rafi Hidayat', 'eksternal', 'Koordinator', '$2b$10$JvCnAQLzviJyn2XVR2FuTOeFNtMMzD5esXRjqTY80xm8ovdHMkJoq', 'user', '2025-10-15 23:09:36', NULL, NULL, NULL),
(79, 'dewi', 'dewi@ftiunand.ac.id', 'Dewi Amelia', 'eksternal', 'Staff', '$2b$10$JvCnAQLzviJyn2XVR2FuTOeFNtMMzD5esXRjqTY80xm8ovdHMkJoq', 'user', '2025-10-15 23:09:36', NULL, NULL, NULL),
(80, 'reza', 'reza@ftiunand.ac.id', 'Reza Akbar', 'eksternal', 'Staff', '$2b$10$JvCnAQLzviJyn2XVR2FuTOeFNtMMzD5esXRjqTY80xm8ovdHMkJoq', 'user', '2025-10-15 23:09:36', NULL, NULL, NULL),
(81, 'nisa', 'nisa@ftiunand.ac.id', 'Nisa Rahma', 'sosmas', 'Koordinator', '$2b$10$JvCnAQLzviJyn2XVR2FuTOeFNtMMzD5esXRjqTY80xm8ovdHMkJoq', 'user', '2025-10-15 23:09:36', NULL, NULL, NULL),
(82, 'budi', 'budi@ftiunand.ac.id', 'Budi Santoso', 'sosmas', 'Staff', '$2b$10$JvCnAQLzviJyn2XVR2FuTOeFNtMMzD5esXRjqTY80xm8ovdHMkJoq', 'user', '2025-10-15 23:09:36', NULL, NULL, NULL),
(83, 'putri', 'putri@ftiunand.ac.id', 'Putri Amelia', 'sosmas', 'Staff', '$2b$10$JvCnAQLzviJyn2XVR2FuTOeFNtMMzD5esXRjqTY80xm8ovdHMkJoq', 'user', '2025-10-15 23:09:36', NULL, NULL, NULL),
(84, 'dimas', 'dimas@ftiunand.ac.id', 'Dimas Nugraha', 'kastrat', 'Koordinator', '$2b$10$JvCnAQLzviJyn2XVR2FuTOeFNtMMzD5esXRjqTY80xm8ovdHMkJoq', 'user', '2025-10-15 23:09:36', NULL, NULL, NULL),
(85, 'aulia', 'aulia@ftiunand.ac.id', 'Aulia Fitri', 'kastrat', 'Staff', '$2b$10$JvCnAQLzviJyn2XVR2FuTOeFNtMMzD5esXRjqTY80xm8ovdHMkJoq', 'user', '2025-10-15 23:09:36', NULL, NULL, NULL),
(86, 'fauzan', 'fauzan@ftiunand.ac.id', 'Fauzan Ramli', 'kastrat', 'Staff', '$2b$10$JvCnAQLzviJyn2XVR2FuTOeFNtMMzD5esXRjqTY80xm8ovdHMkJoq', 'user', '2025-10-15 23:09:36', NULL, NULL, NULL),
(87, 'salsa', 'salsa@ftiunand.ac.id', 'Salsa Ananda', 'medinkraf', 'Koordinator', '$2b$10$JvCnAQLzviJyn2XVR2FuTOeFNtMMzD5esXRjqTY80xm8ovdHMkJoq', 'user', '2025-10-15 23:09:36', NULL, NULL, NULL),
(88, 'kevin', 'kevin@ftiunand.ac.id', 'Kevin Pratama', 'medinkraf', 'Staff', '$2b$10$JvCnAQLzviJyn2XVR2FuTOeFNtMMzD5esXRjqTY80xm8ovdHMkJoq', 'user', '2025-10-15 23:09:36', NULL, NULL, NULL),
(89, 'john.doe', 'john.doe@email.com', 'John Doe', 'Teknologi Informasi', 'Ketua', '$2b$10$RrxPLSiv7iIytieMGhPb8ebtnqP69FeVkR1aRbNLhiqORUYeqD3iu', 'user', '2025-12-20 01:33:50', NULL, NULL, NULL),
(90, 'jane.smith', 'jane.smith@email.com', 'Jane Smith', 'Administrasi', 'Sekretaris', '$2b$10$Un0GXCjWTnVfq9tMtwKuIOPtstvehIT96b.xjYX3I0yTInJhPbgZm', 'user', '2025-12-20 01:33:50', NULL, NULL, NULL),
(91, 'bob.johnson', 'bob.johnson@email.com', 'Bob Johnson', 'Keuangan', 'Bendahara', '$2b$10$rXr8bL3w4j8ZaO01U1Ubeu/NwRRcP4/T8MJahIw3hxb7LvoUXC/Tu', 'user', '2025-12-20 01:33:50', NULL, NULL, NULL),
(92, 'alice.brown', 'alice.brown@email.com', 'Alice Brown', 'Teknologi Informasi', 'Anggota', '$2b$10$TL.6oVbJF0wKfKkT2k8EIO/0XpYYQZ0bwHtpZaH8MOuTmpZkuTUOy', 'user', '2025-12-20 01:33:50', NULL, NULL, NULL),
(93, 'sara', 'sara@gmail.com', 'sara', 'Bistech', 'Anggota', '$2b$10$jxLsogM7P4BZRN0KliFIY.EKrT/.t4kLTFJJbEzsfHQ8PiNmszLmy', 'user', '2025-12-20 01:34:21', NULL, NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `absensi`
--
ALTER TABLE `absensi`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `informasi`
--
ALTER TABLE `informasi`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `inventaris`
--
ALTER TABLE `inventaris`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kode_barang` (`kode_barang`);

--
-- Indexes for table `jadwal_piket`
--
ALTER TABLE `jadwal_piket`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_date` (`user_id`,`tanggal`),
  ADD KEY `idx_tanggal` (`tanggal`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `absensi`
--
ALTER TABLE `absensi`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `informasi`
--
ALTER TABLE `informasi`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `inventaris`
--
ALTER TABLE `inventaris`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `jadwal_piket`
--
ALTER TABLE `jadwal_piket`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=244;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=94;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `absensi`
--
ALTER TABLE `absensi`
  ADD CONSTRAINT `absensi_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `jadwal_piket`
--
ALTER TABLE `jadwal_piket`
  ADD CONSTRAINT `jadwal_piket_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
