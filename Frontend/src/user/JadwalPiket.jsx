import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Clock, CheckCircle, XCircle, Calendar, User, AlertCircle } from 'lucide-react';

const JadwalPiket = () => {
    const [jadwalToday, setJadwalToday] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    // Status config
    const statusInfo = {
        'belum': { icon: <XCircle className="text-gray-500" size={18} />, text: "Belum", bg: "bg-gray-100 border-gray-300 text-gray-600" },
        'sedang': { icon: <Clock className="text-yellow-600" size={18} />, text: "Sedang", bg: "bg-yellow-50 border-yellow-300 text-yellow-800" },
        'sudah': { icon: <CheckCircle className="text-green-600" size={18} />, text: "Selesai", bg: "bg-green-50 border-green-300 text-green-800" },
        'tidak_lengkap': { icon: <AlertCircle className="text-red-500" size={18} />, text: "Tidak Lengkap", bg: "bg-red-50 border-red-200 text-red-800" }
    };

    useEffect(() => {
        const fetchJadwalAndAbsensi = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");

                // Get Current User ID from token (for checking own schedule)
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    setCurrentUser(payload);
                } catch (e) { }

                // 1. Fetch Jadwal (Grouped per Hari) - Lebih reliable daripada /jadwal/hari-ini
                const jadwalRes = await api.get('/piket/jadwal', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                // 2. Fetch Absensi (Hari ini) - Untuk status
                const absensiRes = await api.get('/absensi/today', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (jadwalRes.data.success) {
                    const today = new Date();
                    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
                    const todayIndonesian = days[today.getDay()];

                    // Ambil jadwal hari ini dari grouped data
                    const allJadwal = jadwalRes.data.data;
                    const todayScheduleList = allJadwal[todayIndonesian] || [];

                    const absensiData = absensiRes.data.success ? absensiRes.data.data : [];

                    // Gabungkan data jadwal dengan status absensi
                    const mergedData = todayScheduleList.map(user => {
                        // Find absensi record for this user
                        // Note: user_id might be string or number, force comparson
                        const absenInfo = absensiData.find(a => String(a.user_id) === String(user.user_id));

                        let status = 'belum';
                        let waktu_masuk = null;

                        if (absenInfo) {
                            status = absenInfo.waktu_keluar ? 'sudah' : 'sedang';
                            waktu_masuk = absenInfo.waktu_masuk;
                        }

                        return {
                            ...user,
                            status,
                            waktu_masuk
                        };
                    });

                    setJadwalToday({
                        tanggal: today.toISOString(),
                        hari: todayIndonesian,
                        pengurus: mergedData
                    });
                }
            } catch (error) {
                console.error('Error fetching jadwal:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchJadwalAndAbsensi();
    }, []);

    // Format tanggal Indonesia
    const formatTanggal = () => {
        return new Date().toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Placeholder handleCheckout - because real checkout needs photo/camera
    const handleCheckout = (user) => {
        alert("Silakan gunakan tombol 'Absen Keluar' pada panel Status Tugas (sebelah kiri) untuk melakukan absensi keluar dengan foto.");
    };

    if (loading) {
        return (
            <div className="p-6 border-2 border-black rounded-2xl bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="font-bold text-lg mb-4 text-gray-900 border-b-2 border-dashed border-gray-200 pb-3">Daftar Piket Hari Ini</h3>
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-5 lg:p-6 border-2 border-black rounded-2xl bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] h-full">
            <div className="flex items-center gap-3 mb-5 border-b-2 border-dashed border-gray-300 pb-4">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <Calendar size={20} className="text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-base lg:text-lg text-gray-900 leading-tight">Jadwal Piket</h3>
                    {jadwalToday && (
                        <p className="text-xs font-semibold text-gray-500 mt-1 uppercase tracking-wide">
                            {formatTanggal(jadwalToday.tanggal)}
                        </p>
                    )}
                </div>
            </div>

            {!jadwalToday || jadwalToday.pengurus.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 min-h-[400px] flex flex-col items-center justify-center">
                    <Calendar className="mx-auto mb-2 text-gray-300" size={32} />
                    <p className="text-gray-500 text-sm font-medium">
                        {jadwalToday?.hari === 'Sabtu' || jadwalToday?.hari === 'Minggu'
                            ? 'Libur Akhir Pekan 🏖️'
                            : 'Tidak ada jadwal piket'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3 min-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                    {jadwalToday.pengurus.map((user, index) => {
                        // Check if it's past midnight (00:00) from the check-in date
                        const isPastMidnight = () => {
                            if (!user.waktu_masuk || user.waktu_masuk === '-') return false;

                            const now = new Date();
                            const checkInDate = new Date(user.waktu_masuk); // Use actual check-in time
                            const midnightAfterCheckIn = new Date(checkInDate);
                            midnightAfterCheckIn.setDate(midnightAfterCheckIn.getDate() + 1);
                            midnightAfterCheckIn.setHours(0, 0, 0, 0);

                            return now >= midnightAfterCheckIn;
                        };

                        // Determine actual status
                        let displayStatus = user.status;
                        const isAfterMidnight = isPastMidnight();

                        // If user checked in but didn't check out and it's past midnight
                        if (user.status === 'sedang' && isAfterMidnight) {
                            displayStatus = 'tidak_lengkap';
                        }

                        // Show checkout button only if:
                        // 1. User has checked in (status = 'sedang')
                        // 2. It's NOT past midnight yet
                        // 3. User is CURRENTLY LOGGED IN user (can only checkout self)
                        const isMyself = currentUser && (String(currentUser.id) === String(user.user_id));
                        const showCheckoutButton = isMyself && user.status === 'sedang' && !isAfterMidnight;

                        return (
                            <div
                                key={user.id || index}
                                className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all hover:-translate-y-0.5 hover:shadow-sm ${displayStatus === 'tidak_lengkap'
                                    ? 'bg-red-50 border-red-200'
                                    : statusInfo[displayStatus]?.bg || 'bg-gray-50 border-gray-200'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center flex-shrink-0">
                                        <User size={14} className="text-gray-500" />
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-800 text-sm">
                                                {user.nama_lengkap}
                                            </span>
                                            {isMyself && (
                                                <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold border border-blue-200">
                                                    ANDA
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">
                                            {user.divisi || 'Anggota'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-md border border-gray-200 shadow-sm">
                                        {displayStatus === 'tidak_lengkap' ? (
                                            <>
                                                <AlertCircle size={14} className="text-red-500" />
                                                <span className="text-xs font-bold text-red-700">Tidak Lengkap</span>
                                            </>
                                        ) : (
                                            <>
                                                {statusInfo[displayStatus]?.icon}
                                                <span className="text-xs font-bold">{statusInfo[displayStatus]?.text}</span>
                                            </>
                                        )}
                                    </div>

                                    {showCheckoutButton && (
                                        <button
                                            onClick={() => handleCheckout(user)}
                                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-md border-2 border-black shadow-sm transition-colors"
                                            title="Klik untuk info cara absen keluar"
                                        >
                                            Absen Keluar
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #e5e7eb;
                    border-radius: 20px;
                }
            `}</style>
        </div>
    );
};

export default JadwalPiket;