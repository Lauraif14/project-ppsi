import React, { useState } from 'react';
import { BASE_URL } from "../api/axios";

const AddUserForm = ({ isOpen, onClose, onUserAdded }) => {
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    jabatan: '',
    divisi: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        nama_lengkap: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        jabatan: '',
        divisi: '',
        role: 'user'
      });
      setErrors({});
    }
  }, [isOpen]);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto generate username dari nama lengkap
    if (name === 'nama_lengkap') {
      const autoUsername = value
        .toLowerCase()
        .replace(/\s+/g, '.')
        .replace(/[^a-z0-9.]/g, '');
      setFormData(prev => ({
        ...prev,
        username: autoUsername
      }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Validate nama_lengkap
    if (!formData.nama_lengkap.trim()) {
      newErrors.nama_lengkap = 'Nama lengkap harus diisi';
    } else if (formData.nama_lengkap.length < 2) {
      newErrors.nama_lengkap = 'Nama lengkap minimal 2 karakter';
    }

    // Validate username
    if (!formData.username.trim()) {
      newErrors.username = 'Username harus diisi';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username minimal 3 karakter';
    } else if (!/^[a-z0-9.]+$/.test(formData.username)) {
      newErrors.username = 'Username hanya boleh huruf kecil, angka, dan titik';
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email harus diisi';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password harus diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    // Validate confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password tidak cocok';
    }

    // Validate jabatan
    if (!formData.jabatan.trim()) {
      newErrors.jabatan = 'Jabatan harus diisi';
    }

    // Validate divisi
    if (!formData.divisi.trim()) {
      newErrors.divisi = 'Divisi harus diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${BASE_URL}/api/users/create-account`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nama_lengkap: formData.nama_lengkap.trim(),
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password,
          jabatan: formData.jabatan.trim(),
          divisi: formData.divisi.trim(),
          role: formData.role
        })
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ Akun berhasil ditambahkan!\n\nNama: ${result.user.nama_lengkap}\nUsername: ${result.user.username}\nEmail: ${result.user.email}\nJabatan: ${result.user.jabatan}\nDivisi: ${result.user.divisi}\nRole: ${result.user.role}`);

        // Call callback to refresh user list
        if (onUserAdded) {
          onUserAdded(result.user);
        }

        // Close modal
        onClose();
      } else {
        // Handle validation errors from backend
        if (result.errors) {
          setErrors(result.errors);
        } else {
          alert('❌ Gagal menambahkan akun: ' + result.message);
        }
      }
    } catch (error) {
      console.error('Error adding user:', error);
      alert('❌ Terjadi kesalahan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto border-2 border-black">
        {/* Header */}
        <div className="bg-pink-100 px-6 py-4 border-b-2 border-black">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">➕ Tambah Akun Baru</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nama Lengkap */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nama_lengkap"
              value={formData.nama_lengkap}
              onChange={handleInputChange}
              placeholder="Masukkan nama lengkap"
              className={`w-full px-3 py-2 border-2 rounded focus:outline-none focus:ring-2 focus:ring-pink-500 ${errors.nama_lengkap ? 'border-red-500' : 'border-gray-300 focus:border-pink-500'
                }`}
            />
            {errors.nama_lengkap && (
              <p className="text-red-500 text-sm mt-1">❌ {errors.nama_lengkap}</p>
            )}
          </div>

          {/* Username */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="username.login"
              className={`w-full px-3 py-2 border-2 rounded focus:outline-none focus:ring-2 focus:ring-pink-500 ${errors.username ? 'border-red-500' : 'border-gray-300 focus:border-pink-500'
                }`}
            />
            <p className="text-xs text-gray-500 mt-1">Auto generated dari nama, bisa diedit manual</p>
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">❌ {errors.username}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="contoh@email.com"
              className={`w-full px-3 py-2 border-2 rounded focus:outline-none focus:ring-2 focus:ring-pink-500 ${errors.email ? 'border-red-500' : 'border-gray-300 focus:border-pink-500'
                }`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">❌ {errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Minimal 6 karakter"
              className={`w-full px-3 py-2 border-2 rounded focus:outline-none focus:ring-2 focus:ring-pink-500 ${errors.password ? 'border-red-500' : 'border-gray-300 focus:border-pink-500'
                }`}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">❌ {errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Konfirmasi Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Ulangi password"
              className={`w-full px-3 py-2 border-2 rounded focus:outline-none focus:ring-2 focus:ring-pink-500 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300 focus:border-pink-500'
                }`}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">❌ {errors.confirmPassword}</p>
            )}
          </div>

          {/* Jabatan */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Jabatan <span className="text-red-500">*</span>
            </label>
            <select
              name="jabatan"
              value={formData.jabatan}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border-2 rounded focus:outline-none focus:ring-2 focus:ring-pink-500 ${errors.jabatan ? 'border-red-500' : 'border-gray-300 focus:border-pink-500'
                }`}
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
            {errors.jabatan && (
              <p className="text-red-500 text-sm mt-1">❌ {errors.jabatan}</p>
            )}
          </div>

          {/* Divisi */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Divisi <span className="text-red-500">*</span>
            </label>
            <select
              name="divisi"
              value={formData.divisi}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border-2 rounded focus:outline-none focus:ring-2 focus:ring-pink-500 ${errors.divisi ? 'border-red-500' : 'border-gray-300 focus:border-pink-500'
                }`}
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
              <option value="Sosmasling">Sosmasling</option>
            </select>
            {errors.divisi && (
              <p className="text-red-500 text-sm mt-1">❌ {errors.divisi}</p>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors border-2 border-black"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition-colors border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Menambahkan...
                </>
              ) : (
                <>
                  ➕ Tambah Akun
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserForm;