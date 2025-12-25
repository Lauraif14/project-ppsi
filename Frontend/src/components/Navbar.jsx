import React, { useEffect, useState } from "react";
import { LogOut, User, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import SettingsModal from "./SettingsModal";

const Navbar = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUser(decoded);
            } catch (error) {
                console.error("Invalid token", error);
            }
        }
    }, []);

    const handleLogout = () => {
        if (window.confirm("Apakah Anda yakin ingin keluar?")) {
            localStorage.removeItem("token");
            navigate("/login");
        }
    };

    const isAdmin = user?.role === 'admin';

    return (
        <>
            <div className="w-full h-[74px] bg-white text-gray-800 flex items-center justify-between px-6 shadow-sm border-b-2 border-black z-40 sticky top-0">
                {/* Branding */}
                <div className="font-black text-xl tracking-tighter flex items-center gap-2 select-none">
                    <span className="text-pink-600 text-3xl">BESTI</span>
                    {!isAdmin && (
                        <span className="text-gray-900 text-xs bg-gray-100 px-2 py-1 rounded border-2 border-black font-bold">PANEL USER</span>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {/* Tombol Setting - HANYA utuk Admin */}
                    {isAdmin && (
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="p-2.5 rounded-xl border-2 border-black bg-white hover:bg-gray-100 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all active:translate-y-0 active:shadow-none"
                            title="Pengaturan"
                        >
                            <Settings size={20} strokeWidth={2.5} className="text-gray-800" />
                        </button>
                    )}

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 bg-red-500 text-white px-5 py-2.5 rounded-xl font-bold border-2 border-black hover:bg-red-600 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        title="Keluar"
                    >
                        <LogOut size={18} strokeWidth={3} />
                        <span className="hidden sm:inline">Keluar</span>
                    </button>
                </div>
            </div>

            {/* Modal Setting */}
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                user={user}
            />
        </>
    );
};

export default Navbar;
