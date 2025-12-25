import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { jwtDecode } from "jwt-decode";

const SettingsProfile = () => {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setRole(decoded.role);
      } catch (error) {
        console.error("Invalid token", error);
      }
    }
  }, []);

  return (
    <div className="flex bg-gray-50 h-screen overflow-hidden">
      {role === 'admin' && <Sidebar />}

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6 flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-xl border-2 border-black shadow-sm max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">Pengaturan Profil</h2>
            <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg mb-6">
              <p className="text-yellow-800 font-medium">Fitur Profil Pengguna</p>
            </div>
            <p className="text-gray-600">
              Halaman ini akan berisi form untuk mengubah data diri, password, dan preferensi akun Anda.
            </p>
            <p className="text-gray-400 text-sm mt-4">
              Login sebagai: <span className="font-bold uppercase text-gray-700">{role || '...'}</span>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsProfile;