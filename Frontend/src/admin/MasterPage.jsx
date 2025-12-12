// src/pages/MasterPage.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Package, Edit, Trash2, Upload, Plus, Download, FileText } from "lucide-react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
// TAMBAHKAN IMPORT AddUserForm
import AddUserForm from "../components/AddUserForm";

const MasterPage = () => {
  const [activeMenu, setActiveMenu] = useState("master");
  const [dataType, setDataType] = useState("pengurus");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");

  // TAMBAHKAN STATE UNTUK AddUserForm
  const [showAddUserForm, setShowAddUserForm] = useState(false);

  // State untuk data dari database
  const [pengurusData, setPengurusData] = useState([]);
  const [inventarisData, setInventarisData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk upload
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // State untuk form inventaris manual - tambahkan status
  const [inventarisForm, setInventarisForm] = useState({
    nama_barang: '',
    kode_barang: '',
    jumlah: '',
    status: 'Tersedia'
  });

  const fetchPengurus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Token tidak ditemukan. Silakan login kembali.');
        return;
      }

      // GANTI endpoint ini sesuai dengan yang digunakan di UserManagementPage
      const response = await fetch('http://localhost:5000/api/users/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 MasterPage fetch response:', response.status);

      const result = await response.json();
      console.log('📄 MasterPage fetch result:', result);

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

  // UPDATE handleOpenModal untuk membedakan pengurus dan inventaris
  const handleOpenModal = (type) => {
    if (type === "manual" && dataType === "pengurus") {
      // Buka AddUserForm untuk pengurus
      setShowAddUserForm(true);
    } else {
      // Buka modal biasa untuk upload atau tambah inventaris
      setModalType(type);
      setShowModal(true);
      setUploadResult(null);
      setSelectedFile(null);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalType("");
    setUploadResult(null);
    setSelectedFile(null);
    setInventarisForm({ 
      nama_barang: '', 
      kode_barang: '', 
      jumlah: '',
      status: 'Tersedia'
    });
  };

  // FUNGSI CALLBACK SAAT USER DITAMBAHKAN DARI AddUserForm
  const handleUserAdded = (newUser) => {
    // Tambahkan user baru ke state pengurus
    setPengurusData(prev => [...prev, newUser]);
    console.log('New user added to master page:', newUser);
  };

  // FUNGSI UNTUK SUBMIT INVENTARIS MANUAL
  const handleSubmitInventaris = async () => {
    if (!inventarisForm.nama_barang.trim() || !inventarisForm.jumlah) {
      alert('❌ Nama barang dan jumlah harus diisi!');
      return;
    }

    if (parseInt(inventarisForm.jumlah) <= 0) {
      alert('❌ Jumlah harus lebih dari 0!');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/users/inventaris/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nama_barang: inventarisForm.nama_barang.trim(),
          kode_barang: inventarisForm.kode_barang.trim() || null,
          jumlah: parseInt(inventarisForm.jumlah),
          status: inventarisForm.status
        })
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ Inventaris berhasil ditambahkan!\n\nBarang: ${result.data.nama_barang}\nKode: ${result.data.kode_barang || 'N/A'}\nJumlah: ${result.data.jumlah} unit\nStatus: ${result.data.status}`);
        
        // Refresh data inventaris
        fetchInventaris();
        
        // Close modal dan reset form
        handleCloseModal();
      } else {
        alert('❌ Gagal menambahkan inventaris: ' + result.message);
      }
    } catch (error) {
      console.error('Error adding inventaris:', error);
      alert('❌ Terjadi kesalahan: ' + error.message);
    }
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

  // Tambahkan function untuk status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      "Tersedia": "bg-green-200 text-green-900",
      "Habis": "bg-red-200 text-red-900",
      "Dipinjam": "bg-yellow-200 text-yellow-900",
      "Rusak": "bg-orange-200 text-orange-900",
      "Hilang": "bg-gray-200 text-gray-900"
    };
    return statusConfig[status] || "bg-gray-200 text-gray-900";
  };

  // Tambahkan fungsi delete inventaris - TAMBAHKAN SETELAH getStatusBadge
  const handleDeleteInventaris = async (id, namaBarang) => {
    if (!window.confirm(`Yakin ingin menghapus inventaris "${namaBarang}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/users/inventaris/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ Inventaris "${namaBarang}" berhasil dihapus!`);
        fetchInventaris(); // Refresh data
      } else {
        alert('❌ Gagal menghapus inventaris: ' + result.message);
      }
    } catch (error) {
      console.error('Error deleting inventaris:', error);
      alert('❌ Terjadi kesalahan: ' + error.message);
    }
  };

  // Download template Excel
  const downloadTemplate = () => {
    if (dataType === 'pengurus') {
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
      // UPDATE template inventaris - kode_barang dibiarkan kosong
      const csvContent = "nama_barang,kode_barang,jumlah,status\n" +
        "Kursi Plastik,,50,Tersedia\n" +
        "Meja Lipat,,25,Tersedia\n" +
        "Sound System,,2,Dipinjam\n" +
        "Proyektor,,1,Rusak\n" +
        "Kabel HDMI,,5,Tersedia";
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'template_inventaris.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

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
          {/* Header */}
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
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 border-2 border-black ${
                  dataType === "pengurus" 
                    ? "bg-gradient-to-r from-pink-500 to-pink-600" 
                    : "bg-gradient-to-r from-green-500 to-green-600"
                }`}
              >
                <Plus size={18} /> 
                {dataType === "pengurus" ? "Tambah Pengurus" : "Tambah Inventaris"}
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jabatan</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Divisi</th>
                      </>
                    ) : (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Barang</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode Barang</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                      </>
                    )}
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.username || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.email || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-pink-100 text-pink-800">
                                {item.jabatan || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                {item.divisi || 'N/A'}
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
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{item.nama_barang}</div>
                                  {item.kode_barang && (
                                    <div className="text-xs text-gray-500">Kode: {item.kode_barang}</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {item.kode_barang || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                {item.jumlah} unit
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(item.status || 'Tersedia')}`}>
                                {item.status || 'Tersedia'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button 
                                onClick={() => handleDeleteInventaris(item.id, item.nama_barang)}
                                className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition-colors"
                                title="Hapus inventaris"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={dataType === "pengurus" ? "6" : "6"} className="px-6 py-4 text-center text-gray-500">
                        {dataType === "pengurus" ? "Tidak ada data pengurus" : "Tidak ada data inventaris"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* TAMBAHKAN AddUserForm Component */}
          <AddUserForm
            isOpen={showAddUserForm}
            onClose={() => setShowAddUserForm(false)}
            onUserAdded={handleUserAdded}
          />

          {/* Modal untuk Upload dan Manual Inventaris */}
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
                    {modalType === "upload" 
                      ? "📤 Upload Data Bulk" 
                      : `✏️ Tambah ${dataType === "pengurus" ? "Pengurus" : "Inventaris"} Manual`
                    }
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
                              <li>Kolom wajib: nama_barang, jumlah</li>
                              <li>Kolom opsional: kode_barang (biarkan kosong), status</li>
                              <li>Status yang valid: Tersedia, Habis, Dipinjam, Rusak, Hilang</li>
                              <li>Contoh: Kursi Plastik, , 50, Tersedia</li>
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
                          
                          {uploadResult.errors && uploadResult.errors.length > 0 && (
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
                    // Form Manual untuk Inventaris saja (Pengurus sudah menggunakan AddUserForm)
                    dataType === "inventaris" && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Barang</label>
                          <input
                            type="text"
                            placeholder="Masukkan nama barang"
                            value={inventarisForm.nama_barang}
                            onChange={(e) => setInventarisForm({...inventarisForm, nama_barang: e.target.value})}
                            className="w-full px-3 py-2 border-2 border-black rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Kode Barang (Opsional)</label>
                          <input
                            type="text"
                            placeholder="Masukkan kode barang"
                            value={inventarisForm.kode_barang}
                            onChange={(e) => setInventarisForm({...inventarisForm, kode_barang: e.target.value})}
                            className="w-full px-3 py-2 border-2 border-black rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
                          <input
                            type="number"
                            placeholder="Masukkan jumlah barang"
                            min="1"
                            value={inventarisForm.jumlah}
                            onChange={(e) => setInventarisForm({...inventarisForm, jumlah: e.target.value})}
                            className="w-full px-3 py-2 border-2 border-black rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                          <select
                            value={inventarisForm.status}
                            onChange={(e) => setInventarisForm({...inventarisForm, status: e.target.value})}
                            className="w-full px-3 py-2 border-2 border-black rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                          >
                            <option value="Tersedia">Tersedia</option>
                            <option value="Habis">Habis</option>
                            <option value="Dipinjam">Dipinjam</option>
                            <option value="Rusak">Rusak</option>
                            <option value="Hilang">Hilang</option>
                          </select>
                        </div>
                        <button 
                          onClick={handleSubmitInventaris}
                          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 border-2 border-black"
                        >
                          💾 Simpan Inventaris
                        </button>
                      </div>
                    )
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