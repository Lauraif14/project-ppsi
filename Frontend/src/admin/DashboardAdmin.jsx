// src/admin/DashboardAdmin.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import JadwalPiketContent from "./JadwalPiketContent";
import PapanPengumumanContent from "./PapanPengumumanContent";
import { Users, Calendar, FileText, Package, Clock, TrendingUp, RefreshCw, AlertCircle, Download } from "lucide-react";
import { BASE_URL } from "../api/axios";

const DashboardAdmin = () => {
  const [dashboardData, setDashboardData] = useState({
    totalPengurus: 0,
    jadwalHariIni: 0,
    pengurusHariIni: [],
    totalInventaris: 0,
    informasiList: []
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
      const [pengurusResponse, jadwalResponse, inventarisResponse, informasiResponse] = await Promise.all([
        // 1. Get total pengurus
        // 1. Get total pengurus
        fetch(`${BASE_URL}/api/users/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),

        // 2. Get jadwal piket
        // 2. Get jadwal piket
        fetch(`${BASE_URL}/api/piket/jadwal`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),

        // 3. Get inventaris count
        // 3. Get inventaris count
        fetch(`${BASE_URL}/api/users/inventaris`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),

        // 4. Get all information
        // 4. Get all information
        fetch(`${BASE_URL}/api/informasi`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      // Process responses
      const pengurusData = pengurusResponse.ok ? await pengurusResponse.json() : { success: false, data: [] };
      const jadwalData = jadwalResponse.ok ? await jadwalResponse.json() : { success: false, data: [] };
      const inventarisData = inventarisResponse.ok ? await inventarisResponse.json() : { success: false, data: [] };
      const informasiData = informasiResponse.ok ? await informasiResponse.json() : { success: false, data: [] };

      console.log('📅 Jadwal Data:', jadwalData);

      // Calculate data
      const totalPengurus = pengurusData.success ? pengurusData.data.length : 0;

      // Get today's date in YYYY-MM-DD format (local timezone)
      const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        .toISOString().split('T')[0];
      console.log('📆 Today Date:', todayDate);
      console.log('📆 Today Indonesian:', todayIndonesian);

      // Find today's schedule from the array - try multiple methods
      let todaySchedule = null;

      if (jadwalData.success && Array.isArray(jadwalData.data)) {
        // Method 1: Match by exact date
        todaySchedule = jadwalData.data.find(item => item.tanggal === todayDate);

        // Method 2: If not found, try matching by day name
        if (!todaySchedule) {
          todaySchedule = jadwalData.data.find(item => item.hari === todayIndonesian);
        }

        // Method 3: If still not found, try the first item (for testing)
        if (!todaySchedule && jadwalData.data.length > 0) {
          console.log('⚠️ No exact match, using first available schedule');
          todaySchedule = jadwalData.data[0];
        }
      }

      console.log('🎯 Today Schedule:', todaySchedule);

      const pengurusHariIni = todaySchedule && todaySchedule.pengurus
        ? todaySchedule.pengurus
        : [];

      console.log('👥 Pengurus Hari Ini:', pengurusHariIni);

      const jadwalHariIni = pengurusHariIni.length;
      const totalInventaris = inventarisData.success ? inventarisData.data.length : 0;

      // Fix: Handle single object response from getActiveInfo
      const rawInfoData = informasiData.data;
      const informasiList = Array.isArray(rawInfoData) ? rawInfoData : (rawInfoData ? [rawInfoData] : []);

      setDashboardData({
        totalPengurus,
        jadwalHariIni,
        pengurusHariIni,
        totalInventaris,
        informasiList
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
      <div className="flex bg-gray-50 h-screen overflow-hidden">
        <Sidebar activeMenu="dashboard" />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <Navbar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-500 border-t-transparent mx-auto"></div>
              <p className="mt-4 text-gray-600 font-medium">Memuat data dashboard...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex bg-gray-50 h-screen overflow-hidden">
        <Sidebar activeMenu="dashboard" />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <Navbar />
          <main className="flex-1 flex items-center justify-center p-6 bg-gray-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center max-w-md"
            >
              <div className="bg-red-50 border-2 border-red-500 rounded-xl p-6 shadow-lg">
                <div className="text-red-500 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-red-800 mb-2">Terjadi Kesalahan</h3>
                <p className="text-red-700 mb-4">{error}</p>
                <button
                  onClick={fetchDashboardData}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-medium shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 border-2 border-black"
                >
                  <RefreshCw size={16} className="inline mr-2" />
                  Coba Lagi
                </button>
              </div>
            </motion.div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 h-screen overflow-hidden">
      {/* Sidebar - Fixed */}
      <Sidebar activeMenu="dashboard" />

      {/* Main Content Wrapper - Scrollable */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Navbar - Fixed at top of content wrapper */}
        <Navbar />

        {/* Content Area - Scrollable */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Header dengan tanggal */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Dashboard BESTI
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <Calendar size={18} />
                {todayFormatted}
              </p>
            </div>

            {/* Grid Card Statistik */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {/* Card 1 - Total Pengurus */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-pink-50 to-pink-100 border-2 border-black rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-sm text-pink-800 mb-1">Total Pengurus</h2>
                    <p className="text-4xl font-bold text-pink-600">{dashboardData.totalPengurus}</p>
                    <p className="text-xs text-pink-700 mt-1">Pengurus aktif</p>
                  </div>
                  <div className="bg-pink-500 p-3 rounded-lg border-2 border-black">
                    <Users size={32} className="text-white" />
                  </div>
                </div>
              </motion.div>

              {/* Card 2 - Piket Hari Ini */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-black rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-sm text-blue-800 mb-1">Piket {todayIndonesian}</h2>
                    <p className="text-4xl font-bold text-blue-600">{dashboardData.jadwalHariIni}</p>
                    <p className="text-xs text-blue-700 mt-1">Pengurus bertugas</p>
                  </div>
                  <div className="bg-blue-500 p-3 rounded-lg border-2 border-black">
                    <Calendar size={32} className="text-white" />
                  </div>
                </div>
              </motion.div>

              {/* Card 3 - Total Inventaris */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-black rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-sm text-green-800 mb-1">Item Inventaris</h2>
                    <p className="text-4xl font-bold text-green-600">{dashboardData.totalInventaris}</p>
                    <p className="text-xs text-green-700 mt-1">Jenis barang</p>
                  </div>
                  <div className="bg-green-500 p-3 rounded-lg border-2 border-black">
                    <Package size={32} className="text-white" />
                  </div>
                </div>
              </motion.div>

              {/* Card 4 - Status Sistem */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-black rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-sm text-purple-800 mb-1">Status Sistem</h2>
                    <p className="text-4xl font-bold text-purple-600">✅</p>
                    <p className="text-xs text-purple-700 mt-1">Sistem normal</p>
                  </div>
                  <div className="bg-purple-500 p-3 rounded-lg border-2 border-black">
                    <TrendingUp size={32} className="text-white" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Grid 2 Kolom: Jadwal Piket | Informasi Terbaru */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              {/* COLUMN 1: Jadwal Piket Hari Ini - Admin Style */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white border-2 border-black rounded-xl shadow-sm overflow-hidden flex flex-col"
              >
                <div className="p-6 border-b-2 border-gray-200">
                  <h2 className="font-semibold text-xl flex items-center gap-2">
                    <Clock className="text-blue-500" size={24} />
                    Piket {todayIndonesian} Hari Ini
                  </h2>
                </div>
                <JadwalPiketContent />
              </motion.div>

              {/* COLUMN 2: Informasi Terbaru - Admin Style */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white border-2 border-black rounded-xl shadow-sm overflow-hidden flex flex-col"
              >
                <div className="p-6 border-b-2 border-gray-200">
                  <h2 className="font-semibold text-xl flex items-center gap-2">
                    <FileText className="text-green-500" size={24} />
                    Informasi Terbaru
                  </h2>
                </div>
                <PapanPengumumanContent />
              </motion.div>
            </div>

            {/* Refresh Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-6 text-center"
            >
              <button
                onClick={fetchDashboardData}
                className="px-6 py-3 rounded-lg bg-white border-2 border-black text-gray-700 font-medium shadow-sm hover:bg-gray-50 hover:shadow-md transition-all duration-200 inline-flex items-center gap-2"
              >
                <RefreshCw size={18} />
                Refresh Data
              </button>
              <p className="text-sm text-gray-500 mt-3">
                Data terakhir diperbarui: {new Date().toLocaleTimeString('id-ID')}
              </p>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardAdmin;
