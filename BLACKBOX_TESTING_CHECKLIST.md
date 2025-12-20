# 📋 Blackbox Testing Checklist - Project PPSI

## 🎯 Tujuan
Memastikan semua fitur aplikasi berfungsi dengan baik dari perspektif user.

---

## ✅ 1. AUTENTIKASI & OTORISASI

### Login
- [ ] **TC-001:** Login dengan username & password yang benar (admin)
  - Expected: Redirect ke dashboard admin
- [ ] **TC-002:** Login dengan username & password yang benar (user)
  - Expected: Redirect ke dashboard user
- [ ] **TC-003:** Login dengan password salah
  - Expected: Error message "Username atau password salah"
- [ ] **TC-004:** Login dengan username yang tidak terdaftar
  - Expected: Error message
- [ ] **TC-005:** Login dengan field kosong
  - Expected: Validation error

### Logout
- [ ] **TC-006:** Logout dari dashboard
  - Expected: Redirect ke halaman login, session cleared

### Forgot Password
- [ ] **TC-007:** Request reset password dengan email terdaftar
  - Expected: Email terkirim dengan link reset
- [ ] **TC-008:** Request reset password dengan email tidak terdaftar
  - Expected: Error message
- [ ] **TC-009:** Reset password dengan token valid
  - Expected: Password berhasil diubah
- [ ] **TC-010:** Reset password dengan token expired
  - Expected: Error message

---

## ✅ 2. DASHBOARD ADMIN

### User Management
- [ ] **TC-011:** Lihat daftar semua user
  - Expected: Tampil tabel user dengan data lengkap
- [ ] **TC-012:** Tambah user baru dengan data lengkap
  - Expected: User berhasil ditambahkan, muncul di list
- [ ] **TC-013:** Tambah user dengan username yang sudah ada
  - Expected: Error "Username sudah digunakan"
- [ ] **TC-014:** Edit data user
  - Expected: Data berhasil diupdate
- [ ] **TC-015:** Hapus user
  - Expected: User terhapus dari sistem
- [ ] **TC-016:** Coba hapus admin terakhir
  - Expected: Error "Tidak bisa hapus admin terakhir"

### Master Data - Pengurus
- [ ] **TC-017:** Lihat daftar pengurus
  - Expected: Tampil semua pengurus
- [ ] **TC-018:** Tambah pengurus baru
  - Expected: Pengurus berhasil ditambahkan
- [ ] **TC-019:** Edit data pengurus
  - Expected: Data berhasil diupdate
- [ ] **TC-020:** Hapus pengurus
  - Expected: Pengurus terhapus

### Master Data - Inventaris
- [ ] **TC-021:** Lihat daftar inventaris
  - Expected: Tampil semua barang inventaris
- [ ] **TC-022:** Tambah inventaris baru dengan kategori
  - Expected: Inventaris berhasil ditambahkan
- [ ] **TC-023:** Edit inventaris (ubah status: Baik/Rusak)
  - Expected: Status berhasil diupdate
- [ ] **TC-024:** Hapus inventaris
  - Expected: Inventaris terhapus

### Jadwal Piket
- [ ] **TC-025:** Lihat jadwal piket minggu ini
  - Expected: Tampil jadwal dengan nama pengurus per hari
- [ ] **TC-026:** Generate jadwal piket otomatis
  - Expected: Jadwal ter-generate untuk 5 hari kerja
- [ ] **TC-027:** Edit jadwal piket manual (drag & drop atau form)
  - Expected: Jadwal berhasil diubah
- [ ] **TC-028:** Simpan jadwal piket
  - Expected: Jadwal tersimpan ke database
- [ ] **TC-029:** Hapus semua jadwal
  - Expected: Jadwal terhapus, tabel kosong

### Informasi & SOP
- [ ] **TC-030:** Lihat daftar informasi/SOP
  - Expected: Tampil semua dokumen
- [ ] **TC-031:** Tambah informasi baru (kategori: SOP)
  - Expected: Informasi berhasil ditambahkan
- [ ] **TC-032:** Upload file PDF/DOCX
  - Expected: File berhasil diupload dan bisa didownload
- [ ] **TC-033:** Edit informasi
  - Expected: Data berhasil diupdate
- [ ] **TC-034:** Hapus informasi
  - Expected: Informasi dan file terhapus
- [ ] **TC-035:** Set informasi sebagai "Aktif" (untuk dashboard user)
  - Expected: Informasi tampil di dashboard user

### Laporan
- [ ] **TC-036:** Lihat laporan absensi dengan filter tanggal
  - Expected: Tampil data absensi sesuai range tanggal
- [ ] **TC-037:** Export laporan absensi ke Excel
  - Expected: File Excel terdownload dengan data lengkap
- [ ] **TC-038:** Lihat laporan inventaris per tanggal
  - Expected: Tampil status inventaris pada tanggal tersebut
- [ ] **TC-039:** Export laporan inventaris ke Excel
  - Expected: File Excel terdownload

---

## ✅ 3. DASHBOARD USER

### Profil
- [ ] **TC-040:** Lihat profil sendiri
  - Expected: Tampil data profil lengkap
- [ ] **TC-041:** Edit profil (nama, email)
  - Expected: Data berhasil diupdate
- [ ] **TC-042:** Upload foto profil
  - Expected: Foto berhasil diupload dan tampil
- [ ] **TC-043:** Ubah password
  - Expected: Password berhasil diubah, bisa login dengan password baru

### Jadwal Piket
- [ ] **TC-044:** Lihat jadwal piket hari ini
  - Expected: Tampil nama-nama yang piket hari ini
- [ ] **TC-045:** Lihat jadwal piket minggu ini
  - Expected: Tampil jadwal lengkap

### Absensi Masuk
- [ ] **TC-046:** Absen masuk dengan foto & lokasi (saat dijadwalkan)
  - Expected: Absensi berhasil, foto ter-watermark dengan lokasi & waktu
- [ ] **TC-047:** Coba absen masuk saat tidak dijadwalkan
  - Expected: Error "Anda tidak dijadwalkan piket hari ini"
- [ ] **TC-048:** Coba absen masuk 2x (sudah ada sesi aktif)
  - Expected: Error "Anda sudah memiliki sesi absen aktif"
- [ ] **TC-049:** Absen masuk tanpa foto
  - Expected: Error "Foto diperlukan"
- [ ] **TC-050:** Absen masuk tanpa akses lokasi
  - Expected: Error "Lokasi diperlukan"

### Checklist Inventaris
- [ ] **TC-051:** Lihat checklist inventaris setelah absen masuk
  - Expected: Tampil daftar barang yang perlu dicek
- [ ] **TC-052:** Isi checklist (tandai barang Baik/Rusak, tambah catatan)
  - Expected: Checklist tersimpan
- [ ] **TC-053:** Submit checklist
  - Expected: Status "checklist_submitted" = true

### Absensi Keluar
- [ ] **TC-054:** Absen keluar setelah 2+ jam dan checklist submitted
  - Expected: Absensi keluar berhasil
- [ ] **TC-055:** Coba absen keluar sebelum 2 jam
  - Expected: Error "Absen keluar bisa dilakukan setelah 2 jam"
- [ ] **TC-056:** Coba absen keluar tanpa submit checklist
  - Expected: Error "Harap kirim checklist inventaris dulu"
- [ ] **TC-057:** Absen keluar dengan foto & lokasi
  - Expected: Foto keluar tersimpan dengan watermark

### Riwayat Absensi
- [ ] **TC-058:** Lihat riwayat absensi pribadi
  - Expected: Tampil semua riwayat absensi dengan foto masuk/keluar

### Informasi & Panduan
- [ ] **TC-059:** Lihat informasi aktif di dashboard
  - Expected: Tampil informasi yang di-set aktif oleh admin
- [ ] **TC-060:** Buka modal Panduan SOP
  - Expected: Tampil daftar SOP
- [ ] **TC-061:** Download file SOP/Panduan
  - Expected: File terdownload

---

## ✅ 4. RESPONSIVE DESIGN

- [ ] **TC-062:** Buka aplikasi di mobile (Chrome DevTools)
  - Expected: Layout responsive, semua fitur accessible
- [ ] **TC-063:** Buka aplikasi di tablet
  - Expected: Layout menyesuaikan
- [ ] **TC-064:** Buka aplikasi di desktop (1920x1080)
  - Expected: Layout optimal

---

## ✅ 5. EDGE CASES & ERROR HANDLING

### Network Error
- [ ] **TC-065:** Matikan backend, coba akses halaman
  - Expected: Error message "Tidak dapat terhubung ke server"
- [ ] **TC-066:** Slow network (throttle di DevTools)
  - Expected: Loading indicator tampil

### Session & Token
- [ ] **TC-067:** Hapus token dari localStorage, refresh page
  - Expected: Redirect ke login
- [ ] **TC-068:** Token expired (tunggu 24 jam atau manipulasi)
  - Expected: Redirect ke login dengan pesan "Session expired"

### File Upload
- [ ] **TC-069:** Upload file dengan ukuran > 5MB
  - Expected: Error "File terlalu besar"
- [ ] **TC-070:** Upload file dengan format tidak didukung (.exe)
  - Expected: Error "Format file tidak didukung"

### Data Validation
- [ ] **TC-071:** Submit form dengan field required kosong
  - Expected: Validation error
- [ ] **TC-072:** Input email dengan format salah
  - Expected: Error "Format email tidak valid"

---

## ✅ 6. PERFORMANCE

- [ ] **TC-073:** Load dashboard dengan 100+ data
  - Expected: Load time < 3 detik
- [ ] **TC-074:** Export Excel dengan 1000+ records
  - Expected: File ter-generate tanpa crash

---

## ✅ 7. SECURITY

- [ ] **TC-075:** Akses halaman admin sebagai user
  - Expected: Redirect atau error 403
- [ ] **TC-076:** Akses API endpoint tanpa token
  - Expected: Error 401 Unauthorized
- [ ] **TC-077:** SQL Injection di form input
  - Expected: Input di-sanitize, tidak ada error
- [ ] **TC-078:** XSS di form input (masukkan `<script>alert('xss')</script>`)
  - Expected: Script tidak dieksekusi

---

## 📊 Summary Template

**Total Test Cases:** 78  
**Passed:** ___  
**Failed:** ___  
**Blocked:** ___  
**Pass Rate:** ____%

**Critical Bugs Found:**
1. 
2. 

**Recommendations:**
1. 
2. 

---

## 📝 Notes

- Test dilakukan pada: [Tanggal]
- Browser: [Chrome/Firefox/Safari]
- OS: [Windows/Mac/Linux]
- Tester: [Nama]
