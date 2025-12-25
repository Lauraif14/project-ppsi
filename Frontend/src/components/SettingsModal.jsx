import React, { useEffect, useState } from 'react';
import { X, User, Lock, Mail, AtSign } from 'lucide-react';
import { BASE_URL } from '../api/axios';

const SettingsModal = ({ isOpen, onClose, user: initialTokenUser }) => {
    const [profile, setProfile] = useState(null);
    const [passwords, setPasswords] = useState({ newPass: '', confirmPass: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchProfile();
            setPasswords({ newPass: '', confirmPass: '' });
        }
    }, [isOpen]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${BASE_URL}/api/auth/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data) {
                setProfile(data);
            }
        } catch (e) {
            console.error("Failed to fetch profile", e);
        } finally {
            setLoading(false);
        }
    };

    const handleSavePassword = (e) => {
        e.preventDefault();
        if (passwords.newPass !== passwords.confirmPass) {
            alert("Konfirmasi password tidak cocok!");
            return;
        }
        alert("Fitur update password belum terhubung ke backend.");
    };

    if (!isOpen) return null;

    // Fallback data display
    const displayName = profile?.nama_lengkap || initialTokenUser?.nama_lengkap || initialTokenUser?.name || '-';
    const displayUsername = profile?.username || initialTokenUser?.username || '-';
    // Email hanya bisa dari fetch profile
    const displayEmail = profile?.email || '-';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] max-w-sm w-full overflow-hidden">
                {/* Header */}
                <div className="bg-gray-100 p-4 border-b-2 border-black flex justify-between items-center">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <User size={20} /> Pengaturan Akun
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-200 rounded border-2 border-transparent hover:border-black transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-5 space-y-6">
                    {/* Informasi User */}
                    <div className="space-y-3">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-gray-500 uppercase">Nama Lengkap</span>
                            <div className="font-medium text-gray-900 border-b border-gray-200 pb-1">
                                {loading ? '...' : displayName}
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-gray-500 uppercase">Username</span>
                            <div className="font-medium text-gray-900 border-b border-gray-200 pb-1 flex items-center gap-2">
                                <AtSign size={14} className="text-gray-400" /> {loading ? '...' : displayUsername}
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-gray-500 uppercase">Email</span>
                            <div className="font-medium text-gray-900 border-b border-gray-200 pb-1 flex items-center gap-2">
                                <Mail size={14} className="text-gray-400" /> {loading ? '...' : displayEmail}
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t-2 border-dashed border-gray-300"></div>

                    {/* Form Ganti Password */}
                    <form onSubmit={handleSavePassword} className="space-y-3">
                        <h3 className="font-bold text-sm flex items-center gap-2">
                            <Lock size={16} /> Ganti Password
                        </h3>
                        <div>
                            <input
                                type="password"
                                placeholder="Password Baru"
                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-black focus:ring-0 outline-none text-sm transition-colors"
                                value={passwords.newPass}
                                onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                placeholder="Konfirmasi Password"
                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-black focus:ring-0 outline-none text-sm transition-colors"
                                value={passwords.confirmPass}
                                onChange={(e) => setPasswords({ ...passwords, confirmPass: e.target.value })}
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-2 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-all text-sm"
                        >
                            Simpan Password
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
