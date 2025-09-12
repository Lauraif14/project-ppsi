// src/LandingPage.jsx
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="bg-[#FFFDF5] min-h-screen font-sans">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-6 border-b-2 border-gray-900">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
          BESTI<span className="text-pink-500">.</span>
        </h1>
        <ul className="hidden md:flex space-x-8 text-gray-800 font-semibold">
          <li><a href="#vision" className="hover:text-pink-500">About</a></li>
          <li><a href="#features" className="hover:text-pink-500">Fitur</a></li>
          <li><a href="#team" className="hover:text-pink-500">Team</a></li>
        </ul>
        <Link
          to="/login"
          className="px-6 py-2 bg-pink-500 text-white border-2 border-gray-900 shadow-md rounded-lg font-bold hover:bg-pink-600 transition"
        >
          Login
        </Link>
      </nav>

     {/* Hero Section */}
<main className="flex flex-col items-center justify-center text-center px-6 py-24 bg-[#FFFDF5]">
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
    className="max-w-3xl"
  >
    <h2 className="text-4xl md:text-6xl font-extrabold leading-tight text-gray-900 uppercase mb-6">
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
</main>

{/* Feature Cards in File Style */}
<section
  id="features"
  className="py-18 border-t-2 border-gray-900 bg-white text-center"
>
  <div className="max-w-5xl mx-auto px-4 py-12">
    <div className="grid md:grid-cols-3 gap-8">
      
      {/* Jadwal Piket */}
      <motion.div
        whileHover={{ y: -8, scale: 1.03, rotate: -1 }}
        transition={{ type: "spring", stiffness: 250 }}
        className="relative bg-pink-50 border-2 border-gray-900 rounded-lg p-6 shadow-md hover:shadow-2xl cursor-pointer"
      >
        {/* Tab Kiri Atas */}
        <div className="absolute -top-3 left-4 bg-pink-400 text-white font-bold px-4 py-1 rounded-t-md border-2 border-gray-900 shadow">
          Jadwal
        </div>
        <h3 className="mt-6 font-extrabold text-gray-900 text-xl mb-2">
          📅 Jadwal Piket
        </h3>
        <p className="text-gray-700 text-sm leading-relaxed">
          Atur jadwal piket pengurus secara otomatis & terstruktur.
        </p>
      </motion.div>

      {/* Inventaris */}
      <motion.div
        whileHover={{ y: -8, scale: 1.03, rotate: 1 }}
        transition={{ type: "spring", stiffness: 250 }}
        className="relative bg-green-50 border-2 border-gray-900 rounded-lg p-6 shadow-md hover:shadow-2xl cursor-pointer"
      >
        <div className="absolute -top-3 left-4 bg-green-400 text-white font-bold px-4 py-1 rounded-t-md border-2 border-gray-900 shadow">
          Barang
        </div>
        <h3 className="mt-6 font-extrabold text-gray-900 text-xl mb-2">
          📦 Inventaris
        </h3>
        <p className="text-gray-700 text-sm leading-relaxed">
          Catat keluar masuk barang inventaris dengan mudah & transparan.
        </p>
      </motion.div>

      {/* Absensi */}
      <motion.div
        whileHover={{ y: -8, scale: 1.03, rotate: -1 }}
        transition={{ type: "spring", stiffness: 250 }}
        className="relative bg-yellow-50 border-2 border-gray-900 rounded-lg p-6 shadow-md hover:shadow-2xl cursor-pointer"
      >
        <div className="absolute -top-3 left-4 bg-yellow-400 text-white font-bold px-4 py-1 rounded-t-md border-2 border-gray-900 shadow">
          Absensi
        </div>
        <h3 className="mt-6 font-extrabold text-gray-900 text-xl mb-2">
          ✅ Absensi
        </h3>
        <p className="text-gray-700 text-sm leading-relaxed">
          Rekam kehadiran pengurus dengan bukti foto & laporan otomatis.
        </p>
      </motion.div>
    </div>
  </div>
</section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white text-center py-12">
        <p className="text-lg font-bold">© 2025 BESTI</p>
        <p className="text-gray-400">Made with 💚 + 💖 to Pengurus BEM KM FTI</p>
      </footer>
    </div>
  );
};

export default LandingPage;
