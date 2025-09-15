// LoginPage.jsx

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api/axios";

const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  // DIUBAH: State diubah dari 'username' menjadi 'identifier'
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Kode ini sekarang sudah benar karena mengirim 'identifier'
      const res = await api.post("/auth/login", { identifier, password });
      const token = res.data.token;
      localStorage.setItem("token", token);

      const decoded = jwtDecode(token);

      if (decoded.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/user-dashboard");
      }
    } catch (err) {
      console.error("Login error:", err.response || err);
      setError(err.response?.data?.message || "Login gagal! Periksa kredensial Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-[#FFFDF5] font-sans">
      {/* Left Hero Section (Tidak diubah) */}
      <div className="flex items-center justify-center px-8 py-16 bg-[#FFFDF5] border-r-2 border-gray-900">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-lg text-center md:text-left"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight text-gray-900 uppercase mb-6">
            Kelola{" "}
            <motion.span
              whileHover={{ scale: 1.1, rotate: -2 }}
              className="bg-pink-400 text-white px-3 py-1 rounded-lg inline-block"
            >
              Piket
            </motion.span>{" "}
            &{" "}
            <motion.span
              whileHover={{ scale: 1.1, rotate: 2 }}
              className="bg-green-400 text-white px-3 py-1 rounded-lg inline-block"
            >
              Inventaris
            </motion.span>
          </h2>
          <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed">
            Aplikasi internal BEM BESTI untuk mengatur jadwal piket pengurus,
            mencatat inventaris, dan absensi dengan rapi, cepat, dan transparan 🚀
          </p>
          <motion.a
            href="#features"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-green-400 border-2 border-gray-900 text-gray-900 rounded-lg font-bold shadow-lg hover:bg-green-500 transition"
          >
            More Info
          </motion.a>
        </motion.div>
      </div>

      {/* Right Login Form (Tidak diubah) */}
      <div className="flex items-center justify-center px-8 py-16 bg-white">
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md p-8 border-2 border-gray-900 rounded-xl shadow-lg bg-[#FFFDF5]"
        >
          <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
            Login ke <span className="text-pink-500">BESTI</span>
          </h2>
          <form className="space-y-6" onSubmit={handleLogin}>
            {/* DIUBAH: Seluruh blok input ini disesuaikan untuk 'identifier' */}
            <div>
              <label className="block text-left font-semibold text-gray-700 mb-2">
                Username atau Email
              </label>
              <input
                type="text"
                name="identifier"
                placeholder="Masukkan username atau email"
                required
                className="w-full px-4 py-3 border-2 border-gray-900 rounded-lg focus:ring-2 focus:ring-pink-400 outline-none"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
            {/* Blok input password tidak perlu diubah */}
            <div>
              <label className="block text-left font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Masukkan password"
                required
                className="w-full px-4 py-3 border-2 border-gray-900 rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-pink-500 text-white font-bold border-2 border-gray-900 rounded-lg shadow hover:bg-pink-600 transition"
            >
              {loading ? "Loading..." : "Login"}
            </motion.button>
            <div className="text-right -mt-4">
              <a href="/forgot-password" className="text-sm text-pink-600 hover:underline">
                Lupa Password?
              </a>
            </div>
            {error && (
              <p className="mt-4 text-center text-red-500 font-semibold">
                {error}
              </p>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;