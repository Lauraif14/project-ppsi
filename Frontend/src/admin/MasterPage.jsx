// src/pages/MasterPage.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Users, Package, Edit, Trash2, Upload, Plus } from "lucide-react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const dummyPengurus = [
  { id: 1, name: "Ahmad Rizki", role: "Ketua" },
  { id: 2, name: "Siti Nurhaliza", role: "Sekretaris" },
  { id: 3, name: "Budi Santoso", role: "Bendahara" },
  { id: 4, name: "Rina Marlina", role: "Anggota" },
];

const dummyInventaris = [
  { id: 1, item: "Kursi Plastik", quantity: 50 },
  { id: 2, item: "Meja Lipat", quantity: 25 },
  { id: 3, item: "Sound System", quantity: 2 },
  { id: 4, item: "Proyektor", quantity: 1 },
];

const MasterPage = () => {
  const [activeMenu, setActiveMenu] = useState("master");
  const [dataType, setDataType] = useState("pengurus");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");

  const handleOpenModal = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalType("");
  };

  const data = dataType === "pengurus" ? dummyPengurus : dummyInventaris;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
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
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Data Master</h1>
              <p className="text-gray-600">Kelola data pengurus dan inventaris BESTI</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleOpenModal("upload")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border-2 border-black text-gray-700 font-medium shadow-sm hover:bg-gray-50 hover:shadow-md transition-all duration-200"
              >
                <Upload size={18} /> Upload File
              </button>
              <button
                onClick={() => handleOpenModal("manual")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-pink-600 text-white font-medium shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 border-2 border-black"
              >
                <Plus size={18} /> Tambah Data
              </button>
            </div>
          </div>

          {/* Tab Buttons */}
          <div className="flex gap-2 bg-white p-1 rounded-lg shadow-sm border-2 border-black w-fit">
            <button
              className={`px-4 py-2 rounded-md font-medium transition-all duration-200 border-2 ${
                dataType === "pengurus"
                  ? "bg-pink-500 text-white shadow-md border-black"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-transparent hover:border-gray-300"
              }`}
              onClick={() => setDataType("pengurus")}
            >
              <Users size={16} className="inline mr-2" />
              Data Pengurus
            </button>
            <button
              className={`px-4 py-2 rounded-md font-medium transition-all duration-200 border-2 ${
                dataType === "inventaris"
                  ? "bg-green-500 text-white shadow-md border-black"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-transparent hover:border-gray-300"
              }`}
              onClick={() => setDataType("inventaris")}
            >
              <Package size={16} className="inline mr-2" />
              Data Inventaris
            </button>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-xl shadow-sm border-2 border-black overflow-hidden">
            <div className="px-6 py-4 border-b-2 border-black">
              <h2 className="text-lg font-semibold text-gray-900">
                {dataType === "pengurus" ? "📋 Daftar Pengurus" : "📦 Daftar Inventaris"}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {dataType === "pengurus" 
                  ? `Menampilkan ${data.length} data pengurus`
                  : `Menampilkan ${data.length} jenis barang inventaris`
                }
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                    {dataType === "pengurus" ? (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Lengkap</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jabatan</th>
                      </>
                    ) : (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Barang</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                      </>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((item, index) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {index + 1}
                      </td>
                      {dataType === "pengurus" ? (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3">
                                {item.name.charAt(0)}
                              </div>
                              <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-pink-100 text-pink-800">
                              {item.role}
                            </span>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-500 rounded-lg flex items-center justify-center text-white mr-3">
                                <Package size={16} />
                              </div>
                              <div className="text-sm font-medium text-gray-900">{item.item}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              {item.quantity} unit
                            </span>
                          </td>
                        </>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors">
                            <Edit size={16} />
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

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl w-full max-w-md shadow-2xl border-2 border-black"
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {modalType === "upload" ? "📤 Upload Data" : "✏️ Tambah Data Manual"}
                  </h3>

                  {modalType === "upload" ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pilih file (.xlsx, .csv)
                        </label>
                        <div className="border-2 border-dashed border-black rounded-lg p-6 text-center hover:border-gray-600 transition-colors">
                          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                          <input 
                            type="file" 
                            accept=".xlsx,.csv" 
                            className="hidden" 
                            id="fileInput"
                          />
                          <label htmlFor="fileInput" className="cursor-pointer">
                            <span className="text-sm text-gray-600">Klik untuk upload atau drag file di sini</span>
                          </label>
                        </div>
                      </div>
                      <button className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 border-2 border-black">
                        Upload File
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {dataType === "pengurus" ? (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                            <input
                              type="text"
                              placeholder="Masukkan nama lengkap"
                              className="w-full px-3 py-2 border-2 border-black rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
                            <select className="w-full px-3 py-2 border-2 border-black rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-colors">
                              <option value="">Pilih Jabatan</option>
                              <option value="Ketua">Ketua</option>
                              <option value="Sekretaris">Sekretaris</option>
                              <option value="Bendahara">Bendahara</option>
                              <option value="Anggota">Anggota</option>
                            </select>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Barang</label>
                            <input
                              type="text"
                              placeholder="Masukkan nama barang"
                              className="w-full px-3 py-2 border-2 border-black rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
                            <input
                              type="number"
                              placeholder="Masukkan jumlah barang"
                              min="1"
                              className="w-full px-3 py-2 border-2 border-black rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                            />
                          </div>
                        </>
                      )}
                      <button 
                        className={`w-full text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 border-2 border-black ${
                          dataType === "pengurus" 
                            ? "bg-gradient-to-r from-pink-500 to-pink-600" 
                            : "bg-gradient-to-r from-green-500 to-green-600"
                        }`}
                      >
                        Simpan Data
                      </button>
                    </div>
                  )}

                  <div className="flex gap-2 mt-4 pt-4 border-t-2 border-black">
                    <button
                      onClick={handleCloseModal}
                      className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors border-2 border-black"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MasterPage;