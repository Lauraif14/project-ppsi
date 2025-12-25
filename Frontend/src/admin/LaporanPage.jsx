import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Download, Printer, ClipboardList, Package, Filter, Calendar, Search, X, CheckCircle, XCircle, FileText, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { BASE_URL } from "../api/axios";
import { motion } from 'framer-motion';

const LaporanPage = () => {
  const [activeTab, setActiveTab] = useState('absensi'); // absensi | inventaris
  const [loading, setLoading] = useState(false);

  // Data States
  const [laporanAbsensi, setLaporanAbsensi] = useState([]);
  const [laporanInventaris, setLaporanInventaris] = useState([]);

  // Filter States
  const [filterPeriod, setFilterPeriod] = useState('all'); // all | weekly | monthly
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Default today
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState({ url: '', title: '' });
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Auto-refresh setiap 10 detik untuk data real-time
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 10000); // 10 detik

    return () => clearInterval(interval);
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      if (activeTab === 'absensi') {
        const response = await fetch(`${BASE_URL}/api/laporan/absensi-lengkap`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        console.log('📊 Response dari /api/laporan/absensi-lengkap:', result);

        if (result.success) {
          const flatData = [];
          result.data.forEach(day => {
            console.log(`📅 Processing tanggal: ${day.tanggal}, pengurus: ${day.pengurus.length}`);
            day.pengurus.forEach(p => {
              flatData.push({
                tanggal: day.tanggal,
                hari: day.hari,
                nama: p.nama_lengkap,
                divisi: p.divisi || '-',
                status: p.status,
                waktu_masuk: p.waktu_masuk || '-',
                waktu_keluar: p.waktu_keluar || '-',
                checklist_submitted: p.checklist_submitted || false,
                note: p.note || null,
                foto_path: p.foto_path || null,
                foto_path_keluar: p.foto_path_keluar || null
              });
            });
          });
          // Sort by date descending
          flatData.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
          console.log('✅ Total data laporan:', flatData.length, flatData);
          setLaporanAbsensi(flatData);
        } else {
          console.error('❌ API returned success: false', result);
        }
      } else {
        const response = await fetch(`${BASE_URL}/api/users/inventaris`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        console.log('📦 Response dari /api/users/inventaris:', result);
        if (result.success) {
          console.log('✅ Data inventaris:', result.data);
          setLaporanInventaris(result.data);
        } else {
          console.error('❌ API inventaris returned success: false', result);
        }
      }
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error fetching laporan:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPhoto = (photoPath, title) => {
    if (photoPath && photoPath !== 'auto-closed') {
      setSelectedPhoto({
        url: `${BASE_URL}/${photoPath}`,
        title: title
      });
      setShowPhotoModal(true);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const exportToExcel = () => {
    if (activeTab !== 'absensi' || filteredData.length === 0) {
      alert('Tidak ada data untuk di-export');
      return;
    }

    // Prepare data dengan kolom yang disederhanakan
    const exportData = filteredData.map((item, index) => ({
      'No': index + 1,
      'Nama': item.nama,
      'Tanggal': new Date(item.tanggal).toLocaleDateString('id-ID'),
      'Hari': item.hari,
      'Divisi': item.divisi,
      'Status': item.status === 'sudah' ? 'Hadir' : item.status === 'sedang' ? 'Bertugas' : 'Belum'
    }));

    // Convert to CSV
    const headers = Object.keys(exportData[0]);
    const csvContent = [
      headers.join(','),
      ...exportData.map(row =>
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    // Add BOM for Excel UTF-8 support
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `Laporan_Absensi_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper functions for date filtering
  const getWeekNumber = (d) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
  };

  const isSameWeek = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return getWeekNumber(d1) === getWeekNumber(d2) && d1.getFullYear() === d2.getFullYear();
  };

  const isSameMonth = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
  };

  // Filter Logic
  const getFilteredData = () => {
    let data = activeTab === 'absensi' ? laporanAbsensi : laporanInventaris;

    // 1. Filter by Search Query
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      data = data.filter(item => {
        if (activeTab === 'absensi') {
          return item.nama?.toLowerCase().includes(lowerQuery) ||
            item.hari?.toLowerCase().includes(lowerQuery) ||
            item.status?.toLowerCase().includes(lowerQuery);
        } else {
          return item.nama_barang?.toLowerCase().includes(lowerQuery) ||
            item.kode_barang?.toLowerCase().includes(lowerQuery) ||
            item.status?.toLowerCase().includes(lowerQuery);
        }
      });
    }

    // 2. Filter by Period (Only for Absensi usually, but flexible)
    if (activeTab === 'absensi' && filterPeriod !== 'all') {
      data = data.filter(item => {
        if (filterPeriod === 'weekly') {
          return isSameWeek(item.tanggal, selectedDate);
        } else if (filterPeriod === 'monthly') {
          return isSameMonth(item.tanggal, selectedDate);
        }
        return true;
      });
    }

    return data;
  };

  const filteredData = getFilteredData();

  return (
    <div className="flex bg-gray-50 h-screen overflow-hidden">
      <div className="print:hidden">
        <Sidebar activeMenu="laporan" />
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="print:hidden">
          <Navbar />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 p-6 space-y-6 overflow-x-hidden overflow-y-auto print:p-0 print:bg-white"
        >
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Laporan & Rekapitulasi</h1>
              <p className="text-gray-600">Pantau kinerja tim dan status inventaris secara berkala.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black transition-all border-2 border-black font-medium shadow-sm hover:shadow-md"
              >
                <Printer size={18} /> Cetak Laporan
              </button>
            </div>
          </div>

          {/* Filter & Controls Card */}
          <div className="bg-white p-4 rounded-xl border-2 border-black shadow-sm print:hidden space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Tab Switcher */}
              <div className="flex bg-gray-100 p-1 rounded-lg border-2 border-transparent">
                <button
                  onClick={() => setActiveTab('absensi')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold transition-all ${activeTab === 'absensi'
                    ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <ClipboardList size={18} />
                  Laporan Absensi
                </button>
                <button
                  onClick={() => setActiveTab('inventaris')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold transition-all ${activeTab === 'inventaris'
                    ? 'bg-white text-green-600 shadow-sm border border-gray-200'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <Package size={18} />
                  Laporan Inventaris
                </button>
              </div>

              {/* Search Box */}
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={activeTab === 'absensi' ? "Cari nama, hari, status..." : "Cari nama barang, kode..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border-2 border-gray-200 rounded-lg focus:border-black focus:ring-0 outline-none transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Date Filters (Only for Absensi) */}
            {activeTab === 'absensi' && (
              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <Filter size={18} className="text-gray-500" />
                  <span className="text-sm font-semibold text-gray-700">Filter Periode:</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilterPeriod('all')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all ${filterPeriod === 'all'
                      ? 'bg-gray-800 text-white border-gray-800'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                      }`}
                  >
                    Semua
                  </button>
                  <button
                    onClick={() => setFilterPeriod('weekly')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all ${filterPeriod === 'weekly'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                      }`}
                  >
                    Mingguan
                  </button>
                  <button
                    onClick={() => setFilterPeriod('monthly')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all ${filterPeriod === 'monthly'
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
                      }`}
                  >
                    Bulanan
                  </button>
                </div>

                {filterPeriod !== 'all' && (
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                    <Calendar size={16} className="text-gray-500" />
                    {filterPeriod === 'weekly' ? (
                      <>
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="bg-transparent border-none text-sm font-medium focus:ring-0 outline-none p-0 text-gray-700"
                        />
                        <span className="text-xs text-gray-400 ml-1">(Pilih tanggal dalam minggu)</span>
                      </>
                    ) : (
                      <>
                        <input
                          type="month"
                          value={selectedDate.substring(0, 7)}
                          onChange={(e) => setSelectedDate(e.target.value + '-01')}
                          className="bg-transparent border-none text-sm font-medium focus:ring-0 outline-none p-0 text-gray-700"
                        />
                        <span className="text-xs text-gray-400 ml-1">(Pilih bulan)</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Report Table Card */}
          <div className="bg-white rounded-xl border-2 border-black shadow-sm overflow-hidden print:shadow-none print:border-none">
            {/* Card Header for Print */}
            <div className="hidden print:block p-6 border-b-2 border-black">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm mb-4">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <h2 className="text-2xl font-bold uppercase">Laporan {activeTab}</h2>
                  <p className="text-sm mt-1">
                    Periode: {filterPeriod === 'all' ? 'Semua Data' :
                      filterPeriod === 'weekly' ? 'Mingguan' : 'Bulanan'}
                  </p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-gray-500">Memuat data...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b-2 border-black">
                    <tr>
                      <th className="px-6 py-3 font-bold text-center w-12 border-r border-gray-300">No</th>
                      {activeTab === 'absensi' ? (
                        <>
                          <th className="px-6 py-3 font-bold border-r border-gray-300 print:hidden">Tanggal</th>
                          <th className="px-6 py-3 font-bold border-r border-gray-300 print:hidden">Hari</th>
                          <th className="px-6 py-3 font-bold border-r border-gray-300">Nama Petugas</th>
                          <th className="px-6 py-3 font-bold border-r border-gray-300 hidden print:table-cell">Tanggal</th>
                          <th className="px-6 py-3 font-bold border-r border-gray-300 hidden print:table-cell">Hari</th>
                          <th className="px-6 py-3 font-bold border-r border-gray-300 hidden print:table-cell">Divisi</th>
                          <th className="px-6 py-3 font-bold text-center">Status</th>
                          <th className="px-6 py-3 font-bold border-r border-gray-300 text-center print:hidden">Masuk</th>
                          <th className="px-6 py-3 font-bold border-r border-gray-300 text-center print:hidden">Keluar</th>
                          <th className="px-6 py-3 font-bold border-r border-gray-300 text-center print:hidden">Checklist</th>
                          <th className="px-6 py-3 font-bold text-center print:hidden">Catatan</th>
                        </>
                      ) : (
                        <>
                          <th className="px-6 py-3 font-bold border-r border-gray-300">Kode</th>
                          <th className="px-6 py-3 font-bold border-r border-gray-300">Nama Barang</th>
                          <th className="px-6 py-3 font-bold border-r border-gray-300 text-center">Jumlah</th>
                          <th className="px-6 py-3 font-bold text-center">Status</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredData.length > 0 ? (
                      filteredData.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 border-r border-gray-100 text-center font-medium">{index + 1}</td>
                          {activeTab === 'absensi' ? (
                            <>
                              <td className="px-6 py-4 border-r border-gray-100 font-mono text-gray-600 print:hidden">
                                {new Date(item.tanggal).toLocaleDateString('id-ID')}
                              </td>
                              <td className="px-6 py-4 border-r border-gray-100 capitalize print:hidden">{item.hari}</td>
                              <td className="px-6 py-4 border-r border-gray-100 font-medium text-gray-900">{item.nama}</td>
                              <td className="px-6 py-4 border-r border-gray-100 hidden print:table-cell">
                                {new Date(item.tanggal).toLocaleDateString('id-ID')}
                              </td>
                              <td className="px-6 py-4 border-r border-gray-100 capitalize hidden print:table-cell">{item.hari}</td>
                              <td className="px-6 py-4 border-r border-gray-100 hidden print:table-cell">{item.divisi}</td>
                              <td className="px-6 py-4 text-center">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border print:border-0 print:bg-transparent print:text-black ${item.status === 'sudah' ? 'bg-green-100 text-green-800 border-green-200' :
                                  item.status === 'sedang' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                    'bg-red-100 text-red-800 border-red-200'
                                  }`}>
                                  {item.status === 'sudah' ? 'Hadir' : item.status === 'sedang' ? 'Bertugas' : 'Belum'}
                                </span>
                              </td>
                              <td className="px-6 py-4 border-r border-gray-100 text-center print:hidden">
                                <div className="flex flex-col items-center gap-1">
                                  <span className="font-mono text-sm">{item.waktu_masuk}</span>
                                  {item.foto_path && item.foto_path !== 'auto-closed' && (
                                    <button
                                      onClick={() => handleViewPhoto(item.foto_path, `Foto Masuk - ${item.nama}`)}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors text-xs font-medium border border-blue-200"
                                      title="Lihat foto absen masuk"
                                    >
                                      <ImageIcon size={12} /> Foto
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 border-r border-gray-100 text-center print:hidden">
                                <div className="flex flex-col items-center gap-1">
                                  <span className="font-mono text-sm">{item.waktu_keluar}</span>
                                  {item.foto_path_keluar && item.foto_path_keluar !== 'auto-closed' ? (
                                    <button
                                      onClick={() => handleViewPhoto(item.foto_path_keluar, `Foto Keluar - ${item.nama}`)}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors text-xs font-medium border border-green-200"
                                      title="Lihat foto absen keluar"
                                    >
                                      <ImageIcon size={12} /> Foto
                                    </button>
                                  ) : item.status === 'sudah' && item.foto_path_keluar === 'auto-closed' ? (
                                    <span className="text-xs text-orange-600 font-medium" title="Ditutup otomatis sistem">(Auto)</span>
                                  ) : null}
                                </div>
                              </td>
                              <td className="px-6 py-4 border-r border-gray-100 text-center print:hidden">
                                {item.checklist_submitted ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                                    <CheckCircle size={14} /> Sudah
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                                    <XCircle size={14} /> Belum
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-center print:hidden">
                                {item.note ? (
                                  <div className="flex items-center justify-center gap-2">
                                    <FileText size={14} className="text-blue-600" />
                                    <span className="text-xs text-gray-600 max-w-xs truncate" title={item.note}>
                                      {item.note}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-400">-</span>
                                )}
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-6 py-4 border-r border-gray-100 font-mono text-gray-600">{item.kode_barang || '-'}</td>
                              <td className="px-6 py-4 border-r border-gray-100 font-medium text-gray-900">{item.nama_barang}</td>
                              <td className="px-6 py-4 border-r border-gray-100 text-center font-bold">
                                {item.jumlah}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${!item.status || item.status === 'Baik' || item.status === 'Tersedia' ? 'bg-green-100 text-green-800 border-green-200' :
                                    item.status === 'Rusak' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                      'bg-red-100 text-red-800 border-red-200'
                                  }`}>
                                  {item.status || 'Baik'}
                                </span>
                              </td>
                            </>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={activeTab === 'absensi' ? 9 : 5} className="px-6 py-12 text-center text-gray-500 italic">
                          {searchQuery ? `Tidak ada hasil untuk "${searchQuery}"` : "Tidak ada data laporan untuk periode ini."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Signature Section - Printed Only */}
            <div className="hidden print:flex mt-16 justify-end px-12 pb-12">
              <div className="text-center">
                <p className="mb-1">Padang, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="mb-20 font-bold">Gubernur BEM KM FTI</p>
                <p className="font-bold border-b border-black pb-1 inline-block min-w-[250px]">( ........................................... )</p>
                <p className="mt-1 text-sm text-left">NIM:</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Photo Modal */}
        {showPhotoModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setShowPhotoModal(false)}>
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900">{selectedPhoto.title}</h3>
                <button
                  onClick={() => setShowPhotoModal(false)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 flex items-center justify-center bg-gray-100">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.title}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EGambar tidak tersedia%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LaporanPage;
