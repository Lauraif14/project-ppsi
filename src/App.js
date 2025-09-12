// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import MasterPage from "./pages/MasterPage";
import JAdwalPiketPage from "./pages/JadwalPiketPage";
import LaporanPage from "./pages/LaporanPage";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* route baru */}
        <Route path="/master" element={<MasterPage />} />
        <Route path="/jadwal-piket" element={<JAdwalPiketPage />} />
        <Route path="/laporan" element={<LaporanPage />} />
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
