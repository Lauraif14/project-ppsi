import React from "react";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        if (window.confirm("Apakah Anda yakin ingin keluar?")) {
            localStorage.removeItem("token");
            navigate("/login");
        }
    };

    return (
        <div className="w-full h-[74px] bg-white text-gray-800 flex items-center justify-between px-6 shadow-sm border-b-2 border-black z-40 sticky top-0">
            {/* Branding */}
            <div className="font-black text-xl tracking-tighter flex items-center gap-2 select-none">
                <span className="text-pink-600 text-3xl">BESTI</span>
            </div>

            <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-500 text-white px-5 py-2.5 rounded-xl font-bold border-2 border-black hover:bg-red-600 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
                <LogOut size={18} strokeWidth={3} />
                Keluar
            </button>
        </div>
    );
};

export default Navbar;
