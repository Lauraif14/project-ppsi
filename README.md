# 📋 Sistem Informasi Piket & Inventaris

Sistem manajemen piket dan inventaris berbasis web untuk organisasi/institusi.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 atau lebih tinggi)
- MySQL Database
- npm atau yarn

### Installation

```bash
# Clone repository
git clone <repository-url>
cd project-ppsi

# Install dependencies - Frontend
cd Frontend
npm install

# Install dependencies - Backend
cd ../backend
npm install

# Setup database
# Import database schema dari backend/database/schema.sql

# Configure environment
# Copy .env.example to .env dan sesuaikan konfigurasi
```

### Running the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd Frontend
npm run dev
```

Aplikasi akan berjalan di:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 📚 Dokumentasi

### User Documentation
- [Panduan Export PDF](docs/user/PANDUAN_EXPORT_PDF.md)
- [Quick Start Export](docs/user/QUICK_START_EXPORT.md)

### Developer Documentation
- [Implementation Guide](docs/developer/IMPLEMENTATION_GUIDE.md)
- [System Audit & Improvements](docs/developer/SYSTEM_AUDIT_IMPROVEMENTS.md)
- [Responsive Improvements](docs/developer/RESPONSIVE_IMPROVEMENTS.md)

### Design Documentation
- [Export PDF Premium](docs/design/EXPORT_PDF_PREMIUM.md)
- [Export Style Guide](docs/design/EXPORT_STYLE_GUIDE.md)

## 🎯 Fitur Utama

### Untuk User
- ✅ Absensi dengan GPS & Foto
- ✅ Checklist Inventaris Harian
- ✅ Lihat Jadwal Piket
- ✅ Informasi & Pengumuman
- ✅ Riwayat Absensi

### Untuk Admin
- ✅ User Management
- ✅ Master Data Inventaris
- ✅ Jadwal Piket Management
- ✅ Laporan Absensi & Inventaris
- ✅ Export PDF Professional
- ✅ Information Management

## 🛠️ Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Framer Motion
- jsPDF & jsPDF-AutoTable
- React Router
- Axios

### Backend
- Node.js
- Express.js
- MySQL
- JWT Authentication
- Multer (File Upload)

## 📱 Responsive Design

Aplikasi fully responsive untuk:
- 📱 Mobile (< 640px)
- 📱 Tablet (640px - 1024px)
- 💻 Desktop (> 1024px)

## 🔐 Authentication

Sistem menggunakan JWT (JSON Web Token) untuk autentikasi:
- Token disimpan di localStorage
- Auto logout saat token expired
- Protected routes untuk admin & user

## 📊 Database Schema

```
users
├── id
├── username
├── password
├── nama_lengkap
├── email
├── no_pengurus
├── jabatan
├── divisi
└── role

absensi
├── id
├── user_id
├── tanggal
├── waktu_masuk
├── waktu_keluar
├── foto_masuk
├── foto_keluar
├── latitude
├── longitude
└── status

inventaris
├── id
├── kode_barang
├── nama_barang
├── jumlah
├── kondisi
└── kategori

jadwal_piket
├── id
├── user_id
├── hari
└── created_at

informasi
├── id
├── judul
├── konten
├── tanggal
└── created_by
```

## 🎨 Features Highlights

### Export PDF Professional
- Corporate/Formal style
- Landscape untuk Absensi
- Portrait untuk Inventaris
- Statistik ringkasan
- Tanda tangan area
- Multi-page support

### Responsive Design
- Mobile-first approach
- Touch-friendly interface
- Adaptive layouts
- Optimized for all devices

### User Experience
- Loading states
- Error handling
- Toast notifications
- Form validation
- Empty states

## 🔄 Recent Updates

### v2.0.0 (Latest)
- ✅ Enhanced API utility dengan interceptors
- ✅ Error boundary untuk error handling
- ✅ Loading components (overlay, skeleton, spinner)
- ✅ Responsive improvements untuk mobile
- ✅ Professional PDF export dengan corporate style
- ✅ Form validation dengan react-hook-form
- ✅ Toast notifications dengan react-hot-toast

### v1.0.0
- ✅ Basic CRUD operations
- ✅ Authentication & Authorization
- ✅ Absensi dengan GPS & Foto
- ✅ Inventaris management
- ✅ Jadwal piket
- ✅ Laporan & Export

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Team

- Developer: [Your Name]
- Designer: [Designer Name]
- Project Manager: [PM Name]

## 📞 Support

Untuk bantuan dan pertanyaan:
- Email: support@example.com
- Issues: [GitHub Issues](https://github.com/yourusername/project-ppsi/issues)

## 🙏 Acknowledgments

- React.js Team
- Tailwind CSS Team
- jsPDF Contributors
- All open source contributors

---

**Made with ❤️ for better organization management**
