// src/components/PapanPengumuman.jsx
import React, { useState, useEffect } from 'react';
import { Megaphone, Clock, Download, AlertCircle } from 'lucide-react';
import { BASE_URL } from '../api/axios';
import api from '../api/axios';

const PapanPengumuman = () => {
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

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border-2 border-black overflow-hidden h-full flex flex-col">
                <div className="bg-yellow-100 p-4 border-b-2 border-black flex items-center gap-2">
                    <div className="bg-yellow-500 p-1.5 rounded border-2 border-black text-white">
                        <Megaphone size={16} strokeWidth={3} />
                    </div>
                    <h2 className="font-bold text-lg text-gray-900">Papan Pengumuman</h2>
                </div>
                <div className="p-6 flex-1">
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
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
                            <div
                                key={info.id}
                                className="group relative bg-white border-2 border-black rounded-xl p-5 hover:bg-yellow-50 transition-colors shadow-sm hover:shadow-md border-b-4 border-r-4 border-black"
                            >
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
                                        {new Date(info.created_at).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </span>

                                    {info.file_path && (
                                        <a
                                            href={`${BASE_URL}/${info.file_path}`}
                                            download
                                            className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 transition-colors"
                                            title="Download file"
                                        >
                                            <div className="bg-blue-100 p-1 rounded-sm border border-black hover:bg-blue-200 transition-colors">
                                                <Download size={10} />
                                            </div>
                                            Download
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #e5e7eb;
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: #d1d5db;
                }
            `}</style>
        </div>
    );
};

export default PapanPengumuman;
