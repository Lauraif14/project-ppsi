import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { X, Camera, User, Mail, Lock, Save } from 'lucide-react';

const EditProfilModal = ({ show, onClose, onProfileUpdate }) => {
    const [form, setForm] = useState({ name: '', email: '', username: '', password: '', confirmPassword: '' });
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('error');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (show) {
            setMessage('');
            setImageFile(null);
            const fetchProfile = async () => {
                const token = localStorage.getItem("token");
                try {
                    const response = await api.get('/profile', { headers: { 'Authorization': `Bearer ${token}` } });
                    const { nama_lengkap, email, username, avatar_url } = response.data;
                    setForm(prev => ({ 
                        ...prev, 
                        name: nama_lengkap || '', 
                        email: email || '', 
                        username: username || '', 
                        password: '', 
                        confirmPassword: '' 
                    }));
                    setImagePreview(avatar_url);
                } catch (error) {
                    setMessage("Gagal mengambil data profil.");
                    setMessageType('error');
                }
            };
            fetchProfile();
        }
    }, [show]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5000000) {
                setMessage("Ukuran file maksimal 5MB");
                setMessageType('error');
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (form.password && form.password !== form.confirmPassword) {
            setMessage("Password konfirmasi tidak cocok.");
            setMessageType('error');
            return;
        }

        if (form.password && form.password.length < 6) {
            setMessage("Password minimal 6 karakter.");
            setMessageType('error');
            return;
        }

        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('email', form.email);
        formData.append('username', form.username);
        if (form.password) {
            formData.append('password', form.password);
            formData.append('confirmPassword', form.confirmPassword);
        }
        if (imageFile) {
            formData.append('avatar', imageFile);
        }

        const token = localStorage.getItem("token");
        setIsLoading(true);
        try {
            const response = await api.put('/profile', formData, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setMessage(response.data.message);
            setMessageType('success');
            setTimeout(() => {
                onProfileUpdate();
                onClose();
            }, 1500);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Gagal memperbarui profil.');
            setMessageType('error');
        } finally {
            setIsLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl border-2 border-black shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-pink-500 to-purple p-2 flex justify-between items-center border-b-2 border-black">
                    <h3 className="text-2xl font-bold text-white">Edit Profil</h3>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                    >
                        <X size={24} className="text-white" />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-6 flex-1">
                    {message && (
                        <div className={`p-4 rounded-lg border-2 mb-6 text-center font-semibold ${
                            messageType === 'success' 
                                ? 'bg-green-50 border-green-300 text-green-700' 
                                : 'bg-red-50 border-red-300 text-red-700'
                        }`}>
                            {message}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Foto Profil Section */}
                        <div className="flex flex-col items-center gap-4 p-6 bg-gray-50 rounded-xl border-2 border-gray-200">
                            <div className="relative">
                                <img 
                                    src={imagePreview || 'https://via.placeholder.com/150'} 
                                    alt="Preview" 
                                    className="w-32 h-32 rounded-full object-cover border-4 border-pink-500 shadow-lg"
                                />
                                <div className="absolute bottom-0 right-0 bg-pink-500 rounded-full p-2 border-2 border-white shadow-lg">
                                    <Camera size={20} className="text-white" />
                                </div>
                            </div>
                            <label className="cursor-pointer px-6 py-2.5 bg-pink-500 text-white font-semibold rounded-lg border-2 border-black hover:bg-pink-600 transition-colors flex items-center gap-2">
                                <Camera size={18} />
                                Ganti Foto Profil
                                <input type="file" onChange={handleImageChange} className="hidden" accept="image/*" />
                            </label>
                            <p className="text-xs text-gray-500">Maksimal 5MB (JPG, PNG)</p>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-4">
                            <div>
                                <label className="block font-semibold mb-2 text-gray-700 flex items-center gap-2">
                                    <User size={18} />
                                    Nama Lengkap
                                </label>
                                <input 
                                    name="name" 
                                    value={form.name} 
                                    onChange={handleChange}
                                    required
                                    className="w-full p-3 border-2 border-black rounded-lg focus:outline-none focus:border-pink-500 transition-colors" 
                                    placeholder="Masukkan nama lengkap"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-2 text-gray-700 flex items-center gap-2">
                                    <User size={18} />
                                    Username
                                </label>
                                <input 
                                    name="username" 
                                    value={form.username} 
                                    onChange={handleChange}
                                    required
                                    className="w-full p-3 border-2 border-black rounded-lg focus:outline-none focus:border-pink-500 transition-colors" 
                                    placeholder="Masukkan username"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-2 text-gray-700 flex items-center gap-2">
                                    <Mail size={18} />
                                    Email
                                </label>
                                <input 
                                    type="email" 
                                    name="email" 
                                    value={form.email} 
                                    onChange={handleChange}
                                    required
                                    className="w-full p-3 border-2 border-black rounded-lg focus:outline-none focus:border-pink-500 transition-colors" 
                                    placeholder="Masukkan email"
                                />
                            </div>

                            <div className="pt-4 border-t-2 border-gray-200">
                                <p className="text-sm text-gray-600 mb-4 font-medium">Ubah Password (opsional)</p>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block font-semibold mb-2 text-gray-700 flex items-center gap-2">
                                            <Lock size={18} />
                                            Password Baru
                                        </label>
                                        <input 
                                            type="password" 
                                            name="password" 
                                            value={form.password} 
                                            onChange={handleChange}
                                            className="w-full p-3 border-2 border-black rounded-lg focus:outline-none focus:border-pink-500 transition-colors" 
                                            placeholder="Kosongkan jika tidak diubah"
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-semibold mb-2 text-gray-700 flex items-center gap-2">
                                            <Lock size={18} />
                                            Konfirmasi Password Baru
                                        </label>
                                        <input 
                                            type="password" 
                                            name="confirmPassword" 
                                            value={form.confirmPassword} 
                                            onChange={handleChange}
                                            className="w-full p-3 border-2 border-black rounded-lg focus:outline-none focus:border-pink-500 transition-colors" 
                                            placeholder="Ulangi password baru"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-4">
                            <button 
                                type="button" 
                                onClick={onClose}
                                className="flex-1 px-6 py-3 bg-gray-200 font-semibold rounded-lg border-2 border-black hover:bg-gray-300 transition-colors"
                            >
                                Batal
                            </button>
                            <button 
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 px-6 py-3 bg-pink-500 text-white font-semibold rounded-lg border-2 border-black hover:bg-pink-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>Menyimpan...</>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Simpan Perubahan
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProfilModal;