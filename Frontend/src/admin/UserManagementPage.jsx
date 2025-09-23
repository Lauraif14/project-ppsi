// src/pages/UserManagement.jsx
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { motion } from "framer-motion";
import { Pencil, Trash2, Plus } from "lucide-react";


const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newUser, setNewUser] = useState({ name: "", username: "", divisi: "" });
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token'); // Ambil token dari localStorage
      
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        setUsers(result.data);
        setError(null);
      } else {
        setError(result.message || 'Error fetching users');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Generate username otomatis dari nama
  const generateUsername = (name) => {
    return name.toLowerCase().replace(/\s+/g, ".");
  };

  // Tambah User
  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUser.name) return;

    const username = generateUsername(newUser.name);
    const newEntry = {
      id: Date.now(),
      name: newUser.name,
      username,
      password: "1234", // default password
    };

    setUsers([...users, newEntry]);
    setNewUser({ name: "", username: "", password: "1234" });
  };

  // Update User
  const handleUpdateUser = (e) => {
    e.preventDefault();
    setUsers(users.map((u) => (u.id === editingUser.id ? editingUser : u)));
    setEditingUser(null);
  };

  // Hapus User
  const handleDeleteUser = (id) => {
    setUsers(users.filter((u) => u.id !== id));
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="p-6 flex-1">
          <h2 className="text-2xl font-bold mb-6">Kelola Akun Pengguna</h2>

          {/* Form Tambah User */}
          <motion.form
            onSubmit={handleAddUser}
            className="bg-white border-2 border-gray-200 p-6 rounded-lg shadow-md mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Plus size={18} /> Tambah Akun Baru
            </h3>
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Nama Dinas / Pengurus"
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
              <button
                type="submit"
                className="px-6 py-2 bg-pink-500 text-white font-bold rounded-lg border-2 border-black shadow hover:bg-pink-600"
              >
                Tambah
              </button>
            </div>
          </motion.form>

          {/* Tabel User */}
          <div className="bg-white border-2 border-gray-200 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Daftar Akun</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="p-3 text-left">Nama</th>
                  <th className="p-3 text-left">Username</th>
                  <th className="p-3 text-left">Divisi</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{user.nama_lengkap}</td>
                    <td className="p-3">{user.username}</td>
                    <td className="p-3">{user.divisi}</td>
                    <td className="p-3 flex justify-center gap-3">
                      <button
                        className="p-2 bg-yellow-400 rounded-lg border border-black hover:bg-yellow-500"
                        onClick={() => setEditingUser(user)}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="p-2 bg-red-500 text-white rounded-lg border border-black hover:bg-red-600"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modal Edit User */}
          {editingUser && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md border-2 border-black"
              >
                <h3 className="text-lg font-bold mb-4">Edit Akun</h3>
                <form onSubmit={handleUpdateUser} className="space-y-4">
                  <input
                    type="text"
                    value={editingUser.name}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={editingUser.username}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, username: e.target.value })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={editingUser.password}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, password: e.target.value })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                  />
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-300 rounded-lg"
                      onClick={() => setEditingUser(null)}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-pink-500 text-white font-bold rounded-lg border-2 border-black hover:bg-pink-600"
                    >
                      Simpan
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
