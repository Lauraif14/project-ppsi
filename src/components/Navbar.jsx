// src/components/Navbar.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // hapus token/session jika ada
    navigate("/login"); // arahkan ke halaman login
  };

  return (
    <div className="w-full h-16 bg-pink-500 text-white flex items-center justify-end px-12 border-b-2 border-black shadow-md">
      {/* Profile Dropdown */}
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 bg-white text-pink-600 px-4 py-2 rounded-lg font-semibold border-2 border-black hover:bg-gray-100 transition"
        >
          Admin <ChevronDown size={18} />
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
              Profile
            </button>
            <button
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
              onClick={() => {
                navigate("/settings");
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
