// src/components/Navbar.jsx

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // <-- 1. Impor untuk dekode token

const Navbar = () => {
  const [open, setOpen] = useState(false);
  // 1. State untuk menyimpan data pengguna dari token
  const [userData, setUserData] = useState({ role: "User" }); // Default value
  const navigate = useNavigate();
  const dropdownRef = useRef(null); // <-- 2. Ref untuk dropdown

  // 1. Mengambil dan mendekode token saat komponen dimuat
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserData(decoded); // Simpan seluruh data dari token (misal: { id, role })
      } catch (error) {
        console.error("Token tidak valid:", error);
        handleLogout(); // Logout jika token tidak bisa didekode
      }
    }
  }, []);

  // 2. Efek untuk menutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    // Tambahkan event listener
    document.addEventListener("mousedown", handleClickOutside);
    // Hapus event listener saat komponen unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);


  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="w-full h-16 bg-white text-gray-800 flex items-center justify-between px-8 border-b-2 border-black shadow-sm">
      {/* Brand Title */}
      <h1 className="text-xl font-bold tracking-wide text-gray-900"></h1>

      {/* Profile Dropdown */}
      <div className="relative" ref={dropdownRef}> {/* <-- 2. Terapkan ref di sini */}
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-lg font-semibold border-2 border-black hover:bg-pink-600 transition capitalize"
        >
          {/* 1. Tampilkan role dari state userData */}
          {userData.role} <ChevronDown size={18} />
        </button>

        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-40 bg-white border-2 border-black rounded-lg shadow-md overflow-hidden z-50"
          >
            <button
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
              onClick={() => {
                navigate("/profile");
                setOpen(false);
              }}
            >
              Settings
            </button>
            <button
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 font-semibold"
              onClick={handleLogout}
            >
              Logout
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Navbar;