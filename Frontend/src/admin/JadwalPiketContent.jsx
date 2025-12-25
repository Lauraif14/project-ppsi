// src/admin/JadwalPiketContent.jsx - Content only, no wrapper
import React, { useState, useEffect } from 'react';
import { Calendar, User } from 'lucide-react';
import api from '../api/axios';

const JadwalPiketContent = () => {
    const [jadwalToday, setJadwalToday] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchJadwalToday();
    }, []);

    const fetchJadwalToday = async () => {
        try {
            setLoading(true);
            const response = await api.get('/jadwal/hari-ini');
            if (response.data && response.data.data) {
                setJadwalToday(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching jadwal:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTanggal = (tanggal) => {
        const date = new Date(tanggal);
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {!jadwalToday || jadwalToday.pengurus.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center">
                    <Calendar className="mx-auto mb-2 text-gray-300" size={48} />
                    <p className="text-gray-500 text-sm font-medium">
                        {jadwalToday?.hari === 'Sabtu' || jadwalToday?.hari === 'Minggu'
                            ? 'Libur Akhir Pekan 🏖️'
                            : 'Tidak ada jadwal piket'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {jadwalToday.pengurus.map((user, index) => (
                        <div
                            key={user.id || index}
                            className="flex items-center justify-between p-3 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg border-2 border-black shadow-sm">
                                    {user.nama_lengkap?.charAt(0) || 'P'}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{user.nama_lengkap}</p>
                                    <p className="text-sm text-blue-600">{user.divisi || '-'}</p>
                                </div>
                            </div>
                            <div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${user.status === 'sudah'
                                        ? 'bg-green-100 text-green-800 border-green-300'
                                        : user.status === 'sedang'
                                            ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                                            : 'bg-gray-100 text-gray-600 border-gray-300'
                                    }`}>
                                    {user.status === 'sudah' ? 'Selesai' : user.status === 'sedang' ? 'Sedang' : 'Belum'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default JadwalPiketContent;
