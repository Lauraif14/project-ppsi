// src/pages/UserManagement.jsx
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { motion } from "framer-motion";
import { Pencil, Trash2, Plus, Key } from "lucide-react"; // Tambah import Key
import AddUserForm from "../components/AddUserForm";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [editingUser, setEditingUser] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Starting fetch...');
      
      const token = localStorage.getItem('token');
      console.log('🔑 Token exists:', !!token);
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch('http://localhost:5000/api/users/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 API Response status:', response.status);
      console.log('📡 API Response ok:', response.ok);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('📄 API Result:', result);

      if (result.success) {
        setUsers(result.data || []);
        setError(null);
      } else {
        setError(result.message || 'Unknown error from server');
      }
    } catch (err) {
      console.error('❌ Fetch Error Details:', err);
      console.error('❌ Error name:', err.name);
      console.error('❌ Error message:', err.message);
      
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Cannot connect to server. Is the backend running on port 5000?');
      } else if (err.message.includes('token')) {
        setError('Authentication required. Please login again.');
      } else {
        setError(`Connection failed: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle user added from AddUserForm modal
  const handleUserAdded = (newUser) => {
    setUsers(prev => [...prev, newUser]);
  };

  // Update User
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nama_lengkap: editingUser.nama_lengkap,
          username: editingUser.username,
          email: editingUser.email,
          jabatan: editingUser.jabatan,
          divisi: editingUser.divisi,
          role: editingUser.role
        })
      });

      const result = await response.json();

      if (result.success) {
        setUsers(users.map((u) => (u.id === editingUser.id ? result.user : u)));
        setEditingUser(null);
        alert('✅ User berhasil diupdate!');
      } else {
        alert('❌ Gagal update user: ' + result.message);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('❌ Terjadi kesalahan: ' + error.message);
    }
  };

  // Hapus User
  const handleDeleteUser = async (id) => {
    const user = users.find(u => u.id === id);
    
    if (!window.confirm(`Yakin ingin menghapus user ${user?.nama_lengkap}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        setUsers(users.filter((u) => u.id !== id));
        alert('✅ ' + result.message);
      } else {
        alert('❌ Gagal hapus user: ' + result.message);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('❌ Terjadi kesalahan: ' + error.message);
    }
  };

  // Tambah fungsi reset password
  const handleResetPassword = async (id, namaLengkap) => {
    if (!window.confirm(`Reset password untuk "${namaLengkap}" ke default (123456)?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/users/${id}/reset-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          new_password: '123456'
        })
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ Password untuk "${namaLengkap}" berhasil direset ke: 123456`);
      } else {
        alert('❌ Gagal reset password: ' + result.message);
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('❌ Terjadi kesalahan: ' + error.message);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="p-6 flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Memuat data pengurus...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="p-6 flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
                <p className="font-bold">❌ Error</p>
                <p className="mb-3">{error}</p>
                <button 
                  onClick={fetchUsers}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  🔄 Coba Lagi
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="p-6 flex-1">
          {/* Header dengan tombol tambah */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Daftar Pengurus</h1>
            <div className="flex gap-4 items-center">
              <div className="bg-blue-100 border border-blue-300 rounded-lg px-4 py-2">
                <p className="text-sm text-blue-800">
                  📊 Total Pengurus: <span className="font-bold">{users.length}</span>
                </p>
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors shadow-md border-2 border-black flex items-center gap-2"
              >
                <Plus size={18} />
                Tambah Akun
              </button>
            </div>
          </div>

          {/* GANTI FORM LAMA DENGAN AddUserForm MODAL */}
          <AddUserForm
            isOpen={showAddForm}
            onClose={() => setShowAddForm(false)}
            onUserAdded={handleUserAdded}
          />

          {/* Tabel User */}
          <div className="bg-white border-2 border-gray-200 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Daftar Pengurus ({users.length} orang)</h3>
            
            {users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Belum ada data pengurus</p>
                <p className="text-sm mt-2">Klik "Tambah Akun" untuk menambahkan pengurus baru</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="p-3 text-left">Nama Lengkap</th>
                      <th className="p-3 text-left">Username</th>
                      <th className="p-3 text-left">Email</th>
                      <th className="p-3 text-left">Jabatan</th>
                      <th className="p-3 text-left">Divisi</th>
                      <th className="p-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{user.nama_lengkap || 'N/A'}</td>
                        <td className="p-3 text-gray-600">{user.username || 'N/A'}</td>
                        <td className="p-3 text-gray-600">{user.email || 'N/A'}</td>
                        <td className="p-3">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                            {user.jabatan || 'Staff'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                            {user.divisi || 'Umum'}
                          </span>
                        </td>
                        <td className="p-3 flex justify-center gap-3">
                          <button
                            className="p-2 bg-yellow-400 rounded-lg border border-black hover:bg-yellow-500 transition-colors"
                            onClick={() => setEditingUser({...user})}
                            title="Edit pengurus"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="p-2 bg-blue-500 text-white rounded-lg border border-black hover:bg-blue-600 transition-colors"
                            onClick={() => handleResetPassword(user.id, user.nama_lengkap)}
                            title="Reset password ke 123456"
                          >
                            <Key size={16} />
                          </button>
                          <button
                            className="p-2 bg-red-500 text-white rounded-lg border border-black hover:bg-red-600 transition-colors"
                            onClick={() => handleDeleteUser(user.id)}
                            title="Hapus pengurus"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Modal Edit User - UPDATE dengan field lengkap */}
          {editingUser && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md border-2 border-black max-h-[90vh] overflow-y-auto"
              >
                <h3 className="text-lg font-bold mb-4">✏️ Edit Data Pengurus</h3>
                <form onSubmit={handleUpdateUser} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                    <input
                      type="text"
                      value={editingUser.nama_lengkap || ''}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, nama_lengkap: e.target.value })
                      }
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Username</label>
                    <input
                      type="text"
                      value={editingUser.username || ''}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, username: e.target.value })
                      }
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      value={editingUser.email || ''}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, email: e.target.value })
                      }
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Jabatan</label>
                    <select
                      value={editingUser.jabatan || ''}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, jabatan: e.target.value })
                      }
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none"
                      required
                    >
                      <option value="">Pilih Jabatan</option>
                      <option value="Gubernur">Gubernur</option>
                      <option value="Wakil Gubernur">Wakil Gubernur</option>
                      <option value="Sekretaris Daerah"> Sekretaris Daerah</option>
                      <option value="Bendahara Daerah">Bendahara Daerah</option>
                      <option value="Kepala Dinas">Kepala Dinas</option>
                      <option value="Sekretaris Dinas">Sekretaris Dinas</option>
                      <option value="Bendahara Dinas">Bendahara Dinas</option>
                      <option value="Anggota">Anggota</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Divisi</label>
                    <select
                      value={editingUser.divisi || ''}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, divisi: e.target.value })
                      }
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none"
                      required
                    >
                      <option value="">Pilih Divisi</option>
                      <option value="Inti">Inti</option>
                      <option value="Audkes">Audkes</option>
                      <option value="Medinkraf">Medinkraf</option>
                      <option value="Adkesma">Adkesma</option>
                      <option value="PSDM">PSDM</option>
                      <option value="Eksternal">Eksternal</option>
                      <option value="Internal">Internal</option>
                      <option value="Bistech">Bistech</option>
                      <option value="Ristek">Ristek</option>
                      <option value="Kastrat">Kastrat</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Role</label>
                    <select
                      value={editingUser.role || ''}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, role: e.target.value })
                      }
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none"
                      required
                    >
                      <option value="">Pilih Role</option>
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => setEditingUser(null)}
                      className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      ❌ Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      💾 Simpan Perubahan
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default UserManagement;
