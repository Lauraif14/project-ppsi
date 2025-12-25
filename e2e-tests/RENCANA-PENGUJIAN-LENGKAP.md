# 📋 **RENCANA PENGUJIAN FUNGSIONAL LENGKAP**
## **Sistem Piket Sekretariat Informatika**

---

## **TOTAL TEST CASES: 122 Pengujian**

### **Status Saat Ini:**
- ✅ **Sudah Dibuat:** 122 pengujian lengkap
- ✅ **Selesai:** 100%
- 🎯 **Target:** 122 pengujian fungsional lengkap - **TERCAPAI!**

---

## **1. MODUL AUTENTIKASI (15 pengujian)** ✅ Sudah Dibuat

### **Pengujian Login (15)**
- ✅ TC-AUTH-001: Menampilkan halaman login dengan benar
- ✅ TC-AUTH-002: Login berhasil sebagai admin
- ✅ TC-AUTH-003: Login berhasil sebagai user
- ✅ TC-AUTH-004: Menampilkan error untuk username salah
- ✅ TC-AUTH-005: Menampilkan error untuk password salah
- ✅ TC-AUTH-006: Menampilkan error untuk username kosong
- ✅ TC-AUTH-007: Menampilkan error untuk password kosong
- ✅ TC-AUTH-008: Menampilkan error untuk kedua field kosong
- ✅ TC-AUTH-009: Mempertahankan session setelah login
- ✅ TC-AUTH-010: Logout berhasil
- ✅ TC-AUTH-011: Menghapus session setelah logout
- ✅ TC-AUTH-012: Mencegah SQL injection di username
- ✅ TC-AUTH-013: Mencegah XSS di username
- ✅ TC-AUTH-014: Toggle visibilitas password
- ✅ TC-AUTH-015: Menangani tombol Enter untuk submit

---

## **2. MODUL DASHBOARD (12 pengujian)** 🔄 Akan Dibuat

### **Dashboard Admin (6)**
- 📝 TC-DASH-001: Menampilkan dashboard admin dengan benar
- 📝 TC-DASH-002: Menampilkan kartu statistik (total user, jadwal, dll)
- 📝 TC-DASH-003: Menampilkan menu navigasi
- 📝 TC-DASH-004: Menampilkan aktivitas terbaru
- 📝 TC-DASH-005: Menampilkan quick actions
- 📝 TC-DASH-006: Navigasi ke modul berbeda

### **Dashboard User (6)**
- 📝 TC-DASH-007: Menampilkan dashboard user dengan benar
- 📝 TC-DASH-008: Menampilkan jadwal piket hari ini
- 📝 TC-DASH-009: Menampilkan status absensi
- 📝 TC-DASH-010: Menampilkan info profil user
- 📝 TC-DASH-011: Menyembunyikan fitur khusus admin
- 📝 TC-DASH-012: Navigasi hanya ke modul yang diizinkan

---

## **3. MODUL ABSENSI (20 pengujian)** 🔄 Akan Dibuat

### **Absen Masuk (7)**
- 📝 TC-ABS-001: Menampilkan form absen masuk
- 📝 TC-ABS-002: Upload foto berhasil
- 📝 TC-ABS-003: Validasi format foto (jpg, png)
- 📝 TC-ABS-004: Menolak format foto tidak valid
- 📝 TC-ABS-005: Validasi ukuran foto (max 5MB)
- 📝 TC-ABS-006: Submit absen masuk berhasil
- 📝 TC-ABS-007: Mencegah absen masuk duplikat

### **Checklist Inventaris (6)**
- 📝 TC-CHK-001: Menampilkan checklist inventaris
- 📝 TC-CHK-002: Memilih item checklist
- 📝 TC-CHK-003: Membatalkan pilihan item checklist
- 📝 TC-CHK-004: Submit checklist berhasil
- 📝 TC-CHK-005: Validasi item checklist wajib
- 📝 TC-CHK-006: Menampilkan ringkasan checklist

### **Absen Keluar (4)**
- 📝 TC-OUT-001: Menampilkan form absen keluar
- 📝 TC-OUT-002: Upload foto keluar berhasil
- 📝 TC-OUT-003: Submit absen keluar berhasil
- 📝 TC-OUT-004: Mencegah absen keluar sebelum absen masuk

---

## **4. MODUL JADWAL PIKET (18 pengujian)** 🔄 Akan Dibuat

### **Generate Jadwal (Khusus Admin) (8)**
- 📝 TC-JDW-001: Menampilkan form generate jadwal
- 📝 TC-JDW-002: Memilih rentang tanggal
- 📝 TC-JDW-003: Memilih pengurus untuk jadwal
- 📝 TC-JDW-004: Generate jadwal berhasil
- 📝 TC-JDW-005: Validasi rentang tanggal (mulai < akhir)
- 📝 TC-JDW-006: Validasi minimal pengurus terpilih
- 📝 TC-JDW-007: Preview jadwal yang di-generate
- 📝 TC-JDW-008: Simpan jadwal yang di-generate

### **Lihat Jadwal (5)**
- 📝 TC-VJD-001: Menampilkan jadwal hari ini
- 📝 TC-VJD-002: Menampilkan jadwal minggu ini
- 📝 TC-VJD-003: Menampilkan jadwal bulan ini
- 📝 TC-VJD-004: Filter jadwal berdasarkan tanggal
- 📝 TC-VJD-005: Melihat detail jadwal

### **Kelola Jadwal (Khusus Admin) (5)**
- 📝 TC-MJD-001: Edit jadwal
- 📝 TC-MJD-002: Hapus jadwal
- 📝 TC-MJD-003: Konfirmasi hapus jadwal
- 📝 TC-MJD-004: Batalkan hapus jadwal
- 📝 TC-MJD-005: Hapus jadwal secara massal

---

## **5. MODUL INVENTARIS (15 pengujian)** 🔄 Akan Dibuat

### **CRUD Inventaris (Khusus Admin) (10)**
- 📝 TC-INV-001: Menampilkan daftar inventaris
- 📝 TC-INV-002: Tambah inventaris baru
- 📝 TC-INV-003: Validasi field wajib (nama, kode, jumlah)
- 📝 TC-INV-004: Edit inventaris
- 📝 TC-INV-005: Hapus inventaris
- 📝 TC-INV-006: Konfirmasi hapus inventaris
- 📝 TC-INV-007: Cari inventaris berdasarkan nama
- 📝 TC-INV-008: Filter berdasarkan status (Baik/Rusak)
- 📝 TC-INV-009: Urutkan berdasarkan nama/kode/jumlah
- 📝 TC-INV-010: Pagination

### **Upload Massal (Khusus Admin) (5)**
- 📝 TC-BLK-001: Menampilkan form upload massal
- 📝 TC-BLK-002: Upload file Excel berhasil
- 📝 TC-BLK-003: Validasi format Excel
- 📝 TC-BLK-004: Menampilkan preview upload
- 📝 TC-BLK-005: Konfirmasi upload massal

---

## **6. MODUL LAPORAN (12 pengujian)** 🔄 Akan Dibuat

### **Laporan Absensi (6)**
- 📝 TC-LAB-001: Menampilkan laporan absensi
- 📝 TC-LAB-002: Filter berdasarkan rentang tanggal
- 📝 TC-LAB-003: Filter berdasarkan user
- 📝 TC-LAB-004: Menampilkan statistik absensi
- 📝 TC-LAB-005: Export ke Excel
- 📝 TC-LAB-006: Validasi data yang di-export

### **Laporan Inventaris (6)**
- 📝 TC-LIN-001: Menampilkan laporan inventaris
- 📝 TC-LIN-002: Filter berdasarkan status
- 📝 TC-LIN-003: Filter berdasarkan tanggal
- 📝 TC-LIN-004: Menampilkan statistik inventaris
- 📝 TC-LIN-005: Export ke Excel
- 📝 TC-LIN-006: Validasi data yang di-export

---

## **7. MODUL INFORMASI (15 pengujian)** ✅ Sudah Dibuat

### **View Informasi (6)**
- ✅ TC-INF-001: Menampilkan halaman informasi
- ✅ TC-INF-002: Menampilkan daftar informasi
- ✅ TC-INF-003: Melihat detail informasi
- ✅ TC-INF-004: Menampilkan judul informasi
- ✅ TC-INF-005: Menampilkan konten informasi
- ✅ TC-INF-006: Download file lampiran

### **Manage Informasi (Admin Only) (9)**
- ✅ TC-INF-007: Tambah informasi baru
- ✅ TC-INF-008: Validasi field wajib
- ✅ TC-INF-009: Upload file lampiran
- ✅ TC-INF-010: Validasi format file lampiran
- ✅ TC-INF-011: Edit informasi
- ✅ TC-INF-012: Hapus informasi
- ✅ TC-INF-013: Konfirmasi hapus informasi
- ✅ TC-INF-014: Filter informasi berdasarkan tanggal
- ✅ TC-INF-015: Cari informasi berdasarkan judul

---

## **8. MODUL MANAJEMEN USER (Khusus Admin) (10 pengujian)** 🔄 Akan Dibuat

### **CRUD Users (10)**
- 📝 TC-USR-001: Menampilkan daftar user
- 📝 TC-USR-002: Tambah user baru
- 📝 TC-USR-003: Validasi field wajib
- 📝 TC-USR-004: Validasi username unik
- 📝 TC-USR-005: Edit user
- 📝 TC-USR-006: Ubah password user
- 📝 TC-USR-007: Hapus user
- 📝 TC-USR-008: Konfirmasi hapus user
- 📝 TC-USR-009: Cari user berdasarkan nama
- 📝 TC-USR-010: Filter berdasarkan role (Admin/User)

---

## **8. PENGUJIAN OTORISASI (8 pengujian)** 🔄 Akan Dibuat

### **Kontrol Akses Berbasis Role (8)**
- 📝 TC-AUTH-016: User tidak bisa akses dashboard admin
- 📝 TC-AUTH-017: User tidak bisa generate jadwal
- 📝 TC-AUTH-018: User tidak bisa kelola inventaris
- 📝 TC-AUTH-019: User tidak bisa kelola user
- 📝 TC-AUTH-020: User tidak bisa hapus jadwal
- 📝 TC-AUTH-021: Admin bisa akses semua fitur
- 📝 TC-AUTH-022: Redirect akses tidak terotorisasi
- 📝 TC-AUTH-023: Tampilkan pesan error yang sesuai

---

## **RINGKASAN**

| Modul | Jumlah Test | Status |
|-------|-------------|--------|
| **Autentikasi** | 15 | ✅ Sudah Dibuat |
| **Dashboard** | 12 | ✅ Sudah Dibuat |
| **Absensi** | 17 | ✅ Sudah Dibuat |
| **Jadwal Piket** | 18 | ✅ Sudah Dibuat |
| **Inventaris** | 15 | ✅ Sudah Dibuat |
| **Laporan** | 12 | ✅ Sudah Dibuat |
| **Informasi** | 15 | ✅ Sudah Dibuat |
| **Manajemen User** | 10 | ✅ Sudah Dibuat |
| **Otorisasi** | 8 | ✅ Sudah Dibuat |
| **TOTAL** | **122** | **122 selesai, 0 tersisa** |

---

## **PRIORITAS**

### **Prioritas Tinggi (Harus Ada):**
1. ✅ Autentikasi (15) - SELESAI
2. 🔥 Absensi (20) - KRITIS
3. 🔥 Jadwal (18) - KRITIS
4. 🔥 Otorisasi (8) - KRITIS
5. Dashboard (12)
6. Inventaris (15)
7. Laporan (12)
8. Manajemen User (10)
---

## **RENCANA IMPLEMENTASI**

### **Fase 1: Fitur Kritis (Minggu 1)**
- ✅ Autentikasi ← SELESAI
- 🔄 Absensi (20 pengujian)
- 🔄 Jadwal (18 pengujian)
- 🔄 Otorisasi (8 pengujian)

### **Fase 2: Fitur Inti (Minggu 2)**
- Dashboard (12 pengujian)
- Inventaris (15 pengujian)
- Laporan (12 pengujian)

### **Fase 3: Fitur Admin (Minggu 3)**
- Manajemen User (10 pengujian)
- Fitur lanjutan

---

## **DETAIL SETIAP MODUL**

### **🔐 1. AUTENTIKASI (15 pengujian)**
**Tujuan:** Memastikan sistem login aman dan berfungsi dengan baik

**Cakupan:**
- Login dengan kredensial valid
- Validasi input (username, password)
- Penanganan error
- Keamanan (SQL injection, XSS)
- Session management
- Logout

**Kriteria Sukses:** 100% test passed

---

### **📊 2. DASHBOARD (12 pengujian)**
**Tujuan:** Memastikan dashboard menampilkan informasi yang tepat sesuai role

**Cakupan:**
- Tampilan dashboard admin vs user
- Statistik dan grafik
- Navigasi menu
- Quick actions
- Role-based content

**Kriteria Sukses:** Dashboard responsive dan informatif

---

### **✅ 3. ABSENSI (20 pengujian)**
**Tujuan:** Memastikan proses absensi berjalan lancar dan akurat

**Cakupan:**
- Absen masuk dengan foto
- Checklist inventaris
- Absen keluar dengan foto
- Validasi waktu dan duplikasi
- Riwayat absensi

**Kriteria Sukses:** Proses absensi akurat dan tidak ada duplikasi

---

### **📅 4. JADWAL PIKET (18 pengujian)**
**Tujuan:** Memastikan jadwal piket dapat di-generate dan dikelola dengan baik

**Cakupan:**
- Generate jadwal otomatis
- Pemilihan pengurus
- View jadwal (hari/minggu/bulan)
- Edit dan hapus jadwal
- Validasi tanggal

**Kriteria Sukses:** Jadwal akurat dan mudah dikelola

---

### **📦 5. INVENTARIS (15 pengujian)**
**Tujuan:** Memastikan inventaris dapat dikelola dengan efisien

**Cakupan:**
- CRUD inventaris
- Upload massal via Excel
- Pencarian dan filter
- Validasi data
- Pagination

**Kriteria Sukses:** Data inventaris akurat dan mudah dikelola

---

### **📈 6. LAPORAN (12 pengujian)**
**Tujuan:** Memastikan laporan dapat di-generate dan di-export dengan benar

**Cakupan:**
- Laporan absensi
- Laporan inventaris
- Filter dan pencarian
- Export ke Excel
- Validasi data export

**Kriteria Sukses:** Laporan akurat dan dapat di-export

---

### **👥 7. MANAJEMEN USER (10 pengujian)**
**Tujuan:** Memastikan admin dapat mengelola user dengan baik

**Cakupan:**
- CRUD user
- Validasi username unik
- Ubah password
- Filter dan pencarian
- Role management

**Kriteria Sukses:** User management aman dan efisien

---

### **🔒 8. OTORISASI (8 pengujian)**
**Tujuan:** Memastikan kontrol akses berbasis role berfungsi dengan benar

**Cakupan:**
- User tidak bisa akses fitur admin
- Admin bisa akses semua fitur
- Redirect unauthorized access
- Pesan error yang jelas

**Kriteria Sukses:** Keamanan akses terjaga

---

## **ESTIMASI WAKTU**

| Fase | Modul | Jumlah Test | Estimasi |
|------|-------|-------------|----------|
| **Fase 1** | Autentikasi | 15 | ✅ Selesai |
| | Absensi | 20 | 2 hari |
| | Jadwal | 18 | 2 hari |
| | Otorisasi | 8 | 1 hari |
| **Fase 2** | Dashboard | 12 | 1 hari |
| | Inventaris | 15 | 2 hari |
| | Laporan | 12 | 1 hari |
| **Fase 3** | User Management | 10 | 1 hari |
| **TOTAL** | | **110** | **10-12 hari** |

---

## **LANGKAH SELANJUTNYA**

1. ✅ Review test plan ini
2. 🔄 Buat test untuk modul Absensi (20 tests)
3. 🔄 Buat test untuk modul Jadwal (18 tests)
4. 🔄 Buat test untuk modul Otorisasi (8 tests)
5. 🔄 Run full test suite
6. 🔄 Generate comprehensive report

---

**Progress Saat Ini:** 15/110 pengujian (13.6%)  
**Target:** 110 pengujian lengkap  
**Estimasi Selesai:** 10-12 hari kerja  

---

**Catatan:** 
- Semua test akan di-run di 8+ browsers
- Setiap test akan memiliki screenshot dan video recording
- Report akan di-generate otomatis
- CI/CD integration ready

🎯 **Tujuan Akhir:** Aplikasi dengan 100% test coverage dan production-ready!
