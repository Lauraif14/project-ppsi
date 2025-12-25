// src/admin/PapanPengumumanContent.jsx - Content only, no wrapper
import React, { useState, useEffect } from 'react';
import { Megaphone, Download, AlertCircle } from 'lucide-react';
import api, { BASE_URL } from '../api/axios';

const PapanPengumumanContent = () => {
    const [informasiList, setInformasiList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInformasi();
    }, []);

    const fetchInformasi = async () => {
        try {
            setLoading(true);
            const response = await api.get('/informasi');

            if (response.data && response.data.data) {
                const data = response.data.data;
                setInformasiList(Array.isArray(data) ? data : [data]);
            } else {
                setInformasiList([]);
            }
        } catch (error) {
            console.error('Error fetching informasi:', error);
            setInformasiList([]);
        } finally {
            setLoading(false);
        }
    };

    const getCategoryColor = (kategori) => {
        switch (kategori?.toUpperCase()) {
            case 'SOP':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'PANDUAN':
                return 'bg-purple-100 text-purple-800 border-purple-300';
            default:
                return 'bg-green-100 text-green-800 border-green-300';
        }
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {informasiList.length > 0 ? (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {informasiList.map((info, index) => (
                        <div
                            key={info.id || index}
                            className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg hover:border-green-400 transition-colors"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-gray-900 flex-1">{info.judul}</h3>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium border ml-2 ${getCategoryColor(info.kategori)}`}>
                                    {info.kategori}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-3 mb-2">{info.isi}</p>
                            <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                                <p className="text-xs text-gray-400">
                                    {new Date(info.created_at).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                </p>
                                {info.file_path && (
                                    <a
                                        href={`${BASE_URL}/${info.file_path}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
                                    >
                                        <Download size={12} /> Unduh
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center">
                    <AlertCircle size={48} className="mx-auto mb-3 text-gray-300" />
                    <p className="font-medium text-gray-600">Belum ada informasi</p>
                    <p className="text-xs mt-1 text-gray-500">Informasi akan muncul di sini</p>
                </div>
            )}
        </div>
    );
};

export default PapanPengumumanContent;
