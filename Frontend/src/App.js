// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// Pages
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import DashboardAdmin from "./admin/DashboardAdmin";
import DashboardUser from "./user/DashboardUser";
import MasterPage from "./admin/MasterPage";
import JadwalPiketPage from "./admin/JadwalPiketPage";
import LaporanPage from "./admin/LaporanPage";
import UserManagement from "./admin/UserManagementPage";
import SettingsProfile from "./admin/SettingsProfile";
import InformasiAdmin from "./admin/InformasiAdmin";

import RiwayatPiket from "./user/RiwayatPiketUser";
import SopPanduan from "./user/SOPPanduan";

// Protected Route
import ProtectedRoute from "./components/ProtectedRoute";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* --- PUBLIC ROUTES --- */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* --- USER ROUTES --- */}
        <Route element={<ProtectedRoute allowedRoles={['user', 'admin']} />}>
          <Route path="/user-dashboard" element={<DashboardUser />} />
          <Route path="/user/riwayat" element={<RiwayatPiket />} />
          <Route path="/user/sop-panduan" element={<SopPanduan />} />
        </Route>

        {/* --- ADMIN ROUTES --- */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin-dashboard" element={<DashboardAdmin />} />
          <Route path="/master" element={<MasterPage />} />
          <Route path="/jadwal-piket" element={<JadwalPiketPage />} />
          <Route path="/laporan" element={<LaporanPage />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/profile" element={<SettingsProfile />} />
          <Route path="/admin/informasi" element={<InformasiAdmin />} />
          
        </Route>
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
