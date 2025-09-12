// src/pages/DashboardPage.jsx
import React from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const DashboardPage = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <Navbar />

        <main className="p-6 overflow-auto">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">
            Dashboard
          </h1>

          {/* Grid Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 - Pink */}
            <div className="bg-pink-100 border-2 border-black rounded-lg shadow-md p-4">
              <h2 className="font-semibold text-lg mb-2">Jumlah Pengurus</h2>
              <p className="text-2xl font-bold text-pink-600">25</p>
            </div>

            {/* Card 2 - Biru */}
            <div className="bg-blue-100 border-2 border-black rounded-lg shadow-md p-4">
              <h2 className="font-semibold text-lg mb-2">Jadwal Hari Ini</h2>
              <p className="text-2xl font-bold text-blue-600">5 Pengurus</p>
            </div>

            {/* Card 3 - Hijau */}
            <div className="bg-green-100 border-2 border-black rounded-lg shadow-md p-4">
              <h2 className="font-semibold text-lg mb-2">Laporan Mingguan</h2>
              <p className="text-2xl font-bold text-green-600">3 Laporan</p>
            </div>

          </div>

          {/* Konten tambahan */}
          <div className="mt-6 bg-white border-2 border-black rounded-lg shadow-md p-4">
            <h2 className="font-semibold text-lg mb-2">Informasi</h2>
            <p>Selamat datang di Dashboard BESTI! Pantau jadwal dan laporan dengan mudah.</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
