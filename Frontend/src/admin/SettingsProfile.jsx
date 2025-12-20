import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const SettingsProfile = () => {
  return (
    <div className="flex bg-gray-50 h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6 flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-xl border-2 border-black shadow-sm">
            <h2 className="text-2xl font-bold mb-2">Pengaturan Profil</h2>
            <p className="text-gray-600 mb-4">Silakan gunakan menu di pojok kanan atas (Avatar) untuk pengaturan profil.</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsProfile;