import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, BookOpen } from 'lucide-react';

const MenuNavigasi = () => {
    const navigate = useNavigate();

    return (
        <div className="p-6 border-2 border-black rounded-xl bg-white shadow-lg">
            <h3 className="font-bold text-lg mb-4">Menu Navigasi</h3>
            <div className="space-y-3">
                <button 
                    onClick={() => navigate('/riwayat-absensi')} 
                    className="w-full flex items-center gap-3 p-3 bg-gray-100 text-left font-semibold rounded-lg border-2 border-black hover:bg-gray-200 transition-colors"
                >
                    <ClipboardList size={20} /> Riwayat Piket
                </button>
                <button 
                    onClick={() => navigate('/panduan')} 
                    className="w-full flex items-center gap-3 p-3 bg-gray-100 text-left font-semibold rounded-lg border-2 border-black hover:bg-gray-200 transition-colors"
                >
                    <BookOpen size={20} /> Panduan & SOP
                </button>
            </div>
        </div>
    );
};

export default MenuNavigasi;