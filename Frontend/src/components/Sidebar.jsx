// src/components/Sidebar.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { Home, ClipboardList, Calendar, BarChart3, Menu, Users, FileText } from "lucide-react";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: <Home size={20} />, path: "/admin-dashboard" },
  { id: "master", label: "Data Master", icon: <ClipboardList size={20} />, path: "/master" },
  { id: "jadwal", label: "Jadwal Piket", icon: <Calendar size={20} />, path: "/jadwal-piket" },
  { id: "laporan", label: "Laporan", icon: <BarChart3 size={20} />, path: "/laporan" },
  { id: "informasi", label: "Informasi", icon: <FileText size={20} />, path: "/admin/informasi" }, // <-- tambahan
  { id: "users", label: "User Management", icon: <Users size={20} />, path: "/users" },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? "80px" : "250px" }}
      className="h-screen bg-white border-r-2 border-black shadow-sm flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b-2 border-black">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold border-2 border-black">
              B
            </div>
            <h2 className="font-bold text-lg text-gray-900">BESTI</h2>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-gray-100 rounded-lg border border-gray-300 transition-colors"
        >
          <Menu size={18} />
        </button>
      </div>

      {/* Menu Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 w-full px-3 py-3 rounded-lg font-medium transition-all duration-200 border-2 ${
                isActive
                  ? "bg-pink-500 text-white border-black shadow-md"
                  : "text-gray-700 hover:bg-gray-50 border-transparent hover:border-gray-200"
              }`
            }
            title={collapsed ? item.label : ""}
          >
            <div className="flex-shrink-0">
              {item.icon}
            </div>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto p-4 border-t-2 border-black text-center">
        {!collapsed ? (
          <p className="text-xs text-gray-500">© 2025 BESTI</p>
        ) : (
          <div className="w-6 h-6 bg-pink-500 rounded-md mx-auto border border-black"></div>
        )}
      </div>
    </motion.aside>
  );
};

export default Sidebar;
