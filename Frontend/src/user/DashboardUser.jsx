// src/user/DashboardUser.jsx
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import JadwalPiket from "./JadwalPiket";
import AbsensiKamera from "./AbsensiKamera";
import UserProfileModal from "./UserProfileModal";
import api, { BASE_URL } from "../api/axios";
import { jwtDecode } from "jwt-decode";
import {
    Megaphone,
    CalendarCheck,
    AlertCircle,
    Video,
    LogOut,
    UserCheck,
    Clock
} from "lucide-react";
import { motion } from "framer-motion";

const DashboardUser = () => {
    const [userData, setUserData] = useState({ nama_lengkap: "User" });
    const [loading, setLoading] = useState(true);

    // State Pengumuman
    const [informasiList, setInformasiList] = useState([]);

    // State Absensi
    const [absenStatus, setAbsenStatus] = useState(null); // 'belum', 'sedang', 'sudah'
    const [absensiId, setAbsensiId] = useState(null); // ID untuk absen keluar
    const [showCamera, setShowCamera] = useState(false);
    const [cameraMode, setCameraMode] = useState('masuk'); // 'masuk' or 'keluar'
    const [isPiketToday, setIsPiketToday] = useState(false);

    // State Modal
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [pesanDashboard, setPesanDashboard] = useState("");

    // Load User Data
    const fetchUserData = async () => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Init from token first
                setUserData(prev => ({ ...prev, ...decoded }));

                // Fetch full profile (including avatar)
                try {
                    const profileRes = await api.get('/profile');
                    if (profileRes.data) {
                        setUserData(prev => ({ ...prev, ...profileRes.data }));
                    }
                } catch (err) {
                    console.error("Failed to fetch profile:", err);
                }

                fetchDashboardData(decoded.id);
            } catch (error) {
                console.error("Token invalid:", error);
            }
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchDashboardData = async (userId) => {
        setLoading(true);
        try {
            // 1. Fetch Semua Informasi (SOP, Panduan, Lainnya)
            const infoRes = await api.get('/informasi');
            if (infoRes.data && infoRes.data.data) {
                const data = infoRes.data.data;
                setInformasiList(Array.isArray(data) ? data : [data]);
            } else {
                setInformasiList([]);
            }

            // 2. Fetch Status Piket Hari Ini
            const jadwalRes = await api.get('/jadwal/hari-ini');

            if (jadwalRes.data.success && jadwalRes.data.data) {
                const todaySchedule = jadwalRes.data.data;
                const mySchedule = todaySchedule.pengurus.find(p =>
                    (p.user_id == userId) || (p.id == userId)
                );

                if (mySchedule) {
                    setIsPiketToday(true);
                    setAbsenStatus(mySchedule.status);
                    if (mySchedule.absensi_id) {
                        setAbsensiId(mySchedule.absensi_id);
                    }
                } else {
                    setIsPiketToday(false);
                }
            }
        } catch (error) {
            console.error("Error loading dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAbsenClick = (mode) => {
        setCameraMode(mode);
        setShowCamera(true);
    };

    const handleAbsensiSuccess = () => {
        if (userData.id) fetchDashboardData(userData.id);
        setShowCamera(false);
    };

    const handleProfileUpdate = () => {
        fetchUserData();
    };

    useEffect(() => {
        if (pesanDashboard) {
            const timer = setTimeout(() => setPesanDashboard(""), 5000);
            return () => clearTimeout(timer);
        }
    }, [pesanDashboard]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans overflow-hidden">
            <Navbar />

            <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-[1600px] mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setShowProfileModal(true)} title="Klik untuk edit profil">
                            {/* Avatar */}
                            <div className="w-16 h-16 rounded-full border-2 border-black overflow-hidden bg-white shadow-sm shrink-0 transition-transform group-hover:scale-105 relative">
                                {userData.avatar_url ? (
                                    <img
                                        src={userData.avatar_url}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                                    />
                                ) : null}
                                <div className={`w-full h-full flex items-center justify-center bg-pink-100 text-pink-600 font-bold text-2xl ${userData.avatar_url ? 'hidden' : 'flex'}`}>
                                    {userData.nama_lengkap ? userData.nama_lengkap.charAt(0).toUpperCase() : 'U'}
                                </div>

                                {/* Overlay Edit Hint */}
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <span className="text-white text-xs font-bold">Edit</span>
                                </div>
                            </div>

                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 group-hover:text-pink-700 transition-colors">
                                    Halo, <span className="text-pink-600 capitalize">{userData.nama_lengkap}</span> 👋
                                </h1>
                                <p className="text-gray-500 mt-1 font-medium">Selamat datang di Panel Piket BESTI</p>
                            </div>
                        </div>
                    </div>

                    {/* Alert Message */}
                    {pesanDashboard && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-4 bg-green-100 text-green-800 rounded-xl border-2 border-black shadow-sm flex items-center gap-3"
                        >
                            <UserCheck size={24} />
                            <span className="font-bold">{pesanDashboard}</span>
                        </motion.div>
                    )}

                    {/* Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full">

                        {/* COLUMN 1: Status Piket (Absensi) */}
                        <div className="bg-white rounded-xl shadow-sm border-2 border-black overflow-hidden flex flex-col h-full lg:h-[600px]">
                            <div className="bg-pink-100 p-4 border-b-2 border-black flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-2">
                                    <div className="bg-pink-500 p-1.5 rounded border-2 border-black text-white">
                                        <Clock size={16} strokeWidth={3} />
                                    </div>
                                    <h2 className="font-bold text-lg text-gray-900">Status Tugas</h2>
                                </div>
                                {isPiketToday && (
                                    <span className="text-xs font-black bg-yellow-300 px-2 py-1 border-2 border-black rounded shadow-sm">
                                        HARI INI
                                    </span>
                                )}
                            </div>

                            <div className="p-6 text-center flex-1 flex flex-col justify-center items-center overflow-y-auto">
                                {loading ? (
                                    <div className="animate-pulse flex flex-col items-center w-full">
                                        <div className="h-20 w-20 bg-gray-200 rounded-full mb-4"></div>
                                        <div className="h-4 w-32 bg-gray-200 rounded"></div>
                                    </div>
                                ) : isPiketToday ? (
                                    <div className="space-y-6 w-full">
                                        <div className="inline-block relative">
                                            {absenStatus === 'belum' && (
                                                <div className="flex flex-col items-center">
                                                    <div className="w-24 h-24 bg-gray-100 rounded-full border-2 border-black flex items-center justify-center mb-3">
                                                        <Clock size={40} className="text-gray-400" />
                                                    </div>
                                                    <span className="px-4 py-2 bg-gray-100 border-2 border-black rounded-lg font-bold text-gray-600">
                                                        Belum Absen
                                                    </span>
                                                </div>
                                            )}
                                            {absenStatus === 'sedang' && (
                                                <div className="flex flex-col items-center">
                                                    <div className="w-24 h-24 bg-yellow-100 rounded-full border-2 border-black flex items-center justify-center mb-3 animate-pulse">
                                                        <Clock size={40} className="text-yellow-600" />
                                                    </div>
                                                    <span className="px-4 py-2 bg-yellow-100 border-2 border-black rounded-lg font-bold text-yellow-700">
                                                        Sedang Bertugas
                                                    </span>
                                                </div>
                                            )}
                                            {absenStatus === 'sudah' && (
                                                <div className="flex flex-col items-center">
                                                    <div className="w-24 h-24 bg-green-100 rounded-full border-2 border-black flex items-center justify-center mb-3">
                                                        <UserCheck size={40} className="text-green-600" />
                                                    </div>
                                                    <span className="px-4 py-2 bg-green-100 border-2 border-black rounded-lg font-bold text-green-700">
                                                        Selesai Bertugas
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {absenStatus === 'belum' && (
                                            <button
                                                onClick={() => handleAbsenClick('masuk')}
                                                className="w-full py-4 bg-green-500 text-white rounded-xl border-2 border-black font-black text-lg hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all flex items-center justify-center gap-2"
                                            >
                                                <Video size={24} /> ABSEN MASUK
                                            </button>
                                        )}

                                        {absenStatus === 'sedang' && (
                                            <button
                                                onClick={() => handleAbsenClick('keluar')}
                                                className="w-full py-4 bg-red-500 text-white rounded-xl border-2 border-black font-black text-lg hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all flex items-center justify-center gap-2"
                                            >
                                                <LogOut size={24} /> ABSEN KELUAR
                                            </button>
                                        )}

                                        {absenStatus === 'sudah' && (
                                            <div className="p-4 bg-green-50 rounded-xl border-2 border-black border-dashed w-full">
                                                <p className="text-sm font-bold text-green-800">Laporan piket telah tersimpan.</p>
                                                <p className="text-xs text-green-600 mt-1">Terima kasih atas kontribusi Anda hari ini!</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="py-6 flex flex-col items-center">
                                        <div className="bg-gray-50 w-32 h-32 rounded-full border-2 border-black flex items-center justify-center mb-6 border-dashed">
                                            <CalendarCheck size={48} className="text-gray-400" />
                                        </div>
                                        <p className="text-gray-800 font-bold text-xl">Bebas Tugas!</p>
                                        <p className="text-gray-500 text-sm mt-2 max-w-[200px]">Hari ini kamu tidak ada jadwal piket. Nikmati harimu!</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* COLUMN 2: Jadwal Piket Hari Ini */}
                        <div className="bg-white rounded-xl shadow-sm border-2 border-black overflow-hidden h-full lg:h-[600px] flex flex-col">
                            <div className="bg-blue-100 p-4 border-b-2 border-black flex items-center gap-2 shrink-0">
                                <div className="bg-blue-500 p-1.5 rounded border-2 border-black text-white">
                                    <CalendarCheck size={16} strokeWidth={3} />
                                </div>
                                <h2 className="font-bold text-lg text-gray-900">Jadwal Hari Ini</h2>
                            </div>
                            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                                <JadwalPiket />
                            </div>
                        </div>

                        {/* COLUMN 3: Informasi */}
                        <div className="bg-white rounded-xl shadow-sm border-2 border-black overflow-hidden h-full lg:h-[600px] flex flex-col">
                            <div className="bg-yellow-100 p-4 border-b-2 border-black flex items-center gap-2 shrink-0">
                                <div className="bg-yellow-500 p-1.5 rounded border-2 border-black text-white">
                                    <Megaphone size={16} strokeWidth={3} />
                                </div>
                                <h2 className="font-bold text-lg text-gray-900">Papan Pengumuman</h2>
                            </div>

                            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar relative">
                                {informasiList.length === 0 ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-gray-400">
                                        <div className="bg-gray-50 p-4 rounded-full border-2 border-dashed border-gray-300 mb-3">
                                            <AlertCircle size={32} className="opacity-50" />
                                        </div>
                                        <p className="font-medium">Tidak ada informasi baru</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {informasiList.map((info) => (
                                            <div key={info.id} className="group relative bg-white border-2 border-black rounded-xl p-5 hover:bg-yellow-50 transition-colors shadow-sm hover:shadow-md border-b-4 border-r-4 border-black">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h3 className="font-black text-gray-900 text-lg leading-tight">
                                                            {info.judul}
                                                        </h3>
                                                        <span className="text-[10px] bg-yellow-200 text-yellow-900 px-2 py-0.5 rounded border border-black mt-2 inline-block font-bold uppercase tracking-wider">
                                                            {info.kategori}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="text-gray-700 text-sm font-medium mb-4 whitespace-pre-wrap leading-relaxed">
                                                    {info.isi}
                                                </div>

                                                <div className="flex items-center justify-between pt-3 border-t border-gray-200 mt-2">
                                                    <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
                                                        <Clock size={10} />
                                                        {new Date(info.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>

                                                    {info.file_path && (
                                                        <a
                                                            href={`${BASE_URL}/${info.file_path}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                                                        >
                                                            <div className="bg-blue-100 p-1 rounded-sm border border-black">
                                                                <Megaphone size={10} />
                                                            </div>
                                                            Unduh
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modals */}
            {showCamera && (
                <AbsensiKamera
                    mode={cameraMode}
                    absensiId={absensiId}
                    onClose={() => setShowCamera(false)}
                    setPesanDashboard={setPesanDashboard}
                    onSuccess={handleAbsensiSuccess}
                />
            )}

            {showProfileModal && (
                <UserProfileModal
                    userData={userData}
                    onClose={() => setShowProfileModal(false)}
                    onUpdate={handleProfileUpdate}
                />
            )}

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #d1d5db;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #9ca3af;
                }
            `}</style>
        </div>
    );
};

export default DashboardUser;
