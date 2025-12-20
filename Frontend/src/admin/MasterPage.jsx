// src/admin/MasterPage.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Package, Edit, Trash2, Upload, Plus, Download, FileText, Search, X, Lock, Key } from "lucide-react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import AddUserForm from "../components/AddUserForm";
import { BASE_URL } from "../api/axios";

const MasterPage = () => {
  const [activeMenu, setActiveMenu] = useState("master");
  const [dataType, setDataType] = useState("pengurus");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
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

  // State untuk form inventaris manual
  const [inventarisForm, setInventarisForm] = useState({
    nama_barang: '',
    kode_barang: '',
    jumlah: '',
    status: 'Tersedia'
  });

  // STATE BARU UNTUK SEARCH DAN EDIT
  const [searchQuery, setSearchQuery] = useState('');

  // EDIT USER STATE
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    nama_lengkap: '',
    username: '',
    email: '',
    jabatan: '',
    divisi: ''
  });

  // EDIT INVENTARIS STATE
  const [showEditInventarisModal, setShowEditInventarisModal] = useState(false);
  const [editingInventaris, setEditingInventaris] = useState(null);
  const [editInventarisForm, setEditInventarisForm] = useState({
    nama_barang: '',
    kode_barang: '',
    jumlah: '',
    status: 'Tersedia'
  });

  // Fetch Pengurus
  const fetchPengurus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Token tidak ditemukan. Silakan login kembali.');
        return;
      }

      const response = await fetch(`${BASE_URL}/api/users/`, {
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

  // Fetch Inventaris
  const fetchInventaris = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Token tidak ditemukan. Silakan login kembali.');
        return;
      }

      const response = await fetch(`${BASE_URL}/api/users/inventaris`, {
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

  // Handle Open Modal
  const handleOpenModal = (type) => {
    if (type === "manual" && dataType === "pengurus") {
      setShowAddUserForm(true);
    } else {
      setModalType(type);
      setShowModal(true);
      setUploadResult(null);
      setSelectedFile(null);
    }
  };

  // Handle Close Modal
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

  // Handle User Added
  const handleUserAdded = (newUser) => {
    setPengurusData(prev => [...prev, newUser]);
  };

  // Handle Submit Inventaris
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

      const response = await fetch(`${BASE_URL}/api/users/inventaris/create`, {
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
        alert(`✅ Inventaris berhasil ditambahkan!`);
        fetchInventaris();
        handleCloseModal();
      } else {
        alert('❌ Gagal menambahkan inventaris: ' + result.message);
      }
    } catch (error) {
      console.error('Error adding inventaris:', error);
      alert('❌ Terjadi kesalahan: ' + error.message);
    }
  };

  // Handle File Upload
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
        ? `${BASE_URL}/api/users/pengurus/bulk`
        : `${BASE_URL}/api/users/inventaris/bulk`;

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

  // Get Status Badge
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

  // Handle Delete Inventaris
  const handleDeleteInventaris = async (id, namaBarang) => {
    if (!window.confirm(`Yakin ingin menghapus inventaris "${namaBarang}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${BASE_URL}/api/users/inventaris/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ Inventaris "${namaBarang}" berhasil dihapus!`);
        fetchInventaris();
      } else {
        alert('❌ Gagal menghapus inventaris: ' + result.message);
      }
    } catch (error) {
      console.error('Error deleting inventaris:', error);
      alert('❌ Terjadi kesalahan: ' + error.message);
    }
  };

  // ========== FUNGSI BARU UNTUK EDIT USER ==========

  // Handle Open Edit Modal
  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setEditForm({
      nama_lengkap: user.nama_lengkap || '',
      username: user.username || '',
      email: user.email || '',
      jabatan: user.jabatan || '',
      divisi: user.divisi || ''
    });
    setShowEditModal(true);
  };

  // Handle Close Edit Modal
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingUser(null);
    setEditForm({
      nama_lengkap: '',
      username: '',
      email: '',
      jabatan: '',
      divisi: ''
    });
  };

  // Handle Submit Edit User
  const handleSubmitEdit = async () => {
    if (!editForm.nama_lengkap.trim() || !editForm.username.trim() || !editForm.email.trim()) {
      alert('❌ Nama lengkap, username, dan email harus diisi!');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      const result = await response.json();

      if (result.success) {
        alert('✅ Data pengurus berhasil diupdate!');
        fetchPengurus();
        handleCloseEditModal();
      } else {
        alert('❌ Gagal mengupdate data: ' + result.message);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('❌ Terjadi kesalahan: ' + error.message);
    }
  };

  // Handle Delete User (Fungsi Baru)
  const handleDeleteUser = async (id, nama) => {
    if (!window.confirm(`⚠️ Yakin ingin menghapus user "${nama}"? Data yang dihapus tidak dapat dikembalikan.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ User "${nama}" berhasil dihapus.`);
        fetchPengurus();
      } else {
        alert('❌ Gagal menghapus user: ' + result.message);
      }
    } catch (error) {
      console.error('Error delete user:', error);
      alert('❌ Terjadi kesalahan saat menghapus user.');
    }
  };

  // Handle Reset Password (Fungsi Baru)
  const handleResetPassword = async (id, nama) => {
    const newPassword = prompt(`Masukkan password baru untuk user "${nama}":`, "123456");
    if (newPassword === null) return; // Cancelled
    if (!newPassword.trim()) {
      alert("❌ Password tidak boleh kosong!");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/users/${id}/reset-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ new_password: newPassword })
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ Password untuk user "${nama}" berhasil direset!`);
      } else {
        alert('❌ Gagal mereset password: ' + result.message);
      }
    } catch (error) {
      console.error('Error reset password:', error);
      alert('❌ Terjadi kesalahan saat reset password.');
    }
  };

  // ========== FUNGSI BARU UNTUK EDIT INVENTARIS ==========

  // Handle Open Edit Inventaris Modal
  const handleOpenEditInventarisModal = (item) => {
    setEditingInventaris(item);
    setEditInventarisForm({
      nama_barang: item.nama_barang,
      kode_barang: item.kode_barang || '',
      jumlah: item.jumlah,
      status: item.status || 'Tersedia'
    });
    setShowEditInventarisModal(true);
  };

  // Handle Close Edit Inventaris Modal
  const handleCloseEditInventarisModal = () => {
    setShowEditInventarisModal(false);
    setEditingInventaris(null);
    setEditInventarisForm({
      nama_barang: '',
      kode_barang: '',
      jumlah: '',
      status: 'Tersedia'
    });
  };

  // Handle Submit Edit Inventaris
  const handleSubmitInventarisEdit = async () => {
    if (!editInventarisForm.nama_barang.trim() || !editInventarisForm.jumlah) {
      alert('❌ Nama barang dan jumlah harus diisi!');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/users/inventaris/${editingInventaris.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nama_barang: editInventarisForm.nama_barang.trim(),
          kode_barang: editInventarisForm.kode_barang.trim() || null,
          jumlah: parseInt(editInventarisForm.jumlah),
          status: editInventarisForm.status
        })
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ Data ${editInventarisForm.nama_barang} berhasil diupdate!`);
        fetchInventaris();
        handleCloseEditInventarisModal();
      } else {
        alert('❌ Gagal mengupdate data: ' + result.message);
      }
    } catch (error) {
      console.error('Error updating inventaris:', error);
      alert('❌ Terjadi kesalahan: ' + error.message);
    }
  };

  // Download Template
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

  // ========== FUNGSI FILTER DATA BERDASARKAN SEARCH ==========
  const filteredData = () => {
    const currentData = dataType === "pengurus" ? pengurusData : inventarisData;

    if (!searchQuery.trim()) {
      return currentData;
    }

    const query = searchQuery.toLowerCase();

    if (dataType === "pengurus") {
      return currentData.filter(item =>
        item.nama_lengkap?.toLowerCase().includes(query) ||
        item.username?.toLowerCase().includes(query) ||
        item.email?.toLowerCase().includes(query) ||
        item.jabatan?.toLowerCase().includes(query) ||
        item.divisi?.toLowerCase().includes(query)
      );
    } else {
      return currentData.filter(item =>
        item.nama_barang?.toLowerCase().includes(query) ||
        item.kode_barang?.toLowerCase().includes(query) ||
        item.status?.toLowerCase().includes(query)
      );
    }
  };

  const data = filteredData();

  // Loading state
  if (loading) {
    return (
      <div className="flex bg-gray-50 h-screen overflow-hidden">
        <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
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
      <div className="flex bg-gray-50 h-screen overflow-hidden">
        <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
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
    <div className="flex bg-gray-50 h-screen overflow-hidden">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar />

        <motion.div
          className="flex-1 p-6 space-y-6 overflow-x-hidden overflow-y-auto"
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
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 border-2 border-black ${dataType === "pengurus"
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
              className={`px-4 py-2 rounded-md font-medium transition-all duration-200 border-2 ${dataType === "pengurus"
                ? "bg-pink-500 text-white shadow-md border-black"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-transparent hover:border-gray-300"
                }`}
              onClick={() => setDataType("pengurus")}
            >
              <Users size={16} className="inline mr-2" />
              Data Pengurus
            </button>
            <button
              className={`px-4 py-2 rounded-md font-medium transition-all duration-200 border-2 ${dataType === "inventaris"
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

            {/* SEARCH BOX */}
            <div className="px-6 py-3 border-b border-gray-200">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Cari ${dataType === "pengurus" ? "pengurus (nama, username, email, jabatan, divisi)" : "inventaris (nama barang, kode, status)"}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="text-xs text-gray-500 mt-2">
                  Menampilkan {data.length} hasil dari {dataType === "pengurus" ? pengurusData.length : inventarisData.length} total data
                </p>
              )}
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleResetPassword(item.id, item.nama_lengkap)}
                                  className="text-yellow-600 hover:text-yellow-800 p-1 hover:bg-yellow-50 rounded transition-colors"
                                  title="Reset Password"
                                >
                                  <Key size={16} />
                                </button>
                                <button
                                  onClick={() => handleOpenEditModal(item)}
                                  className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors"
                                  title="Edit pengurus"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(item.id, item.nama_lengkap)}
                                  className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition-colors"
                                  title="Hapus user"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
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
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleOpenEditInventarisModal(item)}
                                  className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors"
                                  title="Edit inventaris"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteInventaris(item.id, item.nama_barang)}
                                  className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition-colors"
                                  title="Hapus inventaris"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={dataType === "pengurus" ? "7" : "6"} className="px-6 py-4 text-center text-gray-500">
                        {searchQuery
                          ? `Tidak ada hasil untuk "${searchQuery}"`
                          : (dataType === "pengurus" ? "Tidak ada data pengurus" : "Tidak ada data inventaris")
                        }
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* AddUserForm Component */}
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
                    // Form Manual untuk Inventaris saja
                    dataType === "inventaris" && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Barang</label>
                          <input
                            type="text"
                            placeholder="Masukkan nama barang"
                            value={inventarisForm.nama_barang}
                            onChange={(e) => setInventarisForm({ ...inventarisForm, nama_barang: e.target.value })}
                            className="w-full px-3 py-2 border-2 border-black rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Kode Barang (Opsional)</label>
                          <input
                            type="text"
                            placeholder="Masukkan kode barang"
                            value={inventarisForm.kode_barang}
                            onChange={(e) => setInventarisForm({ ...inventarisForm, kode_barang: e.target.value })}
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
                            onChange={(e) => setInventarisForm({ ...inventarisForm, jumlah: e.target.value })}
                            className="w-full px-3 py-2 border-2 border-black rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                          <select
                            value={inventarisForm.status}
                            onChange={(e) => setInventarisForm({ ...inventarisForm, status: e.target.value })}
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

          {/* EDIT USER MODAL */}
          {showEditModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl border-2 border-black"
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    ✏️ Edit Data Pengurus
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                      <input
                        type="text"
                        value={editForm.nama_lengkap}
                        onChange={(e) => setEditForm({ ...editForm, nama_lengkap: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                      <input
                        type="text"
                        value={editForm.username}
                        onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
                      <input
                        type="text"
                        value={editForm.jabatan}
                        onChange={(e) => setEditForm({ ...editForm, jabatan: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Divisi</label>
                      <input
                        type="text"
                        value={editForm.divisi}
                        onChange={(e) => setEditForm({ ...editForm, divisi: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 mt-6 pt-4 border-t-2 border-black">
                    <button
                      onClick={handleCloseEditModal}
                      className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors border-2 border-black"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSubmitEdit}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 border-2 border-black"
                    >
                      💾 Simpan Perubahan
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* EDIT INVENTARIS MODAL */}
          {showEditInventarisModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl border-2 border-black"
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    ✏️ Edit Data Inventaris
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nama Barang</label>
                      <input
                        type="text"
                        value={editInventarisForm.nama_barang}
                        onChange={(e) => setEditInventarisForm({ ...editInventarisForm, nama_barang: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kode Barang</label>
                      <input
                        type="text"
                        value={editInventarisForm.kode_barang}
                        onChange={(e) => setEditInventarisForm({ ...editInventarisForm, kode_barang: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
                      <input
                        type="number"
                        min="0"
                        value={editInventarisForm.jumlah}
                        onChange={(e) => setEditInventarisForm({ ...editInventarisForm, jumlah: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={editInventarisForm.status}
                        onChange={(e) => setEditInventarisForm({ ...editInventarisForm, status: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      >
                        <option value="Tersedia">Tersedia</option>
                        <option value="Habis">Habis</option>
                        <option value="Dipinjam">Dipinjam</option>
                        <option value="Rusak">Rusak</option>
                        <option value="Hilang">Hilang</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-6 pt-4 border-t-2 border-black">
                    <button
                      onClick={handleCloseEditInventarisModal}
                      className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors border-2 border-black"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSubmitInventarisEdit}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 border-2 border-black"
                    >
                      💾 Simpan Perubahan
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