import React, { useState, useEffect } from 'react';
import api, { BASE_URL } from '../api/axios';
import { X, Download, FileText, Loader } from 'lucide-react';

// Props: onClose saja, karena conditional rendering diatur oleh parent (DashboardUser)
const PanduanSOPModal = ({ onClose }) => {
    const [dokumen, setDokumen] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                const response = await api.get('/informasi', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const allData = response.data.data || response.data || [];

                // Filter hanya SOP dan Panduan (Tampilkan semua status)
                const filtered = allData.filter(item =>
                    item.kategori === 'SOP' || item.kategori === 'Panduan'
                );
                setDokumen(filtered);
            } catch (error) {
                console.error('Error fetching dokumen:', error);
                setDokumen([]);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const getCategoryColor = (kategori) => {
        return kategori === 'SOP'
            ? 'bg-blue-100 text-blue-900 border-blue-900'
            : 'bg-green-100 text-green-900 border-green-900';
    };

    return (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] border-4 border-black animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b-4 border-black bg-pink-50 rounded-t-xl">
                    <div className="flex items-center gap-3">
                        <div className="bg-pink-500 p-2 rounded-lg border-2 border-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900">Panduan & SOP</h2>
                            <p className="text-sm font-bold text-gray-500">Dokumen resmi operasional piket</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors border-2 border-transparent hover:border-black"
                    >
                        <X size={28} className="text-black" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-white custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader className="animate-spin text-pink-600 mb-4" size={40} />
                            <p className="font-bold text-gray-500">Sedang memuat dokumen...</p>
                        </div>
                    ) : dokumen.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                            <FileText className="mx-auto mb-3 text-gray-300" size={64} />
                            <p className="font-bold text-gray-500 text-lg">Belum ada dokumen tersedia</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {dokumen.map(item => (
                                <div key={item.id} className="relative group bg-white border-2 border-black rounded-xl p-5 hover:bg-yellow-50 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:-translate-y-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`inline-block px-3 py-1 rounded border-2 text-xs font-black uppercase tracking-wider ${getCategoryColor(item.kategori)}`}>
                                            {item.kategori}
                                        </span>
                                    </div>

                                    <h3 className="font-bold text-gray-900 text-lg mb-4 line-clamp-2 leading-tight group-hover:text-pink-600 transition-colors">
                                        {item.judul}
                                    </h3>

                                    {item.file_path && (
                                        <a
                                            href={`${BASE_URL}/${item.file_path}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-900 hover:bg-black text-white rounded-lg transition-all font-bold border-2 border-transparent hover:border-pink-500"
                                        >
                                            <Download size={18} /> Unduh Dokumen
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t-4 border-black bg-gray-100 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-white text-gray-900 rounded-xl font-black border-2 border-black hover:bg-gray-50 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:shadow-none active:translate-y-1"
                    >
                        TUTUP
                    </button>
                </div>
            </div>
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #000;
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #333;
                }
            `}</style>
        </div>
    );
};

export default PanduanSOPModal;