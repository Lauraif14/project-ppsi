// src/components/DashboardUser.jsx

import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { ClipboardCheck, Package, FileText, User } from "lucide-react";
// DIUBAH: Path import disesuaikan dengan lokasi file yang benar
import AbsensiKamera from '../pages/AbsensiKamera';

const DashboardUser = () => {
  const [date, setDate] = useState(new Date());
  const [isAbsenOpen, setIsAbsenOpen] = useState(false);
  const [pesanDashboard, setPesanDashboard] = useState('');

  // Dummy data (nantinya bisa diambil dari API)
  const user = {
    name: "Budi",
    role: "Pengurus BEM",
    email: "budi@example.com",
  };
  const stats = {
    kehadiran: 8,
    inventaris: 15,
    dokumen: 3,
    jadwal: "20 Sept 2025",
  };
  const aktivitas = [
    { id: 1, text: "Absen piket 12 Sept 2025 (08:00 WIB)" },
    { id: 2, text: "Cek Inventaris: Laptop, Proyektor" },
    { id: 3, text: "Upload Dokumen: Laporan Mingguan.pdf" },
  ];

  const shortcuts = [
    { icon: ClipboardCheck, label: "Absen Piket", action: () => setIsAbsenOpen(true) },
    { icon: Package, label: "Inventaris", action: () => alert("Fitur Inventaris belum dibuat") },
    { icon: FileText, label: "Dokumen", action: () => alert("Fitur Dokumen belum dibuat") },
    { icon: User, label: "Edit Profil", action: () => { /* navigasi ke /profile */ } },
  ];

  return (
    <div className="p-6 space-y-8">
      {pesanDashboard && (
          <div className="p-4 mb-4 bg-green-100 text-green-800 rounded-lg text-center font-semibold">
              {pesanDashboard}
          </div>
      )}

      {/* Baris 1: Profil + Shortcut */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 border-2 border-black rounded-xl bg-gradient-to-br from-pink-100 to-pink-200 shadow flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-lg bg-pink-500 flex items-center justify-center text-white text-3xl font-bold">
              {user.name[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
              <p className="text-gray-600">{user.role}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
          <div className="flex gap-3 mt-2">
            <button className="px-4 py-2 bg-pink-500 text-white rounded-lg shadow hover:bg-pink-600 transition">
              Edit Profil
            </button>
            <button className="px-4 py-2 bg-white border-2 border-pink-400 text-pink-600 rounded-lg shadow hover:bg-pink-50 transition">
              Lihat Detail
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {shortcuts.map((item, i) => (
            <button
              key={i}
              onClick={item.action}
              className="flex flex-col items-center justify-center p-4 border-2 border-black rounded-xl bg-pink-500 text-white font-semibold hover:bg-pink-600 hover:scale-105 transform transition shadow"
            >
              <item.icon size={28} />
              <span className="mt-2 text-center">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Baris 2: Statistik + Kalender */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{/* ... Konten Statistik ... */}</div>
      
      {/* Baris 3: Timeline Aktivitas */}
      <div className="p-6 border-2 border-black rounded-xl bg-white shadow">{/* ... Konten Aktivitas ... */}</div>
      
      {isAbsenOpen && (
        <AbsensiKamera 
          onClose={() => setIsAbsenOpen(false)} 
          setPesanDashboard={setPesanDashboard} 
        />
      )}
    </div>
  );
};

export default DashboardUser;