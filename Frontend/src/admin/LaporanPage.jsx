import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Download, Printer, ClipboardList, Package, Filter, Calendar, Search, X } from 'lucide-react';
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

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      if (activeTab === 'absensi') {
        const response = await fetch(`${BASE_URL}/api/jadwal`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (result.success) {
          const flatData = [];
          result.data.forEach(day => {
            day.pengurus.forEach(p => {
              flatData.push({
                tanggal: day.tanggal,
                hari: day.hari,
                nama: p.nama_lengkap,
                status: p.status,
                waktu_masuk: p.waktu_masuk || '-',
                waktu_keluar: p.waktu_keluar || '-'
              });
            });
          });
          // Sort by date descending
          flatData.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
          setLaporanAbsensi(flatData);
        }
      } else {
        const response = await fetch(`${BASE_URL}/api/users/inventaris`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (result.success) {
          setLaporanInventaris(result.data);
        }
      }
    } catch (error) {
      console.error("Error fetching laporan:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
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
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="bg-transparent border-none text-sm font-medium focus:ring-0 outline-none p-0 text-gray-700"
                    />
                    <span className="text-xs text-gray-400 ml-1">
                      {filterPeriod === 'weekly' ? '(Pilih tanggal dalam minggu)' : '(Pilih tanggal dalam bulan)'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Report Table Card */}
          <div className="bg-white rounded-xl border-2 border-black shadow-sm overflow-hidden print:shadow-none print:border-none">
            {/* Card Header for Print */}
            <div className="hidden print:block p-6 border-b-2 border-black">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold uppercase">Laporan {activeTab}</h2>
                  <p className="text-sm mt-1">
                    Periode: {filterPeriod === 'all' ? 'Semua Data' :
                      filterPeriod === 'weekly' ? 'Mingguan' : 'Bulanan'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">BESTI APP</p>
                  <p className="text-sm">{new Date().toLocaleDateString('id-ID')}</p>
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
                          <th className="px-6 py-3 font-bold border-r border-gray-300">Tanggal</th>
                          <th className="px-6 py-3 font-bold border-r border-gray-300">Hari</th>
                          <th className="px-6 py-3 font-bold border-r border-gray-300">Nama Petugas</th>
                          <th className="px-6 py-3 font-bold border-r border-gray-300 text-center">Status</th>
                          <th className="px-6 py-3 font-bold border-r border-gray-300 text-center">Masuk</th>
                          <th className="px-6 py-3 font-bold text-center">Keluar</th>
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
                              <td className="px-6 py-4 border-r border-gray-100 font-mono text-gray-600">
                                {new Date(item.tanggal).toLocaleDateString('id-ID')}
                              </td>
                              <td className="px-6 py-4 border-r border-gray-100 capitalize">{item.hari}</td>
                              <td className="px-6 py-4 border-r border-gray-100 font-medium text-gray-900">{item.nama}</td>
                              <td className="px-6 py-4 border-r border-gray-100 text-center">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${item.status === 'sudah' ? 'bg-green-100 text-green-800 border-green-200' :
                                  item.status === 'sedang' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                    'bg-red-100 text-red-800 border-red-200'
                                  }`}>
                                  {item.status === 'sudah' ? 'Hadir' : item.status === 'sedang' ? 'Bertugas' : 'Belum'}
                                </span>
                              </td>
                              <td className="px-6 py-4 border-r border-gray-100 text-center font-mono">{item.waktu_masuk}</td>
                              <td className="px-6 py-4 text-center font-mono">{item.waktu_keluar}</td>
                            </>
                          ) : (
                            <>
                              <td className="px-6 py-4 border-r border-gray-100 font-mono text-gray-600">{item.kode_barang || '-'}</td>
                              <td className="px-6 py-4 border-r border-gray-100 font-medium text-gray-900">{item.nama_barang}</td>
                              <td className="px-6 py-4 border-r border-gray-100 text-center font-bold">
                                {item.jumlah}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${item.status === 'Tersedia' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'
                                  }`}>
                                  {item.status}
                                </span>
                              </td>
                            </>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={activeTab === 'absensi' ? 7 : 5} className="px-6 py-12 text-center text-gray-500 italic">
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
                <p className="mb-1 font-medium">Jakarta, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="mb-20 font-bold">Kepala Bagian Umum</p>
                <p className="font-bold border-b border-black pb-1 inline-block min-w-[200px]">( ........................................... )</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LaporanPage;
