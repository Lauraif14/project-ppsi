import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { RefreshCw } from 'lucide-react';

const PanduanSOPModal = ({ show, onClose }) => {
    const [informasi, setInformasi] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (show) {
            const fetchData = async () => {
                setLoading(true);
                const token = localStorage.getItem("token");
                const response = await api.get('/informasi', { headers: { 'Authorization': `Bearer ${token}` } });
                setInformasi(response.data);
                setLoading(false);
            };
            fetchData();
        }
    }, [show]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-2xl border-2 border-black w-full max-w-2xl max-h-[90vh] flex flex-col">
                <h2 className="text-2xl font-bold mb-6 text-center">Panduan & SOP Piket</h2>
                <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                    {loading ? (
                        <div className="flex items-center justify-center gap-2"><RefreshCw className="animate-spin" /> Memuat...</div>
                    ) : (
                        informasi.map(item => (
                            <div key={item.id} className="p-4 border-2 border-gray-200 rounded-lg">
                                <h3 className="font-bold text-lg text-pink-600">{item.judul}</h3>
                                <p className="whitespace-pre-wrap mt-2">{item.isi}</p>
                            </div>
                        ))
                    )}
                </div>
                <button onClick={onClose} className="mt-6 w-full py-3 bg-gray-200 rounded-lg border-2 border-black font-semibold">Tutup</button>
            </div>
        </div>
    );
};

export default PanduanSOPModal;