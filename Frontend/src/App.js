// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import DashboardAdmin from "./components/DashboardAdmin";
import DashboardUser from "./components/DashboardUser";
import MasterPage from "./pages/MasterPage";
import JadwalPiketPage from "./pages/JadwalPiketPage";
import LaporanPage from "./pages/LaporanPage";
import UserManagement from "./pages/UserManagementPage";
import SettingsProfile from "./pages/SettingsProfile";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin-dashboard" element={<DashboardAdmin />} />
        <Route path="/user-dashboard" element={<DashboardUser />} />
        

        {/* route baru */}
        <Route path="/master" element={<MasterPage />} />
        <Route path="/jadwal-piket" element={<JadwalPiketPage />} />
        <Route path="/laporan" element={<LaporanPage />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/profile" element={<SettingsProfile />} />

      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
