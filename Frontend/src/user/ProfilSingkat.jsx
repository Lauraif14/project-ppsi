import React, { useState } from 'react';
import EditProfilModal from './EditProfilModal'; // Pastikan file ini ada

const ProfilSingkat = ({ user, onProfileUpdate }) => {
    const [showEditModal, setShowEditModal] = useState(false);

    return (
        <>
            <div className="p-6 border-2 border-black rounded-xl bg-white shadow-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                    
                    {/* --- BAGIAN INI YANG DIPERBAIKI --- */}
                    <div className="w-16 h-16 rounded-full border-2 border-black overflow-hidden flex-shrink-0 bg-pink-100">
                        {user.avatar_url ? (
                            <img 
                                src={user.avatar_url} 
                                alt={user.name} 
                                className="w-full h-full object-cover" 
                            />
                        ) : (
                            <div className="w-full h-full bg-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                                {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                            </div>
                        )}
                    </div>
                    {/* ----------------------------- */}

                    <div>
                        <h2 className="text-lg font-bold text-gray-800">{user.name}</h2>
                        <p className="text-gray-600">{[user.role, user.division].filter(Boolean).join(' • ')}</p>
                    </div>
                </div>
                <button 
                    onClick={() => setShowEditModal(true)} 
                    className="px-4 py-2 bg-pink-500 text-white font-semibold rounded-lg shadow hover:bg-pink-600 border-2 border-black"
                >
                    Edit
                </button>
            </div>

            <EditProfilModal 
                show={showEditModal} 
                onClose={() => setShowEditModal(false)}
                onProfileUpdate={() => {
                    setShowEditModal(false);
                    onProfileUpdate(); // Memanggil fungsi refresh data dari parent
                }}
            />
        </>
    );
};

export default ProfilSingkat;