// src/components/Sidebar.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { Home, ClipboardList, Calendar, BarChart3, Menu, BookText } from "lucide-react";

const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <Home size={20} />, path: "/admin-dashboard" },
    { id: "master", label: "Data Master", icon: <ClipboardList size={20} />, path: "/master" },
    { id: "jadwal", label: "Jadwal Piket", icon: <Calendar size={20} />, path: "/jadwal-piket" },
    { id: "informasi", label: "Informasi Piket", icon: <BookText size={20} />, path: "/informasi-piket" },
    { id: "laporan", label: "Laporan", icon: <BarChart3 size={20} />, path: "/laporan" },
];

const Sidebar = () => {
    // Initialize from localStorage or default to false
    const [collapsed, setCollapsed] = useState(() => {
        const saved = localStorage.getItem("sidebar_collapsed");
        return saved === "true";
    });

    // Save to localStorage whenever state changes
    React.useEffect(() => {
        localStorage.setItem("sidebar_collapsed", collapsed);
    }, [collapsed]);

    return (
        <motion.aside
            animate={{ width: collapsed ? "80px" : "260px" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="h-screen bg-white border-r-2 border-black shadow-sm flex flex-col"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b-2 border-black bg-gradient-to-r from-pink-50 to-pink-100">
                {!collapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2"
                    >
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold border-2 border-black shadow-md">
                            B
                        </div>
                        <h2 className="font-bold text-xl text-gray-900">BESTI</h2>
                    </motion.div>
                )}
                {collapsed && (
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold border-2 border-black shadow-md mx-auto">
                        B
                    </div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 hover:bg-pink-100 rounded-lg border-2 border-transparent hover:border-pink-300 transition-all duration-200"
                    title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    <Menu size={20} className="text-gray-700" />
                </button>
            </div>

            {/* Menu Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {menuItems.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <NavLink
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 w-full px-3 py-3 rounded-lg font-medium transition-all duration-200 border-2 ${isActive
                                    ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white border-black shadow-md"
                                    : "text-gray-700 hover:bg-gray-50 border-transparent hover:border-gray-200 hover:shadow-sm"
                                }`
                            }
                            title={collapsed ? item.label : ""}
                        >
                            <div className="flex-shrink-0">
                                {item.icon}
                            </div>
                            {!collapsed && <span className="truncate">{item.label}</span>}
                        </NavLink>
                    </motion.div>
                ))}
            </nav>

            {/* Footer */}
            <div className="mt-auto p-4 border-t-2 border-black bg-gray-50 text-center">
                {!collapsed ? (
                    <div>
                        <p className="text-xs font-semibold text-gray-600">Sistem Piket</p>
                        <p className="text-xs text-gray-500 mt-1">© 2025 BESTI</p>
                    </div>
                ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg mx-auto border-2 border-black shadow-sm"></div>
                )}
            </div>
        </motion.aside>
    );
};

export default Sidebar;
