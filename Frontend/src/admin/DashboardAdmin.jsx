// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Users, Calendar, FileText, Package, Clock, TrendingUp } from "lucide-react";

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState({
    totalPengurus: 0,
    jadwalHariIni: 0,
    pengurusHariIni: [],
    totalInventaris: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to get Indonesian day name
  const getIndonesianDayName = (date) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[date.getDay()];
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login kembali.');
      }

      // Get current day in Indonesian
      const today = new Date();
      const todayIndonesian = getIndonesianDayName(today);
      
      // Fetch all data parallel
      const [pengurusResponse, jadwalResponse, inventarisResponse] = await Promise.all([
        // 1. Get total pengurus
        fetch('http://localhost:5000/api/users/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        
        // 2. Get jadwal piket
        fetch('http://localhost:5000/api/piket/jadwal', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        
        // 3. Get inventaris count
        fetch('http://localhost:5000/api/users/inventaris', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      // Process responses
      const pengurusData = pengurusResponse.ok ? await pengurusResponse.json() : { success: false, data: [] };
      const jadwalData = jadwalResponse.ok ? await jadwalResponse.json() : { success: false, data: {} };
      const inventarisData = inventarisResponse.ok ? await inventarisResponse.json() : { success: false, data: [] };

      console.log('Dashboard data fetched:', {
        pengurus: pengurusData,
        jadwal: jadwalData,
        inventaris: inventarisData,
        todayIndonesian
      });

      // Calculate data
      const totalPengurus = pengurusData.success ? pengurusData.data.length : 0;
      const pengurusHariIni = jadwalData.success && jadwalData.data[todayIndonesian] 
        ? jadwalData.data[todayIndonesian] 
        : [];
      const jadwalHariIni = pengurusHariIni.length;
      const totalInventaris = inventarisData.success ? inventarisData.data.length : 0;

      setDashboardData({
        totalPengurus,
        jadwalHariIni,
        pengurusHariIni,
        totalInventaris
      });

      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Get current day info
  const today = new Date();
  const todayIndonesian = getIndonesianDayName(today);
  const todayFormatted = today.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="p-6 overflow-auto flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Memuat data dashboard...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="p-6 overflow-auto flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p className="font-bold">Error</p>
                <p>{error}</p>
                <button 
                  onClick={fetchDashboardData}
                  className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  🔄 Coba Lagi
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <Navbar />

        <main className="p-6 overflow-auto">
          {/* Header dengan tanggal */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Dashboard BESTI
            </h1>
            <p className="text-gray-600">
              📅 {todayFormatted}
            </p>
          </div>

          {/* Grid Card Statistik */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Card 1 - Total Pengurus */}
            <div className="bg-pink-100 border-2 border-black rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-lg mb-2 text-pink-800">Total Pengurus</h2>
                  <p className="text-3xl font-bold text-pink-600">{dashboardData.totalPengurus}</p>
                  <p className="text-sm text-pink-700 mt-1">Pengurus aktif</p>
                </div>
                <div className="text-pink-500">
                  <Users size={48} />
                </div>
              </div>
            </div>

            {/* Card 2 - Piket Hari Ini */}
            <div className="bg-blue-100 border-2 border-black rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-lg mb-2 text-blue-800">Piket {todayIndonesian}</h2>
                  <p className="text-3xl font-bold text-blue-600">{dashboardData.jadwalHariIni}</p>
                  <p className="text-sm text-blue-700 mt-1">Pengurus bertugas</p>
                </div>
                <div className="text-blue-500">
                  <Calendar size={48} />
                </div>
              </div>
            </div>

            {/* Card 3 - Total Inventaris */}
            <div className="bg-green-100 border-2 border-black rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-lg mb-2 text-green-800">Item Inventaris</h2>
                  <p className="text-3xl font-bold text-green-600">{dashboardData.totalInventaris}</p>
                  <p className="text-sm text-green-700 mt-1">Jenis barang</p>
                </div>
                <div className="text-green-500">
                  <Package size={48} />
                </div>
              </div>
            </div>

            {/* Card 4 - Status Sistem */}
            <div className="bg-purple-100 border-2 border-black rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-lg mb-2 text-purple-800">Status Sistem</h2>
                  <p className="text-3xl font-bold text-purple-600">✅</p>
                  <p className="text-sm text-purple-700 mt-1">Sistem normal</p>
                </div>
                <div className="text-purple-500">
                  <TrendingUp size={48} />
                </div>
              </div>
            </div>
          </div>

          {/* Informasi Piket Hari Ini */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card Piket Hari Ini Detail */}
            <div className="bg-white border-2 border-black rounded-lg shadow-md p-6">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Clock className="text-blue-500" size={24} />
                Piket {todayIndonesian} Hari Ini
              </h2>
              
              {dashboardData.pengurusHariIni.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.pengurusHariIni.map((pengurus, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                    >
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {pengurus.nama_lengkap?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{pengurus.nama_lengkap}</p>
                        <p className="text-sm text-blue-600">{pengurus.jabatan}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar size={48} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-lg font-medium">Tidak ada piket hari ini</p>
                  <p className="text-sm">
                    {todayIndonesian === 'Sabtu' || todayIndonesian === 'Minggu' 
                      ? 'Hari libur - Tidak ada jadwal piket'
                      : 'Jadwal piket belum diatur untuk hari ini'
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Card Informasi Umum */}
            <div className="bg-white border-2 border-black rounded-lg shadow-md p-6">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <FileText className="text-green-500" size={24} />
                Informasi Sistem
              </h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-medium text-green-800 mb-2">🎉 Selamat Datang!</h3>
                  <p className="text-green-700 text-sm">
                    Sistem manajemen BESTI siap digunakan. Kelola pengurus, jadwal piket, dan inventaris dengan mudah.
                  </p>
                </div>
                
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-medium text-yellow-800 mb-2">💡 Tips Hari Ini</h3>
                  <p className="text-yellow-700 text-sm">
                    Jangan lupa cek jadwal piket mingguan dan pastikan semua pengurus mendapat giliran yang adil.
                  </p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-2">📊 Quick Stats</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-blue-600">Pengurus:</span>
                      <span className="font-semibold ml-1">{dashboardData.totalPengurus}</span>
                    </div>
                    <div>
                      <span className="text-blue-600">Inventaris:</span>
                      <span className="font-semibold ml-1">{dashboardData.totalInventaris}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Refresh Info */}
          <div className="mt-6 text-center">
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border-2 border-black rounded-lg font-medium transition-colors"
            >
              🔄 Refresh Data
            </button>
            <p className="text-sm text-gray-500 mt-2">
              Data terakhir diperbarui: {new Date().toLocaleTimeString('id-ID')}
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
