// src/LoginPage.jsx
import React from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // 👉 nanti bisa ditambah validasi login di sini
    navigate("/dashboard"); // redirect ke dashboard
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-[#FFFDF5] font-sans">
      {/* Left Hero Section */}
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

      {/* Right Login Form */}
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
            <div>
              <label className="block text-left font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="Masukkan email kamu"
                className="w-full px-4 py-3 border-2 border-gray-900 rounded-lg focus:ring-2 focus:ring-pink-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-left font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Masukkan password"
                className="w-full px-4 py-3 border-2 border-gray-900 rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full py-3 bg-pink-500 text-white font-bold border-2 border-gray-900 rounded-lg shadow hover:bg-pink-600 transition"
            >
              Login
            </motion.button>
          </form>

          <p className="text-sm text-gray-600 mt-6 text-center">
            Belum punya akun?{" "}
            <Link to="/register" className="font-semibold text-pink-500 hover:underline">
              Register
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
