# 🚀 Laporan Pengujian Performa (Performance Test Report)

**Target Aplikasi**: `https://besti.app`
**Waktu Pengujian**: 25 Desember 2025
**Alat Pengujian**: Artillery.io

---

## 📊 Ringkasan Eksekutif

Sistem **LULUS** pengujian beban (Load Testing).
Backend berhasil menangani **100 pengguna per detik** secara bersamaan dengan waktu respons yang sangat cepat (rata-rata 0.25 detik), jauh di bawah batas maksimum yang ditentukan (3 detik).

### 🟢 Status: **LULUS (PASSED)**

---

## 📈 Statistik Detil

### 1. Kapasitas & Beban
| Metrik | Nilai | Keterangan |
| :--- | :--- | :--- |
| **Total Permintaan** | **6,900** | Total request selama 1.5 menit |
| **Beban Puncak** | **100 user/detik** | Jumlah pengguna bersamaan (Concurrent) |
| **Total Sukses** | **6,899** (99.99%) | Kode 200 OK |
| **Total Gagal** | **1** (0.01%) | Timeout (ETIMEDOUT) |

### 2. Waktu Respons (Latency)
*Seberapa cepat server membalas permintaan?*

| Metrik | Waktu (ms) | Target (Batas) | Status |
| :--- | :--- | :--- | :--- |
| **Rata-rata** | **258 ms** | - | 🚀 Cepat Sekali |
| **Median (50%)** | **257 ms** | - | - |
| **95% User (p95)** | **308 ms** | < 3000 ms | ✅ **LULUS** |
| **99% User (p99)** | **347 ms** | - | - |
| **Lambat (Max)** | **1,106 ms** | - | Masih Aman |

---

## 📝 Kesimpulan
1. **Stabilitas Tinggi**: Dari 6,900 permintaan, hanya 1 yang gagal. Ini menunjukkan stabilitas server 99.99%.
2. **Performa Luar Biasa**: Mayoritas pengguna (95%) merasakan waktu loading aplikasi hanya sekitar **0.3 detik**.
3. **Memenuhi Syarat**: Persyaratan "Response Time < 3 detik" dan "Menangani 100 pengguna" telah terpenuhi sepenuhnya.
