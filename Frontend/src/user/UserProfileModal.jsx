import React, { useState, useEffect } from 'react';
import { X, Save, Camera, User, Mail, Lock, Settings, BadgeCheck, Shield } from 'lucide-react';
import api from '../api/axios';

const UserProfileModal = ({ userData, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        username: '',
        role: '',
        password: '',
        confirmPassword: ''
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (userData) {
            setFormData({
                name: userData.nama_lengkap || '',
                email: userData.email || '',
                username: userData.username || '',
                role: userData.role || 'USER',
                password: '',
                confirmPassword: ''
            });
            if (userData.avatar_url) {
                setPreviewUrl(userData.avatar_url);
            }
        }
    }, [userData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        if (formData.password && formData.password !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'Password konfirmasi tidak cocok.' });
            setLoading(false);
            return;
        }

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('email', formData.email);
            data.append('username', formData.username);
            if (formData.password) {
                data.append('password', formData.password);
                data.append('confirmPassword', formData.confirmPassword);
            }
            if (avatarFile) {
                data.append('avatar', avatarFile);
            }

            await api.put('/profile', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
            if (onUpdate) onUpdate();

            setTimeout(() => {
                onClose();
            }, 1000);

        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: error.response?.data?.message || 'Gagal memperbarui profil.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border-2 border-black flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="bg-pink-50 p-5 border-b-2 border-black flex justify-between items-center shrink-0">
                    <h2 className="font-black text-xl text-gray-900 flex items-center gap-2">
                        <Settings className="text-pink-600" size={24} /> Pengaturan Akun
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="overflow-y-auto p-6 flex-1 custom-scrollbar">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Avatar Section (Kept as user asked for photo edit) */}
                        <div className="flex flex-col items-center">
                            <div className="relative group">
                                <div className="w-28 h-28 rounded-full border-2 border-black overflow-hidden bg-gray-100 shadow-md">
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-4xl">
                                            {formData.name ? formData.name.charAt(0).toUpperCase() : '?'}
                                        </div>
                                    )}
                                </div>
                                <label className="absolute bottom-1 right-1 bg-pink-500 text-white p-2 rounded-full border-2 border-black cursor-pointer hover:bg-pink-600 shadow-sm transition-transform hover:scale-110">
                                    <Camera size={18} />
                                    <input type="file" onChange={handleFileChange} className="hidden" accept="image/*" />
                                </label>
                            </div>
                        </div>

                        {/* Message Alert */}
                        {message.text && (
                            <div className={`p-3 rounded-xl border-2 border-black text-sm font-bold flex items-center gap-2 ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        {/* Informasi Data Diri Section */}
                        <div>
                            <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                                <BadgeCheck className="text-blue-500" size={20} /> Informasi Data Diri
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-1.5">Nama Lengkap</label>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:ring-0 transition-all font-medium text-gray-800"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-1.5">Username</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:ring-0 transition-all font-medium text-gray-800"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-1.5">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:ring-0 transition-all font-medium text-gray-800"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-1.5">Role</label>
                                    <div className="relative">
                                        <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            value={formData.role}
                                            disabled
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-2 border-gray-200 rounded-xl text-gray-500 font-bold cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Password Section */}
                        <div className="pt-2">
                            <h3 className="flex items-center gap-2 text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">
                                <Lock size={16} /> Ganti Password (Opsional)
                            </h3>
                            <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Password Baru"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-0 transition-all"
                                />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Konfirmasi Password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-0 transition-all"
                                />
                            </div>
                        </div>

                    </form>
                </div>

                {/* Footer Buttons */}
                <div className="p-5 border-t-2 border-black bg-gray-50 flex gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all"
                        disabled={loading}
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex-1 py-3 px-4 bg-pink-600 text-white rounded-xl border-2 border-black font-bold flex items-center justify-center gap-2 hover:bg-pink-700 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        disabled={loading}
                    >
                        {loading ? 'Menyimpan...' : (
                            <>
                                <Save size={20} /> Simpan Perubahan
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserProfileModal;
