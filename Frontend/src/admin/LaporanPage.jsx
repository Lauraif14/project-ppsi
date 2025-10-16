import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Eye, Download, CalendarDays } from "lucide-react";
import html2canvas from "html2canvas";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../api/axios";

// 🔹 Modal Detail Inventaris
const DetailInventarisModal = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 border-2 border-black">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            🧾 Detail Inventaris — {data.checkedBy}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-red-500 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
          <thead className="bg-gray-100 border-b border-gray-300">
            <tr>
              <th className="px-4 py-2 text-left">Nama Barang</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Catatan</th>
            </tr>
          </thead>
          <tbody>
            {data.items && data.items.length > 0 ? (
              data.items.map((item, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-gray-50 border-b border-gray-200"
                >
                  <td className="px-4 py-2">{item.nama}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        item.status === "Baik" || item.status === "Tersedia"
                          ? "bg-green-200 text-green-900"
                          : item.status === "Rusak" || item.status === "Hilang"
                          ? "bg-red-200 text-red-900"
                          : "bg-yellow-200 text-yellow-900"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">{item.catatan || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center py-4 text-gray-500">
                  Tidak ada data inventaris
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium border-2 border-black"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

const LaporanPage = () => {
  const [dataType, setDataType] = useState("piket");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [laporanPiket, setLaporanPiket] = useState([]);
  const [laporanInventaris, setLaporanInventaris] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInventaris, setSelectedInventaris] = useState(null);
  const tableRef = useRef();

// 🔹 Ambil Data Piket (Admin)
useEffect(() => {
  if (dataType === "piket") {
    const fetchPiket = async () => {
      try {
        const res = await api.get(`/laporan/piket?date=${selectedDate}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        console.log("📋 Data piket:", res.data);
        // ✅ perbaikan di sini
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.data || [];
        setLaporanPiket(data);
        setLaporanInventaris([]); // reset biar gak nyampur
      } catch (error) {
        console.error("❌ Gagal mengambil data piket:", error);
        setLaporanPiket([]);
      }
    };
    fetchPiket();
  }
}, [dataType, selectedDate]);

// 🔹 Ambil Data Inventaris (Admin)
useEffect(() => {
  if (dataType === "inventaris") {
    const fetchInventaris = async () => {
      try {
        const res = await api.get(`/laporan/inventaris?date=${selectedDate}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        // ✅ perbaikan di sini juga
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.data || [];
        setLaporanInventaris(data);
        setLaporanPiket([]); // reset biar gak nyampur
      } catch (error) {
        console.error("❌ Gagal mengambil laporan inventaris:", error);
        setLaporanInventaris([]);
      }
    };
    fetchInventaris();
  }
}, [dataType, selectedDate]);

  // 🔹 Statistik
  const stats =
    dataType === "piket"
      ? {
          hadir: laporanPiket.filter((i) => i.status === "Hadir").length,
          tidak: laporanPiket.filter((i) => i.status === "Tidak Hadir").length,
          izin: laporanPiket.filter((i) => i.status === "Izin").length,
          total: laporanPiket.length,
        }
      : {
          baik: laporanInventaris.filter(
            (i) => i.condition === "Baik" || i.condition === "Tersedia"
          ).length,
          rusak: laporanInventaris.filter((i) => i.condition === "Rusak").length,
          hilang: laporanInventaris.filter(
            (i) => i.condition === "Hilang"
          ).length,
          total: laporanInventaris.length,
        };

  // 🔹 Export ke PNG
  const handleExport = () => {
    if (tableRef.current) {
      const buttons = tableRef.current.querySelectorAll("button");
      buttons.forEach((btn) => (btn.style.display = "none"));
      html2canvas(tableRef.current, { scale: 2 })
        .then((canvas) => {
          const link = document.createElement("a");
          link.download = `laporan_${dataType}_${selectedDate}.png`;
          link.href = canvas.toDataURL("image/png");
          link.click();
        })
        .finally(() => {
          buttons.forEach((btn) => (btn.style.display = "inline-block"));
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
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Laporan Harian
              </h1>
              <p className="text-gray-600">
                Pantau piket dan inventaris setiap hari
              </p>
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

          {/* Tabs */}
          <div className="flex gap-2 bg-white p-1 rounded-lg shadow-sm border-2 border-black w-fit">
            {[
              { key: "piket", label: "🗓️ Piket" },
              { key: "inventaris", label: "📦 Inventaris" },
            ].map((tab) => (
              <button
                key={tab.key}
                className={`px-4 py-2 rounded-md font-medium transition-all duration-200 border-2 ${
                  dataType === tab.key
                    ? "bg-blue-300 text-white shadow-md border-black"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-transparent hover:border-gray-300"
                }`}
                onClick={() => setDataType(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Statistik */}
          {dataType === "piket" ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[ 
                { label: "Hadir", color: "green", value: stats.hadir },
                { label: "Tidak Hadir", color: "red", value: stats.tidak },
                { label: "Izin", color: "yellow", value: stats.izin },
                { label: "Total", color: "blue", value: stats.total },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`bg-${stat.color}-100 p-4 rounded-xl text-${stat.color}-900 shadow-md border-2 border-black`}
                >
                  <p className="text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: "Baik/Tersedia", color: "green", value: stats.baik },
                { label: "Rusak", color: "yellow", value: stats.rusak },
                { label: "Hilang", color: "red", value: stats.hilang },
                { label: "Total", color: "blue", value: stats.total },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`bg-${stat.color}-100 p-4 rounded-xl text-${stat.color}-900 shadow-md border-2 border-black`}
                >
                  <p className="text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Tabel Data */}
          <div
            ref={tableRef}
            className="bg-white rounded-xl shadow-sm border-2 border-black overflow-hidden mt-4"
          >
            <div className="px-6 py-4 border-b-2 border-black">
              <h2 className="text-lg font-semibold text-gray-900">
                {dataType === "piket"
                  ? "📋 Laporan Piket"
                  : "📦 Laporan Inventaris"}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Data tanggal {selectedDate} •{" "}
                {dataType === "piket"
                  ? laporanPiket.length
                  : laporanInventaris.length}{" "}
                entri
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      No
                    </th>
                    {dataType === "piket" ? (
                      <>
                        <th className="px-6 py-3">Nama</th>
                        <th className="px-6 py-3">Jam Masuk</th>
                        <th className="px-6 py-3">Jam Keluar</th>
                        <th className="px-6 py-3">Durasi (menit)</th>
                        <th className="px-6 py-3">Status</th>
                      </>
                    ) : (
                      <>
                        <th className="px-6 py-3">Nama Barang</th>
                        <th className="px-6 py-3">Kondisi</th>
                        <th className="px-6 py-3">Dicek Oleh</th>
                      </>
                    )}
                    <th className="px-6 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {dataType === "piket"
                    ? laporanPiket.map((item, index) => (
                        <tr
                          key={item.id || index}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">{index + 1}</td>
                          <td className="px-6 py-4">{item.nama}</td>
                          <td className="px-6 py-4">{item.jam_masuk}</td>
                          <td className="px-6 py-4">{item.jam_keluar}</td>
                          <td className="px-6 py-4">{item.durasi}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                item.status === "Hadir"
                                  ? "bg-green-200 text-green-900"
                                  : item.status === "Izin"
                                  ? "bg-yellow-200 text-yellow-900"
                                  : "bg-red-200 text-red-900"
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Eye size={16} className="text-gray-400" />
                          </td>
                        </tr>
                      ))
                    : laporanInventaris.map((item, index) => (
                        <tr
                          key={item.id || index}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">{index + 1}</td>
                          <td className="px-6 py-4">{item.item}</td>
                          <td className="px-6 py-4">{item.condition}</td>
                          <td className="px-6 py-4">{item.checkedBy}</td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => {
                                setSelectedInventaris({
                                  checkedBy: item.checkedBy,
                                  items: laporanInventaris.filter(
                                    (i) =>
                                      i.checkedBy === item.checkedBy &&
                                      i.tanggal === selectedDate
                                  ),
                                });
                                setModalOpen(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors"
                            >
                              <Eye size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal Inventaris */}
          <DetailInventarisModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            data={selectedInventaris}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default LaporanPage;
