import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from '../api/axios';
import { CheckCircle, Clock, RefreshCw, LogOut, Camera, AlertTriangle } from 'lucide-react';

// Impor komponen-komponen lain
import AbsensiKamera from './AbsensiKamera';
import JadwalPiket from './JadwalPiket';
import ProfilSingkat from './ProfilSingkat';

// Komponen Checklist Inventaris
const InventarisChecklist = ({ sesiAbsen, setSesiAbsen, onChecklistSubmit }) => {
    const [isLoading, setIsLoading] = useState(false);
    
    if (!sesiAbsen || !sesiAbsen.inventaris_checklist) {
        return (
            <div className="p-6 border-2 border-black rounded-xl bg-white shadow-lg">
                <p>Memuat checklist...</p>
            </div>
        );
    }
    
    let checklist;
    try { 
        checklist = JSON.parse(sesiAbsen.inventaris_checklist); 
    } catch (e) { 
        return <p>Error memuat checklist.</p>; 
    }

    const isSubmitted = sesiAbsen.checklist_submitted;
    const statusOptions = ["Tersedia", "Habis", "Dipinjam", "Rusak", "Hilang"];
    const totalItems = checklist.length;
    const checkedItems = checklist.filter(item => item.status).length;
    const allChecked = checkedItems === totalItems;

    const handleStatusChange = (index, newStatus) => {
        if (isSubmitted) return;
        const updated = [...checklist];
        updated[index].status = newStatus;
        setSesiAbsen({ ...sesiAbsen, inventaris_checklist: JSON.stringify(updated) });
    };

    const handleSubmitChecklist = async () => {
        if (!allChecked) {
            alert(`Mohon lengkapi semua item checklist (${checkedItems}/${totalItems})`);
            return;
        }
        
        setIsLoading(true);
        try {
            const response = await api.post("/absensi/submit-checklist", 
                { absensiId: sesiAbsen.id, checklist: checklist },
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );
            onChecklistSubmit(response.data.message);
        } catch (error) { 
            alert("Gagal mengirim checklist."); 
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="p-6 border-2 border-black rounded-xl bg-white shadow-lg">
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold text-gray-800">Laporan Cek Inventaris</h3>
                {isSubmitted ? (
                    <span className="flex items-center gap-1.5 text-green-600 font-semibold text-sm bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                        <CheckCircle size={16} /> Terkirim
                    </span>
                ) : (
                    <span className="text-sm font-medium text-gray-500">
                        {checkedItems}/{totalItems}
                    </span>
                )}
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {checklist.map((item, index) => (
                    <div key={index} className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50 hover:border-pink-300 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold text-gray-800">{item.nama}</p>
                            {item.status && <CheckCircle size={18} className="text-green-600" />}
                        </div>
                        <select
                            value={item.status || ""}
                            onChange={(e) => handleStatusChange(index, e.target.value)}
                            disabled={isSubmitted}
                            className="w-full p-2.5 border-2 border-black rounded-lg bg-white disabled:bg-gray-200 font-medium text-sm focus:outline-none focus:border-pink-500"
                        >
                            <option value="" disabled>Pilih Status</option>
                            {statusOptions.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>

            <button
                onClick={handleSubmitChecklist}
                disabled={isSubmitted || isLoading || !allChecked}
                className="w-full mt-6 py-3.5 bg-pink-500 text-white font-bold rounded-lg border-2 border-black hover:bg-pink-600 disabled:bg-gray-400 disabled:border-gray-400 transition-all"
            >
                {isLoading ? 'Mengirim...' : (isSubmitted ? "Laporan Terkirim" : "Kirim Laporan Inventaris")}
            </button>
        </div>
    );
};


// Komponen Dashboard Utama
const DashboardUser = () => {
    const [userInfo, setUserInfo] = useState({ name: '', role: '' });
    const [sesiAbsen, setSesiAbsen] = useState(null);
    const [showAbsenModal, setShowAbsenModal] = useState(false);
    const [modeAbsen, setModeAbsen] = useState('masuk');
    const [pesanDashboard, setPesanDashboard] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const getInitialData = async () => {
        const token = localStorage.getItem("token");
        if (!token) { navigate('/login'); return; }
        
        setIsLoading(true);
        const headers = { 'Authorization': `Bearer ${token}` };
        
        try {
            const [profileRes, statusRes] = await Promise.all([
                api.get('/profile', { headers }),
                api.get('/absensi/status', { headers })
            ]);
            setUserInfo({ name: profileRes.data.nama_lengkap, role: profileRes.data.jabatan });
            setSesiAbsen(statusRes.data);
        } catch (error) {
            console.error('Error loading data:', error);
            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                navigate('/login');
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { getInitialData(); }, []);

    const handleOpenAbsen = (mode) => {
        setModeAbsen(mode);
        setShowAbsenModal(true);
    };

    const handleLogout = () => {
        if (window.confirm('Apakah Anda yakin ingin keluar?')) {
            localStorage.removeItem("token");
            navigate('/login');
        }
    };

    const { isDurasiCukup, durasiMenit, sisaMenit } = useMemo(() => {
        if (!sesiAbsen?.waktu_masuk) return { isDurasiCukup: false, durasiMenit: 0, sisaMenit: 0 };
        const durasiMs = new Date() - new Date(sesiAbsen.waktu_masuk);
        const durasiMenit = durasiMs / (1000 * 60);
        const sisaMenit = Math.max(0, Math.ceil(120 - durasiMenit));
        return { 
            isDurasiCukup: durasiMenit >= 120, 
            durasiMenit,
            sisaMenit
        };
    }, [sesiAbsen]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <RefreshCw className="animate-spin h-12 w-12 text-pink-500" />
            </div>
        );
    }

    const canAbsenKeluar = sesiAbsen?.checklist_submitted && isDurasiCukup;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto p-6 lg:p-8">
                {/* Header dengan Logout */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Dashboard Piket</h1>
                        <p className="text-gray-600 mt-1">Selamat datang, {userInfo.name}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-6 py-2.5 bg-gray-700 text-white font-semibold rounded-lg border-2 border-black hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>

                {pesanDashboard && (
                    <div className="mb-6 p-4 text-center font-bold bg-green-100 text-green-800 rounded-xl border-2 border-green-300 shadow-lg">
                        {pesanDashboard}
                    </div>
                )}
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* === KOLOM UTAMA === */}
                    <div className="lg:col-span-8 space-y-8">
                        {!sesiAbsen ? (
                            <div className="p-10 border-2 border-black rounded-xl bg-gradient-to-br from-white to-gray-50 shadow-xl">
                                <div className="max-w-md mx-auto text-center">
                                    <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-black">
                                        <Camera size={40} className="text-pink-600" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-gray-800 mb-3">Mulai Sesi Piket</h2>
                                    <p className="text-gray-600 mb-8 text-lg">
                                        Anda belum memulai sesi piket hari ini. <br/>
                                        Ambil foto absen untuk memulai.
                                    </p>
                                    <button 
                                        onClick={() => handleOpenAbsen('masuk')} 
                                        className="px-10 py-4 bg-green-500 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-green-600 transition-all border-2 border-black inline-flex items-center gap-3"
                                    >
                                        <Camera size={24} />
                                        Ambil Absen Masuk
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Status Piket Card dengan Layout Horizontal */}
                                <div className="p-6 border-2 border-black rounded-xl bg-pink-50 shadow-lg">
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-4">
                                            <div className="w-16 h-16 bg-pink-500 rounded-xl flex items-center justify-center border-2 border-black flex-shrink-0">
                                                <Clock size={32} className="text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-gray-800 mb-1">Sedang Piket</h2>
                                                <div className="space-y-1 text-gray-700">
                                                    <p className="text-sm">
                                                        Masuk: <span className="font-semibold">
                                                            {new Date(sesiAbsen.waktu_masuk).toLocaleTimeString('id-ID')}
                                                        </span>
                                                    </p>
                                                    <p className="text-sm">
                                                        Durasi: <span className="font-semibold">
                                                            {Math.floor(durasiMenit / 60)} jam {Math.floor(durasiMenit % 60)} menit
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Checklist */}
                                <InventarisChecklist 
                                    sesiAbsen={sesiAbsen} 
                                    setSesiAbsen={setSesiAbsen}
                                    onChecklistSubmit={(message) => {
                                        setPesanDashboard(message);
                                        getInitialData();
                                    }}
                                />
                            </>
                        )}
                    </div>

                    {/* === SIDEBAR === */}
                    <div className="lg:col-span-4 space-y-8">
                        <ProfilSingkat user={userInfo} onProfileUpdate={getInitialData} />
                        <JadwalPiket />
                        
                        {sesiAbsen && (
                            <div className="p-6 border-2 border-black rounded-xl bg-white shadow-lg">
                                <h3 className="font-bold text-xl mb-5 text-gray-800">Persyaratan Absen Keluar</h3>
                                
                                <div className="space-y-3 mb-6">
                                    <div className={`p-4 rounded-lg border-2 ${
                                        sesiAbsen.checklist_submitted 
                                            ? 'bg-green-50 border-green-400' 
                                            : 'bg-yellow-50 border-yellow-400'
                                    }`}>
                                        <div className="flex items-center gap-3">
                                            {sesiAbsen.checklist_submitted ? (
                                                <CheckCircle className="text-green-600 flex-shrink-0" size={24}/>
                                            ) : (
                                                <AlertTriangle className="text-yellow-600 flex-shrink-0" size={24}/>
                                            )}
                                            <div>
                                                <span className="font-semibold text-gray-800 block">Laporan Inventaris</span>
                                                <span className={`text-sm ${
                                                    sesiAbsen.checklist_submitted ? 'text-green-700' : 'text-yellow-700'
                                                }`}>
                                                    {sesiAbsen.checklist_submitted ? 'Selesai' : 'Belum selesai'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className={`p-4 rounded-lg border-2 ${
                                        isDurasiCukup 
                                            ? 'bg-green-50 border-green-400' 
                                            : 'bg-yellow-50 border-yellow-400'
                                    }`}>
                                        <div className="flex items-center gap-3">
                                            {isDurasiCukup ? (
                                                <CheckCircle className="text-green-600 flex-shrink-0" size={24}/>
                                            ) : (
                                                <Clock className="text-yellow-600 flex-shrink-0" size={24}/>
                                            )}
                                            <div>
                                                <span className="font-semibold text-gray-800 block">Durasi Piket</span>
                                                <span className={`text-sm ${
                                                    isDurasiCukup ? 'text-green-700' : 'text-yellow-700'
                                                }`}>
                                                    {isDurasiCukup ? 'Minimal 2 jam terpenuhi' : `${sisaMenit} menit lagi`}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <button
                                    onClick={() => handleOpenAbsen("keluar")}
                                    disabled={!canAbsenKeluar}
                                    className="w-full py-4 bg-red-500 text-white font-bold text-lg rounded-lg shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-red-600 transition-all border-2 border-black flex items-center justify-center gap-2"
                                >
                                    <Camera size={24} />
                                    {canAbsenKeluar ? 'Ambil Absen Keluar' : 'Lengkapi Persyaratan'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showAbsenModal && (
                <AbsensiKamera
                    mode={modeAbsen}
                    absensiId={sesiAbsen?.id}
                    onClose={() => { 
                        setShowAbsenModal(false); 
                        getInitialData(); 
                    }}
                    setPesanDashboard={setPesanDashboard}
                />
            )}
        </div>
    );
};

export default DashboardUser;