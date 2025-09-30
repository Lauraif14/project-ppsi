// src/pages/MasterPage.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Package, Edit, Trash2, Upload, Plus, Download, FileText } from "lucide-react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const MasterPage = () => {
  const [activeMenu, setActiveMenu] = useState("master");
  const [dataType, setDataType] = useState("pengurus");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");

  // State untuk data dari database
  const [pengurusData, setPengurusData] = useState([]);
  const [inventarisData, setInventarisData] = useState([]); // Tambahkan state inventaris
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk upload
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchPengurus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Token tidak ditemukan. Silakan login kembali.');
        return;
      }

      const response = await fetch('http://localhost:5000/api/users/pengurus', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        setPengurusData(result.data);
        setError(null);
      } else {
        setError(result.message || 'Error fetching pengurus');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Error fetching pengurus:', err);
    } finally {
      setLoading(false);
    }
  };

  // Tambahkan fungsi fetch inventaris
  const fetchInventaris = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Token tidak ditemukan. Silakan login kembali.');
        return;
      }

      const response = await fetch('http://localhost:5000/api/users/inventaris', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        setInventarisData(result.data);
        setError(null);
      } else {
        setError(result.message || 'Error fetching inventaris');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Error fetching inventaris:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load data saat component mount dan saat dataType berubah
  useEffect(() => {
    if (dataType === 'pengurus') {
      fetchPengurus();
    } else {
      fetchInventaris();
    }
  }, [dataType]);

  const handleOpenModal = (type) => {
    setModalType(type);
    setShowModal(true);
    setUploadResult(null);
    setSelectedFile(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalType("");
    setUploadResult(null);
    setSelectedFile(null);
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert('Pilih file terlebih dahulu');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setUploading(true);
      const token = localStorage.getItem('token');
      
      const endpoint = dataType === 'pengurus' 
        ? 'http://localhost:5000/api/users/pengurus/bulk'
        : 'http://localhost:5000/api/users/inventaris/bulk';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setUploadResult(result.data);
        // Refresh data setelah upload berhasil
        if (dataType === 'pengurus') {
          fetchPengurus();
        } else {
          fetchInventaris();
        }
      } else {
        alert(result.message || 'Upload gagal');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Terjadi kesalahan saat upload');
    } finally {
      setUploading(false);
    }
  };

  // Download template Excel
  const downloadTemplate = () => {
    if (dataType === 'pengurus') {
      // Create template CSV dengan field lengkap
      const csvContent = "nama_lengkap,username,email,divisi,jabatan\n" +
        "John Doe,john.doe,john.doe@email.com,Teknologi Informasi,Ketua\n" +
        "Jane Smith,jane.smith,jane.smith@email.com,Administrasi,Sekretaris\n" +
        "Bob Johnson,bob.johnson,bob.johnson@email.com,Keuangan,Bendahara\n" +
        "Alice Brown,alice.brown,alice.brown@email.com,Teknologi Informasi,Anggota";
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'template_pengurus.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      const csvContent = "nama_barang,jumlah\n" +
        "Kursi Plastik,50\n" +
        "Meja Lipat,25\n" +
        "Sound System,2\n" +
        "Proyektor,1";
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'template_inventaris.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  // Gunakan data dari database untuk pengurus dan inventaris
  const data = dataType === "pengurus" ? pengurusData : inventarisData;

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading data {dataType}...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p className="font-bold">Error</p>
                <p>{error}</p>
                <button 
                  onClick={dataType === 'pengurus' ? fetchPengurus : fetchInventaris}
                  className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          {/* Header - tetap sama */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Data Master</h1>
              <p className="text-gray-600">Kelola data pengurus dan inventaris BESTI</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white font-medium shadow-sm hover:bg-blue-600 transition-all duration-200 border-2 border-black"
              >
                <Download size={18} /> Template
              </button>
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

          {/* Tab Buttons - tetap sama */}
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

          {/* Data Table - update untuk inventaris dari database */}
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
                  {data.length > 0 ? (
                    data.map((item, index) => (
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
                                  {item.nama_lengkap?.charAt(0) || 'N'}
                                </div>
                                <div className="text-sm font-medium text-gray-900">{item.nama_lengkap || 'N/A'}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-pink-100 text-pink-800">
                                {item.jabatan || 'N/A'}
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
                                <div className="text-sm font-medium text-gray-900">{item.nama_barang}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                {item.jumlah} unit
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
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                        {dataType === "pengurus" ? "Tidak ada data pengurus" : "Tidak ada data inventaris"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Enhanced Modal with Upload Features */}
          {showModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl border-2 border-black"
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {modalType === "upload" ? "📤 Upload Data Bulk" : "✏️ Tambah Data Manual"}
                  </h3>

                  {modalType === "upload" ? (
                    <div className="space-y-4">
                      {/* File Upload Section */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pilih file (.xlsx, .csv)
                        </label>
                        <div className="border-2 border-dashed border-black rounded-lg p-6 text-center hover:border-gray-600 transition-colors">
                          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                          <input 
                            type="file" 
                            accept=".xlsx,.csv,.xls" 
                            className="hidden" 
                            id="fileInput"
                            onChange={(e) => setSelectedFile(e.target.files[0])}
                          />
                          <label htmlFor="fileInput" className="cursor-pointer">
                            <span className="text-sm text-gray-600">
                              {selectedFile ? selectedFile.name : 'Klik untuk upload atau drag file di sini'}
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* Instructions */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">Format File:</h4>
                        <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
                          {dataType === 'pengurus' ? (
                            <>
                              <li>Kolom: nama_lengkap, username, email, divisi, jabatan</li>
                              <li>Contoh: John Doe, john.doe, john@email.com, IT, Ketua</li>
                              <li>Password default: <strong>123456</strong> (akan di-generate otomatis)</li>
                            </>
                          ) : (
                            <>
                              <li>Kolom: nama_barang, jumlah</li>
                              <li>Contoh: Kursi Plastik, 50</li>
                            </>
                          )}
                        </ul>
                      </div>

                      {/* Upload Button */}
                      <button 
                        onClick={handleFileUpload}
                        disabled={uploading || !selectedFile}
                        className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {uploading ? 'Mengupload...' : 'Upload File'}
                      </button>

                      {/* Upload Results */}
                      {uploadResult && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">Hasil Upload:</h4>
                          <div className="text-sm space-y-1">
                            <p className="text-green-600">✅ Berhasil: {uploadResult.total_success} data</p>
                            <p className="text-red-600">❌ Gagal: {uploadResult.total_errors} data</p>
                          </div>
                          
                          {uploadResult.errors.length > 0 && (
                            <div className="mt-3">
                              <p className="font-medium text-red-700">Error Details:</p>
                              <ul className="text-xs text-red-600 max-h-32 overflow-y-auto">
                                {uploadResult.errors.map((error, index) => (
                                  <li key={index}>• {error}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Manual form - dalam modal
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <input
                              type="text"
                              placeholder="Masukkan username"
                              className="w-full px-3 py-2 border-2 border-black rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                              type="email"
                              placeholder="Masukkan email"
                              className="w-full px-3 py-2 border-2 border-black rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Divisi</label>
                            <input
                              type="text"
                              placeholder="Masukkan divisi"
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
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <p className="text-sm text-yellow-800">
                              <strong>Info:</strong> Password default <strong>123456</strong> akan di-generate otomatis
                            </p>
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