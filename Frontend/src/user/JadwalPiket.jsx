import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Clock, CheckCircle, XCircle, Calendar, User } from 'lucide-react';

const JadwalPiket = () => {
    const [jadwalToday, setJadwalToday] = useState(null);
    const [loading, setLoading] = useState(true);

    const statusInfo = {
        'belum': { icon: <XCircle className="text-gray-500" size={18} />, text: "Belum", bg: "bg-gray-100 border-gray-300 text-gray-600" },
        'sedang': { icon: <Clock className="text-yellow-600" size={18} />, text: "Sedang", bg: "bg-yellow-50 border-yellow-300 text-yellow-800" },
        'sudah': { icon: <CheckCircle className="text-green-600" size={18} />, text: "Selesai", bg: "bg-green-50 border-green-300 text-green-800" }
    };

    useEffect(() => {
        const fetchJadwal = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");
                const response = await api.get('/jadwal/hari-ini', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.data.success) {
                    setJadwalToday(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching jadwal:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchJadwal();
    }, []);

    // Format tanggal Indonesia
    const formatTanggal = (dateString) => {
        const date = new Date(dateString);
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return date.toLocaleDateString('id-ID', options);
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
                <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <Calendar className="mx-auto mb-2 text-gray-300" size={32} />
                    <p className="text-gray-500 text-sm font-medium">
                        {jadwalToday?.hari === 'Sabtu' || jadwalToday?.hari === 'Minggu'
                            ? 'Libur Akhir Pekan 🏖️'
                            : 'Tidak ada jadwal piket'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                    {jadwalToday.pengurus.map((user, index) => (
                        <div
                            key={user.id || index}
                            className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all hover:-translate-y-0.5 hover:shadow-sm ${statusInfo[user.status]?.bg || 'bg-gray-50 border-gray-200'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center flex-shrink-0">
                                    <User size={14} className="text-gray-500" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-gray-800 text-sm">
                                        {user.nama_lengkap}
                                    </span>
                                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">
                                        {user.divisi || 'Anggota'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-md border border-gray-200 shadow-sm">
                                {statusInfo[user.status]?.icon}
                                <span className="text-xs font-bold">{statusInfo[user.status]?.text}</span>
                            </div>
                        </div>
                    ))}
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