// src/pages/LaporanPage.jsx
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Package, CalendarDays, Trash2, Download } from "lucide-react";
import html2canvas from "html2canvas";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const LaporanPage = () => {
  const [dataType, setDataType] = useState("absensi");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  
  // State untuk data asli dari API
  const [absensiData, setAbsensiData] = useState([]);
  const [inventarisData, setInventarisData] = useState([]);
  
  const tableRef = useRef();

  // Fetch data absensi dari backend
  const fetchAbsensiData = async (date) => {
    try {
      const token = localStorage.getItem('token');
      
      console.log('🔍 Fetching absensi data for date:', date);
      
      const response = await fetch(`http://localhost:5000/api/absensi/laporan?date=${date}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('📊 Absensi API Response:', result);
      
      if (result.success) {
        // Transform data sesuai struktur database yang benar
        const transformedData = result.data.map(item => ({
          id: item.id,
          user_id: item.user_id,
          nama_lengkap: item.nama_lengkap || 'N/A',
          username: item.username || 'N/A',
          email: item.email || 'N/A',
          jabatan: item.jabatan || 'N/A',
          divisi: item.divisi || 'N/A',
          
          // Waktu absen
          waktu_masuk: item.waktu_masuk,
          waktu_keluar: item.waktu_keluar,
          waktu_absen: item.waktu_absen_formatted || '-',
          waktu_keluar_formatted: item.waktu_keluar_formatted || '-',
          
          // Status
          status: item.status || 'Tidak Hadir',
          
          // Lokasi (koordinat)
          latitude: item.latitude,
          longitude: item.longitude,
          latitude_keluar: item.latitude_keluar,
          longitude_keluar: item.longitude_keluar,
          
          // Foto
          foto_path: item.foto_path,
          foto_path_keluar: item.foto_path_keluar,
          
          // Inventaris checklist
          inventaris_checklist: item.inventaris_checklist,
          checklist_submitted: item.checklist_submitted,
          
          // Alias untuk kompatibilitas
          name: item.nama_lengkap,
          time: item.waktu_absen_formatted || item.waktu_masuk
        }));

        setAbsensiData(transformedData);
        return transformedData;
      } else {
        console.warn('No absensi data found for date:', date, result.message);
        setAbsensiData([]);
        return [];
      }
    } catch (err) {
      console.error('Error fetching absensi data:', err);
      setAbsensiData([]);
      return [];
    }
  };

  // Fetch data inventaris dari backend
  const fetchInventarisData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch inventaris data dan jadwal piket secara bersamaan
      const [inventarisResponse, jadwalResponse] = await Promise.all([
        fetch('http://localhost:5000/api/users/inventaris', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('http://localhost:5000/api/piket/jadwal', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      const inventarisResult = await inventarisResponse.json();
      const jadwalResult = await jadwalResponse.json();
      
      if (inventarisResult.success) {
        // Get Indonesian day name from selected date
        const selectedDateObj = new Date(selectedDate);
        const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const selectedDayIndonesian = dayNames[selectedDateObj.getDay()];
        
        // Get pengurus piket untuk hari yang dipilih
        let pengurusPiket = [];
        if (jadwalResult.success && jadwalResult.data[selectedDayIndonesian]) {
          pengurusPiket = jadwalResult.data[selectedDayIndonesian];
        }
        
        // Transform inventaris data untuk laporan
        const transformedData = inventarisResult.data.map((item, index) => {
          return {
            id: item.id,
            item: item.nama_barang,
            kode_barang: item.kode_barang,
            date: selectedDate,
            checkedBy: item.dicek_oleh || 'Sistem',
            condition: item.status || 'Tersedia', // Ambil dari kolom 'status' bukan 'kondisi'
            quantity: item.jumlah,
            selectedDay: selectedDayIndonesian,
            availablePiket: pengurusPiket,
            // Data tambahan dari database
            tanggal_cek: item.tanggal_cek,
            waktu_cek: item.waktu_cek,
            created_at: item.created_at
          };
        });
        
        setInventarisData(transformedData);
        return transformedData;
      } else {
        console.warn('No inventaris data found');
        setInventarisData([]);
        return [];
      }
    } catch (err) {
      console.error('Error fetching inventaris data:', err);
      setInventarisData([]);
      return [];
    }
  };

  // Fungsi untuk update kondisi inventaris
  const updateInventoryCondition = async (itemId, newCondition, checkedBy) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/users/inventaris/${itemId}/condition`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          condition: newCondition,
          checked_by: checkedBy,
          checked_date: selectedDate,
          checked_time: new Date().toLocaleTimeString('id-ID', { hour12: false })
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`✅ Kondisi inventaris berhasil diupdate!\n\nBarang: ${result.data.nama_barang}\nKondisi: ${result.data.kondisi}\nDicek oleh: ${result.data.dicek_oleh}\nTanggal: ${result.data.tanggal_cek}\nWaktu: ${result.data.waktu_cek}`);
        fetchData(); // Refresh data
      } else {
        alert('❌ Gagal update kondisi: ' + result.message);
      }
    } catch (error) {
      console.error('Error updating inventory condition:', error);
      alert('❌ Terjadi kesalahan: ' + error.message);
    }
  };

  // Main function untuk fetch data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let fetchedData = [];
      
      if (dataType === "absensi") {
        fetchedData = await fetchAbsensiData(selectedDate);
      } else {
        fetchedData = await fetchInventarisData();
      }
      
      setData(fetchedData);
    } catch (err) {
      setError(`Gagal memuat data ${dataType}: ${err.message}`);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Effect untuk fetch data saat component mount dan saat dependencies berubah
  useEffect(() => {
    fetchData();
  }, [dataType, selectedDate]);

  // Statistik berdasarkan data real dari database
  const absensiStats = {
    hadir: data.filter(item => item.status === "Hadir").length,
    belumKeluar: data.filter(item => item.status === "Belum Keluar").length,
    tidak: data.filter(item => item.status === "Tidak Hadir").length,
    withPhoto: data.filter(item => item.foto_path).length,
    withChecklist: data.filter(item => item.checklist_submitted === 1).length,
    total: data.length
  };

  // Update statistik inventaris sesuai enum yang benar
  const inventarisStats = {
    tersedia: data.filter(item => item.condition === "Tersedia").length,
    habis: data.filter(item => item.condition === "Habis").length,
    dipinjam: data.filter(item => item.condition === "Dipinjam").length,
    rusak: data.filter(item => item.condition === "Rusak").length,
    hilang: data.filter(item => item.condition === "Hilang").length,
    total: data.length
  };

  // Update badge status absensi sesuai logika database
  const getStatusBadge = (status) => {
    const statusConfig = {
      "Hadir": "bg-green-200 text-green-900",
      "Belum Keluar": "bg-yellow-200 text-yellow-900",
      "Tidak Hadir": "bg-red-200 text-red-900",
      "Izin": "bg-blue-200 text-blue-900",
      "Sakit": "bg-purple-200 text-purple-900",
      "Terlambat": "bg-orange-200 text-orange-900"
    };
    return statusConfig[status] || "bg-gray-200 text-gray-900";
  };

  // Update badge kondisi sesuai enum
  const getConditionBadge = (condition) => {
    const conditionConfig = {
      "Tersedia": "bg-green-200 text-green-900",
      "Habis": "bg-red-200 text-red-900",
      "Dipinjam": "bg-yellow-200 text-yellow-900",
      "Rusak": "bg-orange-200 text-orange-900",
      "Hilang": "bg-gray-200 text-gray-900"
    };
    return conditionConfig[condition] || "bg-gray-200 text-gray-900";
  };

  const handleExport = () => {
    if (tableRef.current) {
      // Hide semua button sementara
      const buttons = tableRef.current.querySelectorAll("button");
      buttons.forEach(btn => btn.style.display = "none");

      html2canvas(tableRef.current, { scale: 2 }).then(canvas => {
        const link = document.createElement("a");
        link.download = `laporan_${dataType}_${selectedDate}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      }).finally(() => {
        buttons.forEach(btn => btn.style.display = "inline-block");
      });
    }
  };

  // Hapus fungsi handleDelete karena tidak digunakan lagi
  // const handleDelete = async (id) => { ... } // HAPUS FUNGSI INI

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar activeMenu="laporan" setActiveMenu={() => {}} />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Memuat data laporan...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeMenu="laporan" setActiveMenu={() => {}} />
      <div className="flex-1 flex flex-col">
        <Navbar />

        <motion.div
          className="flex-1 p-6 space-y-6 overflow-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Laporan Harian</h1>
              <p className="text-gray-600">Monitor absensi pengurus dan kondisi inventaris</p>
            </div>
            <div className="flex gap-3 items-center">
              <div className="flex items-center gap-2">
                <CalendarDays size={18} className="text-gray-600" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border-2 border-black rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <button
                onClick={handleExport}
                disabled={data.length === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-300 to-blue-400 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={18} />
                Export
              </button>
              <button
                onClick={fetchData}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 border-2 border-black text-gray-700 font-medium transition-colors"
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}

          {/* Tab untuk pilih tampilan */}
          <div className="flex gap-2 bg-white p-1 rounded-lg shadow-sm border-2 border-black w-fit">
            <button
              className={`px-4 py-2 rounded-md font-medium transition-all duration-200 border-2 ${
                dataType === "absensi"
                  ? "bg-blue-300 text-white shadow-md border-black"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-transparent hover:border-gray-300"
              }`}
              onClick={() => setDataType("absensi")}
            >
              <Users size={16} className="inline mr-2" />
              Absensi Pengurus
            </button>
            <button
              className={`px-4 py-2 rounded-md font-medium transition-all duration-200 border-2 ${
                dataType === "inventaris"
                  ? "bg-green-300 text-white shadow-md border-black"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-transparent hover:border-gray-300"
              }`}
              onClick={() => setDataType("inventaris")}
            >
              <Package size={16} className="inline mr-2" />
              Inventaris Harian
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {dataType === "absensi" ? (
              <>
                <div className="bg-green-100 p-4 rounded-xl text-green-900 shadow-md border-2 border-black">
                  <div className="flex items-center">
                    <Users size={20} className="mr-3" />
                    <div>
                      <p className="text-sm">Hadir</p>
                      <p className="text-2xl font-bold">{absensiStats.hadir}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-red-100 p-4 rounded-xl text-red-900 shadow-md border-2 border-black">
                  <div className="flex items-center">
                    <Users size={20} className="mr-3" />
                    <div>
                      <p className="text-sm">Tidak Hadir</p>
                      <p className="text-2xl font-bold">{absensiStats.tidak}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-100 p-4 rounded-xl text-yellow-900 shadow-md border-2 border-black">
                  <div className="flex items-center">
                    <Users size={20} className="mr-3" />
                    <div>
                      <p className="text-sm">Izin</p>
                      <p className="text-2xl font-bold">{absensiStats.izin}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-100 p-4 rounded-xl text-blue-900 shadow-md border-2 border-black">
                  <div className="flex items-center">
                    <Users size={20} className="mr-3" />
                    <div>
                      <p className="text-sm">Total Pengurus</p>
                      <p className="text-2xl font-bold">{absensiStats.total}</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-green-100 p-4 rounded-xl text-green-900 shadow-md border-2 border-black">
                  <div className="flex items-center">
                    <Package size={20} className="mr-3" />
                    <div>
                      <p className="text-sm">Tersedia</p>
                      <p className="text-2xl font-bold">{inventarisStats.tersedia}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-red-100 p-4 rounded-xl text-red-900 shadow-md border-2 border-black">
                  <div className="flex items-center">
                    <Package size={20} className="mr-3" />
                    <div>
                      <p className="text-sm">Habis</p>
                      <p className="text-2xl font-bold">{inventarisStats.habis}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-100 p-4 rounded-xl text-yellow-900 shadow-md border-2 border-black">
                  <div className="flex items-center">
                    <Package size={20} className="mr-3" />
                    <div>
                      <p className="text-sm">Dipinjam</p>
                      <p className="text-2xl font-bold">{inventarisStats.dipinjam}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-orange-100 p-4 rounded-xl text-orange-900 shadow-md border-2 border-black">
                  <div className="flex items-center">
                    <Package size={20} className="mr-3" />
                    <div>
                      <p className="text-sm">Rusak</p>
                      <p className="text-2xl font-bold">{inventarisStats.rusak}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-100 p-4 rounded-xl text-gray-900 shadow-md border-2 border-black">
                  <div className="flex items-center">
                    <Package size={20} className="mr-3" />
                    <div>
                      <p className="text-sm">Hilang</p>
                      <p className="text-2xl font-bold">{inventarisStats.hilang}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Tabel Data */}
          <div
            ref={tableRef}
            className="bg-white rounded-xl shadow-sm border-2 border-black overflow-hidden mt-4"
          >
            <div className="px-6 py-4 border-b-2 border-black">
              <h2 className="text-lg font-semibold text-gray-900">
                {dataType === "absensi" ? "📋 Laporan Absensi" : "📦 Laporan Inventaris"}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Data tanggal {selectedDate} • {data.length} {dataType === "absensi" ? "pengurus" : "item"}
              </p>
            </div>
            
            {data.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="mb-4">
                  {dataType === "absensi" ? (
                    <Users size={48} className="mx-auto text-gray-300" />
                  ) : (
                    <Package size={48} className="mx-auto text-gray-300" />
                  )}
                </div>
                <p className="text-lg font-medium">Tidak ada data {dataType}</p>
                <p className="text-sm">
                  {dataType === "absensi" 
                    ? `Belum ada data absensi untuk tanggal ${selectedDate}`
                    : "Tidak ada data inventaris yang tersedia"
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                      {dataType === "absensi" ? (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Pengurus</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </>
                      ) : (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Barang</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kondisi</th>
                        </>
                      )}
                      {/* HAPUS header Aksi */}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((item, index) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                        {dataType === "absensi" ? (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap flex items-center">
                              <div className="w-8 h-8 bg-blue-200 text-blue-900 rounded-full flex items-center justify-center font-semibold mr-3">
                                {(item.nama_lengkap || 'N').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {item.nama_lengkap || 'N/A'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {item.jabatan} • {item.divisi}
                                </div>
                              </div>
                            </td>
                            
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div>
                                {item.waktu_absen && item.waktu_absen !== '-' ? (
                                  <div>
                                    <div className="font-medium">
                                      📍 Masuk: {item.waktu_absen}
                                    </div>
                                    {item.waktu_keluar_formatted && item.waktu_keluar_formatted !== '-' && (
                                      <div className="text-xs text-gray-500">
                                        🚪 Keluar: {item.waktu_keluar_formatted}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </div>
                            </td>
                            
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="space-y-1">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(item.status)}`}>
                                  {item.status}
                                </span>
                                
                                {/* Indikator foto dan checklist */}
                                <div className="flex gap-2">
                                  {item.foto_path && (
                                    <span className="text-xs text-green-600 bg-green-100 px-1 py-0.5 rounded">
                                      📸 Foto Masuk
                                    </span>
                                  )}
                                  {item.foto_path_keluar && (
                                    <span className="text-xs text-blue-600 bg-blue-100 px-1 py-0.5 rounded">
                                      📸 Foto Keluar
                                    </span>
                                  )}
                                  {item.checklist_submitted === 1 && (
                                    <span className="text-xs text-purple-600 bg-purple-100 px-1 py-0.5 rounded">
                                      ✅ Checklist
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap flex items-center">
                              <div className="w-8 h-8 bg-green-200 text-green-900 rounded-lg flex items-center justify-center mr-3">
                                <Package size={16} />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{item.item || item.nama_barang}</div>
                                {item.kode_barang && (
                                  <div className="text-xs text-gray-500">Kode: {item.kode_barang}</div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity || item.jumlah} unit</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConditionBadge(item.condition || 'Tersedia')}`}>
                                {item.condition || 'Tersedia'}
                              </span>
                            </td>
                          </>
                        )}
                        {/* HAPUS kolom Aksi */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Info Piket untuk Inventaris */}
          {dataType === "inventaris" && data.length > 0 && (
            <div className="flex justify-between items-center mt-1">
              <p className="text-sm text-gray-600">
                Data tanggal {selectedDate} • {data.length} {dataType === "absensi" ? "pengurus" : "item"}
              </p>
              
              <div className="text-sm text-gray-600">
                {data[0]?.availablePiket && data[0].availablePiket.length > 0 ? (
                  <div className="flex items-center gap-2">
                    <span>👥 Piket {data[0]?.selectedDay}:</span>
                    <div className="flex gap-1">
                      {data[0].availablePiket.map((pengurus, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {pengurus.nama_lengkap}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-orange-600">
                    <span>⚠️ {data[0]?.selectedDay}: Tidak ada piket</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default LaporanPage;
