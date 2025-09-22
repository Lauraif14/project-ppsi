// src/pages/LaporanPage.jsx
import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Users, Package, CalendarDays, Eye, Trash2, Download } from "lucide-react";
import html2canvas from "html2canvas";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const dummyAbsensi = [
  { id: 1, name: "Ahmad Rizki", date: "2025-09-01", status: "Hadir", time: "08:00" },
  { id: 2, name: "Siti Nurhaliza", date: "2025-09-01", status: "Tidak Hadir", time: "-" },
  { id: 3, name: "Budi Santoso", date: "2025-09-01", status: "Hadir", time: "08:15" },
  { id: 4, name: "Rina Marlina", date: "2025-09-01", status: "Izin", time: "-" },
];

const dummyInventaris = [
  { id: 1, item: "Kursi Plastik", date: "2025-09-01", checkedBy: "Ahmad Rizki", condition: "Baik", quantity: 50 },
  { id: 2, item: "Meja Lipat", date: "2025-09-01", checkedBy: "Siti Nurhaliza", condition: "Hilang", quantity: 25 },
  { id: 3, item: "Sound System", date: "2025-09-01", checkedBy: "Budi Santoso", condition: "Baik", quantity: 2 },
  { id: 4, item: "Proyektor", date: "2025-09-01", checkedBy: "Rina Marlina", condition: "Dipinjam", quantity: 1 },
];

const LaporanPage = () => {
  const [dataType, setDataType] = useState("absensi");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const tableRef = useRef();

  // Filter data sesuai tanggal
  const data = dataType === "absensi"
    ? dummyAbsensi.filter(d => d.date === selectedDate)
    : dummyInventaris.filter(d => d.date === selectedDate);

  // Statistik
  const absensiStats = {
    hadir: data.filter(item => item.status === "Hadir").length,
    tidak: data.filter(item => item.status === "Tidak Hadir").length,
    izin: data.filter(item => item.status === "Izin").length,
    total: data.length
  };

  const inventarisStats = {
    baik: data.filter(item => item.condition === "Baik").length,
    hilang: data.filter(item => item.condition === "Hilang").length,
    dipinjam: data.filter(item => item.condition === "Dipinjam").length,
    total: data.length
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      "Hadir": "bg-green-200 text-green-900",
      "Tidak Hadir": "bg-red-200 text-red-900",
      "Izin": "bg-yellow-200 text-yellow-900"
    };
    return statusConfig[status] || "bg-gray-200 text-gray-900";
  };

  const getConditionBadge = (condition) => {
    const conditionConfig = {
      "Baik": "bg-green-200 text-green-900",
      "Hilang": "bg-red-200 text-red-900",
      "Dipinjam": "bg-yellow-200 text-yellow-900"
    };
    return conditionConfig[condition] || "bg-gray-200 text-gray-900";
  };

  const handleExport = () => {
    if (tableRef.current) {
      // hide semua button sementara
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
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-300 to-blue-400 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 border-2 border-black"
              >
                <Download size={18} />
                Export
              </button>
            </div>
          </div>

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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                      <p className="text-sm">Kondisi Baik</p>
                      <p className="text-2xl font-bold">{inventarisStats.baik}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-red-100 p-4 rounded-xl text-red-900 shadow-md border-2 border-black">
                  <div className="flex items-center">
                    <Package size={20} className="mr-3" />
                    <div>
                      <p className="text-sm">Hilang</p>
                      <p className="text-2xl font-bold">{inventarisStats.hilang}</p>
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
                <div className="bg-blue-100 p-4 rounded-xl text-blue-900 shadow-md border-2 border-black">
                  <div className="flex items-center">
                    <Package size={20} className="mr-3" />
                    <div>
                      <p className="text-sm">Total Item</p>
                      <p className="text-2xl font-bold">{inventarisStats.total}</p>
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dicek Oleh</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kondisi</th>
                      </>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
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
                              {item.name.charAt(0)}
                            </div>
                            {item.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.time}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(item.status)}`}>
                              {item.status}
                            </span>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap flex items-center">
                            <div className="w-8 h-8 bg-green-200 text-green-900 rounded-lg flex items-center justify-center mr-3">
                              <Package size={16} />
                            </div>
                            {item.item}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity} unit</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.checkedBy}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConditionBadge(item.condition)}`}>
                              {item.condition}
                            </span>
                          </td>
                        </>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors">
                            <Eye size={16} />
                          </button>
                          <button className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LaporanPage;
