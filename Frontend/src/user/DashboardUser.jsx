// src/user/DashboardUser.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import AbsensiKamera from "./AbsensiKamera";

// ✅ Komponen Checklist yang Disederhanakan
const InventarisChecklist = ({ sesiAbsen, setSesiAbsen, onChecklistSubmit }) => {
  const [checklist, setChecklist] = useState([]);
  const [expandedItems, setExpandedItems] = useState(new Set());

  useEffect(() => {
    if (sesiAbsen?.inventaris_checklist) {
      try {
        setChecklist(JSON.parse(sesiAbsen.inventaris_checklist));
      } catch (e) {
        console.error("Error parsing checklist:", e);
        setChecklist([]);
      }
    }
  }, [sesiAbsen]);

  const toggleExpanded = (index) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  if (!sesiAbsen || checklist.length === 0) {
    return (
      <div className="p-6 border-2 border-black rounded-xl bg-white shadow-lg">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
          <p className="text-gray-600 font-medium">Memuat checklist...</p>
        </div>
      </div>
    );
  }

  const isSubmitted = sesiAbsen.checklist_submitted;
  const statusOptions = ["Tersedia", "Habis", "Dipinjam", "Rusak", "Hilang"];
  const completedItems = checklist.filter(item => item.status).length;
  const progressPercentage = (completedItems / checklist.length) * 100;

  const getStatusColor = (status) => {
    const colors = {
      "Tersedia": "bg-green-100 text-green-800 border-green-200",
      "Habis": "bg-orange-100 text-orange-800 border-orange-200",
      "Dipinjam": "bg-blue-100 text-blue-800 border-blue-200",
      "Rusak": "bg-red-100 text-red-800 border-red-200",
      "Hilang": "bg-gray-100 text-gray-800 border-gray-200"
    };
    return colors[status] || "bg-gray-50 text-gray-600";
  };

  const handleStatusChange = (index, newStatus) => {
    if (isSubmitted) return;
    const updated = [...checklist];
    updated[index].status = newStatus;
    setChecklist(updated);
    setSesiAbsen({
      ...sesiAbsen,
      inventaris_checklist: JSON.stringify(updated),
    });
  };

  const handleCatatanChange = (index, newCatatan) => {
    if (isSubmitted) return;
    const updated = [...checklist];
    updated[index].catatan = newCatatan;
    setChecklist(updated);
    setSesiAbsen({
      ...sesiAbsen,
      inventaris_checklist: JSON.stringify(updated),
    });
  };

  const handleSubmitChecklist = async () => {
    try {
      const response = await api.post(
        "/absensi/submit-checklist",
        {
          absensiId: sesiAbsen.id,
          checklist: checklist,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      onChecklistSubmit(response.data.message);
    } catch (error) {
      console.error(error);
      alert("Gagal mengirim checklist.");
    }
  };

  return (
    <div className="p-4 sm:p-6 border-2 border-black rounded-xl bg-white shadow-lg transform hover:scale-[1.01] transition-all duration-300">
      {/* Header dengan Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <h3 className="text-lg font-bold text-gray-800 flex items-center">
          📋 Laporan Inventaris
        </h3>
        {isSubmitted && (
          <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full border border-green-200 text-sm font-medium self-start">
            ✅ Terkirim
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{completedItems}/{checklist.length} selesai</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 border-2 border-black">
          <div 
            className="bg-gradient-to-r from-pink-500 to-pink-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-3 mb-6">
        {checklist.map((item, index) => (
          <div
            key={index}
            className={`border-2 border-black rounded-lg transition-all ${
              isSubmitted ? 'bg-gray-50' : 'bg-white hover:shadow-md'
            }`}
          >
            <div 
              className="p-3 sm:p-4 cursor-pointer flex items-center justify-between"
              onClick={() => !isSubmitted && toggleExpanded(index)}
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <span className="text-lg sm:text-xl flex-shrink-0">📦</span>
                <span className="font-semibold text-gray-800 truncate">{item.nama}</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                {item.status && (
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                )}
                <span className={`text-base sm:text-lg transition-transform ${
                  expandedItems.has(index) ? 'rotate-180' : ''
                }`}>
                  ▼
                </span>
              </div>
            </div>
            
            {expandedItems.has(index) && (
              <div className="px-3 sm:px-4 pb-3 sm:pb-4 border-t-2 border-gray-200 bg-gray-50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                    <select
                      value={item.status || ""}
                      onChange={(e) => handleStatusChange(index, e.target.value)}
                      disabled={isSubmitted}
                      className="w-full p-2 sm:p-3 border-2 border-black rounded-lg bg-white font-medium disabled:bg-gray-200 focus:ring-2 focus:ring-pink-500 text-sm sm:text-base"
                    >
                      <option value="">Pilih Status</option>
                      {statusOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Catatan</label>
                    <input
                      type="text"
                      value={item.catatan || ""}
                      onChange={(e) => handleCatatanChange(index, e.target.value)}
                      disabled={isSubmitted}
                      placeholder="Catatan (opsional)"
                      className="w-full p-2 sm:p-3 border-2 border-black rounded-lg font-medium disabled:bg-gray-200 focus:ring-2 focus:ring-pink-500 text-sm sm:text-base"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmitChecklist}
        disabled={isSubmitted}
        className="w-full py-3 sm:py-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-bold text-base sm:text-lg rounded-lg border-2 border-black hover:from-pink-600 hover:to-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all shadow-lg"
      >
        {isSubmitted ? "✔ Laporan Terkirim" : "Kirim Laporan Inventaris"}
      </button>
    </div>
  );
};

// ✅ Dashboard User yang Responsif
const DashboardUser = () => {
  const [sesiAbsen, setSesiAbsen] = useState(null);
  const [isAbsenOpen, setIsAbsenOpen] = useState(false);
  const [modeAbsen, setModeAbsen] = useState("masuk");
  const [pesanDashboard, setPesanDashboard] = useState("");
  const [userInfo, setUserInfo] = useState({
    name: "Pengurus",
    role: "BEM",
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getInitialData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const statusRes = await api.get("/absensi/status", { headers });
      setSesiAbsen(statusRes.data);

      const profileRes = await api.get("/profile", { headers });
      setUserInfo({
        name: profileRes.data.nama_lengkap,
        role: profileRes.data.jabatan,
      });
    } catch (error) {
      console.error("Gagal memuat data awal:", error);
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    getInitialData();
  }, []);

  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar?")) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  const handleOpenAbsen = (mode) => {
    setModeAbsen(mode);
    setIsAbsenOpen(true);
  };

  const isDurasiCukup = useMemo(() => {
    if (!sesiAbsen?.waktu_masuk) return false;
    const masuk = new Date(sesiAbsen.waktu_masuk);
    return (new Date() - masuk) / (1000 * 60) >= 120;
  }, [sesiAbsen]);

  const getDurasiPiket = () => {
    if (!sesiAbsen?.waktu_masuk) return "00:00:00";
    const masuk = new Date(sesiAbsen.waktu_masuk);
    const sekarang = new Date();
    const durasi = sekarang - masuk;
    const hours = Math.floor(durasi / (1000 * 60 * 60));
    const minutes = Math.floor((durasi % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((durasi % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const menuItems = [
    { title: "Riwayat Piket", icon: "📊", path: "/riwayat-absensi" },
    { title: "Cek Inventaris", icon: "📦", path: "/inventaris" },
    { title: "Jadwal Piket", icon: "📅", path: "/jadwal" },
    { title: "Profil Saya", icon: "👤", path: "/profile" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b-4 border-black shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center border-2 border-black">
                <span className="text-white text-lg sm:text-xl font-bold">🏢</span>
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-800">Dashboard Piket</h1>
                <p className="text-sm text-gray-600 hidden sm:block">Selamat datang, {userInfo.name}</p>
                <p className="text-xs sm:hidden text-gray-600">{userInfo.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="text-right">
                <div className="text-base sm:text-xl font-mono font-bold text-gray-800">
                  {currentTime.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  {currentTime.toLocaleDateString("id-ID", { 
                    weekday: 'short', 
                    day: 'numeric', 
                    month: 'short'
                  })}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 sm:p-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-lg border-2 border-black hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 shadow-lg"
                title="Logout"
              >
                <span className="text-sm sm:text-base"></span>
                <span className="hidden sm:inline ml-1">Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Alert Message */}
        {pesanDashboard && (
          <div className="mb-6 sm:mb-8 p-4 text-center font-bold bg-gradient-to-r from-green-100 to-green-200 text-green-800 rounded-xl border-2 border-green-300 shadow-lg">
            🎉 {pesanDashboard}
          </div>
        )}

        {/* Layout Responsif */}
        <div className="space-y-6 lg:space-y-8">
          {/* Main Content */}
          <div className="space-y-6 lg:space-y-8">
            {!sesiAbsen ? (
              /* Belum Mulai Piket */
              <div className="text-center p-8 sm:p-12 border-2 border-black rounded-xl bg-gradient-to-br from-white to-gray-50 shadow-xl transform hover:scale-[1.02] transition-all duration-300">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-pink-100 to-pink-200 rounded-full flex items-center justify-center border-4 border-black mb-4 sm:mb-6">
                  <span className="text-3xl sm:text-4xl">👋</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">
                  Selamat Datang!
                </h2>
                <p className="text-base sm:text-lg text-gray-600 mb-2">
                  {userInfo.role} • {userInfo.name}
                </p>
                <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
                  Anda belum memulai sesi piket hari ini
                </p>
                <button
                  onClick={() => handleOpenAbsen("masuk")}
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-base sm:text-lg rounded-xl shadow-lg hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 border-2 border-black"
                >
                  🚀 Mulai Piket Sekarang
                </button>
              </div>
            ) : (
              /* Sedang Piket */
              <div className="space-y-6 lg:space-y-8">
                {/* Status Piket */}
                <div className="p-4 sm:p-6 border-2 border-black rounded-xl bg-gradient-to-r from-pink-100 to-pink-50 shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-500 rounded-full flex items-center justify-center border-2 border-black">
                        <span className="text-white text-lg sm:text-xl">⏰</span>
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-800">Sedang Piket!</h2>
                        <p className="text-sm sm:text-base text-gray-600">
                          Dimulai: <span className="font-bold text-pink-600">
                            {new Date(sesiAbsen.waktu_masuk).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })} WIB
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="text-center sm:text-right">
                      <div className="text-2xl sm:text-3xl font-mono font-bold text-pink-600">
                        {getDurasiPiket()}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600">Durasi Piket</p>
                    </div>
                  </div>
                </div>

                {/* Checklist */}
                <InventarisChecklist
                  sesiAbsen={sesiAbsen}
                  setSesiAbsen={setSesiAbsen}
                  onChecklistSubmit={(message) => {
                    setPesanDashboard(message);
                    getInitialData();
                  }}
                />

                {/* Tombol Selesai */}
                <div className="p-4 sm:p-6 border-2 border-black rounded-xl bg-white shadow-lg">
                  <h3 className="font-bold text-base sm:text-lg mb-4 text-gray-800">
                    Selesaikan Piket
                  </h3>
                  <div className="space-y-3 mb-6">
                    <div className={`flex items-center space-x-3 p-3 rounded-lg border-2 ${
                      sesiAbsen.checklist_submitted 
                        ? 'bg-green-100 text-green-800 border-green-300' 
                        : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                    }`}>
                      <span className="text-base sm:text-lg">{sesiAbsen.checklist_submitted ? '✅' : '⏳'}</span>
                      <span className="font-medium text-sm sm:text-base">Laporan inventaris</span>
                    </div>
                    <div className={`flex items-center space-x-3 p-3 rounded-lg border-2 ${
                      isDurasiCukup 
                        ? 'bg-green-100 text-green-800 border-green-300' 
                        : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                    }`}>
                      <span className="text-base sm:text-lg">{isDurasiCukup ? '✅' : '⏳'}</span>
                      <span className="font-medium text-sm sm:text-base">Minimal 2 jam piket</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenAbsen("keluar")}
                    disabled={!sesiAbsen.checklist_submitted || !isDurasiCukup}
                    className="w-full py-3 sm:py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-base sm:text-lg rounded-lg shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:from-red-600 hover:to-red-700 transition-all border-2 border-black"
                  >
                    {(!sesiAbsen.checklist_submitted || !isDurasiCukup) ? 
                      '🔒 Selesaikan Syarat Dulu' : 
                      '🏁 Absen Keluar Sekarang'
                    }
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Section - Kalender & Menu */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* Kalender Modern */}
            <div className="p-4 sm:p-6 border-2 border-black rounded-xl bg-gradient-to-br from-blue-100 via-blue-50 to-white shadow-lg order-2 md:order-1">
              <h3 className="text-base sm:text-lg font-bold mb-4 text-gray-800 text-center">📅 Kalender Hari Ini</h3>
              <div className="bg-white rounded-lg border-2 border-black p-4 sm:p-6">
                <div className="text-center space-y-2">
                  <div className="text-4xl sm:text-5xl font-bold text-blue-600 mb-2">
                    {currentTime.getDate()}
                  </div>
                  <div className="text-base sm:text-lg font-bold text-gray-800">
                    {currentTime.toLocaleDateString("id-ID", { 
                      month: 'long' 
                    })} {currentTime.getFullYear()}
                  </div>
                  <div className="text-sm text-gray-600 px-3 py-1 bg-blue-50 rounded-full border border-blue-200">
                    {currentTime.toLocaleDateString("id-ID", { weekday: 'long' })}
                  </div>
                </div>
                
                {/* Mini Calendar Grid */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-7 gap-1 text-center text-xs">
                    {['M', 'S', 'S', 'R', 'K', 'J', 'S'].map(day => (
                      <div key={day} className="p-1 font-bold text-gray-500">{day}</div>
                    ))}
                    {Array.from({ length: 14 }, (_, i) => {
                      const dayNum = currentTime.getDate() - 6 + i;
                      const isToday = i === 6;
                      return (
                        <div 
                          key={i} 
                          className={`p-1 text-xs rounded ${
                            isToday 
                              ? 'bg-blue-500 text-white font-bold' 
                              : dayNum > 0 
                                ? 'text-gray-600 hover:bg-gray-200' 
                                : 'text-gray-300'
                          }`}
                        >
                          {dayNum > 0 ? dayNum : ''}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Cepat */}
            <div className="p-4 sm:p-6 border-2 border-black rounded-xl bg-white shadow-lg order-1 md:order-2">
              <h3 className="text-base sm:text-lg font-bold mb-4 text-gray-800"> Menu Cepat</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-3">
                {menuItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => item.action === "logout" ? handleLogout() : navigate(item.path)}
                    className={`p-3 sm:p-4 border-2 border-black rounded-lg text-left font-bold transition-all group transform hover:scale-105 ${
                      item.action === "logout" 
                        ? 'bg-gradient-to-r from-red-100 to-red-200 hover:from-red-200 hover:to-red-300 text-red-800' 
                        : 'bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg sm:text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                      <span className="text-sm sm:text-base">{item.title}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Kamera */}
      {isAbsenOpen && (
        <AbsensiKamera
          mode={modeAbsen}
          absensiId={sesiAbsen?.id}
          onClose={() => {
            setIsAbsenOpen(false);
            getInitialData();
          }}
          setPesanDashboard={setPesanDashboard}
        />
      )}
    </div>
  );
};

export default DashboardUser;