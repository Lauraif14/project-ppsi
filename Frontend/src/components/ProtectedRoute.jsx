import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// Fungsi untuk memeriksa apakah token valid (tidak kedaluwarsa)
const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    return true; // Anggap token tidak valid jika gagal di-decode
  }
};

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');

  // 1. Cek apakah ada token dan tidak kedaluwarsa
  if (!token || isTokenExpired(token)) {
    localStorage.removeItem('token'); // Hapus token basi
    return <Navigate to="/login" replace />;
  }

  // 2. Cek apakah role diizinkan (jika ada batasan role)
  const decoded = jwtDecode(token);
  if (allowedRoles && !allowedRoles.includes(decoded.role)) {
    // Jika user biasa mencoba akses halaman admin, arahkan ke dashboard mereka
    return <Navigate to="/user-dashboard" replace />;
  }

  // Jika semua pengecekan lolos, tampilkan halaman yang dituju
  return <Outlet />;
};

export default ProtectedRoute;