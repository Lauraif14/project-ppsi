import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

const JadwalPiket = () => {
    const [jadwal, setJadwal] = useState([]);
    const statusInfo = {
        'belum': { icon: <XCircle className="text-gray-400"/>, text: "Belum", bg: "bg-gray-100" },
        'sedang': { icon: <Clock className="text-yellow-600 animate-spin"/>, text: "Piket", bg: "bg-yellow-100" },
        'sudah': { icon: <CheckCircle className="text-green-600"/>, text: "Selesai", bg: "bg-green-100" }
    };

    useEffect(() => {
        const fetchJadwal = async () => {
            const token = localStorage.getItem("token");
            const response = await api.get('/jadwal/hari-ini', { headers: { 'Authorization': `Bearer ${token}` } });
            setJadwal(response.data);
        };
        fetchJadwal().catch(console.error);
    }, []);

    return (
        <div className="p-6 border-2 border-black rounded-xl bg-white shadow-lg">
            <h3 className="font-bold text-lg mb-4">Jadwal Piket Hari Ini</h3>
            <div className="space-y-3">
                {jadwal.map(user => (
                    <div key={user.id} className={`flex items-center justify-between p-3 rounded-lg border-2 border-black ${statusInfo[user.status].bg}`}>
                        <span className="font-semibold">{user.nama_lengkap}</span>
                        <div className="flex items-center gap-2 text-sm">
                            {statusInfo[user.status].icon}
                            <span>{statusInfo[user.status].text}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default JadwalPiket;